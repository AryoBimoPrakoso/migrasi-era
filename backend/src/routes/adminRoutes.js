// routes/adminRoutes.js

const express = require('express');
const router = express.Router();

// PENTING: Import authorizeRoles dari middleware
const { authorizeRoles } = require('../middleware/authMiddleware');

// Catatan: Middleware verifyAdmin sudah diterapkan di server.js untuk router ini.

// Daftar peran yang diizinkan untuk operasional umum (Editor dan SuperAdmin)
const OPERATIONAL_ROLES = ['SuperAdmin', 'editor'];

// ===========================================
// RUTE ADMIN UMUM
// ===========================================
// Catatan: Rute Orders sudah dikelola di orderRoutes.js
// Catatan: Rute Inventory sudah dikelola di inventoryRoutes.js
// Catatan: Rute Products sudah dikelola di productRoutes.js

// Tambahkan rute admin umum lainnya di sini jika diperlukan
// Contoh: router.get('/settings', authorizeRoles(...OPERATIONAL_ROLES), settingsController.getSettings);

module.exports = router;