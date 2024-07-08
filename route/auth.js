const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail } = require('../model/user');
const { createOrganisation, addUserToOrganisation } = require('../model/organisation');

const router = express.Router();

router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password, phone } = req.body;
  
    if (!firstName || !lastName || !email || !password) {
      return res.status(422).json({
        errors: [{ field: 'validation', message: 'All fields are required' }]
      });
    }
  
    try {
      const userExists = await findUserByEmail(email);
      if (userExists) {
        return res.status(422).json({
          errors: [{ field: 'email', message: 'Email already exists' }]
        });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await createUser({ user_name: `${firstName} ${lastName}`, user_email: email, user_password: hashedPassword });
  
      const orgName = `${firstName}'s Organisation`;
      const organisation = await createOrganisation({ name: orgName, description: '' });
  
      await addUserToOrganisation(user.user_id, organisation.org_id);
  
      const token = jwt.sign({ userId: user.user_id }, 'secretkey', { expiresIn: '1h' });
  
      res.status(201).json({
        status: 'success',
        message: 'Registration successful',
        data: {
          accessToken: token,
          user: {
            userId: user.user_id,
            firstName: firstName,
            lastName: lastName,
            email: user.user_email,
            phone: phone
          }
        }
      });
    } catch (error) {
      console.error('Error during registration:', error.message);
      res.status(400).json({
        status: 'Bad request',
        message: 'Registration unsuccessful',
        statusCode: 400
      });
    }
  });

  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(422).json({
        errors: [{ field: 'validation', message: 'Email and password are required' }]
      });
    }
  
    try {
      const user = await findUserByEmail(email);
  
      if (!user || !await bcrypt.compare(password, user.user_password)) {
        return res.status(401).json({
          status: 'Bad request',
          message: 'Authentication failed',
          statusCode: 401
        });
      }
  
      const token = jwt.sign({ userId: user.user_id }, 'secretkey', { expiresIn: '1h' });
  
      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          accessToken: token,
          user: {
            userId: user.user_id,
            firstName: user.user_name.split(' ')[0],
            lastName: user.user_name.split(' ')[1],
            email: user.user_email,
            phone: user.phone
          }
        }
      });
    } catch (error) {
      res.status(400).json({
        status: 'Bad request',
        message: 'Authentication failed',
        statusCode: 401
      });
    }
  });

module.exports = router;
