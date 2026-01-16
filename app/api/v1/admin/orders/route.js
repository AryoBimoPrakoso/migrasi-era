import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

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