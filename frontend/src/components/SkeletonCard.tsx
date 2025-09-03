'use client';

interface SkeletonCardProps {
  className?: string;
}

export default function SkeletonCard({ className = '' }: SkeletonCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 animate-pulse ${className}`}>
      {/* Заголовок */}
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      
      {/* Значение */}
      <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
      
      {/* Описание */}
      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
    </div>
  );
}
