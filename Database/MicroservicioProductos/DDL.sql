DROP DATABASE IF EXISTS productosMS;

CREATE DATABASE productosMS;
USE productosMS;

-- Tabla de Categorías
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

-- Tabla de Marcas
CREATE TABLE marcas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE
);

-- Tabla de Productos
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria_id INT NOT NULL,
    creado_por INT NOT NULL, -- Usuario que carga el producto
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL, -- Precio de venta
    cantidad INT DEFAULT 0,
    disponibilidad BOOLEAN DEFAULT TRUE,
    codigo VARCHAR(50) UNIQUE,
    valor DECIMAL(10,2) DEFAULT 0, -- Valor de compra
    creado_el TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    marca_id INT,  -- asociar una marca al producto
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (marca_id) REFERENCES marcas(id),  -- Relación con la tabla marcas
    CONSTRAINT check_precio CHECK (precio >= 0),
    CONSTRAINT check_cantidad CHECK (cantidad >= 0)
);

-- Tabla de Restricciones de Venta
CREATE TABLE restricciones_venta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    region VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE producto_restricciones (
    producto_id INT NOT NULL,
    restriccion_id INT NOT NULL,
    PRIMARY KEY (producto_id, restriccion_id),
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (restriccion_id) REFERENCES restricciones_venta(id) ON DELETE CASCADE
);

-- Tabla de Imágenes de Productos
CREATE TABLE producto_imagenes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    url_imagen VARCHAR(500) NOT NULL,
    creado_el TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);
