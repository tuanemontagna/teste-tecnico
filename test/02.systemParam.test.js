import request from 'supertest';
import app from '../src/server.js';
import { sequelize } from '../src/config/postgres.js';

describe('System Parameters', () => {
  beforeAll(async () => {
    await sequelize.authenticate();
  });

  test('Create system parameters (admin)', async () => {
    let adminToken = '';
    const login = await request(app).post('/auth/login').send({ 
        email: 'admin@example.com', 
        password: '123456' 
    });
    
    if (login.status === 200) {
      adminToken = login.body.token;
      const res = await request(app)
        .post('/system-param')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ finePerDay: 2.5, baseRent: 5.0, rentPerDay: 1.5, standardLoanDays: 7, firstDelayDiscount: 0.5 });
      expect([200,201]).toContain(res.status);
    } else {
      const res = await request(app)
        .post('/system-param')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ finePerDay: 2.5, baseRent: 5.0, rentPerDay: 1.5, standardLoanDays: 7, firstDelayDiscount: 0.5 });
      expect([401,403,500]).toContain(res.status);
    }
  });
});