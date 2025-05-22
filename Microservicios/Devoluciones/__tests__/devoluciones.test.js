const {
    agregarDevolucion,
    obtenerDevolucionesUsuario,
    obtenerDevolucionesAdmin,
    modificarDevolucion,
    obtenerCuponDevolucionUsuario,
    modificarEstadoCuponUsuario
  } = require('../src/controllers/devoluciones.controller');
  
  jest.mock('../src/models/commands/devoluciones.query', () => ({
    GestionDevoluciones: jest.fn().mockImplementation(() => ({
      agregarDevolucion: jest.fn(async () => ({ success: true, message: 'Devolución registrada' })),
      devolucionesUsuario: jest.fn(async () => ({ success: true, message: ['Devolución 1'] })),
      devolucionesAdmin: jest.fn(async () => ({ success: true, message: ['Admin Devolución'] })),
      modificarDevolucion: jest.fn(async () => ({
        success: true,
        message: {
          precio_total: 100,
          correo_usuario: 'test@correo.com'
        }
      })),
      generarCuponValorProductoUsuario: jest.fn(async () => ({ success: true, message: 'Cupón generado' })),
      obtenerCuponDevolucionUsuario: jest.fn(async () => ({ success: true, message: ['Cupón 1'] })),
      modificarEstadoCuponUsuario: jest.fn(async () => ({ success: true, message: 'Estado modificado' })),
      crearOtroCuponDiferencia: jest.fn(async () => ({ success: true, message: 'Cupón adicional creado' }))
    }))
  }));
  
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  
  describe('Devoluciones Controller', () => {
  
    test('agregarDevolucion debe funcionar con datos válidos', async () => {
      const fecha = new Date();
      const req = {
        user: { id: 1 },
        body: {
          correo_usuario: 'test@correo.com',
          id_producto: 2,
          codigo_producto: 'ABC123',
          fecha: fecha.toISOString(),
          cantidad: 1,
          motivo_devolucion: 'Defecto',
          precio_producto: 50
        }
      };
      const res = mockRes();
      const next = jest.fn();
  
      await agregarDevolucion(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Devolución registrada' });
    });
  
    test('obtenerDevolucionesUsuario debe retornar lista del usuario', async () => {
      const req = { user: { id: 1 } };
      const res = mockRes();
      const next = jest.fn();
  
      await obtenerDevolucionesUsuario(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: ['Devolución 1'] });
    });
  
    test('obtenerDevolucionesAdmin debe retornar lista global', async () => {
      const req = {};
      const res = mockRes();
      const next = jest.fn();
  
      await obtenerDevolucionesAdmin(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: ['Admin Devolución'] });
    });
  
    test('modificarDevolucion debe generar cupón si es aceptada', async () => {
      const req = {
        body: { id_devolucion: 5, estado: 'ACEPTADO' }
      };
      const res = mockRes();
      const next = jest.fn();
  
      await modificarDevolucion(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Cupón generado' });
    });
  
    test('obtenerCuponDevolucionUsuario debe retornar cupones', async () => {
      const req = { user: { id: 1 } };
      const res = mockRes();
      const next = jest.fn();
  
      await obtenerCuponDevolucionUsuario(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: ['Cupón 1'] });
    });
  
    test('modificarEstadoCuponUsuario crea cupón adicional si hay diferencia', async () => {
      const req = {
        body: {
          id: 1,
          id_devolucion: 2,
          valor: 100,
          correo: 'test@correo.com',
          sub_total: 80
        }
      };
      const res = mockRes();
      const next = jest.fn();
  
      await modificarEstadoCuponUsuario(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Estado modificado' });
    });
  
  });
  