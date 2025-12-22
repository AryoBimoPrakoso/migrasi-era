// controllers/authController.js - VERSI FINAL (Menggunakan Variabel Lingkungan)

const { db, admin } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Import Custom Errors
const { BadRequestError, UnauthorizedError, InternalServerError, ForbiddenError } = require('../utils/customError');

// Import Email Service
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');

// Nama koleksi untuk admin
const ADMIN_COLLECTION = 'admins';


/**
 * Utilitas untuk membuat token JWT
 * @param {object} payload - Data yang akan dimasukkan ke dalam token
 * @returns {string} Token JWT
 */
const generateToken = (payload) => {
    if (!process.env.JWT_SECRET) {
        throw new InternalServerError('Kesalahan Server: Kunci rahasia JWT tidak ditemukan.');
    }
    // Menggunakan process.env.JWT_SECRET untuk keamanan
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });
};


/**
 * Endpoint untuk Pendaftaran Admin Pertama (First-Time Setup)
 * HANYA boleh dipanggil jika belum ada admin terdaftar.
 */
exports.registerFirstAdmin = async (req, res, next) => {
    const { username, password, email } = req.body;
    if (!username || !password) {
        return next(new BadRequestError('Username dan password wajib diisi.'));
    }

    try {
        // 1. Cek apakah sudah ada admin terdaftar
        const snapshot = await db.collection(ADMIN_COLLECTION).limit(1).get();
        if (!snapshot.empty) {
            return next(new ForbiddenError('Admin sudah terdaftar. Silakan login atau hubungi SuperAdmin.'));
        }

        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Simpan Admin Pertama ke Firestore
        const newAdminData = {
            username: username,
            email: email,
            passwordHash: passwordHash,
            role: 'SuperAdmin',
            emailVerified: true, // First admin is verified by default
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdByAdminId: null,
        };

        const docRef = await db.collection(ADMIN_COLLECTION).add(newAdminData);
        const adminId = docRef.id;

        // 4. Buat JWT untuk SuperAdmin pertama
        const payload = {
            id: adminId,
            username: newAdminData.username,
            role: newAdminData.role,
        };
        const token = generateToken(payload);

        res.status(201).json({ 
            message: 'Registrasi Admin Pertama berhasil!', 
            adminId: adminId,
            token: token
        });

    } catch (error) {
        console.error('Error saat registrasi admin:', error);
        next(new InternalServerError('Gagal melakukan registrasi Admin Pertama.'));
    }
};

/**
 * Endpoint untuk Admin Mendaftarkan Pegawai Admin Baru (Pegawai Kedua, dst.)
 * Rute ini WAJIB diproteksi oleh middleware verifyAdmin.
 */
exports.registerNewAdmin = async (req, res, next) => {
    // Ambil ID Admin yang sedang login dari token (disediakan oleh verifyAdmin middleware)
    const registeringAdminId = req.admin ? req.admin.id : 'SYSTEM'; 
    const { username, password, role = 'editor', email } = req.body; 

    if (!username || !password) {
        return next(new BadRequestError('Username dan password wajib diisi untuk Admin baru.'));
    }
    
    // Opsional: Cek apakah Admin yang mendaftar punya izin untuk membuat role tertentu 
    if (role.toLowerCase() === 'superadmin' && req.admin.role.toLowerCase() !== 'superadmin') {
        return next(new ForbiddenError('Hanya SuperAdmin yang dapat mendaftarkan Admin dengan role SuperAdmin.'));
    }

    try {
        // 1. Cek apakah username sudah ada
        const existingSnapshot = await db.collection(ADMIN_COLLECTION)
            .where('username', '==', username)
            .limit(1)
            .get();

        if (!existingSnapshot.empty) {
            return next(new BadRequestError('Username sudah digunakan. Pilih username lain.'));
        }
        
        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Simpan Admin Baru ke Firestore
        const newAdminData = {
            username: username,
            email: email,
            passwordHash: passwordHash,
            role: role,
            emailVerified: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdByAdminId: registeringAdminId,
        };

        const docRef = await db.collection(ADMIN_COLLECTION).add(newAdminData);
        const adminId = docRef.id;

        // 4. Generate verification token
        const verificationToken = jwt.sign({ id: adminId, email: email }, process.env.JWT_SECRET, { expiresIn: '24h' });

        // Update admin with verification token
        await db.collection(ADMIN_COLLECTION).doc(adminId).update({
            verificationToken: verificationToken,
        });

        // 5. Send verification email
        try {
            await sendVerificationEmail(email, verificationToken);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            // Don't fail registration if email fails, but log it
        }

        // 6. Buat JWT untuk Admin baru (but they need to verify email first)
        const payload = {
            id: adminId,
            username: newAdminData.username,
            role: newAdminData.role,
        };
        const token = generateToken(payload);

        res.status(201).json({
            message: `Admin Pegawai baru (${username}) berhasil didaftarkan. Silakan verifikasi email untuk login.`,
            adminId: adminId,
            role: newAdminData.role,
            token: token, // Token issued but login will check verification
        });

    } catch (error) {
        console.error('Error saat mendaftarkan admin baru:', error);
        next(new InternalServerError('Gagal mendaftarkan admin baru.'));
    }
};

/**
 * Endpoint untuk Verifikasi Email Admin
 */
