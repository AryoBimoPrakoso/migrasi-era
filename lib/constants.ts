// app/lib/constants.ts

// API_BASE_URL: Menunjuk ke lokasi server backend Anda (port 5000 dengan prefix /api/v1)
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

// CHATBOT_API_URL: Menunjuk ke lokasi server chatbot Python
export const CHATBOT_API_URL = process.env.NEXT_PUBLIC_CHATBOT_API_URL || 'https://chatbot-erabanyu.vercel.app';

// Anda bisa menambahkan konstanta lain di sini, seperti
// export const PAGINATION_LIMIT = 10;
// export const JWT_TOKEN_KEY = 'eraBanyuToken';