'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function TradingJournal() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Имитация загрузки
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingSpinner text="Загружаем дневник торговли..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">📈 Trading Journal</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Ведите детальный учет всех ваших торговых операций, анализируйте результаты и улучшайте стратегии
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">+24.5%</div>
          <h3 className="text-sm font-medium text-gray-500">Общий ROI</h3>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">156</div>
          <h3 className="text-sm font-medium text-gray-500">Всего сделок</h3>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">68%</div>
          <h3 className="text-sm font-medium text-gray-500">Успешных сделок</h3>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">$12.4K</div>
          <h3 className="text-sm font-medium text-gray-500">Общая прибыль</h3>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Детальная запись сделок</h3>
          <ul className="space-y-2 text-gray-600">
            <li>• Дата и время входа/выхода</li>
            <li>• Цена входа и выхода</li>
            <li>• Размер позиции и риск</li>
            <li>• Причина входа и выхода</li>
            <li>• Эмоциональное состояние</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Аналитика и отчеты</h3>
          <ul className="space-y-2 text-gray-600">
            <li>• Графики доходности</li>
            <li>• Анализ по монетам</li>
            <li>• Статистика по времени</li>
            <li>• Анализ ошибок</li>
            <li>• Сравнение стратегий</li>
          </ul>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">🚀</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Функционал в разработке</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Мы создаем мощный инструмент для профессиональных трейдеров с интеграцией бирж, 
          автоматическим импортом сделок и продвинутой аналитикой.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-2">🔗 Интеграция бирж</h4>
            <p className="text-sm text-gray-600">Binance, Coinbase, Kraken</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-2">📱 Мобильное приложение</h4>
            <p className="text-sm text-gray-600">iOS и Android</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-2">🤖 Автоимпорт</h4>
            <p className="text-sm text-gray-600">Автоматический импорт сделок</p>
          </div>
        </div>
      </div>

      {/* Sample Journal Entry */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Пример записи в дневнике</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">BTC/USDT</span>
            <span className="text-green-600 font-semibold">+$450</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Вход:</span>
              <span className="ml-2 font-medium">$42,500</span>
            </div>
            <div>
              <span className="text-gray-500">Выход:</span>
              <span className="ml-2 font-medium">$43,200</span>
            </div>
            <div>
              <span className="text-gray-500">Размер:</span>
              <span className="ml-2 font-medium">0.1 BTC</span>
            </div>
            <div>
              <span className="text-gray-500">Длительность:</span>
              <span className="ml-2 font-medium">2ч 15м</span>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <strong>Причина входа:</strong> Пробой уровня сопротивления $42,300, объем выше среднего
          </div>
          <div className="text-sm text-gray-600">
            <strong>Причина выхода:</strong> Достижение целевого уровня $43,200, RSI перекуплен
          </div>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Получайте уведомления о запуске</h3>
        <p className="text-gray-600 mb-4">Будьте первыми, кто попробует новый Trading Journal</p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Ваш email"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors">
            Подписаться
          </button>
        </div>
      </div>
    </div>
  );
}

