const {
    agregarMarca,
    obtenerMarcas,
    eliminarMarca,
    actualizarMarca,
  } = require('../src/controllers/marcas.controller');
  
  jest.mock('../src/models/commands/marcas.querys', () => ({
    GestionMarcas: jest.fn().mockImplementation(() => ({
      agregarMarcas: jest.fn(async () => ({ success: true })),
      obtenerMarcas: jest.fn(async () => ({ success: true, message: [{ id: 1, nombre: 'Nike' }] })),
      eliminarMarca: jest.fn(async () => ({ success: true, message: 'Eliminado correctamente' })),
      actualizarMarca: jest.fn(async () => ({ success: true, message: 'Actualizado correctamente' })),
    }))
  }));
  
  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  
  describe('Marcas Controller', () => {
  
    test('agregarMarca debe responder con 201 si los datos son válidos y hay token', async () => {
      const req = {
        user: { id: 1, rol: 'admin' },
        body: { nombre: 'Adidas' }
      };
      const res = mockResponse();
      const next = jest.fn();
  
      await agregarMarca(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, messsage: 'Marca agregada' });
    });
  
    test('agregarMarca debe fallar si no hay token', async () => {
      const req = {
        body: { nombre: 'Puma' }
      };
      const res = mockResponse();
      const next = jest.fn();
  
      await agregarMarca(req, res, next);
  
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].message).toBe('Acceso denegado: No se ha proporcionado token');
    });
  
    test('obtenerMarcas debe devolver lista correctamente', async () => {
      const req = {};
      const res = mockResponse();
      const next = jest.fn();
  
      await obtenerMarcas(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: [{ id: 1, nombre: 'Nike' }]
      });
    });
  
    test('eliminarMarca debe devolver mensaje de éxito', async () => {
      const req = { params: { id: 1 } };
      const res = mockResponse();
      const next = jest.fn();
  
      await eliminarMarca(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Eliminado correctamente'
      });
    });
  
    test('actualizarMarca debe actualizar correctamente', async () => {
      const req = {
        body: {
          id: 1,
          nombre: 'New Balance'
        }
      };
      const res = mockResponse();
      const next = jest.fn();
  
      await actualizarMarca(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Actualizado correctamente'
      });
    });
  
  });
  