import nodemailer from 'nodemailer';

const createTransporter = () => {
    const isLocal = process.env.NODE_ENV !== 'production';

    const transporter = nodemailer.createTransporter({
        // Contoh untuk GMAIL (jika menggunakan)
        // host: 'smtp.gmail.com',
        // port: 587,
        // secure: false,
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === 'true' || false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        // Opsi tambahan untuk debugging
        logger: isLocal,
        debug: isLocal,
    });

    if (isLocal) {
        console.log('--- EMAIL INFO ---');
        console.log(`Menggunakan Transporter: ${transporter.options.host}:${transporter.options.port}`);
        console.log('Pastikan Anda memiliki kredensial email yang valid di file .env.');
        console.log('------------------');
    }

    return transporter;
};

const transporter = createTransporter();

module.exports = {
    transporter,
};