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
  jumlah: string;
  detail: string;
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

  // --- 1. STATE DEFAULT "Semua" ---
  const [selectedMonth, setSelectedMonth] = useState("Semua");
  const [selectedYear, setSelectedYear] = useState("Semua");

  // Fetch Data Orders
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

  // --- 2. LOGIKA OPSI TAHUN (Include "Semua") ---
  const yearOptions = useMemo(() => {
    const years = new Set<string>();
    // Selalu masukkan tahun saat ini
    years.add(new Date().getFullYear().toString());
    
    orders.forEach((o) => {
      if (o.tanggalPesan) {
        const d = new Date(o.tanggalPesan);
        if (!isNaN(d.getTime())) years.add(d.getFullYear().toString());
      }
    });
    
    const sortedYears = Array.from(years).sort().reverse();
    // Tambahkan opsi "Semua" di awal
    return ["Semua", ...sortedYears];
  }, [orders]);

  // --- 3. KALKULASI DATA DASHBOARD ---
  const dashboardData = useMemo(() => {
    // A. FILTER DATA
    const filtered = orders.filter((order) => {
      // Wajib Status 'Selesai' (Agar revenue akurat)
      if (order.status !== 'Selesai') return false;
      
      if (!order.tanggalPesan) return false;
      const d = new Date(order.tanggalPesan);
      if (isNaN(d.getTime())) return false;

      // Filter Tahun (Jika bukan "Semua", cek kesesuaian)
      const orderYear = d.getFullYear().toString();
      if (selectedYear !== "Semua" && orderYear !== selectedYear) return false;

      // Filter Bulan (Jika bukan "Semua", cek kesesuaian)
      if (selectedMonth !== "Semua") {
         const orderMonthName = new Intl.DateTimeFormat("id-ID", { month: "long" }).format(d);
         if (orderMonthName.toLowerCase() !== selectedMonth.toLowerCase()) return false;
      }

      return true;
    });

    // B. HITUNG STATISTIK
    let revenue = 0;
    let totalQty = 0;
    const productStats: Record<string, number> = {};

    filtered.forEach((order) => {
      // Revenue
      revenue += Number(order.total) || 0;

      // Quantity (Parse "1000 pcs" -> 1000)
      const qtyMatch = order.jumlah ? order.jumlah.match(/\d+/) : null;
      const qty = qtyMatch ? parseInt(qtyMatch[0]) : 0;
      totalQty += qty;

      // Grouping Produk
      const productName = order.detail || "Tanpa Nama";
      if (!productStats[productName]) {
        productStats[productName] = 0;
      }
      productStats[productName] += qty;
    });

    // C. BEST SELLER
    let bestSellerName = "-";
    let maxSold = -1;

    Object.entries(productStats).forEach(([name, qty]) => {
      if (qty > maxSold) {
        maxSold = qty;
        bestSellerName = name;
      }
    });

    // D. DATA CHART
    const chartData = Object.entries(productStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10) // Top 10
      .map(([name, qty]) => ({
        range: name,
        sales: qty,
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

  // Helper Judul Chart
  const chartTitle = () => {
    if (selectedMonth === "Semua" && selectedYear === "Semua") return "Semua Waktu";
    if (selectedMonth === "Semua") return `Tahun ${selectedYear}`;
    return `${selectedMonth} ${selectedYear}`;
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-gray-50 min-h-screen">
      {/* Header + Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500">Ringkasan dari data laporan (Status: Selesai).</p>
        </div>

        <div className="flex gap-3">
          {/* Filter Bulan */}
          <MonthFilter 
            value={selectedMonth} 
            onChange={setSelectedMonth} 
            options={["Semua", ...INDONESIA_MONTHS]} 
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
            title={chartTitle()} 
          />
        </>
      )}
    </div>
  );
}