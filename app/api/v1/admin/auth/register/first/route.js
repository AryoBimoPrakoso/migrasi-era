import { NextResponse } from 'next/server';
import { db, admin } from '@lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { BadRequestError, InternalServerError } from '@/lib/customError';

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
        const { username, password, email } = await request.json();

        if (!username || !password) {
            throw new BadRequestError('Username dan password wajib diisi.');
        }

        // 1. Cek apakah sudah ada admin terdaftar
        const snapshot = await db.collection(ADMIN_COLLECTION).limit(1).get();
        if (!snapshot.empty) {
            throw new BadRequestError('Admin sudah terdaftar. Silakan login atau hubungi SuperAdmin.');
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

        return NextResponse.json({
            message: 'Registrasi Admin Pertama berhasil!',
            adminId: adminId,
            token: token
        });

    } catch (error) {
        console.error('Error saat registrasi admin:', error);
        return NextResponse.json(
            { error: error.message || 'Gagal melakukan registrasi Admin Pertama.' },
            { status: error.statusCode || 500 }
        );
    }
}