// server.js FINAL - OPTIMIZED

// 1. Load Dependencies
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require("socket.io");

// Performance & Security Middleware
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables dari file .env
dotenv.config();

// Validate environment variables
const { logEnvironmentStatus } = require('./src/utils/envCheck');
const envValidation = logEnvironmentStatus();

if (!envValidation.isValid) {
    console.error('❌ Server cannot start due to missing required environment variables');
    process.exit(1);
}

// --- PENTING: INISIALISASI & AMBIL INSTANCE DB ---
// dbConfig berisi { db, admin, auth }. Memastikan DB diinisialisasi sekali.
const dbConfig = require('./src/config/db');
const db = dbConfig.db; // Instance Firestore
const auth = dbConfig.auth; // Instance Auth

// --- IMPORT ROUTES ---
// Pastikan semua rute yang akan digunakan diimpor
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const adminRoutes = require('./src/routes/adminRoutes'); // Rute Admin Umum
const inventoryRoutes = require('./src/routes/inventoryRoutes');

// --- IMPORT MIDDLEWARE ---
// Pastikan verifyToken juga diimpor, meskipun hanya verifyAdmin yang digunakan di level global
const { verifyAdmin, verifyToken } = require('./src/middleware/authMiddleware');
const { notFound, errorHandler } = require('./src/middleware/errorMiddleware');


// 2. Inisialisasi Express
const app = express();
const PORT = process.env.PORT || 5000;

// 3. Konfigurasi Middleware Global

// 3a. Compression - GZIP responses (reduce size 60-80%)
app.use(compression({
    level: 6, // Compression level (1-9, 6 is good balance)
    threshold: 1024, // Only compress responses > 1KB
    filter: (req, res) => {
        // Don't compress if client doesn't support it
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));

// 3b. Helmet - Security HTTP headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin for API
    contentSecurityPolicy: false // Disable CSP for API (no HTML served)
}));

// 3c. Rate Limiting - Prevent abuse
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // Limit each IP to 300 requests per window (suitable for e-commerce)
    message: {
        success: false,
        error: 'Terlalu banyak permintaan. Coba lagi dalam 15 menit.',
        status_code: 429
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
    skip: (req) => {
        // Skip rate limiting for health checks
        return req.path === '/' || req.path === '/health';
    }
});

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// 3d. CORS Configuration
app.use(cors({
    // Atur CORS agar aman di lingkungan produksi
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

// 3e. Body Parsing
app.use(express.json({ limit: process.env.MAX_FILE_SIZE || '10mb' })); // Parsing body JSON
app.use(express.urlencoded({ extended: true, limit: process.env.MAX_FILE_SIZE || '10mb' })); // Parsing form data


// 4. Rute Sederhana (Contoh Test)
app.get('/', (req, res) => {
    res.status(200).send({
        message: 'Era Banyu Segara Backend API berjalan!',
        version: 'v1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// -----------------------------------------------------------
// 5. Integrasi Rute API (Semua Rute Anda)
// -----------------------------------------------------------
const API_PREFIX = '/api/v1'; // Prefix umum untuk versi API

// A. Rute Admin Khusus Auth: TIDAK TERPROTEKSI
app.use(`${API_PREFIX}/admin/auth`, authRoutes);


// B. Rute Admin Terproteksi: INVENTARIS
// Urutan: verifyToken -> authorizeRoles (implisit di verifyAdmin)
app.use(`${API_PREFIX}/admin/inventory`, verifyAdmin, inventoryRoutes);

// C. Rute Admin Terproteksi: ORDERS
app.use(`${API_PREFIX}/admin/orders`, verifyAdmin, orderRoutes);

// Rute publik untuk produk
app.use(`${API_PREFIX}/products`, productRoutes);

// D. Rute Admin Terproteksi: PRODUK (CRUD)
app.use(`${API_PREFIX}/admin/products`, verifyAdmin, productRoutes);


// E. Rute Admin Terproteksi Lainnya
app.use(`${API_PREFIX}/admin`, verifyAdmin, adminRoutes);


// -----------------------------------------------------------
// 6. PENANGANAN ERROR (Diletakkan di BAGIAN PALING AKHIR)
// -----------------------------------------------------------
app.use(notFound); // 404 handler
app.use(errorHandler); // Global error handler


// 7. Menjalankan Server (Socket.IO)
// Membuat server HTTP dari aplikasi Express
const server = http.createServer(app);

// Inisialisasi Socket.IO Server
const io = new Server(server, {
    cors: {
        // Menggunakan origin yang sama dengan CORS Express di atas
        origin: process.env.CORS_ORIGIN || '*',
        methods: ["GET", "POST", "PUT", "DELETE"]
    },
    pingTimeout: 60000 // Jaga koneksi tetap hidup
});

// Simpan objek IO di app.locals agar bisa diakses di controller
app.locals.io = io;

// Socket.IO Connection Handler
io.on('connection', (socket) => {
    // console.log(`👤 Admin terkoneksi: ${socket.id}`);

    // Contoh untuk join room, e.g., 'admin-dashboard'
    socket.on('joinAdmin', (adminId) => {
        socket.join('admin-dashboard');
        console.log(`Admin ${adminId} bergabung di room 'admin-dashboard'.`);
    });

    socket.on('disconnect', () => {
        // console.log(`🚶 Admin terputus: ${socket.id}`);
    });
});

// Jalankan Server HTTP/Socket.IO
server.listen(PORT, () => {
    console.log(`-----------------------------------------------------`);
    console.log(`✅ Server Express berjalan di http://localhost:${PORT}`);
    console.log(`🔔 Socket.IO berjalan pada port ${PORT}`);
    console.log(`🔗 Lingkungan: ${process.env.NODE_ENV || 'development'}`);
    console.log(`-----------------------------------------------------`);
});