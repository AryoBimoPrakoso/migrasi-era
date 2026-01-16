import { NextResponse } from 'next/server';
import { db, admin } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

// --- GET: Ambil Detail 1 Produk (Untuk Form Edit) ---
export async function GET(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization');
    verifyAdmin(authHeader);

    const { id } = params;
    const docRef = db.collection('products').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data()
      }
    });
  } catch (error) {
    console.error('Error fetching product detail:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal mengambil data produk.' },
      { status: 500 }
    );
  }
}

// --- PUT: Update Data Produk ---
export async function PUT(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization');
    verifyAdmin(authHeader);

    const { id } = params;
    const body = await request.json();

    // Mapping Data Update (Sama seperti POST)
    const updateData = {
      name: body.name,
      sku: body.sku,
      price: Number(body.price),
      
      // Gunakan currentStock jika dikirim, atau stock jika tidak
      stock: body.currentStock !== undefined ? Number(body.currentStock) : undefined,
      minOrderQuantity: body.minOrderQuantity !== undefined ? Number(body.minOrderQuantity) : undefined,
      
      unit: body.unit,
      description: body.description,
      imageUrl: body.imageUrl,
      material: body.material,
      size: body.size,
      
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Bersihkan field undefined agar tidak menghapus data lama
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const docRef = db.collection('products').doc(id);
    await docRef.update(updateData);

    return NextResponse.json({
      success: true,
      message: 'Produk berhasil diperbarui.',
      data: { id, ...updateData }
    });

  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal memperbarui produk.' },
      { status: 500 }
    );
  }
}

// --- DELETE: Hapus Produk ---
export async function DELETE(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization');
    verifyAdmin(authHeader);

    const { id } = params;

    await db.collection('products').doc(id).delete();

    return NextResponse.json({
      success: true,
      message: 'Produk berhasil dihapus.'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal menghapus produk.' },
      { status: 500 }
    );
  }
}