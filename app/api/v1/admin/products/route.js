import { NextResponse } from 'next/server';
import { db, admin } from '@/lib/db'; // Import admin untuk timestamp
import { verifyAdmin } from '@/lib/auth';

// --- GET: Ambil Semua Produk ---
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    verifyAdmin(authHeader);

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

// --- POST: Tambah Produk Baru ---
export async function POST(request) {
  try {
    // 1. Verifikasi Admin
    const authHeader = request.headers.get('authorization');
    verifyAdmin(authHeader);

    const body = await request.json();

    // 2. Validasi Input
    if (!body.name || !body.sku || !body.price) {
      return NextResponse.json(
        { message: "Nama, SKU, dan Harga wajib diisi" },
        { status: 400 }
      );
    }

    // 3. Persiapkan Data
    // PENTING: Mapping nama field agar sesuai dengan yang dibaca frontend (stock & minOrder)
    const newProductData = {
      name: body.name,
      sku: body.sku,
      price: Number(body.price),
      
      // Mapping: Frontend kirim 'currentStock', Database simpan 'stock'
      stock: Number(body.currentStock) || 0, 
      
      // Mapping: Frontend kirim 'minOrderQuantity', Database simpan 'minOrder'
      minOrderQuantity: Number(body.minOrderQuantity) || 1, 
      
      unit: body.unit || 'pcs',
      description: body.description || '',
      imageUrl: body.imageUrl || '',
      material: body.material || '',
      size: body.size || '',
      
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // 4. Simpan ke Firestore
    const docRef = await db.collection('products').add(newProductData);

    return NextResponse.json(
      { 
        message: "Produk berhasil ditambahkan", 
        data: { id: docRef.id, ...newProductData } 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("POST Product Error:", error);
    return NextResponse.json(
      { message: "Gagal menyimpan produk", error: error.message },
      { status: 500 }
    );
  }
} 