const request = require('supertest');
const app = require('../src/app');

// Mock de Supabase para pruebas
jest.mock('../src/config/supabase', () => ({
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
}));

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('debería retornar 400 si faltan campos requeridos', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com' }); // falta nombre y password

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('debería tener el endpoint disponible', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(res.statusCode).not.toBe(404);
    });
  });

  describe('POST /api/auth/login', () => {
    it('debería retornar 400 si faltan credenciales', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/auth/me', () => {
    it('debería retornar 401 sin token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });

    it('debería retornar 403 con token inválido', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer token-invalido');

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /health', () => {
    it('debería retornar status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });
});
