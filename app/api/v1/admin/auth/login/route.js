import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs' ;
import jwt from 'jsonwebtoken' ;
import { UnauthorizedError, InternalServerError } from '@/lib/customError';

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
        const { username, password } = await request.json();

        // 1. Cari Admin berdasarkan username
        const snapshot = await db.collection(ADMIN_COLLECTION)
            .where('username', '==', username)
            .limit(1)
            .get();

        if (snapshot.empty) {
            throw new UnauthorizedError('Username atau password salah.');
        }

        const adminDoc = snapshot.docs[0];
        const adminData = adminDoc.data();
        const adminId = adminDoc.id;

        // 2. Check if email is verified
        if (adminData.emailVerified === false) {
            throw new UnauthorizedError('Email belum diverifikasi. Silakan verifikasi email Anda terlebih dahulu.');
        }

        // 3. Bandingkan Password
        const isMatch = await bcrypt.compare(password, adminData.passwordHash);

        if (!isMatch) {
            throw new UnauthorizedError('Username atau password salah.');
        }

        // 4. Buat JWT
        const payload = {
            id: adminId,
            username: adminData.username,
            role: adminData.role,
        };

        const token = generateToken(payload);

        return NextResponse.json({
            message: 'Login berhasil!',
            token: token,
            admin: { id: adminId, username: adminData.username, role: adminData.role }
        });

    } catch (error) {
        console.error('Error saat login admin:', error);
        return NextResponse.json(
            { error: error.message || 'Gagal melakukan login.' },
            { status: error.statusCode || 500 }
        );
    }
}