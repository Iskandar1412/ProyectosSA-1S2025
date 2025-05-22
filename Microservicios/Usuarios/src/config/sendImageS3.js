const aws = require('aws-sdk');
const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_BUCKET_NAME } = require('./env/aws.config');

aws.config.update({
    region: AWS_REGION,
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
});

const s3 = new aws.S3();

async function sendImageS3(usuario, image) {
    try {
        if(!image) return '';
        const fechaActual = new Date();
        const fechaString = fechaActual.toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);

        const pathImagen = `profile-images/${usuario}_${fechaString}.jpg`;
        const pathFull = `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${pathImagen}`;

        const base64Data = image.replace(/^data:image\/(png|jpeg|jpg|svg|tif|bmp|avif|heif|tif|jfif|ico|gif|pjpeg|svgz|webp|xmb|apng);base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        const parametros = {
            Bucket: AWS_BUCKET_NAME,
            Key: pathImagen,
            Body: buffer,
            ContentType: 'image/jpeg'
        };

        const result = await s3.putObject(parametros).promise();
        
        if (result && result.ETag) {
            return { success: true, path: pathFull };
        } else {
            return { success: false, message: 'No se recibió un ETag válido' };
        }
    } catch (error) {
        console.error('Error subiendo imagen a S3:', error);
        return { success: false, message: error.message };
    }
}

module.exports = { sendImageS3 };
