"use client";
import React, { use, useEffect, useState } from "react";
import { getApi, putApi } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaSave } from "react-icons/fa";
import Image from "next/image";
import Swal from "sweetalert2";

// Definisi State Form
interface ProductFormEdit {
  name: string;
  sku: string;
  price: string | number;
  stock: string | number;
  minOrderQuantity: string | number;
  unit: string;
  description: string;
  imageUrl: string;
  material: string;
  size: string;
}

const EditProduct = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const router = useRouter();
  const [formData, setFormData] = useState<ProductFormEdit>({
    name: "",
    sku: "",
    price: 0,
    stock: 0,
    minOrderQuantity: 0,
    unit: "",
    description: "",
    imageUrl: "",
    material: "",
    size: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetching data yang diambil dengan id
  useEffect(() => {
    async function fetchProduct() {
      try {
        setIsLoading(true);
        const res = await getApi(`admin/products/${id}`, true);
        const data = res.data || res;

        setFormData({
          name: data.name || "",
          sku: data.sku || "",
          price: data.price || 0,
          stock: data.stock || 0,
          minOrderQuantity: data.minOrder || 0,
          unit: data.unit || "",
          description: data.description || "",
          imageUrl: data.imageUrl || "",
          material: data.material || "",
          size: data.size || "",
        });
      } catch (err: any) {
        console.error("Error pas fecthing :", err);
        setError(err.message || "Gagal memuat data produk ");
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Handler untuk update form
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle Edit gambar ukuran
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi ukuran (Max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire({
          title: "Peringatan!",
          text: "Ukuran file terlalu besar (max 2mb)",
          icon: "warning",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // Hasil berupa "data:image/jpeg;base64,..."
        setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler untuk submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const payload = {
        name: formData.name,
        sku: formData.sku,
        price: Number(formData.price),
        currentStock: Number(formData.stock),
        minOrderQuantity: Number(formData.minOrderQuantity),
        unit: formData.unit,
        description: formData.description,
        imageUrl: formData.imageUrl,
        material: formData.material,
        size: formData.size,
      };

      await putApi(`admin/products/${id}`, payload, true);

      Swal.fire({
        title: "Berhasil!",
        text: "Berhasil mengupdate data!",
        icon: "success",
      });
      router.push("/katalog");
    } catch (err: any) {
      console.error("Error update produk : ", err);
      Swal.fire({
        title: "Gagal!",
        text: "Gagal mengupdate data!" + (err.message || "Error server"),
        icon: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error : {error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-black transition"
        >
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Edit Produk</h1>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6"
      >
        {/* --- Bagian Gambar --- */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">
            Foto Produk
          </label>
          <div className="flex items-start gap-6">
            <div className="w-32 h-32 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center relative">
              <Image
                src={formData.imageUrl}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-2 justify-center h-32">
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
              />
              <p className="text-xs text-gray-400">
                Format: JPG, PNG. Maksimal 2MB.
              </p>
            </div>
          </div>
        </div>

        {/* --- Informasi Dasar --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-medium">
              Nama Produk <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded-md outline-none focus:border-black focus:ring-1 focus:ring-black transition"
              placeholder="Contoh: Air Mineral 600ml"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">
              SKU (Kode Unik) <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded-md outline-none focus:border-black focus:ring-1 focus:ring-black transition"
              placeholder="Contoh: AM-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-medium">
              Harga (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              className="w-full border border-gray-300 p-2 rounded-md outline-none focus:border-black focus:ring-1 focus:ring-black transition"
              placeholder="0"
            />
          </div>
          {/* Input Ukuran */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Ukuran</label>
            <input
              type="text"
              name="size"
              value={formData.size}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded-md outline-none focus:border-black"
              placeholder="Contoh: 20x30 cm, Besar, Kecil"
            />
          </div>
        </div>

        {/* --- Inventaris --- */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-md font-semibold text-gray-800 mb-4">
            Inventaris
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Stok Awal</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className="w-full border border-gray-300 p-2 rounded-md outline-none focus:border-black transition"
                placeholder="0"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Bahan (Material)</label>
              <input
                type="text"
                name="material"
                value={formData.material}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded-md outline-none focus:border-black"
                placeholder="Contoh: Plastik, Besi, Kertas"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Min. Order <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="number"
                name="minOrderQuantity"
                value={formData.minOrderQuantity}
                onChange={handleChange}
                min="1"
                className="w-full border border-gray-300 p-2 rounded-md outline-none focus:border-black transition"
                placeholder="1"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Satuan Unit <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded-md outline-none focus:border-black transition"
                placeholder="Pcs / Box"
              />
            </div>
          </div>
        </div>

        {/* --- Detail Lainnya --- */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div className="space-y-1">
            <label className="text-sm font-medium">Deskripsi (Opsional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full border border-gray-300 p-2 rounded-md outline-none focus:border-black transition"
              placeholder="Jelaskan detail produk secara lengkap..."
            />
          </div>
        </div>

        {/* --- Tombol Simpan --- */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`flex items-center gap-2 px-8 py-3 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition shadow-md ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <FaSave />
            {isLoading ? "Menyimpan..." : "Simpan Produk"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
