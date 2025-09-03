'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient, type MarketOverview, type Ticker } from '@/lib/api';

export default function MarketOverview() {
  const [marketData, setMarketData] = useState<MarketOverview | null>(null);
  const [tickers, setTickers] = useState<Ticker[]>([]);
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
      <div className="container-xl">
        <div className="page-header d-print-none">
          <div className="container-xl">
            <div className="row g-2 align-items-center">
              <div className="col">
                <h2 className="page-title">Market Overview</h2>
                <p className="text-muted">Загружаем актуальные данные рынка...</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Skeleton для KPI карточек */}
        <div className="row row-cards mb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="col-sm-6 col-lg-3">
              <div className="card">
                <div className="card-body">
                  <div className="placeholder-glow">
                    <div className="placeholder col-8 mb-2"></div>
                    <div className="placeholder col-6"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Skeleton для таблицы */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Top Cryptocurrencies</h3>
          </div>
          <div className="card-body">
            <div className="placeholder-glow">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="placeholder col-12 mb-2"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-xl">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-title">Ошибка загрузки</h4>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-xl">
      {/* Header */}
      <div className="page-header d-print-none">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              <h2 className="page-title">Market Overview</h2>
              <p className="text-muted">Актуальные данные криптовалютного рынка</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row row-cards mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="subheader">Market Cap</div>
              </div>
              <div className="h1 mb-3">{marketData?.market_cap_formatted || '---'}</div>
              <div className="text-muted">Общая капитализация рынка</div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="subheader">24h Volume</div>
              </div>
              <div className="h1 mb-3">{marketData?.volume_formatted || '---'}</div>
              <div className="text-muted">Объем торгов за 24 часа</div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="subheader">Fear & Greed</div>
              </div>
              <div className="h1 mb-3">{marketData?.fear_greed || '75/100'}</div>
              <div className="text-muted">Индекс страха и жадности</div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="subheader">Altseason</div>
              </div>
              <div className="h1 mb-3">{marketData?.altseason || '65/100'}</div>
              <div className="text-muted">Индекс альткоин сезона</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tickers Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Top Cryptocurrencies</h3>
        </div>
        <div className="card-body">
          {tickers.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-vcenter">
                <thead>
                  <tr>
                    <th>Coin</th>
                    <th>Price</th>
                    <th>24h Change</th>
                  </tr>
                </thead>
                <tbody>
                  {tickers.map((ticker, index) => (
                    <tr key={index}>
                      <td>
                        <div className="d-flex align-items-center">
                          <span className="avatar avatar-sm me-2">
                            <span className="avatar-initials bg-primary">
                              {ticker.symbol?.charAt(0) || '?'}
                            </span>
                          </span>
                          <div>
                            <div className="font-weight-medium">{ticker.symbol || '---'}</div>
                            <div className="text-muted">{ticker.name || '---'}</div>
                          </div>
                        </div>
                      </td>
                      <td>${ticker.price || '---'}</td>
                      <td>
                        <span className={`badge bg-${ticker.priceChangePercent24h >= 0 ? 'success' : 'danger'}`}>
                          {ticker.priceChangePercent24h >= 0 ? '+' : ''}{ticker.priceChangePercent24h || '---'}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-muted py-4">
              <i className="ti ti-coins ti-3x mb-3"></i>
              <p>Нет данных для отображения</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
