import { NextResponse } from 'next/server';
import { db }  from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';
import ExcelJS  from 'exceljs';

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

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan Pesanan');

    // Add headers
    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama', key: 'nama', width: 20 },
      { header: 'Kontak', key: 'kontak', width: 15 },
      { header: 'Detail', key: 'detail', width: 30 },
      { header: 'Jumlah', key: 'jumlah', width: 15 },
      { header: 'Total', key: 'total', width: 15 },
      { header: 'Tanggal Pesan', key: 'tanggalPesan', width: 15 },
      { header: 'Tanggal Bayar', key: 'tanggalPembayaran', width: 15 },
      { header: 'Status', key: 'status', width: 10 },
    ];

    // Add data rows
    orders.forEach((order, index) => {
      worksheet.addRow({
        no: index + 1,
        nama: order.nama || '',
        kontak: order.kontak || '',
        detail: order.detail || '',
        jumlah: order.jumlah || '',
        total: order.total || 0,
        tanggalPesan: order.tanggalPesan ? new Date(order.tanggalPesan).toLocaleDateString('id-ID') : '',
        tanggalPembayaran: order.tanggalPembayaran ? new Date(order.tanggalPembayaran).toLocaleDateString('id-ID') : '',
        status: order.status || '',
      });
    });

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6E6' }
    };

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Return Excel file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=Laporan-Pesanan-${new Date().toISOString().split('T')[0]}.xlsx`,
      },
    });

  } catch (error) {
    console.error('Error exporting orders to Excel:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal mengekspor data ke Excel.' },
      { status: error.statusCode || 500 }
    );
  }
}