const {
    agregarProducto,
    obtenerProductos,
    actualizarProducto,
    obtenerProductosPorFiltro
  } = require('../src/controllers/productos.controller');
  
  jest.mock('../src/models/commands/productos.querys', () => ({
    GestionProductos: jest.fn().mockImplementation(() => ({
      crearProducto: jest.fn(async () => ({ success: true })),
      obtenerProductos: jest.fn(async () => ({ success: true, message: [{ id: 1, nombre: 'Producto A' }] })),
      actualizarProducto: jest.fn(async () => ({ success: true, message: 'Actualizado correctamente' })),
      productoXCategoria: jest.fn(async () => ({ success: true, data: ['Producto filtrado'] })),
    }))
  }));
  
  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  
  describe('Productos Controller', () => {
  
    test('agregarProducto debe agregar correctamente', async () => {
      const req = {
        user: { id: 1 },
        body: {
          id_categoria: 1,
          id_marca: 1,
          nombre: 'Zapato',
          descripcion: 'Zapato cómodo',
          precio: 150,
          cantidad: 10,
          disponibilidad: true,
          valor: 5
        }
      };
      const res = mockResponse();
      const next = jest.fn();
  
      await agregarProducto(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, messsage: 'Producto agregado' });
    });
  
    test('obtenerProductos debe devolver lista', async () => {
      const req = {};
      const res = mockResponse();
      const next = jest.fn();
  
      await obtenerProductos(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: [{ id: 1, nombre: 'Producto A' }]
      });
    });
  
    test('actualizarProducto debe responder con éxito', async () => {
      const req = {
        body: {
          id_producto: 1,
          id_categoria: 1,
          id_marca: 1,
          nombre: 'Actualizado',
          descripcion: 'Producto actualizado',
          precio: 100,
          cantidad: 5,
          disponibilidad: true,
          valor: 3
        }
      };
      const res = mockResponse();
      const next = jest.fn();
  
      await actualizarProducto(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(202);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Producto actualizado exitosamente' });
    });
  
    test('obtenerProductosPorFiltro debe filtrar por categoría', async () => {
      const req = {
        query: {
          filtro: 'Categoría',
          parametros: '1'
        }
      };
      const res = mockResponse();
      const next = jest.fn();
  
      await obtenerProductosPorFiltro(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: ['Producto filtrado']
      });
    });
  
  });
  