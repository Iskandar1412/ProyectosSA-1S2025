DROP PROCEDURE IF EXISTS sp_obtener_productos_por_marca;

DELIMITER $$

CREATE PROCEDURE sp_obtener_productos_por_marca(
    IN p_marca_id INT
)
BEGIN
    SELECT p.id, p.nombre, p.descripcion, p.precio, p.codigo, p.valor, p.cantidad, p.disponibilidad, p.creado_el, m.id AS marca_id, m.nombre AS marca_nombre
    FROM productos p
    JOIN marcas m ON p.marca_id = m.id
    WHERE p.marca_id = p_marca_id
    AND p.disponibilidad = 1;
END $$

DELIMITER ;
