const {
    agregarQuitarFavorito,
    obtenerFavoritos,
    notificarProductoBajo,
    notificarCambioProducto
  } = require('../src/controllers/favoritos.controller');
  
  jest.mock('../src/models/commands/favoritos.query', () => ({
    GestionFavoritos: jest.fn().mockImplementation(() => ({
      agregarQuitar: jest.fn(async () => ({ success: true, message: 'Favorito actualizado' })),
      obtenerFavoritos: jest.fn(async () => ({ success: true, message: ['Producto A', 'Producto B'] })),
      parseoVerProductosFavoritosBajos: jest.fn(async () => ({ success: true, message: 'Productos notificados' })),
      notificarCambioProducto: jest.fn(async () => ({ success: true, message: 'Cambio notificado' }))
    }))
  }));
  
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  
  describe('Favoritos Controller', () => {
  
    test('agregarQuitarFavorito debe responder con éxito', async () => {
      const req = {
        user: { id: 1 },
        body: {
          id_producto: 10,
          correo: 'test@correo.com'
        }
      };
      const res = mockRes();
      const next = jest.fn();
  
      await agregarQuitarFavorito(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Favorito actualizado' });
    });
  
    test('obtenerFavoritos debe devolver productos favoritos', async () => {
      const req = { user: { id: 1 } };
      const res = mockRes();
      const next = jest.fn();
  
      await obtenerFavoritos(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: ['Producto A', 'Producto B'] });
    });
  
    test('notificarProductoBajo debe funcionar con productos válidos', async () => {
      const req = { body: { carro: [{ id: 1, nombre: 'Producto A' }] } };
      const res = mockRes();
      const next = jest.fn();
  
      await notificarProductoBajo(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Productos notificados' });
    });
  
    test('notificarCambioProducto debe funcionar correctamente', async () => {
      const req = { body: { producto: { id: 5, nombre: 'Nuevo producto' } } };
      const res = mockRes();
      const next = jest.fn();
  
      await notificarCambioProducto(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Cambio notificado' });
    });
  
  });
  