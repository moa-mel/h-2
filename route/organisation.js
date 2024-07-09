const express = require('express');
const { findUserOrganisations, createOrganisation, addUserToOrganisation } = require('../model/organisation');
const jwt = require('jsonwebtoken');
const { findUserById } = require('../model/user');

const router = express.Router();


const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
  
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'Unauthorized',
        message: 'Token is not provided or invalid',
        statusCode: 401
      });
    }
  
    const token = authHeader.split(' ')[1];
  
    jwt.verify(token, 'secretkey', (err, decoded) => {
      if (err) {
        return res.status(401).json({
          status: 'Unauthorized',
          message: 'Token is not valid',
          statusCode: 401
        });
      }
      req.user = decoded;
      next();
    });
  };

router.get('/api/organisations', authenticate, async (req, res) => {
  try {
    const organisations = await findUserOrganisations(req.user.userId);
    res.status(200).json({
      status: 'success',
      message: 'Organisations fetched successfully',
      data: { organisations }
    });
  } catch (error) {
    res.status(400).json({
      status: 'Bad request',
      message: 'Client error',
      statusCode: 400
    });
  }
});

router.post('/api/organisations', authenticate, async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(422).json({
      errors: [{ field: 'name', message: 'Name is required' }]
    });
  }

  try {
    const organisation = await createOrganisation({ name, description });
    await addUserToOrganisation(req.user.userId, organisation.org_id);

    res.status(201).json({
      status: 'success',
      message: 'Organisation created successfully',
      data: {
        orgId: organisation.org_id,
        name: organisation.name,
        description: organisation.description
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'Bad request',
      message: 'Client error',
      statusCode: 400
    });
  }
});

router.get('/api/organisations/:orgId', authenticate, async (req, res) => {
  const { orgId } = req.params;

  try {
    const organisations = await findUserOrganisations(req.user.userId);
    const organisation = organisations.find(org => org.org_id === orgId);

    if (!organisation) {
      return res.status(404).json({
        status: 'Not found',
        message: 'Organisation not found',
        statusCode: 404
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Organisation fetched successfully',
      data: organisation
    });
  } catch (error) {
    res.status(400).json({
      status: 'Bad request',
      message: 'Client error',
      statusCode: 400
    });
  }
});

router.post('/api/organisations/:orgId/users', authenticate, async (req, res) => {
    const { orgId } = req.params;
    const { userId } = req.body;
  
    try {
      // Attempt to add user to organisation
      await addUserToOrganisation(userId, orgId);
  
      res.status(200).json({
        status: 'success',
        message: 'User added to organisation successfully',
      });
    } catch (error) {
      if (error.message === 'User is already associated with this organisation') {
        return res.status(409).json({
          status: 'Conflict',
          message: 'User is already associated with this organisation',
          statusCode: 409
        });
      }
  
      console.error('Error adding user to organisation:', error);
      res.status(400).json({
        status: 'Bad request',
        message: 'Client error',
        statusCode: 400
      });
    }
  });
  
  
  router.get('/api/users/:id', authenticate, async (req, res) => {
    const { id } = req.params;

    try {
        // Ensure the user can only access their own record or records in their organisations
        const user = await findUserById(id);

        if (!user) {
            return res.status(404).json({
                status: 'Not found',
                message: 'User not found',
                statusCode: 404
            });
        }

        // Check if the user has permission to access this user's details
        const organisations = await findUserOrganisations(req.user.userId);

        // Ensure user.organisationIds is defined and an array before using includes()
        const isAccessible = user.organisationIds && user.organisationIds.length > 0 &&
            organisations.some(org => user.organisationIds.includes(org.orgId));

        if (!isAccessible) {
            return res.status(403).json({
                status: 'Forbidden',
                message: 'You do not have permission to access this user',
                statusCode: 403
            });
        }

        // Return user data if accessible
        res.status(200).json({
            status: 'success',
            message: 'User data retrieved successfully',
            data: {
                userId: user.user_id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.user_email,
                phone: user.phone
                // Add more fields as needed
            }
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(400).json({
            status: 'Bad request',
            message: 'Client error',
            statusCode: 400
        });
    }
});

module.exports = router;