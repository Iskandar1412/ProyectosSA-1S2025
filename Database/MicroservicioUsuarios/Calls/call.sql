call buscar_usuario("pacosilva468@gmail.com");
call registrar_usuario("Juan", "Urbina", 24, "iskandar", "pacosilva468@gmail.com", "123");
call registrar_administrador("Juan", "Urbina", 24, "iskandar", "pacosilva468@gmail.com", "123");
call login_usuario("iskandar", "123");
call registrar_rol("Administrador");
call cambio_rol(1, 2, "user");