
# Era Banyu - Sistem Manajemen Katalog & Laporan - Kelompok 3 4IA19

Era Banyu adalah aplikasi berbasis web yang digunakan untuk manajemen katalog produk dan pelaporan. Proyek ini dibangun menggunakan arsitektur modern dengan frontend Next.js dan backend Node.js.


## Fitur Utama
- Dashboard Admin: Visualisasi data menggunakan Barchart dan ringkasan total.

- Manajemen Katalog: Fitur untuk membuat, mengedit, dan melihat daftar produk.

- Sistem Laporan: Pembuatan dan pengelolaan laporan operasional.

- Autentikasi: Sistem login, registrasi admin, lupa kata sandi, dan verifikasi email.

- Chatbot & FAQ: Fitur bantuan untuk pengguna di sisi klien.


## Teknologi yang digunakan
- Frontend: Next.js (TypeScript), Tailwind CSS.

- Backend: Node.js, Express.js.

- Database & Auth: Firebase / Firestore.

- State Management/API: Axios untuk komunikasi frontend-backend.

## Instalasi
1. Prasyarat

- Node.js (versi terbaru direkomendasikan)

- NPM atau Yarn
2. Setup Backend
- Masuk ke direktori backend:  ``cd backend``
- Instal dependensi: ``npm install``
- Salin file .env.example menjadi .env dan isi kredensial yang diperlukan (Firebase API Key, DB URL, dll).
- Jalankan server: ``npm start`` atau ``node server.js``

3. Setup Frontend
- Kembali ke direktori utama (root).
- Instal dependensi: ``npm install``
- Jalankan server pengembangan:
```bash
npm run dev
```
4. Buka http://localhost:3000 di browser Anda.


