'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getApi } from '@/lib/apiClient';

interface OrderForm {
  nama: string;
  kontak: string;
  detail: string;
  jumlah: string;
  total: string;
  tanggalPesan: string;
  tanggalPembayaran: string;
  status: string;
}

export default function EditLaporanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [form, setForm] = useState<OrderForm>({
    nama: '',
    kontak: '',
    detail: '',
    jumlah: '',
    total: '',
    tanggalPesan: '',
    tanggalPembayaran: '',
    status: 'Diproses'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      const data = await getApi(`admin/orders/${id}`, true);
      setForm({
        nama: data.nama || '',
        kontak: data.kontak || '',
        detail: data.detail || '',
        jumlah: data.jumlah || '',
        total: data.total?.toString() || '',
        tanggalPesan: data.tanggalPesan || '',
        tanggalPembayaran: data.tanggalPembayaran || '',
        status: data.status || 'Diproses'
      });
    } catch (err) {
      setError('Gagal memuat data order');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...form,
        total: parseFloat(form.total) || 0
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/admin/orders${id ? `/${id}` : ''}`, {
        method: id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      router.push('/laporan');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold mb-6">{id ? 'Edit' : 'Tambah'} Laporan Pesanan</h1>

        {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Nama</label>
              <input
                type="text"
                name="nama"
                value={form.nama}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Kontak</label>
              <input
                type="text"
                name="kontak"
                value={form.kontak}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Detail Produk</label>
              <input
                type="text"
                name="detail"
                value={form.detail}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Jumlah Pesanan</label>
              <input
                type="text"
                name="jumlah"
                value={form.jumlah}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Total (Rp)</label>
              <input
                type="number"
                name="total"
                value={form.total}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tanggal Pesanan</label>
              <input
                type="date"
                name="tanggalPesan"
                value={form.tanggalPesan}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tanggal Pembayaran</label>
              <input
                type="date"
                name="tanggalPembayaran"
                value={form.tanggalPembayaran}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              >
                <option value="Diproses">Diproses</option>
                <option value="Selesai">Selesai</option>
                <option value="Batal">Batal</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/laporan')}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}