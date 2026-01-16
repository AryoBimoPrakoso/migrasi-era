// lib/emailConfig.js
import nodemailer from 'nodemailer';

const createTransporter = () => {
    const isLocal = process.env.NODE_ENV !== 'production';

    // PERBAIKAN: Gunakan 'createTransport' bukan 'createTransporter'
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587, // Pastikan port dibaca sebagai angka
        secure: process.env.EMAIL_SECURE === 'true', // Konversi string 'true' ke boolean
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        logger: isLocal,
        debug: isLocal,
    });

    if (isLocal) {
        console.log('--- EMAIL INFO ---');
        // Mengakses options.host harus memastikan transporter terbuat dulu
        console.log(`Konfigurasi Email: ${process.env.EMAIL_HOST}`);
        console.log('Pastikan kredensial di .env sudah benar.');
        console.log('------------------');
    }

    return transporter;
};

// Inisialisasi transporter
export const transporter = createTransporter();