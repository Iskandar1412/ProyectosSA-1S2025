CREATE PROCEDURE estado_cuenta(
    IN p_admin_id INT,
    IN p_usuario_id INT,
    IN p_nuevo_estado BOOLEAN
)
BEGIN
    DECLARE v_es_admin INT;

    SELECT COUNT(*) INTO v_es_admin
    FROM usuarios u JOIN roles r ON u.rol_id = r.id
    WHERE u.id = p_admin_id AND r.rol = 'admin';

    IF v_es_admin = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Acceso denegado. Usuario no autorizado.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE id = p_usuario_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Usuario no existente en la base de datos.';
    END IF;

    UPDATE usuarios SET cuenta_activada = p_nuevo_estado WHERE id = p_usuario_id;

    SELECT 'Cambio de estado de cuenta exitoso' AS mensaje;
END;