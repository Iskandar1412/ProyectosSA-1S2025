create database if not exists UsuariosMS;
use UsuariosMS;

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rol VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(150) NOT NULL UNIQUE,
    genero ENUM('Masculino', 'Femenino') NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    fecha_creacion_cuenta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    url_profile VARCHAR(255),
    contrasenia VARCHAR(255) NOT NULL,
    cuenta_activada BOOLEAN DEFAULT FALSE,
    token_activacion VARCHAR(255),
    rol_id INT NOT NULL DEFAULT 'usuario',
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

CREATE TABLE direcciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    ciudad VARCHAR(50) NOT NULL,
    departamento VARCHAR(50) NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);