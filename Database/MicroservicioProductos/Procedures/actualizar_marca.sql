DROP PROCEDURE IF EXISTS sp_actualizar_marca;

DELIMITER $$

CREATE PROCEDURE sp_actualizar_marca(IN marca_id INT, IN nuevo_nombre VARCHAR(100))
BEGIN
    UPDATE marcas
    SET nombre = nuevo_nombre
    WHERE id = marca_id;
END $$

DELIMITER ;
