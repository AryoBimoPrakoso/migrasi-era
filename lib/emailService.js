import { transporter } from './emailConfig';

const sendVerificationEmail = async (email, verificationToken) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    const htmlTemplate = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifikasi Email</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; padding: 20px 0; background-color: #007bff; color: #ffffff; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; text-align: center; }
        .button { display: inline-block; padding: 12px 24px; background-color: #28a745; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Verifikasi Email Anda</h1>
        </div>
        <div class="content">
            <p>Halo,</p>
            <p>Terima kasih telah mendaftar. Untuk menyelesaikan proses pendaftaran, silakan verifikasi email Anda dengan mengklik tombol di bawah ini:</p>
            <a href="${verificationUrl}" class="button">Verifikasi Email</a>
            <p>Jika tombol tidak berfungsi, salin dan tempel tautan berikut ke browser Anda:</p>
            <p><a href="${verificationUrl}">${verificationUrl}</a></p>
            <p>Tautan ini akan kedaluwarsa dalam 1 jam.</p>
        </div>
        <div class="footer">
            <p>Jika Anda tidak meminta verifikasi ini, abaikan email ini.</p>
            <p>&copy; 2023 Era Banyu. Semua hak dilindungi.</p>
        </div>
    </div>
</body>
</html>
    `;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verifikasi Email Anda - Era Banyu',
        html: htmlTemplate,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email verifikasi dikirim ke:', email);
    } catch (error) {
        console.error('Gagal mengirim email verifikasi:', error);
        throw error;
    }
};

const sendPasswordResetEmail = async (email, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL}/forgot-password/reset/${resetToken}`;

    const htmlTemplate = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Kata Sandi</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; padding: 20px 0; background-color: #dc3545; color: #ffffff; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; text-align: center; }
        .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Reset Kata Sandi Anda</h1>
        </div>
        <div class="content">
            <p>Halo,</p>
            <p>Kami menerima permintaan untuk mereset kata sandi akun Anda. Klik tombol di bawah ini untuk membuat kata sandi baru:</p>
            <a href="${resetUrl}" class="button">Reset Kata Sandi</a>
            <p>Jika tombol tidak berfungsi, salin dan tempel tautan berikut ke browser Anda:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <p>Tautan ini akan kedaluwarsa dalam 1 jam.</p>
        </div>
        <div class="footer">
            <p>Jika Anda tidak meminta reset ini, abaikan email ini.</p>
            <p>&copy; 2023 Era Banyu. Semua hak dilindungi.</p>
        </div>
    </div>
</body>
</html>
    `;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Reset Kata Sandi - Era Banyu',
        html: htmlTemplate,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email reset kata sandi dikirim ke:', email);
    } catch (error) {
        console.error('Gagal mengirim email reset kata sandi:', error);
        throw error;
    }
};

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail,
};