exports.verifyEmail = async (req, res, next) => {
    const { token } = req.body;

    if (!token) {
        return next(new BadRequestError('Token verifikasi diperlukan.'));
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find admin by id
        const adminDoc = await db.collection(ADMIN_COLLECTION).doc(decoded.id).get();
        if (!adminDoc.exists) {
            return next(new BadRequestError('Token tidak valid.'));
        }

        const adminData = adminDoc.data();

        // Check if token matches
        if (adminData.verificationToken !== token) {
            return next(new BadRequestError('Token tidak valid.'));
        }

        // Update admin: set emailVerified true, remove verificationToken
        await db.collection(ADMIN_COLLECTION).doc(decoded.id).update({
            emailVerified: true,
            verificationToken: admin.firestore.FieldValue.delete(),
        });

        res.status(200).json({
            message: 'Email berhasil diverifikasi. Anda sekarang dapat login.',
        });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return next(new BadRequestError('Token verifikasi telah kedaluwarsa.'));
        }
        console.error('Error saat verifikasi email:', error);
        next(new InternalServerError('Gagal memverifikasi email.'));
    }
};

/**
 * Endpoint untuk Forgot Password
 */
exports.forgotPassword = async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new BadRequestError('Email diperlukan.'));
    }

    try {
        // Find admin by email
        const snapshot = await db.collection(ADMIN_COLLECTION)
            .where('email', '==', email)
            .limit(1)
            .get();

        if (snapshot.empty) {
            // Don't reveal if email exists or not for security
            return res.status(200).json({
                message: 'Jika email terdaftar, instruksi reset kata sandi telah dikirim.',
            });
        }

        const adminDoc = snapshot.docs[0];
        const adminId = adminDoc.id;

        // Generate reset token
        const resetToken = jwt.sign({ id: adminId, email: email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Update admin with reset token
        await db.collection(ADMIN_COLLECTION).doc(adminId).update({
            resetToken: resetToken,
            resetTokenExpiry: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 60 * 60 * 1000)), // 1 hour
        });

        // Send reset email
        try {
            await sendPasswordResetEmail(email, resetToken);
        } catch (emailError) {
            console.error('Failed to send reset email:', emailError);
            // Don't fail the request
        }

        res.status(200).json({
            message: 'Jika email terdaftar, instruksi reset kata sandi telah dikirim.',
        });

    } catch (error) {
        console.error('Error saat forgot password:', error);
        next(new InternalServerError('Gagal memproses permintaan reset kata sandi.'));
    }
};

/**
 * Endpoint untuk Reset Password
 */
exports.resetPassword = async (req, res, next) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return next(new BadRequestError('Token dan kata sandi baru diperlukan.'));
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find admin by id
        const adminDoc = await db.collection(ADMIN_COLLECTION).doc(decoded.id).get();
        if (!adminDoc.exists) {
            return next(new BadRequestError('Token tidak valid.'));
        }

        const adminData = adminDoc.data();

        // Check if token matches and not expired
        if (adminData.resetToken !== token) {
            return next(new BadRequestError('Token tidak valid.'));
        }

        // Check expiry (though jwt already checks, but for extra safety)
        if (adminData.resetTokenExpiry && adminData.resetTokenExpiry.toDate() < new Date()) {
            return next(new BadRequestError('Token reset telah kedaluwarsa.'));
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        // Update admin: set new password, remove resetToken
        await db.collection(ADMIN_COLLECTION).doc(decoded.id).update({
            passwordHash: passwordHash,
            resetToken: admin.firestore.FieldValue.delete(),
            resetTokenExpiry: admin.firestore.FieldValue.delete(),
        });

        res.status(200).json({
            message: 'Kata sandi berhasil direset. Anda dapat login dengan kata sandi baru.',
        });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return next(new BadRequestError('Token reset telah kedaluwarsa.'));
        }
        console.error('Error saat reset password:', error);
        next(new InternalServerError('Gagal mereset kata sandi.'));
    }
};

/**
 * Endpoint untuk Login Admin
 */
exports.loginAdmin = async (req, res, next) => {
    const { username, password } = req.body;

    try {
        // 1. Cari Admin berdasarkan username
        const snapshot = await db.collection(ADMIN_COLLECTION)
            .where('username', '==', username)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return next(new UnauthorizedError('Username atau password salah.'));
        }

        const adminDoc = snapshot.docs[0];
        const adminData = adminDoc.data();
        const adminId = adminDoc.id;

        // 2. Check if email is verified
        if (adminData.emailVerified === false) {
            return next(new UnauthorizedError('Email belum diverifikasi. Silakan verifikasi email Anda terlebih dahulu.'));
        }

        // 3. Bandingkan Password
        const isMatch = await bcrypt.compare(password, adminData.passwordHash);

        if (!isMatch) {
            return next(new UnauthorizedError('Username atau password salah.'));
        }

        // 3. Buat JWT
        const payload = {
            id: adminId,
            username: adminData.username,
            role: adminData.role,
        };
        
        const token = generateToken(payload); 
        
        res.status(200).json({ 
            message: 'Login berhasil!', 
            token: token,
            admin: { id: adminId, username: adminData.username, role: adminData.role }
        });

    } catch (error) {
        console.error('Error saat login admin:', error);
        next(new InternalServerError('Gagal melakukan login.'));
    }
};