const {
    agregarPago,
    obtenerPagoUsuario,
    obtenerPagoAdministrador
  } = require('../src/controllers/pagos.controller');
  
  jest.mock('../src/models/commands/pagos.query', () => ({
    GestionPagos: jest.fn().mockImplementation(() => ({
      agregarPago: jest.fn(async () => ({ success: true, message: 'Pago registrado exitosamente' })),
      obtenerPagosUsuario: jest.fn(async () => ({ success: true, message: ['Pago 1', 'Pago 2'] })),
      obtenerPagosAdmin: jest.fn(async () => ({ success: true, message: ['Pago admin 1', 'Pago admin 2'] }))
    }))
  }));
  
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  
  describe('Pagos Controller', () => {
    test('agregarPago responde correctamente con datos válidos', async () => {
      const req = {
        user: { id: 1 },
        body: {
          id_compra: 1,
          usuario: 'testuser',
          tipo_pago_1: 'Tarjeta',
          no_tarjeta_1: '1234567890123456',
          porcentaje_1: 50,
          tipo_pago_2: 'Efectivo',
          no_tarjeta_2: null,
          porcentaje_2: 50,
          subtotal: 100,
          cupon_descuento: 10,
          total: 90
        }
      };
      const res = mockRes();
      const next = jest.fn();
  
      await agregarPago(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Pago registrado exitosamente'
      });
    });
  
    test('obtenerPagoUsuario debe retornar los pagos del usuario', async () => {
      const req = { user: { id: 1 } };
      const res = mockRes();
      const next = jest.fn();
  
      await obtenerPagoUsuario(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: ['Pago 1', 'Pago 2']
      });
    });
  
    test('obtenerPagoAdministrador debe retornar todos los pagos', async () => {
      const req = {};
      const res = mockRes();
      const next = jest.fn();
  
      await obtenerPagoAdministrador(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: ['Pago admin 1', 'Pago admin 2']
      });
    });
  });
  