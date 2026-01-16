import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export async function DELETE(request, { params }) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('authorization');
    verifyAdmin(authHeader);

    const { id } = params;

    // Delete product from Firestore
    await db.collection('products').doc(id).delete();

    return NextResponse.json({
      success: true,
      message: 'Produk berhasil dihapus.'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal menghapus produk.' },
      { status: error.statusCode || 500 }
    );
  }
}