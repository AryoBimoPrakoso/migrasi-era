import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// HANYA Method GET (Baca Data)
export async function GET(request, { params }) {
  try {
    // 1. Tangkap ID dari URL (Wajib await di Next.js 15)
    const { id } = await params;

    // 2. Ambil data dari Firebase
    const docRef = db.collection('products').doc(id);
    const doc = await docRef.get();

    // 3. Cek jika barang tidak ada
    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan.' },
        { status: 404 }
      );
    }

    const data = doc.data();

    // 4. (Opsional) Cek jika produk disembunyikan admin
    // if (data.isActive === false) { ... }

    // 5. Kirim data ke Frontend
    return NextResponse.json({
      success: true,
      data: {
        id: doc.id,
        ...data // Mengirim semua field (nama, harga, gambar, dll)
      }
    });

  } catch (error) {
    console.error('Error fetching public product:', error);
    return NextResponse.json(
      { error: 'Gagal memuat data produk.' },
      { status: 500 }
    );
  }
}

// JANGAN ADA function PUT atau DELETE di file ini!
// Karena ini file publik, bahaya jika orang lain bisa edit/hapus.