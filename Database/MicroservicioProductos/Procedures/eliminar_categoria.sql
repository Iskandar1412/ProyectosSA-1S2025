DROP PROCEDURE IF EXISTS sp_eliminar_categoria;

DELIMITER $$

CREATE PROCEDURE sp_eliminar_categoria(IN categoria_id INT)
BEGIN
    DELETE FROM categorias WHERE id = categoria_id;
END $$

DELIMITER ;
