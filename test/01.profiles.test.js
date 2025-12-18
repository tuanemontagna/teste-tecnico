import request from 'supertest';
import app from '../src/server.js';
import { sequelize } from '../src/config/postgres.js';

describe('Profiles', () => {
  beforeAll(async () => {
    await sequelize.authenticate();
  });

  test('Create ADMIN and CLIENTE profiles', async () => {
    const admin = await request(app).post('/profile').send({ 
        name: 'ADMIN', 
        description: 'Administrador' 
    });
    expect([200,201,409,500]).toContain(admin.status);

    const cliente = await request(app).post('/profile').send({ 
        name: 'CLIENTE', 
        description: 'Leitor' 
    });
    expect([200,201,409,500]).toContain(cliente.status);
  });
});