const fs = require('fs');
const path = require('path');

async function SaveImage(usuario, image) {
    try {

        if(!image) {
            return '';
        }

        const fechaActual = new Date();
        const anio = fechaActual.getFullYear().toString();
        const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
        const dia = fechaActual.getDate().toString().padStart(2, '0');
        const hora = fechaActual.getHours().toString().padStart(2, '0');
        const minuto = fechaActual.getMinutes().toString().padStart(2, '0');
        const segundo = fechaActual.getSeconds().toString().padStart(2, '0');
        const fechaString = `${anio}${mes}${dia}${hora}${minuto}${segundo}`;

        const pathImagen = `${usuario}_${fechaString}.jpg`;

        const carpetaDestino = path.join(__dirname, 'uploads');

        if (!fs.existsSync(carpetaDestino)) {
            fs.mkdirSync(carpetaDestino);
        }

        const base64Data = image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        const rutaImagen = path.join(carpetaDestino, pathImagen);

        fs.writeFileSync(rutaImagen, buffer);

        const pathLocal = `uploads/${pathImagen}`;
        return pathLocal;
    } catch (e) {
        console.error("Error al guardar la imagen:", e);
        throw e;
    }
}

module.exports = SaveImage;