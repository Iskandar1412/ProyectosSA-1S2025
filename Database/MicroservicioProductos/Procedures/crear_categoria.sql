DROP PROCEDURE IF EXISTS sp_crear_categoria;

DELIMITER $$

CREATE PROCEDURE sp_crear_categoria(
    IN p_nombre VARCHAR(100),
    IN p_descripcion TEXT,
    OUT p_categoria_id INT
)
BEGIN
    DECLARE categoria_existe INT;

    -- Verificar si la categoría ya existe
    SELECT COUNT(*) INTO categoria_existe FROM categorias WHERE nombre = p_nombre;

    IF categoria_existe > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: La categoría ya existe.';
    ELSE
        -- Insertar la nueva categoría
        INSERT INTO categorias (nombre, descripcion)
        VALUES (p_nombre, p_descripcion);
        
        -- Obtener el ID de la categoría recién insertada
        SET p_categoria_id = LAST_INSERT_ID();
    END IF;
END $$

DELIMITER ;

