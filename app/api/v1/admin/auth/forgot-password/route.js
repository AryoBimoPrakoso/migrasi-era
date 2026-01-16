import { NextResponse } from 'next/server';
import { db, admin } from '@/lib/db' ;
import jwt from 'jsonwebtoken' ;
import { BadRequestError, InternalServerError } from '@/lib/customError';
import { sendPasswordResetEmail } from '@/lib/emailService';


const ADMIN_COLLECTION = 'admins';

export async function POST(request) {
    try {
        const { email } = await request.json();

        if (!email) {
            throw new BadRequestError('Email diperlukan.');
        }

        // Find admin by email
        const snapshot = await db.collection(ADMIN_COLLECTION)
            .where('email', '==', email)
            .limit(1)
            .get();

        if (snapshot.empty) {
            // Don't reveal if email exists or not for security
            return NextResponse.json({
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

        return NextResponse.json({
            message: 'Jika email terdaftar, instruksi reset kata sandi telah dikirim.',
        });

    } catch (error) {
        console.error('Error saat forgot password:', error);
        return NextResponse.json(
            { error: error.message || 'Gagal memproses permintaan reset kata sandi.' },
            { status: error.statusCode || 500 }
        );
    }
}