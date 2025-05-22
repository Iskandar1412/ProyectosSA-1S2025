## Contenedores de docker

- docker run --name sa -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=iskandar mysql:latest

- docker exec -it sa mysql -uroot -piskandar

## Instalación paquetes

* Nodemon (Dependencia de desarollo)

```bash
npm i --save-dev nodemon
```

Configuración package.json

```json
"scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
}
```

Correr Backend

```bash
npm run dev
```

* Morgan (impresion peticiones)

Instalación Paquete

```bash
npm i morgan
```

* Cors (aceptar solicitudes de dominios)

Instalación Paquete

```bash
npm i cors
```

* Express

Instalación Paquete

```bash
npm i express
```

* Cookie Parser

Instalación Paquete

```bash
npm i cookie-parser
```

* Json Web Token

Instalación Paquete

```bash
npm i jsonwebtoken
```

* Crypto/Aes (encripcion)

Instalación Paquete

```bash
npm i crypto
```

* MySql2

Instalación Paquete

```bash
npm i mysql2
```

* servicio para correo

```bash
npm i nodemailer
```

## Creación Llaves AES (env)

```bash
# Generación AES Key 32 Bytes
openssl rand -hex 32

# Generación IV 16 Bytes
openssl rand -hex 16
```