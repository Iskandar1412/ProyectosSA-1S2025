DROP PROCEDURE IF EXISTS sp_obtener_imagenes_producto;

DELIMITER $$

CREATE PROCEDURE sp_obtener_imagenes_producto(
    IN p_producto_id INT
)
BEGIN
    SELECT pi.id, pi.url_imagen, pi.creado_el
    FROM producto_imagenes pi
    WHERE pi.producto_id = p_producto_id;
END $$

DELIMITER ;
