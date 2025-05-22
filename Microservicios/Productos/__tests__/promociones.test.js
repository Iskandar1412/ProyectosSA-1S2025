const {
    agregarPromocion,
    modificarPromocion,
    obtenerPromociones,
    eliminarPromocion,
    agregarProductoPromocion,
    obtenerProductosPromociones,
    modificarProductoPromocion,
    eliminarProductoPromocion
  } = require('../src/controllers/promociones.controller');
  
  jest.mock('../src/models/commands/promociones.query', () => ({
    GestionPromociones: jest.fn().mockImplementation(() => ({
      agregarPromocion: jest.fn(async () => ({ success: true, message: 'Promoción agregada' })),
      modificarPromocion: jest.fn(async () => ({ success: true, message: 'Promoción modificada' })),
      obtenerPromociones: jest.fn(async () => ({ success: true, message: ['Promo 1', 'Promo 2'] })),
      elminarPromocion: jest.fn(async () => ({ success: true, message: 'Promoción eliminada' })),
      agregarProductoPromocion: jest.fn(async () => ({ success: true, message: 'Producto promocionado' })),
      obtenerProductosPromociones: jest.fn(async () => ({
        success: true,
        message: [{
          id: 1,
          nombre: 'Producto A',
          fecha_inicio: new Date('2025-04-01'),
          fecha_fin: new Date('2025-04-30')
        }]
      })),
      modificarProductoPromocion: jest.fn(async () => ({ success: true, message: 'Producto promo modificado' })),
      eliminarProductoPromocion: jest.fn(async () => ({ success: true, message: 'Producto promo eliminado' }))
    }))
  }));
  
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  
  describe('Promociones Controller', () => {
    test('agregarPromocion debe responder correctamente', async () => {
      const req = { body: { porcentaje: 10 } };
      const res = mockRes();
      const next = jest.fn();
  
      await agregarPromocion(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Promoción agregada' });
    });
  
    test('modificarPromocion debe responder correctamente', async () => {
      const req = { body: { id_promocion: 1, porcentaje: 15 } };
      const res = mockRes();
      const next = jest.fn();
  
      await modificarPromocion(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Promoción modificada' });
    });
  
    test('obtenerPromociones debe retornar la lista', async () => {
      const req = {};
      const res = mockRes();
      const next = jest.fn();
  
      await obtenerPromociones(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: ['Promo 1', 'Promo 2'] });
    });
  
    test('eliminarPromocion debe retornar mensaje exitoso', async () => {
      const req = { params: { id: 1 } };
      const res = mockRes();
      const next = jest.fn();
  
      await eliminarPromocion(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Promoción eliminada' });
    });
  
    test('agregarProductoPromocion debe funcionar con datos válidos', async () => {
      const req = {
        body: {
          id_producto: 1,
          id_promocion: 2,
          fecha_inicio: '2025-04-01',
          fecha_fin: '2025-04-30'
        }
      };
      const res = mockRes();
      const next = jest.fn();
  
      await agregarProductoPromocion(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Producto promocionado' });
    });
  
    test('obtenerProductosPromociones debe devolver datos formateados', async () => {
      const req = {};
      const res = mockRes();
      const next = jest.fn();
  
      await obtenerProductosPromociones(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: [{
          id: 1,
          nombre: 'Producto A',
          fecha_inicio: '2025-04-01',
          fecha_fin: '2025-04-30'
        }]
      });
    });
  
    test('modificarProductoPromocion debe responder correctamente', async () => {
      const req = {
        body: {
          id_promocion_producto: 1,
          id_promocion: 2,
          fecha_inicio: '2025-05-01',
          fecha_fin: '2025-05-15'
        }
      };
      const res = mockRes();
      const next = jest.fn();
  
      await modificarProductoPromocion(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Producto promo modificado' });
    });
  
    test('eliminarProductoPromocion debe responder correctamente', async () => {
      const req = { params: { id: 1 } };
      const res = mockRes();
      const next = jest.fn();
  
      await eliminarProductoPromocion(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Producto promo eliminado' });
    });
  });
  