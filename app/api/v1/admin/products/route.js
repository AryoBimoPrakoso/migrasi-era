import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export async function GET(request) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('authorization');
    verifyAdmin(authHeader);

    // Get all products from Firestore
    const productsSnapshot = await db.collection('products').get();
    const products = [];

    productsSnapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return NextResponse.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal mengambil data produk.' },
      { status: error.statusCode || 500 }
    );
  }
}