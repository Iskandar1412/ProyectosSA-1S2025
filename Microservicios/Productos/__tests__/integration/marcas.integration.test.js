// MOCK debe ir antes de importar cualquier archivo que use isAuthUser o isAdmin
jest.mock('../../src/middleware/auth.middleware', () => ({
    isAuthUser: (req, res, next) => {
      req.user = { id: 1, rol: 'admin', correo: 'admin@correo.com' };
      next();
    },
    isAdmin: (req, res, next) => {
      if (req.user?.rol === 'admin') return next();
      const error = new Error('No autorizado');
      error.statusCode = 403;
      next(error);
    }
  }));
  
  const request = require('supertest');
  const app = require('../../src/index');
  
  let marcaId = null;
  let categoriaId = null;
  let productoId = null;
  
  describe('Integración - Marcas', () => {
    test('POST /api/marcas debe agregar una nueva marca', async () => {
      const response = await request(app)
        .post('/api/marcas')
        .set('Cookie', ['token=mock'])
        .send({ nombre: 'MarcaTest' });
  
      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.messsage).toBe('Marca agregada');
    });
  
    test('GET /api/marcas debe obtener lista de marcas', async () => {
      const response = await request(app).get('/api/marcas');
  
      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.message)).toBe(true);
  
      const marcaTest = response.body.message.find(m => m.nombre === 'MarcaTest');
      expect(marcaTest).toBeDefined();
      marcaId = marcaTest.id_marca;
      console.log(marcaId)
    });
  });
  
  describe('Integración - Categorías', () => {
    test('POST /api/categorias debe agregar una nueva categoría', async () => {
      const response = await request(app)
        .post('/api/categorias')
        .set('Cookie', ['token=mock'])
        .send({ nombre: 'CategoriaTest', descripcion: 'Categoria de prueba' });
  
      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.messsage).toBe('Categoria agregada');
    });
  
    test('GET /api/categorias debe obtener lista de categorías', async () => {
      const response = await request(app).get('/api/categorias');
  
      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.message)).toBe(true);
  
      const categoriaTest = response.body.message.find(c => c.nombre === 'CategoriaTest');
      expect(categoriaTest).toBeDefined();
      categoriaId = categoriaTest.id_categoria;
      console.log(categoriaId)
    });
  });
  
  describe('Integración - Productos', () => {
    test('POST /api/productos debe agregar un nuevo producto', async () => {
      const response = await request(app)
        .post('/api/productos')
        .set('Cookie', ['token=mock'])
        .send({
          id_categoria: categoriaId,
          id_marca: marcaId,
          nombre: 'ProductoTest',
          descripcion: 'Descripción del producto de prueba',
          precio: 100.50,
          cantidad: 5,
          disponibilidad: true,
          valor: 0
        });
  
      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
    });
  
    test('GET /api/productos debe obtener lista de productos', async () => {
      const response = await request(app).get('/api/productos');
  
      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
  
      const productoTest = response.body.message.find(p => p.nombre === 'ProductoTest');
      expect(productoTest).toBeDefined();
      productoId = productoTest.id_producto;
    });
  
    test('DELETE /api/productos/:id debe eliminar el producto', async () => {
      const response = await request(app)
        .delete(`/api/productos/${productoId}`)
        .set('Cookie', ['token=mock']);
  
      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });
  
  describe('Limpieza - Eliminar marca y categoría de test', () => {
    test('DELETE /api/marcas/:id debe eliminar la marca', async () => {
      const response = await request(app)
        .delete(`/api/marcas/${marcaId}`)
        .set('Cookie', ['token=mock']);
  
      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
    });
  
    test('DELETE /api/categorias/:id debe eliminar la categoría', async () => {
      const response = await request(app)
        .delete(`/api/categorias/${categoriaId}`)
        .set('Cookie', ['token=mock']);
  
      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });
  