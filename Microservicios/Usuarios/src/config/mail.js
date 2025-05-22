const nodemailer = require('nodemailer');
const { BASE_CORREO, BASE_CORREO_PASS } = require('./env/email.config');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: BASE_CORREO,
        pass: BASE_CORREO_PASS
    }
});

async function SendMail(mail, subject, content) {
    const mailtoSend = {
        from: 'no-reply@proyect1activate.com',
        to: mail,
        subject: subject,
        html: content
    }
    try {
        await transporter.sendMail(mailtoSend, function(err, info) {
            if (err) {
                console.log('Error to send email:', err);
                return { success: false, message: 'Error en el envio del correo' }
            }
        });
        return { success: true, message: 'Correo enviado exitosamente' }
    } catch(e) {
        return { success: false, message: "Error:", e };
    }
};

module.exports = SendMail;