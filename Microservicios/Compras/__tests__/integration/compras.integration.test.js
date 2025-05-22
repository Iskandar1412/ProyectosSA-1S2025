// MOCK debe ir antes de importar cualquier archivo que lo use

jest.mock('../../src/middleware/auth.middleware', () => {
    const jwt = require('jsonwebtoken');
    const { JWT_SECRET } = require('../../src/config/env/token.config');
  
    return {
      isAuthUser: (req, res, next) => {
        const cookie = req.headers.cookie || '';
        const tokenMatch = cookie.match(/token=([^;]+)/);
        const token = tokenMatch ? tokenMatch[1] : null;
  
        if (token) {
          try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = {
              id: decoded.id,
              rol: decoded.rol,
              correo: decoded.correo || 'test@correo.com',
            };
          } catch (e) {
            req.user = { id: 0, rol: 'usuario', correo: 'fallback@correo.com' };
          }
        } else {
          req.user = { id: 0, rol: 'usuario', correo: 'no-token@correo.com' };
        }
  
        next();
      },
      isAdmin: (req, res, next) => {
        if (req.user?.rol === 'admin') return next();
        const error = new Error('No autorizado');
        error.statusCode = 403;
        next(error);
      }
    };
  });

const request = require('supertest');
const app = require('../../src/index');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../src/config/env/token.config');

// Crear tokens reales solo para simular las cookies (no se validarán en este mock)
const tokenUsuario = jwt.sign({ id: 10, rol: 'usuario' }, JWT_SECRET);
const tokenAdmin = jwt.sign({ id: 1, rol: 'admin' }, JWT_SECRET);

describe('Integración - Compras usuario', () => {

    test('POST /api/compras debe registrar compra correctamente', async () => {
        const response = await request(app)
            .post('/api/compras')
            .set('Cookie', [`token=${tokenUsuario}`])
            .send({
                id_usuario: 2,
                correo_usuario: 'stevengonzalez088@gmail.com',
                total_pagar: 150,
                descuento: 10,
                sub_total: 170,
                carrito: [
                    {
                        id_producto: 1,
                        cantidad: 1,
                        descuento: 15,
                        codigo: 'P-000001',
                        nombre: 'Licuadora Ninja con accesorios',
                        precio: 1500.00
                    }
                ]
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);
    }, 10000);

    test('GET /api/compras debe devolver compras del usuario', async () => {
        const response = await request(app)
            .get('/api/compras')
            .set('Cookie', [`token=${tokenUsuario}`]);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.message)).toBe(true);
    });



});

describe('Integración - Compras admin', () => {

    test('GET /api/compras/admin debe devolver compras del admin', async () => {
        const response = await request(app)
            .get('/api/compras/admin')
            .set('Cookie', [`token=${tokenAdmin}`]);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
    });

    test('PUT /api/compras no debe modificar estado de compra que ya avanzo', async () => {
        const response = await request(app)
            .put('/api/compras')
            .set('Cookie', [`token=${tokenAdmin}`])
            .send({
                id_orden: 1,
                estado: 'ENTREGADO'
            });

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
    });
});