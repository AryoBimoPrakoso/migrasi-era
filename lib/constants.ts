// app/lib/constants.ts

// API_BASE_URL: Menunjuk ke lokasi server backend Anda (Next.js API dengan prefix /api/v1)


// CHATBOT_API_URL: Menunjuk ke lokasi server chatbot Python
export const CHATBOT_API_URL = 'https://chatbot-erabanyu.vercel.app';

// Anda bisa menambahkan konstanta lain di sini, seperti
// export const PAGINATION_LIMIT = 10;
// export const JWT_TOKEN_KEY = 'eraBanyuToken';

export const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // Di Browser: gunakan origin saat ini (otomatis support localhost & preview)
    return window.location.origin;
  }

  // Di Server: Cek Env Vars
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL;
  }

  // Vercel System Var (Server-side only, otomatis ada di Vercel)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Default Localhost
  return "http://localhost:3000";
};

// Export konstanta siap pakai
export const FRONTEND_URL = getBaseUrl();
export const API_BASE_URL = `${FRONTEND_URL}/api/v1`;