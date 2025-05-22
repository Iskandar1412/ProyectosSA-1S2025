const {
    agregarCoprasUsuarios,
    obtenerComprasAdmin,
    obtenerComprasUser,
    modificarEstadoOrden,
    obtenerHistorial,
    obtenerHistorialProductosEntregados
  } = require('../src/controllers/compras.controller');
  
  jest.mock('../src/models/commands/compras.query', () => ({
    GestionCompras: jest.fn().mockImplementation(() => ({
      agregarCompra: jest.fn(async () => ({ success: true, message: 'Compra registrada' })),
      obtenerComprasAdmin: jest.fn(async () => ({ success: true, message: ['Compra Admin'] })),
      obtenerComprasUsuario: jest.fn(async () => ({ success: true, message: ['Compra Usuario'] })),
      modificarEstadoCompra: jest.fn(async () => ({ success: true, message: 'Estado actualizado' })),
      obtenerHistorial: jest.fn(async () => ({ success: true, message: ['Historial completo'] })),
      obtenerHistorialFinal: jest.fn(async () => ({ success: true, message: ['Historial entregado'] }))
    }))
  }));
  
  jest.mock('../src/config/mail', () => jest.fn(async () => ({ success: true })));
  
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  
  describe('Compras Controller', () => {
  
    test('agregarCoprasUsuarios debe registrar compra correctamente', async () => {
      const req = {
        body: {
          id_usuario: 1,
          correo_usuario: 'usuario@test.com',
          total_pagar: 100,
          descuento: 10,
          sub_total: 90,
          carrito: [{
            nombre: 'Producto X',
            codigo: 'ABC123',
            cantidad: 1,
            precio: 100,
            descuento: 10
          }]
        }
      };
      const res = mockRes();
      const next = jest.fn();
  
      await agregarCoprasUsuarios(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Compra registrada' });
    });
  
    test('obtenerComprasAdmin debe devolver compras del admin', async () => {
      const req = {};
      const res = mockRes();
      const next = jest.fn();
  
      await obtenerComprasAdmin(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: ['Compra Admin'] });
    });
  
    test('obtenerComprasUser debe devolver compras del usuario', async () => {
      const req = { user: { id: 1 } };
      const res = mockRes();
      const next = jest.fn();
  
      await obtenerComprasUser(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: ['Compra Usuario'] });
    });
  
    test('modificarEstadoOrden debe actualizar estado de orden', async () => {
      const req = { body: { id_orden: 1, estado: 'ENTREGADO' } };
      const res = mockRes();
      const next = jest.fn();
  
      await modificarEstadoOrden(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Estado actualizado' });
    });
  
    test('obtenerHistorial debe devolver historial del usuario', async () => {
      const req = { user: { id: 1 } };
      const res = mockRes();
      const next = jest.fn();
  
      await obtenerHistorial(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: ['Historial completo'] });
    });
  
    test('obtenerHistorialProductosEntregados debe devolver historial filtrado', async () => {
      const req = { user: { id: 1 } };
      const res = mockRes();
      const next = jest.fn();
  
      await obtenerHistorialProductosEntregados(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: ['Historial entregado'] });
    });
  
  });
  