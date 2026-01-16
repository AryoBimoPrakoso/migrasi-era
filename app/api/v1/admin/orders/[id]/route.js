import { NextResponse } from 'next/server';
import { db } from '@lib/db';
import { verifyAdmin } from '@lib/auth';

export async function DELETE(request, { params }) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('authorization');
    verifyAdmin(authHeader);

    const { id } = params;

    // Delete order from Firestore
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