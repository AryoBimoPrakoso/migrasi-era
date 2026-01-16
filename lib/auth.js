// lib/auth.js - Auth utilities for Next.js API routes

import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from './customError';

/**
 * Verify JWT token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {object} Decoded token payload
 */
function verifyToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('Akses ditolak. Token tidak ditemukan atau format tidak valid. Gunakan format: Bearer <token>.');
    }

    const token = authHeader.split(' ')[1];

    if (!process.env.JWT_SECRET) {
        console.error("Kesalahan Konfigurasi: Variabel lingkungan JWT_SECRET UNDEFINED atau tidak dimuat!");
        throw new UnauthorizedError('Kesalahan Server: Kunci rahasia otentikasi tidak ditemukan.');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (err) {
        throw new UnauthorizedError('Token tidak valid atau kedaluwarsa.');
    }
}

/**
 * Authorize roles
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {function} Middleware function
 */
function authorizeRoles(allowedRoles) {
    const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());

    return (admin) => {
        if (!admin || !admin.role) {
            throw new ForbiddenError('Akses Ditolak. Informasi otentikasi (Token) belum terverifikasi.');
        }

        const adminRole = admin.role.toLowerCase();

        if (!normalizedAllowedRoles.includes(adminRole)) {
            const roleList = allowedRoles.join(', ');
            throw new ForbiddenError(`Akses Ditolak. Peran Anda (${admin.role}) tidak diizinkan untuk mengakses fitur ini. Diperlukan peran: ${roleList}.`);
        }
    };
}

/**
 * Verify admin (token + roles)
 * @param {string} authHeader - Authorization header
 * @returns {object} Admin data
 */
function verifyAdmin(authHeader) {
    const admin = verifyToken(authHeader);
    authorizeRoles(['editor', 'superadmin'])(admin);
    return admin;
}

/**
 * Verify super admin
 * @param {string} authHeader - Authorization header
 * @returns {object} Admin data
 */
function verifySuperAdmin(authHeader) {
    const admin = verifyToken(authHeader);
    authorizeRoles(['superadmin'])(admin);
    return admin;
}

export {
    verifyToken,
    authorizeRoles,
    verifyAdmin,
    verifySuperAdmin
};