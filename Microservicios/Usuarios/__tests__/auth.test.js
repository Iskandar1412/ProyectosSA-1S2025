const request = require('supertest');
const app = require('../src/index');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../src/config/env/auth.config');

const pool = require('../src/config/db'); // Asegúrate de que la ruta sea correcta

// Limpieza y helpers para tests
beforeAll(async () => {
  // Aquí podrías insertar usuarios de prueba en la base de datos si es necesario
  // await pool.query('INSERT INTO usuarios ...')
});

describe('Auth Controller - Login', () => {
  it('debe retornar token y encabezados cuando las credenciales son válidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        credentials: 'tiky2',
        contrasenia: '1234'
      });
  
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Loggin successful');
    expect(res.body.rol).toBe('admin');
  
    expect(res.headers['authorization']).toBeDefined();
    expect(res.headers['refresh']).toBeDefined();
  });

  it('debe fallar si faltan campos obligatorios', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        credentials: '',
        contrasenia: ''
      });

    expect(res.statusCode).toBe(400);
  });

  it('debe fallar si el usuario no existe', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        credentials: 'invalido@example.com',
        contrasenia: '123456'
      });

    expect(res.statusCode).toBe(404);
  });

  it('debe fallar si la contraseña es incorrecta', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        credentials: 'tiky2',
        contrasenia: 'contraseña_incorrecta'
      });
  
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('debe cerrar sesión correctamente y eliminar los encabezados de autenticación', async () => {
    const agent = request.agent(app);
  
    // Iniciar sesión y obtener los tokens
    const loginRes = await agent
      .post('/api/auth/login')
      .send({ credentials: 'tiky2', contrasenia: '1234' });
  
    expect(loginRes.statusCode).toBe(200);
    const authToken = loginRes.headers['authorization'];
    const refreshToken = loginRes.headers['refresh'];
    expect(authToken).toBeDefined();
    expect(refreshToken).toBeDefined();

    // Cerrar sesión utilizando los tokens obtenidos
    const logoutRes = await agent
      .post('/api/auth/logout')
      .set('Authorization', authToken)
      .set('Refresh', refreshToken);
  
    expect(logoutRes.statusCode).toBe(200);
    expect(logoutRes.body.message).toMatch(/logout/i);
  });

  // Test adicional: intentar cerrar sesión sin tokens
  it('debe fallar el logout si no se envían los encabezados', async () => {
    const res = await request(app)
      .post('/api/auth/logout');

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.body.success).toBe(false);
  });
});

// Limpieza final
afterAll(async () => {
  // Aquí podrías limpiar usuarios de prueba si los insertaste
  // await pool.query('DELETE FROM usuarios WHERE ...')
  await pool.end();
});
