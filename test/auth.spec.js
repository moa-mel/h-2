const request = require('supertest');
const app = require('../app');

let authToken;

beforeAll(async () => {
  try {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        phone: '0987654321'
      })
      .expect(201);

    authToken = res.body.data.accessToken;
  } catch (error) {
    console.error('Error during registration:', error.message);
  }
});

describe('Authentication Endpoints', () => {
  test('should register user successfully with default organisation', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        phone: '0987654321'
      })
      .expect(201);

    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('accessToken');
  });

  test('should fail if email already exists', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com', // Duplicate email
        password: 'password123',
        name: 'Test User',
        phone: '0987654321'
      })
      .expect(400);

    expect(res.body).toHaveProperty('message', 'Email already exists');
  });

  test('should log the user in successfully', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })
      .expect(200);

    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('accessToken');
  });

  test('should fail with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      })
      .expect(401);

    expect(res.body).toHaveProperty('status', 'error');
  });
});

describe('Organisation Endpoints', () => {
  beforeEach(async () => {
    if (!authToken) {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      authToken = loginRes.body.data.accessToken;
    }
  });

  test('should create an organisation successfully', async () => {
    const res = await request(app)
      .post('/api/organisations')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Organisation'
      })
      .expect(201);

    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('name', 'Test Organisation');
  });

  test('should fail if name is missing', async () => {
    const res = await request(app)
      .post('/api/organisations')
      .set('Authorization', `Bearer ${authToken}`)
      .send({})
      .expect(400);

    expect(res.body).toHaveProperty('status', 'error');
    expect(res.body).toHaveProperty('message');
  });

  test('should fetch user organisations successfully', async () => {
    const res = await request(app)
      .get('/api/organisations')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toBeInstanceOf(Array);
  });

  test('should fetch organisation details successfully', async () => {
    const orgRes = await request(app)
      .post('/api/organisations')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Organisation'
      })
      .expect(201);

    const orgId = orgRes.body.data.id;

    const res = await request(app)
      .get(`/api/organisations/${orgId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('id', orgId);
    expect(res.body.data).toHaveProperty('name', 'Test Organisation');
  });

  test('should return 404 if organisation not found', async () => {
    const res = await request(app)
      .get('/api/organisations/nonexistentid')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);

    expect(res.body).toHaveProperty('status', 'error');
    expect(res.body).toHaveProperty('message', 'Organisation not found');
  });

  test('should add user to organisation successfully', async () => {
    const orgRes = await request(app)
      .post('/api/organisations')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Organisation'
      })
      .expect(201);

    const orgId = orgRes.body.data.id;

    const res = await request(app)
      .post(`/api/organisations/${orgId}/users`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        email: 'anotheruser@example.com'
      })
      .expect(200);

    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('organisationId', orgId);
  });

  test('should return 409 if user already associated with organisation', async () => {
    const orgRes = await request(app)
      .post('/api/organisations')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Organisation'
      })
      .expect(201);

    const orgId = orgRes.body.data.id;

    await request(app)
      .post(`/api/organisations/${orgId}/users`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        email: 'anotheruser@example.com'
      })
      .expect(200);

    const res = await request(app)
      .post(`/api/organisations/${orgId}/users`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        email: 'anotheruser@example.com'
      })
      .expect(409);

    expect(res.body).toHaveProperty('status', 'error');
    expect(res.body).toHaveProperty('message', 'User already associated with organisation');
  });
});
