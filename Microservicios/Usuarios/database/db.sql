CREATE DATABASE UsuariosMS;
USE UsuariosMS;

CREATE TABLE rol (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    rol ENUM("admin", "user") UNIQUE NOT NULL
);

CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_rol INT,
    nombre VARCHAR(150) NOT NULL,
    apellido VARCHAR(150) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    username VARCHAR(150) UNIQUE NOT NULL,
    contrasenia VARCHAR(255) NOT NULL,
    telefono VARCHAR(8) UNIQUE NOT NULL,
    genero ENUM("M", "F") NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    foto VARCHAR(255),
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol)    
);

CREATE TABLE direccion (
    id_direccion INT AUTO_INCREMENT PRIMARY KEY,
    ciudad VARCHAR(50),
    departamento VARCHAR(50),
    id_usuario INT NOT NULL,
    FOREIGN KEY(id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE confirmacion_correo (
    id_confirmacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    correo_confirmado BOOLEAN DEFAULT FALSE,
    fecha_confirmacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    codigo_confirmacion VARCHAR(150),
    caducidad VARCHAR(30),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE inicio_sesion (
    id_inicio INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    refresh_token VARCHAR(200) NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE cuenta_activa (
    id_usuario INT,
    activa BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE descuentos (
    id_descuento INT AUTO_INCREMENT PRIMARY KEY,
    rango_compra_min DECIMAL(10, 2),
    rango_compra_max DECIMAL(10, 2),
    porcentaje_descuento DECIMAL(5, 2)
);

CREATE TABLE usuario_reportado (
    id_usurio INT,
    motivo VARCHAR(500),
    estado ENUM('Revision', 'Resuelto'),
    fecha_reporte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE cuenta_administrador (
    id_administrador INT AUTO_INCREMENT,
    id_usuario INT,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE cuenta_usuario (
    id_cuenta_usuario INT AUTO_INCREMENT,
    id_usuario INT,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);