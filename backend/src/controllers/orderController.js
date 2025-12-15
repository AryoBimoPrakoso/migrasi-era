// src/controllers/orderController.js

const { db, admin } = require('../config/db');
const { NotFoundError, BadRequestError } = require('../utils/customError');
const { body, validationResult } = require('express-validator');
const ExcelJS = require('exceljs');
const ORDER_COLLECTION = 'orders';

/**
 * Get all orders for admin
 */
exports.getAllOrders = async (req, res, next) => {
  try {
    const snapshot = await db.collection(ORDER_COLLECTION).get();
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error getting orders:', error);
    next(error);
  }
};

/**
 * Get order by ID
 */
exports.getOrderById = async (req, res, next) => {
  try {
    const doc = await db.collection(ORDER_COLLECTION).doc(req.params.id).get();

    if (!doc.exists) {
      return next(new NotFoundError('Order tidak ditemukan'));
    }

    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error getting order:', error);
    next(error);
  }
};

// Validation middleware for createOrder
exports.validateCreateOrder = [
  body('nama').notEmpty().withMessage('Nama wajib diisi'),
  body('kontak').notEmpty().withMessage('Kontak wajib diisi'),
  body('detail').notEmpty().withMessage('Detail produk wajib diisi'),
  body('jumlah').notEmpty().withMessage('Jumlah wajib diisi'),
  body('total').isNumeric().withMessage('Total harus angka'),
  body('tanggalPesan').notEmpty().withMessage('Tanggal pesan wajib diisi'),
  body('status').notEmpty().withMessage('Status wajib diisi'),
];

/**
 * Create new order
 */
exports.createOrder = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new BadRequestError('Validation failed: ' + errors.array().map(err => err.msg).join(', ')));
  }

  const { nama, kontak, detail, jumlah, total, tanggalPesan, tanggalPembayaran, status } = req.body;

  try {
    const newOrder = {
      nama,
      kontak,
      detail,
      jumlah,
      total: Number(total),
      tanggalPesan,
      tanggalPembayaran: tanggalPembayaran || null,
      status,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection(ORDER_COLLECTION).add(newOrder);

    console.log(`[INFO] Order baru dibuat: ${nama} - ${detail}`);

    res.status(201).json({
      success: true,
      message: 'Order berhasil ditambahkan',
      orderId: docRef.id,
      order: { id: docRef.id, ...newOrder }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    next(error);
  }
};

/**
 * Update order
 */
exports.updateOrder = async (req, res, next) => {
  const orderId = req.params.id;

  let updateData = {
    ...req.body,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  if (updateData.total) {
    updateData.total = Number(updateData.total);
  }

  delete updateData.id;

  try {
    const docRef = db.collection(ORDER_COLLECTION).doc(orderId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return next(new NotFoundError('Order tidak ditemukan'));
    }

    await docRef.update(updateData);
    res.status(200).json({ success: true, message: 'Order berhasil diperbarui' });
  } catch (error) {
    console.error('Error updating order:', error);
    next(error);
  }
};

/**
 * Delete order
 */
exports.deleteOrder = async (req, res, next) => {
  try {
    const docRef = db.collection(ORDER_COLLECTION).doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(200).json({ success: true, message: 'Order tidak ditemukan (sudah terhapus)' });
    }

    await docRef.delete();

    res.status(200).json({ success: true, message: 'Order berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting order:', error);
    next(error);
  }
};

/**
 * Export orders to Excel
 */
exports.exportOrdersToExcel = async (req, res, next) => {
  try {
    const snapshot = await db.collection(ORDER_COLLECTION).get();
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan Pesanan');

    // Add headers
    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama', key: 'nama', width: 20 },
      { header: 'Kontak', key: 'kontak', width: 15 },
      { header: 'Detail Produk', key: 'detail', width: 30 },
      { header: 'Jumlah Pesanan', key: 'jumlah', width: 15 },
      { header: 'Total', key: 'total', width: 15 },
      { header: 'Tanggal Pesanan', key: 'tanggalPesan', width: 15 },
      { header: 'Tanggal Pembayaran', key: 'tanggalPembayaran', width: 18 },
      { header: 'Status', key: 'status', width: 10 },
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' }
    };

    // Add data
    orders.forEach((order, index) => {
      worksheet.addRow({
        no: index + 1,
        nama: order.nama,
        kontak: order.kontak,
        detail: order.detail,
        jumlah: order.jumlah,
        total: `Rp ${order.total?.toLocaleString() || 0}`,
        tanggalPesan: order.tanggalPesan,
        tanggalPembayaran: order.tanggalPembayaran || '-',
        status: order.status,
      });
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=laporan-pesanan-${new Date().toISOString().split('T')[0]}.xlsx`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error exporting to Excel:', error);
    next(new BadRequestError('Failed to export Excel'));
  }
};