CREATE PROCEDURE cambio_rol (
    IN p_usuario_admin INT,
    IN p_usuario INT,
    IN p_rol_nuevo VARCHAR(30)
)
BEGIN
	IF (SELECT usuarios.id FROM usuarios JOIN  roles ON usuarios.rol_id = roles.id WHERE usuarios.id = p_usuario_admin AND roles.rol = "admin") THEN
		IF (SELECT usuarios.id FROM usuarios JOIN roles ON usuarios.rol_id = roles.id WHERE usuarios.id = p_usuario AND roles.rol = p_rol_nuevo) THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "No se puede asignar el mismo rol al usuario";
		ELSE
			UPDATE usuarios 
			JOIN roles ON roles.rol = p_rol_nuevo
			SET usuarios.rol_id = roles.id WHERE usuarios.id = p_usuario;
		END IF;
	ELSE
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "Usuario administrdor no valido o existente";
	END IF;
END;