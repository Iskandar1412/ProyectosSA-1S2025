const { AES_KEY, AES_IV } = require('../config/env/aes.config');
const crypto = require('crypto');
const aes = 'aes-256-cbc'; // algoritmo aes
const key = Buffer.from(AES_KEY, 'hex'); // clave de 32 bytes para aes
const iv = Buffer.from(AES_IV, 'hex'); // vector de inicialización para aes (16 bytes)

// funcion para cifrado
const encrypt = (value) => {
    if (!value) throw new Error('Necesario el valor para encriptar');
    try {
        let cifrado = crypto.createCipheriv(aes, key, iv);
        let encriptado = cifrado.update(value, 'utf-8', 'hex');
        encriptado += cifrado.final('hex')
        return encriptado;
    } catch(e) {
        throw new Error('Operación Fallida (encripcion)');
    }
}

// funcion para desencriptar
const decrypt = (value) => {
    if(!value) throw new Error('Valor encriptado invalido');
    try {
        let cifrado = crypto.createDecipheriv(aes, key, iv);
        let decifrado = cifrado.update(value, 'hex', 'utf-8');
        decifrado += cifrado.final('utf-8');
        return decifrado;
    } catch(e) {
        throw new Error('Operación Fallida (desencripcion)');
    }
}

module.exports = { encrypt, decrypt };