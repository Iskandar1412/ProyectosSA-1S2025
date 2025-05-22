CREATE PROCEDURE registrar_administrador (
    IN p_nombre VARCHAR(150),
    IN p_apellido VARCHAR(150),
    IN p_correo VARCHAR(150),
    IN p_username VARCHAR(50),
    IN p_telefono VARCHAR(150),
    IN p_genero ENUM('Masculino', 'Femenino'),
    IN p_fecha_nacimiento DATE,
    IN p_contrasenia VARCHAR(255),
    IN p_ciudad VARCHAR(50),
    IN p_departamento VARCHAR(50)
)
BEGIN
	DECLARE v_rol_id INT;
	DECLARE v_usuario_id INT;

    SELECT id INTO v_rol_id FROM roles
    WHERE rol = 'admin' LIMIT 1;

    IF v_rol_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El rol no existe';
    END IF;
    
    -- Verificar si el correo ya existe
    IF EXISTS(SELECT 1 FROM usuarios WHERE correo = p_correo) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El correo ya existe';
    -- Verificar si el usuario ya existe
    ELSEIF EXISTS(SELECT 1 FROM usuarios WHERE username = p_username) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El usuario ya existe';
    -- Verificar si el telefono existe
    ELSEIF EXISTS(SELECT 1 FROM usuarios where telefono = p_telefono) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El teléfono ya existe';
    ELSE
        INSERT INTO usuarios(
            nombre,
            apellido,
            correo,
            username,
            telefono,
            genero,
            fecha_nacimiento,
            contrasenia,
            rol_id
        )
        VALUES(
            p_nombre,
            p_apellido,
            p_correo,
            p_username,
            p_telefono,
            p_genero,
            p_fecha_nacimiento,
            p_contrasenia,
            v_rol_id
        );
        
        -- Obtención usuario insertado (id)
        SET v_usuario_id = LAST_INSERT_ID();
    
        INSERT INTO direcciones(
            ciudad,
            departamento,
            id_usuario
        ) VALUES(
            p_ciudad,
            p_departamento,
            v_usuario_id
        );

        SELECT 'Registro exitoso' AS mensaje;
    END IF;
END;