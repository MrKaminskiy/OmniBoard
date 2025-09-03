'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import SkeletonCard from '@/components/SkeletonCard';

export default function MarketOverview() {
  const [marketData, setMarketData] = useState<any>(null);
  const [tickers, setTickers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = useCallback(async () => {
    try {
      setError(null);
      const response = await apiClient.getMarketOverview();
      setMarketData(response.data);
    } catch (err) {
      setError('Failed to fetch market data');
      console.error('Error fetching market data:', err);
    }
  }, []);

  const fetchTickers = useCallback(async () => {
    try {
      setError(null);
      const response = await apiClient.getTickers();
      setTickers(response.data);
    } catch (err) {
      setError('Failed to fetch tickers');
      console.error('Error fetching tickers:', err);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchMarketData(), fetchTickers()]);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchMarketData, fetchTickers]);

  // Polling каждые 30 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMarketData();
      fetchTickers();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchMarketData, fetchTickers]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Market Overview</h1>
          <p className="text-gray-600">Загружаем актуальные данные рынка...</p>
        </div>
        
        {/* Skeleton для KPI карточек */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        
        {/* Skeleton для таблицы */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          </div>
          <div className="p-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ошибка загрузки</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Market Overview</h1>
        <p className="text-gray-600">Актуальные данные криптовалютного рынка</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Market Cap</h3>
          <p className="text-2xl font-bold text-gray-900">
            {marketData?.market_cap_formatted || '---'}
          </p>
          <p className="text-sm text-gray-600 mt-1">Общая капитализация рынка</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">24h Volume</h3>
          <p className="text-2xl font-bold text-gray-900">
            {marketData?.volume_formatted || '---'}
          </p>
          <p className="text-sm text-gray-600 mt-1">Объем торгов за 24 часа</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Fear & Greed</h3>
          <p className="text-2xl font-bold text-gray-900">
            {marketData?.fear_greed || '75/100'}
          </p>
          <p className="text-sm text-gray-600 mt-1">Индекс страха и жадности</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Altseason</h3>
          <p className="text-2xl font-bold text-gray-900">
            {marketData?.altseason || '65/100'}
          </p>
          <p className="text-sm text-gray-600 mt-1">Индекс альткоин сезона</p>
        </div>
      </div>

      {/* Tickers Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Top Cryptocurrencies</h2>
        </div>
        <div className="p-6">
          {tickers.length > 0 ? (
            <div className="space-y-3">
              {tickers.map((ticker, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                      {ticker.symbol?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{ticker.symbol || '---'}</p>
                      <p className="text-sm text-gray-500">{ticker.name || '---'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${ticker.price || '---'}</p>
                    <p className={`text-sm ${ticker.priceChangePercent24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {ticker.priceChangePercent24h >= 0 ? '+' : ''}{ticker.priceChangePercent24h || '---'}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Нет данных для отображения
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
