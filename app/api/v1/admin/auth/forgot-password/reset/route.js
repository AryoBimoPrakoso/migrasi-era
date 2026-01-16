import { NextResponse } from 'next/server';
import { db, admin } from '@/lib/db' ;
import jwt from 'jsonwebtoken' ;
import bcrypt from 'bcryptjs';
import { BadRequestError, InternalServerError } from '@/lib/customError';

const ADMIN_COLLECTION = 'admins';

export async function POST(request) {
    try {
        const { token, newPassword } = await request.json();

        if (!token || !newPassword) {
            throw new BadRequestError('Token dan kata sandi baru diperlukan.');
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find admin by id
        const adminDoc = await db.collection(ADMIN_COLLECTION).doc(decoded.id).get();
        if (!adminDoc.exists) {
            throw new BadRequestError('Token tidak valid.');
        }

        const adminData = adminDoc.data();

        // Check if token matches and not expired
        if (adminData.resetToken !== token) {
            throw new BadRequestError('Token tidak valid.');
        }

        // Check expiry (though jwt already checks, but for extra safety)
        if (adminData.resetTokenExpiry && adminData.resetTokenExpiry.toDate() < new Date()) {
            throw new BadRequestError('Token reset telah kedaluwarsa.');
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

        return NextResponse.json({
            message: 'Kata sandi berhasil direset. Anda dapat login dengan kata sandi baru.',
        });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return NextResponse.json(
                { error: 'Token reset telah kedaluwarsa.' },
                { status: 400 }
            );
        }
        console.error('Error saat reset password:', error);
        return NextResponse.json(
            { error: error.message || 'Gagal mereset kata sandi.' },
            { status: error.statusCode || 500 }
        );
    }
}