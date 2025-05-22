DROP PROCEDURE IF EXISTS sp_obtener_productos_por_categoria;

DELIMITER $$

CREATE PROCEDURE sp_obtener_productos_por_categoria(
    IN p_categoria_id INT
)
BEGIN
    SELECT p.id, p.nombre, p.descripcion, p.precio, p.codigo, p.valor, p.cantidad, p.disponibilidad, p.creado_el, c.id AS categoria_id, c.nombre AS categoria_nombre
    FROM productos p
    JOIN categorias c ON p.categoria_id = c.id
    WHERE p.categoria_id = p_categoria_id
    AND p.disponibilidad = 1;
END $$

DELIMITER ;
