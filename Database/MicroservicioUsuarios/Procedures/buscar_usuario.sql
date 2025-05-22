CREATE PROCEDURE buscar_usuario (
    IN p_cedenciales VARCHAR(100)
)
BEGIN
	DECLARE v_id VARCHAR(150);
	DECLARE v_correo VARCHAR(150);
	DECLARE v_username VARCHAR(150);
	DECLARE v_contrasenia VARCHAR(255);
	DECLARE v_rol_id INT;
 	DECLARE v_rol VARCHAR(30);
	DECLARE v_notfound INT DEFAULT 0;

	DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_notfound = 1;
	
	SELECT usuarios.id, usuarios.correo, usuarios.username, usuarios.contrasenia, usuarios.rol_id, roles.rol AS rol_asignado 
	INTO v_id, v_correo, v_username, v_contrasenia, v_rol_id, v_rol
	FROM usuarios
	JOIN roles ON usuarios.rol_id = roles.id
	WHERE (usuarios.correo = p_cedenciales OR usuarios.username = p_cedenciales)
	LIMIT 1;
	
	IF v_notfound = 1 THEN 
		-- SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "username no enctontrado en la base de datos";
		SELECT NULL AS id,
               NULL AS username, 
               NULL AS correo,
               NULL AS contrasenia,
               NULL AS rol;
	ELSE
		SELECT v_id AS id,
				v_username AS username, 
				v_correo AS correo,
				v_contrasenia AS contrasenia,
				v_rol AS rol;
	END IF;
END;