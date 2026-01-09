// src/controllers/productController.js

const { db, admin } = require("../config/db");
const { NotFoundError, BadRequestError } = require("../utils/customError");
const { body, validationResult } = require("express-validator");
const { getStorage } = require("firebase-admin/storage");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse, paginatedResponse, createdResponse } = require("../utils/responseHelper");

const PRODUCT_COLLECTION = "products";

const bucket = getStorage().bucket();

// ===================================
// PUBLIC API: GET /api/v1/products
// ===================================

/**
 * Mengambil semua produk yang aktif (isActive: true) untuk tampilan publik.
 * Mendukung pagination dan field projection untuk performa optimal.
 * GET /api/v1/products?limit=20&cursor=<lastDocId>
 */
exports.getPublicProducts = asyncHandler(async (req, res, next) => {
  // Pagination parameters
  const limit = Math.min(parseInt(req.query.limit) || 50, 100); // Max 100 items
  const cursor = req.query.cursor;

  // Build query - Note: Removed orderBy to avoid composite index requirement
  let query = db
    .collection(PRODUCT_COLLECTION)
    .where("isActive", "==", true)
    .limit(limit + 1); // Fetch one extra to check if there's more

  // If cursor provided, start after that document
  if (cursor) {
    const cursorDoc = await db.collection(PRODUCT_COLLECTION).doc(cursor).get();
    if (cursorDoc.exists) {
      query = query.startAfter(cursorDoc);
    }
  }

  const snapshot = await query.get();
  const docs = snapshot.docs;

  // Check if there are more results
  const hasMore = docs.length > limit;
  const products = docs.slice(0, limit).map((doc) => ({
    id: doc.id,
    name: doc.data().name,
    sku: doc.data().sku,
    price: doc.data().price,
    unit: doc.data().unit,
    imageUrl: doc.data().imageUrl,
    description: doc.data().description,
    minOrderQuantity: doc.data().minOrderQuantity,
    currentStock: doc.data().currentStock || 0,
    material: doc.data().material,
    size: doc.data().size,
  }));

  // Sort products by name on the server side after fetching
  products.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  // Set cache headers for public products (cache for 5 minutes)
  res.set('Cache-Control', 'public, max-age=300');

  // Return paginated response
  return paginatedResponse(res, products, {
    limit,
    hasMore,
    nextCursor: hasMore ? docs[limit - 1].id : null,
    count: products.length
  }, 'Produk berhasil diambil');
});

// ===================================
// ADMIN API: CRUD (Membutuhkan Token)
// ===================================

// Validation middleware for createProduct
exports.validateCreateProduct = [
  body("name")
    .notEmpty()
    .withMessage("Nama produk wajib diisi")
    .isLength({ min: 2 })
    .withMessage("Nama produk minimal 2 karakter"),
  body("sku")
    .notEmpty()
    .withMessage("SKU wajib diisi")
    .isLength({ min: 3 })
    .withMessage("SKU minimal 3 karakter"),
  body("minOrderQuantity")
    .isInt({ min: 1 })
    .withMessage("Kuantitas minimum order harus angka positif"),
  body("unit").notEmpty().withMessage("Unit wajib diisi"),
  body("material").optional().isString(),
  body("size").optional().isString(),
  body("price").isFloat({ min: 0 }).withMessage("Harga harus angka positif"),
  body("currentStock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock harus angka non-negatif"),
  // body('minStockLevel').optional().isInt({ min: 0 }).withMessage('Minimum stock level harus angka non-negatif'),
];

// 1. CREATE: POST /api/v1/admin/products
/**
 * Membuat produk baru di Firestore.
 */
