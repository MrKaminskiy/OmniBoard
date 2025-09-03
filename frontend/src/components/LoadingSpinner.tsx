'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export default function LoadingSpinner({ size = 'md', text = 'Загрузка...' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizeClasses[size]} relative`}>
        {/* Внешний круг */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        
        {/* Анимированный круг */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
        
        {/* Внутренний круг для эффекта */}
        <div className="absolute inset-2 rounded-full border-2 border-gray-100"></div>
      </div>
      
      {text && (
        <p className="mt-4 text-gray-600 text-center font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}
