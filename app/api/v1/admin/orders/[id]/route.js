import { NextResponse } from 'next/server';
import { db, admin } from '@/lib/db'; // Import admin untuk timestamp
import { verifyAdmin } from '@/lib/auth'; //

// --- GET: Mengambil detail 1 pesanan berdasarkan ID ---
export async function GET(request, { params }) {
  try {
    // 1. Verifikasi Admin
    const authHeader = request.headers.get('authorization');
    verifyAdmin(authHeader);

    const { id } = params;

    // 2. Ambil data dari Firestore
    const docRef = db.collection('orders').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Pesanan tidak ditemukan.' },
        { status: 404 }
      );
    }

    // 3. Return data
    return NextResponse.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data()
      }
    });

  } catch (error) {
    console.error('Error fetching order detail:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal mengambil data pesanan.' },
      { status: error.statusCode || 500 }
    );
  }
}

// --- PUT: Mengupdate data pesanan (Save Edit) ---
export async function PUT(request, { params }) {
  try {
    // 1. Verifikasi Admin
    const authHeader = request.headers.get('authorization');
    verifyAdmin(authHeader);

    const { id } = params;
    const body = await request.json();

    // 2. Persiapkan data update (Gunakan field yang konsisten dengan method POST)
    const updateData = {
      nama: body.nama,
      kontak: body.kontak,
      detail: body.detail,
      jumlah: body.jumlah,
      total: Number(body.total), // Pastikan format number
      tanggalPesan: body.tanggalPesan,
      tanggalPembayaran: body.tanggalPembayaran,
      status: body.status,
      // Tambahkan timestamp update
      updatedAt: admin.firestore.FieldValue.serverTimestamp() 
    };

    // Hapus field yang undefined agar tidak menimpa data lama dengan null (Opsional, untuk keamanan)
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    // 3. Update ke Firestore
    const docRef = db.collection('orders').doc(id);
    
    // Cek dulu apakah dokumen ada
    const doc = await docRef.get();
    if (!doc.exists) {
        return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    await docRef.update(updateData);

    return NextResponse.json({
      success: true,
      message: 'Pesanan berhasil diperbarui.',
      data: { id, ...updateData }
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal memperbarui pesanan.' },
      { status: error.statusCode || 500 }
    );
  }
}

// --- DELETE: Menghapus pesanan (Sudah ada sebelumnya) ---
export async function DELETE(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization');
    verifyAdmin(authHeader);

    const { id } = params;

    await db.collection('orders').doc(id).delete();

    return NextResponse.json({
      success: true,
      message: 'Pesanan berhasil dihapus.'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal menghapus pesanan.' },
      { status: error.statusCode || 500 }
    );
  }
}