import { API_BASE_URL } from "./constants";

// Simple in-memory cache for GET requests
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds cache TTL

/**
 * Clear cache for a specific endpoint or all cache
 */
export function clearCache(endpoint?: string) {
  if (endpoint) {
    const keysToDelete = Array.from(cache.keys()).filter((key) =>
      key.startsWith(endpoint)
    );
    keysToDelete.forEach((key) => cache.delete(key));
  } else {
    cache.clear();
  }
}

/**
 * Fungsi utilitas untuk melakukan panggilan GET ke API backend.
 * @param endpoint - Endpoint API relatif (misal: 'products', 'orders/123').
 * @param requireAuth - Apakah endpoint memerlukan auth (default false).
 * @param useCache - Apakah menggunakan cache (default true).
 */
export async function getApi(
  endpoint: string,
  requireAuth: boolean = false,
  useCache: boolean = true
) {
  // Check cache first
  const cacheKey = `${endpoint}-${requireAuth}`;
  if (useCache) {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }

  // Membangun URL lengkap
  const url = `${API_BASE_URL}/${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (requireAuth) {
    const token = sessionStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      headers,
    });

    if (!response.ok) {
      // Melempar error dengan status code dan pesan untuk ditangkap oleh komponen
      const errorData = await response.json();
      throw new Error(
        errorData.error || `Gagal mengambil data. Status: ${response.status}`
      );
    }

    const data = await response.json();

    // Store in cache
    if (useCache) {
      cache.set(cacheKey, { data, timestamp: Date.now() });
    }

    return data;
  } catch (error) {
    console.error("Error API Call:", error);
    // Melempar kembali error agar bisa ditangani oleh komponen yang memanggil
    throw error;
  }
}

export async function postApi(
  endpoint: string,
  body: any,
  requireAuth: boolean = false
) {
  const url = `${API_BASE_URL}/${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (requireAuth) {
    const token = sessionStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    // Membaca text mentah terlebih dahulu untuk menangani body kosong
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          `Gagal mengirim data. Status: ${response.status}`
      );
    }

    return data;
  } catch (error) {
    console.error("Error API Call (POST):", error);
    throw error;
  }
}

export async function putApi(
  endpoint: string,
  body: any,
  requireAuth: boolean = true
) {
  const url = `${API_BASE_URL}/${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (requireAuth) {
    const token = sessionStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          `Gagal mengirim data. Status: ${response.status}`
      );
    }

    return data;
  } catch (error) {
    console.error("Error API Call (PUT):", error);
    throw error;
  }
}

export async function deleteApi(
  endpoint: string,
  requireAuth: boolean = false
) {
  const url = `${API_BASE_URL}/${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (requireAuth) {
    const token = sessionStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers,
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      throw new Error(
        data.message || `Gagal menghapus data. Status: ${response.status}`
      );
    }

    return data;
  } catch (error) {
    console.error("Error API Call (DELETE):", error);
    throw error;
  }
}
