import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Fetch active products from Firestore
 * @returns Promise<Product[]>
 */
export async function getProducts() {
  try {
    const productsRef = collection(db, "products");
    const q = query(productsRef, where("isActive", "==", true));
    const querySnapshot = await getDocs(q);

    const products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

// Define Product type (adjust based on your data structure)
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  // Add other fields as needed
}