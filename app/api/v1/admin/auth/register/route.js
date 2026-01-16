import { NextResponse } from 'next/server';
import { db, admin } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { BadRequestError, ForbiddenError, InternalServerError }  from '@/lib/customError';
import { sendVerificationEmail }  from '@/lib/emailService';
import { verifyAdmin }  from '@/lib/auth' ;

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
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });
};

export async function POST(request) {
    try {
        // Verify admin
        const authHeader = request.headers.get('authorization');
        const registeringAdmin = verifyAdmin(authHeader);

        const { username, password, role = 'editor', email } = await request.json();

        if (!username || !password) {
            throw new BadRequestError('Username dan password wajib diisi untuk Admin baru.');
        }

        // Opsional: Cek apakah Admin yang mendaftar punya izin untuk membuat role tertentu
        if (role.toLowerCase() === 'superadmin' && registeringAdmin.role.toLowerCase() !== 'superadmin') {
            throw new ForbiddenError('Hanya SuperAdmin yang dapat mendaftarkan Admin dengan role SuperAdmin.');
        }

        // 1. Cek apakah username sudah ada
        const existingSnapshot = await db.collection(ADMIN_COLLECTION)
            .where('username', '==', username)
            .limit(1)
            .get();

        if (!existingSnapshot.empty) {
            throw new BadRequestError('Username sudah digunakan. Pilih username lain.');
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
            createdByAdminId: registeringAdmin.id,
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

        return NextResponse.json({
            message: `Admin Pegawai baru (${username}) berhasil didaftarkan. Silakan verifikasi email untuk login.`,
            adminId: adminId,
            role: newAdminData.role,
            token: token, // Token issued but login will check verification
        });

    } catch (error) {
        console.error('Error saat mendaftarkan admin baru:', error);
        return NextResponse.json(
            { error: error.message || 'Gagal mendaftarkan admin baru.' },
            { status: error.statusCode || 500 }
        );
    }
}