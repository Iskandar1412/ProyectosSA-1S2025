CREATE DATABASE ProductosMS;

USE ProductosMS;

CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    descripcion TEXT
);

CREATE TABLE marcas (
    id_marca INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50)
);

CREATE TABLE productos_imagenes (
    id_imagen INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT,
    url_imagen VARCHAR (250)
);

CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT,
    id_marca INT,
    codigo VARCHAR(50),
    creado_por INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2),
    cantidad INT,
    disponibilidad BOOLEAN DEFAULT false,
    valor DECIMAL(10, 2),
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria),
    FOREIGN KEY (id_marca) REFERENCES marcas(id_marca)
);

CREATE TABLE productos_region (
    id_produc to INT,
    id_region INT,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

CREATE TABLE recomendaciones (
    id_usuario INT,
    id_producto INT,
    tipo_recomendacion ENUM('historial de compras', 'recomendación automática'),
    FOREIGN KEY (id_usuario) REFERENCES usuarios_db.usuarios(id_usuario),
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);