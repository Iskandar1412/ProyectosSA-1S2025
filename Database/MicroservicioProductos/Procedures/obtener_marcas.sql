DROP PROCEDURE IF EXISTS sp_obtener_marcas;

DELIMITER $$

CREATE PROCEDURE sp_obtener_marcas()
BEGIN
    SELECT * FROM marcas ORDER BY nombre;
END $$

DELIMITER ;
