DROP PROCEDURE IF EXISTS sp_obtener_categorias;

DELIMITER $$

CREATE PROCEDURE sp_obtener_categorias()
BEGIN
    SELECT * FROM categorias;
END $$

DELIMITER ;
