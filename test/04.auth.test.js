import request from 'supertest';
import app from '../src/server.js';
import { sequelize } from '../src/config/postgres.js';

const uniq = () => `user_${Date.now()}@example.com`;

describe('Auth', () => {
  beforeAll(async () => {
    await sequelize.authenticate();
  });

  test('Create reader and login success', async () => {
    const email = uniq();
    const create = await request(app).post('/users').send({ 
        name: 'Leitor', 
        email, 
        password: '123456', 
        active: true 
    });
    expect([200,201]).toContain(create.status);

    const login = await request(app).post('/auth/login').send({ 
        email,
        password: '123456'
    });
    expect(login.status).toBe(200);
  });

  test('Login invalid credentials', async () => {
    const login = await request(app).post('/auth/login').send({ 
        email: 'teste@example.com', 
        password: 'errada' 
    });
    expect([401,500]).toContain(login.status);
  });
});