DROP PROCEDURE IF EXISTS sp_obtener_productos_por_precio;

DELIMITER $$

CREATE PROCEDURE sp_obtener_productos_por_precio(
    IN p_precio_min DECIMAL(10,2),
    IN p_precio_max DECIMAL(10,2)
)
BEGIN
    SELECT p.id, p.nombre, p.descripcion, p.precio, p.codigo, p.valor, p.cantidad, p.disponibilidad, p.creado_el, c.id AS categoria_id, c.nombre AS categoria_nombre
    FROM productos p
    JOIN categorias c ON p.categoria_id = c.id
    WHERE p.precio BETWEEN p_precio_min AND p_precio_max
    AND p.disponibilidad = 1;  -- Asegura que los productos estén disponibles
END $$

DELIMITER ;
