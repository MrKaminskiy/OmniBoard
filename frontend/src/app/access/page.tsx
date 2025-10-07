'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Временно отключаем парольную защиту и сразу переходим на главную
    router.push('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            🚀 OmniBoard
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Перенаправление...
          </p>
        </div>
        
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        
        <div className="text-center text-xs text-gray-500">
          <p>Демо-версия OmniBoard - криптотрейдинг дашборд</p>
          <p>Парольная защита временно отключена</p>
        </div>
      </div>
    </div>
  );
}