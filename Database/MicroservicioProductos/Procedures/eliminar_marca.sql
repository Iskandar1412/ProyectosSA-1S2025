DROP PROCEDURE IF EXISTS sp_eliminar_marca;

DELIMITER $$

CREATE PROCEDURE sp_eliminar_marca(IN marca_id INT)
BEGIN
    DELETE FROM marcas WHERE id = marca_id;
END $$

DELIMITER ;
