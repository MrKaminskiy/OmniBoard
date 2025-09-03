'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Signals() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Имитация загрузки
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingSpinner text="Загружаем торговые сигналы..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">📡 Trading Signals</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Получайте актуальные торговые сигналы от профессиональных трейдеров и алгоритмических систем
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Точные сигналы</h3>
          <p className="text-gray-600">
            Сигналы основаны на техническом анализе, фундаментальных данных и машинном обучении
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="text-4xl mb-4">⚡</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time обновления</h3>
          <p className="text-gray-600">
            Получайте сигналы в реальном времени с push-уведомлениями
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Детальная аналитика</h3>
          <p className="text-gray-600">
            Каждый сигнал сопровождается подробным анализом и рекомендациями
          </p>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">🚀</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Функционал в разработке</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Мы работаем над интеграцией с TradingView, Binance, Coinbase и другими платформами для предоставления 
          вам самых актуальных и точных торговых сигналов.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-2">🔔 Уведомления</h4>
            <p className="text-sm text-gray-600">Telegram, Email, Push</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-2">📈 Фильтры</h4>
            <p className="text-sm text-gray-600">По монетам, времени, силе сигнала</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-2">📊 Статистика</h4>
            <p className="text-sm text-gray-600">Успешность, ROI, история</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-2">🤖 Автотрейдинг</h4>
            <p className="text-sm text-gray-600">Автоматическое исполнение сигналов</p>
          </div>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Получайте уведомления о запуске</h3>
        <p className="text-gray-600 mb-4">Будьте первыми, кто узнает о запуске торговых сигналов</p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Ваш email"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors">
            Подписаться
          </button>
        </div>
      </div>
    </div>
  );
}

