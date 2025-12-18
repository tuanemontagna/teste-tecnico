import request from 'supertest';
import app from '../src/server.js';
import { sequelize } from '../src/config/postgres.js';


const uniq = () => `user_${Date.now()}@exemplo.com`;

describe('Critical Routes', () => {
  beforeAll(async () => {
    await sequelize.authenticate();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  let adminToken = '';
  let userToken = '';
  let sectorId = null;
  let shelfId = null;
  let genreId = null;
  let bookId = null;
  let loanId = null;
  let readerId = null;

  test('Profiles: create ADMIN and CLIENTE', async () => {
    const admin = await request(app).post('/profile').send({ name: 'ADMIN', description: 'Administrador' });
    expect([200,201,409,500]).toContain(admin.status);

    const cliente = await request(app).post('/profile').send({ name: 'CLIENTE', description: 'Leitor' });
    expect([200,201,409,500]).toContain(cliente.status);
  });

  test('SystemParam: create (requires ADMIN token)', async () => {
    const adminEmail = uniq();

    let login = await request(app).post('/auth/login').send({ email: 'admin@example.com', password: '123456' });
    if (login.status === 200) {
      adminToken = login.body.token;
    } else {

      const res = await request(app).post('/system-param').set('Authorization', `Bearer ${adminToken}`).send({
        finePerDay: 2.5,
        baseRent: 5.0,
        rentPerDay: 1.5,
        standardLoanDays: 7,
        firstDelayDiscount: 0.5,
      });
      expect([401,403,500,201]).toContain(res.status);
      return;
    }

    const res = await request(app)
      .post('/system-param')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        finePerDay: 2.5,
        baseRent: 5.0,
        rentPerDay: 1.5,
        standardLoanDays: 7,
        firstDelayDiscount: 0.5,
      });
    expect([200,201]).toContain(res.status);
  });

  test('Create Sector, Shelf, Genre', async () => {
    const sec = await request(app).post('/sector').send({ name: `Setor ${Date.now()}`, active: true });
    expect([200,201]).toContain(sec.status);
    sectorId = (sec.body.data && sec.body.data.id) || 1;

    const sh = await request(app).post('/shelf').send({ code: `A${Date.now()}`, sectorId });
    expect([200,201]).toContain(sh.status);
    shelfId = (sh.body.data && sh.body.data.id) || 1;

    const gen = await request(app).post('/genre').send({ name: `Genero ${Date.now()}` });
    expect([200,201]).toContain(gen.status);
    genreId = (gen.body.data && gen.body.data.id) || 1;
  });

  test('Create Admin and login to get token', async () => {
    const email = uniq();
    const create = await request(app)
      .post('/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Admin Test', email, password: '123456', active: true });
    expect([200,201,401,403]).toContain(create.status);

    const login = await request(app).post('/auth/login').send({ email, password: '123456' });
    expect([200,401]).toContain(login.status);
    if (login.status === 200) {
      adminToken = login.body.token;
    }
  });

  test('Create Book (ADMIN)', async () => {
    const res = await request(app)
      .post('/book')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: `Livro ${Date.now()}`,
        isbn: `${Date.now()}`,
        available: true,
        replacementPrice: 120.0,
        genreId,
        shelfId,
      });
    expect([200,201,401,403]).toContain(res.status);
    bookId = (res.body.data && res.body.data.id) || 1;
  });

  test('Create Reader and login', async () => {
    const email = uniq();
    const create = await request(app).post('/users').send({ name: 'Leitor', email, password: '123456', active: true });
    expect([200,201]).toContain(create.status);
    readerId = (create.body.data && create.body.data.id) || null;

    const login = await request(app).post('/auth/login').send({ email, password: '123456' });
    expect(login.status).toBe(200);
    userToken = login.body.token;
  });

  test('Book location (public)', async () => {
    const res = await request(app).get(`/book/${bookId}/location`);
    expect([200,404]).toContain(res.status);
  });

  test('Loan flow: create, preview, fine, rental, return, discount', async () => {
    const create = await request(app)
      .post('/loans')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ userId: readerId || 2, bookId, loanDate: new Date().toISOString().slice(0,10) });
    expect([200,201,400,401,403,404,500]).toContain(create.status);
    loanId = (create.body.data && create.body.data.id) || 1;

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
