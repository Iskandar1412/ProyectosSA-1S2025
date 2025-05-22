DROP PROCEDURE IF EXISTS sp_obtener_productos_admin;

DELIMITER $$

CREATE PROCEDURE sp_obtener_productos_admin()
BEGIN
    SELECT p.id, 
           p.nombre, 
           p.descripcion, 
           p.precio, 
           p.codigo, 
           p.valor, 
           p.cantidad, 
           p.disponibilidad, 
           p.creado_el, 
           c.id AS categoria_id, 
           c.nombre AS categoria_nombre,
           m.id AS marca_id, 
           m.nombre AS marca_nombre
    FROM productos p
    JOIN categorias c ON p.categoria_id = c.id
    LEFT JOIN marcas m ON p.marca_id = m.id;
END $$

DELIMITER ;
