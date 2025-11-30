export interface Produk {
  id: number;
  title: string;
  price: number;
  bahan: string;
  minimum: number;
}

export const DummyProduk: Produk[] = [
  { id: 1, title: "Barang 1", price: 1000000, bahan: "kertas kraft", minimum: 1000},
  { id: 2, title: "Barang 2", price: 2000000, bahan: "Impra Board", minimum: 100 },
  { id: 3, title: "Barang 3", price: 3000000, bahan: "Polietilena", minimum: 200 },
  { id: 4, title: "Barang 4", price: 4000000, bahan: "polypropylene", minimum: 500 },
];
