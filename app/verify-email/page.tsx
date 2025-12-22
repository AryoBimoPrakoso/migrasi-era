'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { postApi } from '../../lib/apiClient';

// Komponen form utama dibungkus terpisah agar bisa menggunakan useSearchParams di dalam Suspense
function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token verifikasi tidak ditemukan di URL.');
      return;
    }

    const verifyEmail = async () => {
      setIsLoading(true);
      setError('');

      try {
        await postApi('admin/auth/verify-email', { token });
        setSuccess(true);
        // Redirect otomatis setelah 3 detik
        setTimeout(() => router.push('/login'), 3000);
      } catch (err: any) {
        setError(err.message || 'Gagal memverifikasi email. Token mungkin sudah kadaluarsa.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token, router]);

  if (success) {
    return (
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg leading-6 font-medium text-gray-900">Email Berhasil Diverifikasi!</h3>
        <p className="mt-2 text-sm text-gray-500">
          Anda akan dialihkan ke halaman login dalam beberapa detik.
        </p>
        <div className="mt-6">
          <Link href="/login" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            Login Sekarang
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isLoading && (
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-sm text-gray-500">Memverifikasi email Anda...</p>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Verifikasi Gagal</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !error && !success && (
        <div className="text-center">
          <p className="text-sm text-gray-500">Memproses verifikasi...</p>
        </div>
      )}
    </div>
  );
}

// Komponen Halaman Utama
export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verifikasi Email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Klik link verifikasi dari email Anda untuk mengaktifkan akun.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          {/* Suspense diperlukan karena menggunakan useSearchParams */}
          <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
            <VerifyEmailForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}