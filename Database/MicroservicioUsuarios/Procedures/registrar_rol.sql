CREATE PROCEDURE registrar_rol (
    IN p_rol VARCHAR(30)
)
BEGIN
    IF EXISTS (SELECT 1 FROM roles WHERE rol = p_rol) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El rol existente';
    ELSE
        INSERT INTO roles(rol) VALUES(p_rol);
        SELECT 'Rol agregado' AS mensaje;
    END IF;
END;