exports.createProduct = async (req, res, next) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new BadRequestError(
        "Validation failed: " +
        errors
          .array()
          .map((err) => err.msg)
          .join(", ")
      )
    );
  }
  const {
    name,
    sku,
    minOrderQuantity,
    unit,
    price,
    material,
    size,
    // category,
    currentStock,
    // minStockLevel,
    // specification,
    description,
    imageUrl,
  } = req.body;

  // Validasi dasar
  if (!name || !sku || !minOrderQuantity || !unit || !price) {
    return next(
      new BadRequestError(
        "Nama Produk, SKU, Kuantitas Minimum Order, Unit, dan Harga wajib diisi."
      )
    );
  }

  try {
    // Pengecekan Duplikasi SKU (penting untuk inventaris)
    const existingSku = await db
      .collection(PRODUCT_COLLECTION)
      .where("sku", "==", sku)
      .limit(1)
      .get();

    if (!existingSku.empty) {
      return next(
        new BadRequestError(
          `SKU Produk ${sku} sudah terdaftar. Gunakan SKU yang unik.`
        )
      );
    }

    // Mapping dan Konversi Angka
    const newProduct = {
      name: name,
      sku: sku,
      minOrderQuantity: Number(minOrderQuantity),
      unit: unit,
      price: Number(price),
      material: material || '-',
      size: size || '-',

      // Field Inventaris Default
      currentStock: Number(currentStock) || 0,
      description: description || "",
      imageUrl: imageUrl || "",
      isActive: true, // Default aktif
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection(PRODUCT_COLLECTION).add(newProduct);

    console.log(
      `[INFO] Produk baru dibuat: ${newProduct.name} (SKU: ${newProduct.sku}) oleh admin`
    );

    res.status(201).json({
      success: true,
      message: "Produk berhasil ditambahkan.",
      productId: docRef.id,
      // Kembalikan data dengan ID dokumen baru
      product: { id: docRef.id, ...newProduct },
    });
  } catch (error) {
    console.error(`[ERROR] Gagal membuat produk: ${error.message}`);
    next(error);
  }
};

// 2. READ All (Admin View): GET /api/v1/admin/products
/**
 * Mengambil semua produk (aktif dan non-aktif) untuk dashboard admin.
 * Mendukung pagination dan sorting.
 * GET /api/v1/admin/products?limit=20&cursor=<lastDocId>&sortBy=name
 */
exports.getAllProductsAdmin = asyncHandler(async (req, res, next) => {
  // Pagination parameters
  const limit = Math.min(parseInt(req.query.limit) || 50, 100); // Max 100 items for admin
  const cursor = req.query.cursor;
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';

  // Build query
  let query = db
    .collection(PRODUCT_COLLECTION)
    .orderBy(sortBy, sortOrder)
    .limit(limit + 1);

  // If cursor provided, start after that document
  if (cursor) {
    const cursorDoc = await db.collection(PRODUCT_COLLECTION).doc(cursor).get();
    if (cursorDoc.exists) {
      query = query.startAfter(cursorDoc);
    }
  }

  const snapshot = await query.get();
  const docs = snapshot.docs;

  // Check if there are more results
  const hasMore = docs.length > limit;
  const products = docs.slice(0, limit).map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return paginatedResponse(res, products, {
    limit,
    hasMore,
    nextCursor: hasMore ? docs[limit - 1].id : null,
    count: products.length
  }, 'Produk admin berhasil diambil');
});

// 3. READ One: GET /api/v1/admin/products/:id
/**
 * Mengambil detail produk berdasarkan ID.
 */
exports.getProductById = async (req, res, next) => {
  try {
    const doc = await db
      .collection(PRODUCT_COLLECTION)
      .doc(req.params.id)
      .get();

    if (!doc.exists) {
      return next(new NotFoundError("Produk tidak ditemukan."));
    }

    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    next(error);
  }
};

// 4. UPDATE: PUT /api/v1/admin/products/:id
/**
 * Memperbarui data produk.
 */
exports.updateProduct = async (req, res, next) => {
  const productId = req.params.id;

  let updateData = {
    ...req.body,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  // Konversi nilai menjadi angka jika ada
  ["minOrderQuantity", "price", "currentStock", "minStockLevel"].forEach(
    (field) => {
      if (updateData[field] !== undefined) {
        updateData[field] = Number(updateData[field]);
      }
    }
  );

  // Hapus ID dan SKU dari body (karena biasanya tidak diizinkan diubah)
  delete updateData.id;
  delete updateData.sku;

  try {
    const docRef = db.collection(PRODUCT_COLLECTION).doc(productId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return next(new NotFoundError("Produk tidak ditemukan."));
    }

    await docRef.update(updateData);
    res
      .status(200)
      .json({ success: true, message: "Produk berhasil diperbarui." });
  } catch (error) {
    next(error);
  }
};

// 5. DELETE: DELETE /api/v1/admin/products/:id
/**
 * Menghapus produk secara permanen (Hard Delete).
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const docRef = db.collection(PRODUCT_COLLECTION).doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      // Beri respons sukses jika produk sudah tidak ada
      return res
        .status(200)
        .json({
          success: true,
          message: "Produk tidak ditemukan (sudah terhapus).",
        });
    }

    await docRef.delete();

    res
      .status(200)
      .json({
        success: true,
        message: "Produk berhasil dihapus secara permanen.",
      });
  } catch (error) {
    next(error);
  }
};
