CREATE PROCEDURE actualizar_usuario (
    IN p_usuario_id INT,
    IN p_correo VARCHAR(100),
    IN p_telefono VARCHAR(150),
    IN p_direcciones JSON
)
BEGIN
    DECLARE v_index INT DEFAULT 0;
    DECLARE v_length INT DEFAULT 0;
    DECLARE v_ciudad VARCHAR(50);
    DECLARE v_departamento VARCHAR(50);

    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE id = p_usuario_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El usuario no existe';
    END IF;

    IF EXISTS (SELECT 1 FROM usuarios WHERE correo = p_correo AND id <> p_usuario_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El correo ya está en uso';
    ELSE
        UPDATE usuarios SET correo = p_correo WHERE id = p_usuario_id;
    END IF;

    IF EXISTS (SELECT 1 FROM usuarios WHERE telefono = p_telefono AND id <> p_usuario_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El teléfono ya está en uso';
    ELSE
        UPDATE usuarios SET telefono = p_telefono WHERE id = p_usuario_id;
    END IF;

    SET v_length = JSON_LENGTH(p_direcciones);

    IF v_length > 0 THEN
        DELETE FROM direcciones WHERE id_usuario = p_usuario_id;

        WHILE v_index < v_length DO
            SET v_ciudad = JSON_UNQUOTE(JSON_EXTRACT(p_direcciones, CONCAT('$[', v_index, '].ciudad')));
            SET v_departamento = JSON_UNQUOTE(JSON_EXTRACT(p_direcciones, CONCAT('$[', v_index, '].departamento')));

            INSERT INTO direcciones (id_usuario, ciudad, departamento)
            VALUES (p_usuario_id, v_ciudad, v_departamento);

            SET v_index = v_index + 1;
        END WHILE;
    END IF;

    SELECT 'Datos actualizados' AS mensaje;
END;