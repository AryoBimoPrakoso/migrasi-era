import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; //
import { verifyAdmin } from '@/lib/auth'; //

export async function GET(request) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('authorization');
    verifyAdmin(authHeader);

    // Get all orders from Firestore
    const ordersSnapshot = await db.collection('orders').get();
    const orders = [];

    ordersSnapshot.forEach(doc => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return NextResponse.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal mengambil data pesanan.' },
      { status: error.statusCode || 500 }
    );
  }
}

export async function POST(request) {
  try {
    // 1. Verifikasi Admin (Wajib untuk keamanan)
    const authHeader = request.headers.get('authorization');
    verifyAdmin(authHeader);

    const body = await request.json();

    // 2. Validasi sederhana
    if (!body.nama || !body.total) {
      return NextResponse.json(
        { message: "Nama dan Total wajib diisi" },
        { status: 400 }
      );
    }

    // 3. Persiapkan data sesuai field database Anda
    // Kita hapus 'Order.create' dan gunakan object biasa
    const newOrderData = {
      nama: body.nama,
      kontak: body.kontak,
      detail: body.detail,
      jumlah: body.jumlah,
      total: Number(body.total), // Pastikan format number agar bisa dihitung
      tanggalPesan: body.tanggalPesan || new Date().toISOString(), // Pakai waktu sekarang jika kosong
      tanggalPembayaran: body.tanggalPembayaran || null,
      status: body.status || "Diproses",
    };

    // 4. Simpan ke Firestore (Collection 'orders')
    // connectDB() dihapus karena koneksi Firebase sudah otomatis di 'lib/db.js'
    const docRef = await db.collection('orders').add(newOrderData);

    return NextResponse.json(
      { 
        message: "Laporan berhasil dibuat", 
        data: { id: docRef.id, ...newOrderData } 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Order Error:", error);
    return NextResponse.json(
      { message: "Gagal menyimpan laporan", error: error.message },
      { status: 500 }
    );
  }
}