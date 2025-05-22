DROP PROCEDURE IF EXISTS sp_actualizar_categoria;

DELIMITER $$

CREATE PROCEDURE sp_actualizar_categoria(IN categoria_id INT, IN nuevo_nombre VARCHAR(100), IN nueva_descripcion TEXT)
BEGIN
    UPDATE categorias
    SET nombre = nuevo_nombre,
        descripcion = nueva_descripcion
    WHERE id = categoria_id;
END $$

DELIMITER ;
