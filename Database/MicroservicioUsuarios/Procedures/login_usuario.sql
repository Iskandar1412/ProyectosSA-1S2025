CREATE PROCEDURE login_usuario (
    IN p_credential VARCHAR(100),
    IN p_contrasenia VARCHAR(255)
)
BEGIN
    DECLARE v_notfound INT DEFAULT 0;
    DECLARE v_id INT;
    DECLARE v_nombres VARCHAR(50);
    DECLARE v_apellidos VARCHAR(50);
    DECLARE v_email VARCHAR(100);
    DECLARE v_rol_id INT;
    
    -- Manejador para cuando no se encuentre ningún registro
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_notfound = 1;
    
    SELECT id, nombre, apellido, correo, rol_id
    INTO v_id, v_nombres, v_apellidos, v_email, v_rol_id
    FROM usuarios
    WHERE (username = p_credential OR correo = p_credential)
      AND contrasenia = p_contrasenia
    LIMIT 1;
    
    IF v_notfound = 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Usuario/correo o contraseña incorrectos';
    ELSE
        SELECT v_id AS id,
               v_nombres AS nombres,
               v_apellidos AS apellidos,
               v_email AS correo,
               v_rol_id AS rol_id;
    END IF;
END;