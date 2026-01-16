import { NextResponse } from 'next/server';
import { db, admin } from '@/lib/db';
import jwt from 'jsonwebtoken' ;
import { BadRequestError, InternalServerError } from '@/lib/customError';

const ADMIN_COLLECTION = 'admins';

export async function POST(request) {
    try {
        const { token } = await request.json();

        if (!token) {
            throw new BadRequestError('Token verifikasi diperlukan.');
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find admin by id
        const adminDoc = await db.collection(ADMIN_COLLECTION).doc(decoded.id).get();
        if (!adminDoc.exists) {
            throw new BadRequestError('Token tidak valid.');
        }

        const adminData = adminDoc.data();

        // Check if token matches
        if (adminData.verificationToken !== token) {
            throw new BadRequestError('Token tidak valid.');
        }

        // Update admin: set emailVerified true, remove verificationToken
        await db.collection(ADMIN_COLLECTION).doc(decoded.id).update({
            emailVerified: true,
            verificationToken: admin.firestore.FieldValue.delete(),
        });

        return NextResponse.json({
            message: 'Email berhasil diverifikasi. Anda sekarang dapat login.',
        });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return NextResponse.json(
                { error: 'Token verifikasi telah kedaluwarsa.' },
                { status: 400 }
            );
        }
        console.error('Error saat verifikasi email:', error);
        return NextResponse.json(
            { error: error.message || 'Gagal memverifikasi email.' },
            { status: error.statusCode || 500 }
        );
    }
}