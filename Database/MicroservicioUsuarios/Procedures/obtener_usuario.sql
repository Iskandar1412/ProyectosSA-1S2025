CREATE PROCEDURE obtener_usuario (
    IN p_usuario_id INT
)
BEGIN
    DECLARE v_datos JSON;

    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE id = p_usuario_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El usuario no existe';
    END IF;

    SET v_datos = (
        SELECT JSON_OBJECT(
            'id', u.id,
            'nombre', u.nombre,
            'apellido', u.apellido,
            'correo', u.correo,
            'username', u.username,
            'telefono', u.telefono,
            'genero', u.genero,
            'fecha_nacimiento', u.fecha_nacimiento,
            'fecha_creacion_cuenta', u.fecha_creacion_cuenta,
            'url_profile', u.url_profile,
            'rol', r.rol,
            'direcciones', (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'ciudad', d.ciudad,
                        'departamento', d.departamento
                    )
                )
                FROM direcciones d WHERE d.id_usuario = u.id
            )
        )
        FROM usuarios u
        JOIN roles r ON u.rol_id = r.id
        WHERE u.id = p_usuario_id
    );

    SELECT v_datos AS datos_usuario;
END;