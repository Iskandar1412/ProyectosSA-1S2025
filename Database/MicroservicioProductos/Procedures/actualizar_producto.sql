DROP PROCEDURE IF EXISTS sp_actualizar_producto;

DELIMITER $$

CREATE PROCEDURE sp_actualizar_producto(
    IN p_id INT,
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
    -- Declarar las variables al inicio del bloque BEGIN
    DECLARE producto_existente INT;
    DECLARE categoria_existente INT;
    DECLARE marca_existente INT;
    DECLARE nuevo_codigo VARCHAR(50);

    -- Verificar si el producto existe
    SELECT COUNT(*) INTO producto_existente
    FROM productos
    WHERE id = p_id;

    IF producto_existente = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Producto no encontrado';
    END IF;

    -- Verificar si la categoría existe
    SELECT COUNT(*) INTO categoria_existente
    FROM categorias
    WHERE id = p_categoria_id;

    IF categoria_existente = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La categoría no existe';
    END IF;

    -- Verificar si la marca existe
    SELECT COUNT(*) INTO marca_existente
    FROM marcas
    WHERE id = p_marca_id;

    IF marca_existente = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La marca no existe';
    END IF;

    -- Actualizar el producto
    UPDATE productos
    SET categoria_id = p_categoria_id,
        creado_por = p_creado_por,
        nombre = p_nombre,
        descripcion = p_descripcion,
        precio = p_precio,
        valor = p_valor,
        cantidad = p_cantidad,
        disponibilidad = p_disponibilidad,
        marca_id = p_marca_id
    WHERE id = p_id;

    -- Confirmación de actualización exitosa
    SELECT 'Producto actualizado exitosamente' AS message;
END $$

DELIMITER ;
