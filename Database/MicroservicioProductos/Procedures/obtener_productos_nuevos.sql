DROP PROCEDURE IF EXISTS sp_obtener_productos_mas_nuevos;

DELIMITER $$

CREATE PROCEDURE sp_obtener_productos_mas_nuevos()
BEGIN
    SELECT p.id, p.nombre, p.descripcion, p.precio, p.codigo, p.valor, p.cantidad, p.disponibilidad, p.creado_el, c.id AS categoria_id, c.nombre AS categoria_nombre
    FROM productos p
    JOIN categorias c ON p.categoria_id = c.id
    WHERE p.disponibilidad = 1
    ORDER BY p.creado_el DESC
    LIMIT 5;
END $$

DELIMITER ;
