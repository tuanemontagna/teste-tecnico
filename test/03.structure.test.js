import request from 'supertest';
import app from '../src/server.js';
import { sequelize } from '../src/config/postgres.js';

describe('Structure: Sector/Shelf/Genre', () => {
  beforeAll(async () => {
    await sequelize.authenticate();
  });

  test('Create Sector, Shelf, Genre', async () => {
    const sec = await request(app).post('/sector').send({ 
        name: `Setor ${Date.now()}`, 
        active: true 
    });

    expect([200,201]).toContain(sec.status);
    const sectorId = (sec.body.data && sec.body.data.id) || 1;

    const sh = await request(app).post('/shelf').send({ 
        code: `A${Date.now()}`, 
        sectorId 
    });
    expect([200,201]).toContain(sh.status);

    const gen = await request(app).post('/genre').send({ 
        name: `Genero ${Date.now()}` 
    });
    expect([200,201]).toContain(gen.status);
  });
});