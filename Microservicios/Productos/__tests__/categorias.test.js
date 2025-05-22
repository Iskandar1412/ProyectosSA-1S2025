const {
    agregarCategoria,
    obtenerCategorias,
    eliminarCategoria,
    actualizarCategoria,
  } = require('../src/controllers/categorias.controller');
  
  jest.mock('../src/models/commands/categorias.querys', () => ({
    GestionCategorias: jest.fn().mockImplementation(() => ({
      crearCategoria: jest.fn(async () => ({ success: true })),
      obtenerCategorias: jest.fn(async () => ({ success: true, message: [{ id: 1, nombre: 'Electrónica' }] })),
      eliminarCategoria: jest.fn(async () => ({ success: true, message: 'Eliminado correctamente' })),
      actualizarCategoria: jest.fn(async () => ({ success: true, message: 'Actualizado correctamente' })),
    }))
  }));
  
  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  
  describe('Categorias Controller', () => {
  
    test('agregarCategoria debe responder con 201 si los datos son válidos', async () => {
      const req = {
        body: {
          nombre: 'Ropa',
          descripcion: 'Categoría de ropa'
        }
      };
      const res = mockResponse();
      const next = jest.fn();
  
      await agregarCategoria(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, messsage: 'Categoria agregada' });
    });
  
    test('obtenerCategorias debe devolver lista correctamente', async () => {
      const req = {};
      const res = mockResponse();
      const next = jest.fn();
  
      await obtenerCategorias(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: [{ id: 1, nombre: 'Electrónica' }]
      });
    });
  
    test('eliminarCategoria debe devolver mensaje de éxito', async () => {
      const req = { params: { id: 1 } };
      const res = mockResponse();
      const next = jest.fn();
  
      await eliminarCategoria(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Eliminado correctamente'
      });
    });
  
    test('actualizarCategoria debe actualizar correctamente', async () => {
      const req = {
        body: {
          id: 1,
          nombre: 'Ropa actualizada',
          descripcion: 'Nueva descripción'
        }
      };
      const res = mockResponse();
      const next = jest.fn();
  
      await actualizarCategoria(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Actualizado correctamente'
      });
    });
  
  });
  