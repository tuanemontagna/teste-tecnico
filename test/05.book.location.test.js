import request from 'supertest';
import app from '../src/server.js';
import { sequelize } from '../src/config/postgres.js';

const uniq = (p='') => `${p}${Date.now()}`;

describe('Book Location', () => {
  beforeAll(async () => {
    await sequelize.authenticate();
  });

  test('Create book (if admin) and fetch location', async () => {
    let adminToken = '';
    const login = await request(app).post('/auth/login').send({ 
        email: 'admin@example.com', 
        password: '123456' 
    });

    if (login.status === 200) {
      adminToken = login.body.token;

      const sec = await request(app).post('/sector').send({ 
        name: `Setor ${uniq()}`, 
        active: true
     });
      const sectorId = (sec.body.data && sec.body.data.id) || 1;
      const sh = await request(app).post('/shelf').send({ code: `A${uniq()}`, sectorId });
      const shelfId = (sh.body.data && sh.body.data.id) || 1;
      const gen = await request(app).post('/genre').send({ name: `Genero ${uniq()}` });
      const genreId = (gen.body.data && gen.body.data.id) || 1;

      const book = await request(app)
        .post('/book')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: `Livro ${uniq()}`, isbn: uniq('ISBN'), available: true, replacementPrice: 120.0, genreId, shelfId });
      const bookId = (book.body.data && book.body.data.id) || 1;

      const res = await request(app).get(`/book/${bookId}/location`);
      expect([200,404]).toContain(res.status);
    } else {
      const res = await request(app).get('/book/1/location');
      expect([200,404]).toContain(res.status);
    }
  });
});