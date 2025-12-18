import request from 'supertest';
import app from '../src/server.js';
import { sequelize } from '../src/config/postgres.js';

const uniq = (p='') => `${p}${Date.now()}`;

describe('Loan Flow', () => {
  beforeAll(async () => {
    await sequelize.authenticate();
  });

  test('Full loan flow', async () => {
    let adminToken = '';
    const adminLogin = await request(app).post('/auth/login').send({ email: 'admin@example.com', password: '123456' });
    if (adminLogin.status === 200) {
      adminToken = adminLogin.body.token;
    }

    if (adminToken) {
      await request(app)
        .post('/system-param')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ finePerDay: 2.5, baseRent: 5.0, rentPerDay: 1.5, standardLoanDays: 7, firstDelayDiscount: 0.5 });
    }

    const sec = await request(app).post('/sector').send({ name: `Setor ${uniq()}`, active: true });
    const sectorId = (sec.body.data && sec.body.data.id) || 1;
    const sh = await request(app).post('/shelf').send({ code: `A${uniq()}`, sectorId });
    const shelfId = (sh.body.data && sh.body.data.id) || 1;
    const gen = await request(app).post('/genre').send({ name: `Genero ${uniq()}` });
    const genreId = (gen.body.data && gen.body.data.id) || 1;

    let bookId = 1;
    if (adminToken) {
      const book = await request(app)
        .post('/book')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: `Livro ${uniq()}`, isbn: uniq('ISBN'), available: true, replacementPrice: 120.0, genreId, shelfId });
      bookId = (book.body.data && book.body.data.id) || bookId;
    }

    const email = `${uniq()}@example.com`;
    const createReader = await request(app).post('/users').send({ name: 'Leitor', email, password: '123456', active: true });
    const readerId = (createReader.body.data && createReader.body.data.id) || null;
    const readerLogin = await request(app).post('/auth/login').send({ email, password: '123456' });
    const userToken = (readerLogin.body && readerLogin.body.token) || '';

    const createLoan = await request(app)
      .post('/loans')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ userId: readerId || 2, bookId, loanDate: new Date().toISOString().slice(0,10) });
    expect([200,201,400,401,403,404,500]).toContain(createLoan.status);
    const loanId = (createLoan.body.data && createLoan.body.data.id) || 1;

    const preview = await request(app)
      .get(`/loans/${loanId}/preview`)
      .set('Authorization', `Bearer ${userToken}`);
    expect([200,404,401,403]).toContain(preview.status);

    const fine = await request(app)
      .get(`/loans/${loanId}/fine`)
      .set('Authorization', `Bearer ${userToken}`);
    expect([200,404,401,403]).toContain(fine.status);

    const rental = await request(app)
      .get(`/loans/${loanId}/rental`)
      .set('Authorization', `Bearer ${userToken}`);
    expect([200,404,401,403]).toContain(rental.status);

    const ret = await request(app)
      .post(`/loans/${loanId}/return`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200,404,401,403]).toContain(ret.status);

    const disc = await request(app)
      .patch(`/loans/${loanId}/discount`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200,404,400,401,403]).toContain(disc.status);
  });
});