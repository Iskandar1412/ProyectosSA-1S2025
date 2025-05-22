DROP PROCEDURE IF EXISTS sp_crear_marca;

DELIMITER $$

CREATE PROCEDURE sp_crear_marca(
    IN p_nombre VARCHAR(100),
    OUT p_marca_id INT
)
BEGIN
    DECLARE marca_existe INT;

    -- Verificar si la marca ya existe
    SELECT COUNT(*) INTO marca_existe FROM marcas WHERE nombre = p_nombre;

    IF marca_existe > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: La marca ya existe.';
    ELSE
        -- Insertar la nueva marca
        INSERT INTO marcas (nombre)
        VALUES (p_nombre);
        
        -- Obtener el ID de la categoría recién insertada
        SET p_marca_id = LAST_INSERT_ID();
    END IF;
END $$

DELIMITER ;

