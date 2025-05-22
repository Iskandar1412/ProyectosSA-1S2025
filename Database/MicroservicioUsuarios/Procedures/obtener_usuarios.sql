CREATE PROCEDURE obtener_usuarios (
    IN p_admin_id INT
)
BEGIN
    DECLARE v_es_admin INT;

    SELECT COUNT(*) INTO v_es_admin
    FROM usuarios u JOIN roles r ON u.rol_id = r.id
    WHERE u.id = p_admin_id AND r.rol = 'admin';

    IF v_es_admin = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Acceso denegado. No tienes permisos para ver esta información.';
    END IF;

    SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
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
            'cuenta_activada', u.cuenta_activada,
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
    ) 
    AS usuarios
    FROM usuarios u
    JOIN roles r ON u.rol_id = r.id;
END;