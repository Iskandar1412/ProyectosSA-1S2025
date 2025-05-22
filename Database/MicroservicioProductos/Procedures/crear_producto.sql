DROP PROCEDURE IF EXISTS sp_crear_producto;

DELIMITER $$

CREATE PROCEDURE sp_crear_producto(
    IN p_categoria_id INT,
    IN p_creado_por INT,
    IN p_nombre VARCHAR(255),
    IN p_descripcion TEXT,
    IN p_precio DECIMAL(10,2),
    IN p_valor DECIMAL(10,2),
    IN p_cantidad INT,
    IN p_disponibilidad BOOLEAN,
    IN p_marca_id INT
)
BEGIN
    DECLARE producto_id INT;
    DECLARE categoria_existente INT;
    DECLARE marca_existente INT;
    DECLARE nuevo_codigo VARCHAR(50);
    DECLARE ultimo_id INT;

    -- Verificar si la categoría existe
    SELECT COUNT(*) INTO categoria_existente
    FROM categorias
    WHERE id = p_categoria_id;

    -- Si la categoría no existe, devolver un error
    IF categoria_existente = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La categoría no existe';
    END IF;

    -- Verificar si la marca existe
    SELECT COUNT(*) INTO marca_existente
    FROM marcas
    WHERE id = p_marca_id;

    -- Si la marca no existe, devolver un error
    IF marca_existente = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La marca no existe';
    END IF;

    -- Obtener el último id del producto insertado (sin usar LAST_INSERT_ID())
    SELECT MAX(id) INTO ultimo_id
    FROM productos;

    -- Generar el código del producto automáticamente basado en el último id
    SET nuevo_codigo = CONCAT('P-', LPAD(ultimo_id + 1, 5, '0'));  -- Se suma 1 al último id

    -- Insertar el nuevo producto, incluyendo el código generado automáticamente y la marca
    INSERT INTO productos (categoria_id, creado_por, nombre, descripcion, precio, codigo, valor, cantidad, disponibilidad, marca_id)
    VALUES (p_categoria_id, p_creado_por, p_nombre, p_descripcion, p_precio, nuevo_codigo, p_valor, p_cantidad, p_disponibilidad, p_marca_id);

    -- Obtener el ID del producto insertado
    SET producto_id = LAST_INSERT_ID();

    -- Retornar el ID del nuevo producto
    SELECT producto_id AS nuevo_producto_id;
END $$

DELIMITER ;
