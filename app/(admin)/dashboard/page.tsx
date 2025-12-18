"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getApi } from "@/lib/apiClient";
import CardsTotal from "@/app/components/admin/CardsTotal";
import Barchart from "@/app/components/admin/Barchart";
import MonthFilter from "@/app/components/admin/MonthFilter";
import YearFilter from "@/app/components/admin/YearFilter";

// Interface Data Order
interface Order {
  id: string;
  total: number;
  jumlah: string; // Contoh: "1000 pcs" -> perlu parsing
  detail: string; // Nama produk
  tanggalPesan: string;
  status: string;
}

// List Bulan Indonesia (Statis)
const INDONESIA_MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE FILTER ---
  const today = new Date();
  
  // Default: Bulan & Tahun saat ini (Bahasa Indonesia)
  const currentMonthName = new Intl.DateTimeFormat("id-ID", { month: "long" }).format(today);
  const currentYear = today.getFullYear().toString();

  const [selectedMonth, setSelectedMonth] = useState(currentMonthName);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // 1. Fetch Data Orders
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await getApi("admin/orders", true);
      const data = response.data || response;
      setOrders(data);
    } catch (error) {
      console.error("Gagal mengambil data dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 2. Siapkan Opsi Tahun (Dinamis dari data)
  const yearOptions = useMemo(() => {
    const years = new Set<string>();
    years.add(new Date().getFullYear().toString()); // Selalu masukkan tahun ini
    orders.forEach((o) => {
      if (o.tanggalPesan) {
        const d = new Date(o.tanggalPesan);
        if (!isNaN(d.getTime())) years.add(d.getFullYear().toString());
      }
    });
    // Sort Descending (2025, 2024...)
    return Array.from(years).sort().reverse();
  }, [orders]);

  // 3. Kalkulasi Data Dashboard (Memoized)
  const dashboardData = useMemo(() => {
    // A. FILTER DATA (Bulan & Tahun)
    const filtered = orders.filter((order) => {
      // Abaikan status 'Batal' agar statistik akurat
      if (order.status !== 'Selesai') return false;
      if (!order.tanggalPesan) return false;

      const d = new Date(order.tanggalPesan);
      if (isNaN(d.getTime())) return false;

      // Cek Tahun
      const orderYear = d.getFullYear().toString();
      if (selectedYear && orderYear !== selectedYear) return false;

      // Cek Bulan
      const orderMonthName = new Intl.DateTimeFormat("id-ID", { month: "long" }).format(d);
      // Case-insensitive comparison
      if (selectedMonth && orderMonthName.toLowerCase() !== selectedMonth.toLowerCase()) return false;

      return true;
    });

    // B. HITUNG STATISTIK
    let revenue = 0;
    let totalQty = 0;
    const productStats: Record<string, number> = {}; // Map: { "Produk A": 100, "Produk B": 50 }

    filtered.forEach((order) => {
      // 1. Revenue
      revenue += Number(order.total) || 0;

      // 2. Quantity (Parsing string "1000 pcs" -> 1000)
      const qtyMatch = order.jumlah ? order.jumlah.match(/\d+/) : null;
      const qty = qtyMatch ? parseInt(qtyMatch[0]) : 0;
      totalQty += qty;

      // 3. Grouping Produk (Untuk Chart & Best Seller)
      const productName = order.detail || "Tanpa Nama";
      if (!productStats[productName]) {
        productStats[productName] = 0;
      }
      productStats[productName] += qty;
    });

    // C. CARI BEST SELLER
    let bestSellerName = "-";
    let maxSold = -1;

    Object.entries(productStats).forEach(([name, qty]) => {
      if (qty > maxSold) {
        maxSold = qty;
        bestSellerName = name;
      }
    });

    // D. SIAPKAN DATA CHART (Format Recharts: { range: string, sales: number })
    // Urutkan dari penjualan terbanyak, ambil Top 5 atau 10
    const chartData = Object.entries(productStats)
      .sort(([, a], [, b]) => b - a) // Descending by qty
      .slice(0, 10) // Top 10 Produk
      .map(([name, qty]) => ({
        range: name, // X-Axis: Nama Produk
        sales: qty,  // Y-Axis: Jumlah Terjual
      }));

    return {
      revenue,
      totalQty,
      bestSeller: maxSold > 0 ? bestSellerName : "-",
      chartData
    };

  }, [orders, selectedMonth, selectedYear]);

  // Helper Format Rupiah
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-gray-50 min-h-screen">
      {/* Header + Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500">Ringkasan performa bisnis Anda.</p>
        </div>

        <div className="flex gap-3">
          {/* Filter Bulan */}
          <MonthFilter 
            value={selectedMonth} 
            onChange={setSelectedMonth} 
            options={INDONESIA_MONTHS} 
          />
          {/* Filter Tahun */}
          <YearFilter 
            value={selectedYear} 
            onChange={setSelectedYear} 
            options={yearOptions} 
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-gray-500">Memuat data dashboard...</div>
      ) : (
        <>
          {/* Cards Statistik */}
          <CardsTotal 
            totalRevenue={formatRupiah(dashboardData.revenue)}
            totalSales={dashboardData.totalQty}
            bestSeller={dashboardData.bestSeller}
          />

          {/* Chart Penjualan Produk */}
          <Barchart 
            data={dashboardData.chartData} 
            title={`${selectedMonth} ${selectedYear}`} 
          />
        </>
      )}
    </div>
  );
}