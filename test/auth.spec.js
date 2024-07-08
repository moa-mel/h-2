(async () => {
  const { expect } = await import('chai');
  const request = require('supertest');
  const app = require('../app')
describe('Auth Endpoints', () => {
  describe('POST /auth/register', () => {
    it('should register user successfully with default organisation', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123',
          phone: '1234567890'
        })
        .expect(201);

      expect(res.body).to.have.property('status', 'success');
      expect(res.body.data).to.have.property('accessToken');
      expect(res.body.data.user).to.include({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890'
      });
    });

    it('should fail if required fields are missing', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          firstName: '',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123'
        })
        .expect(422);

      expect(res.body).to.have.property('errors');
    });

    it('should fail if email already exists', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com', // Assuming this email is already registered
          password: 'password123',
          phone: '1234567890'
        })
        .expect(422);

      expect(res.body).to.have.property('errors');
    });
  });

  describe('POST /auth/login', () => {
    it('should log the user in successfully', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'john.doe@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(res.body).to.have.property('status', 'success');
      expect(res.body.data).to.have.property('accessToken');
    });

    it('should fail with invalid credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'john.doe@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(res.body).to.have.property('status', 'error');
    });
  });
});
})