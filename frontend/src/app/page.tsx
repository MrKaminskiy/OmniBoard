'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient, type MarketOverview, type Coin } from '@/lib/api';

export default function MarketOverview() {
  const [marketData, setMarketData] = useState<MarketOverview | null>(null);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = useCallback(async () => {
    try {
      setError(null);
      console.log('Fetching market overview data...');
      const response = await apiClient.getMarketOverview();
      console.log('Market overview response:', response);
      console.log('Market data structure:', response.data);
      console.log('Available fields:', Object.keys(response.data || {}));
      setMarketData(response.data);
    } catch (err) {
      setError('Failed to fetch market data');
      console.error('Error fetching market data:', err);
    }
  }, []);

  const fetchCoins = useCallback(async () => {
    try {
      setError(null);
      console.log('Fetching coins data...');
      const response = await apiClient.getTickers();
      console.log('Coins response:', response);
      console.log('Coins array:', response.data.coins);
      
      if (response.data.coins && response.data.coins.length > 0) {
        console.log('First coin details:', response.data.coins[0]);
        console.log('All coins prices:', response.data.coins.map(coin => ({
          symbol: coin.symbol,
          price: coin.price,
          price_change_24h: coin.price_change_24h,
          volume_24h: coin.volume_24h
        })));
      }
      
      setCoins(response.data.coins || []);
    } catch (err) {
      setError('Failed to fetch coins data');
      console.error('Error fetching coins:', err);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchMarketData(), fetchCoins()]);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchMarketData, fetchCoins]);

  // Polling каждые 30 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMarketData();
      fetchCoins();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchMarketData, fetchCoins]);

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

  const formatPrice = (price: number): string => {
    if (price === 0) return '---';
    if (price >= 1) {
      return `$${price.toFixed(2)}`;
    } else if (price >= 0.01) {
      return `$${price.toFixed(4)}`;
    } else {
      return `$${price.toFixed(6)}`;
    }
  };

  const formatMarketCap = (marketCap: number): string => {
    if (marketCap === 0) return '---';
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    if (marketCap >= 1e3) return `$${(marketCap / 1e3).toFixed(2)}K`;
    return `$${marketCap.toFixed(2)}`;
  };

  const formatVolume = (volume: number): string => {
    if (volume === 0) return '---';
    if (volume >= 1e12) return `$${(volume / 1e12).toFixed(2)}T`;
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  };

  const formatPriceChange = (change: number): string => {
    if (change === 0) return '---';
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  };

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
              <div className="h1 mb-3">{marketData?.fear_greed || '---'}</div>
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
              <div className="h1 mb-3">{marketData?.altseason || '---'}</div>
              <div className="text-muted">Индекс альткоин сезона</div>
            </div>
          </div>
        </div>
      </div>

      {/* Coins Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Top 15 Cryptocurrencies</h3>
        </div>
        <div className="card-body">
          {coins.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-vcenter">
                <thead>
                  <tr>
                    <th>Coin</th>
                    <th>Price</th>
                    <th>24h Change</th>
                    <th>24h Volume</th>
                    <th>Market Cap</th>
                    <th>RSI 1D</th>
                    <th>Liquidations 24h</th>
                  </tr>
                </thead>
                <tbody>
                  {coins.map((coin) => (
                    <tr key={coin.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img 
                            src={coin.image} 
                            alt={coin.symbol}
                            className="avatar avatar-sm me-2"
                            style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'block';
                            }}
                          />
                          <span className="avatar avatar-sm me-2" style={{ display: 'none' }}>
                            <span className="avatar-initials bg-primary">
                              {coin.symbol.charAt(0)}
                            </span>
                          </span>
                          <div>
                            <div className="font-weight-medium">{coin.symbol}</div>
                            <div className="text-muted">{coin.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="font-weight-medium">{formatPrice(coin.price)}</td>
                      <td>
                        {coin.price_change_24h === 0 ? (
                          <span className="badge bg-secondary">---</span>
                        ) : (
                          <span className={`badge bg-${coin.price_change_24h >= 0 ? 'success' : 'danger'}`}>
                            {formatPriceChange(coin.price_change_24h)}
                          </span>
                        )}
                      </td>
                      <td>{formatVolume(coin.volume_24h)}</td>
                      <td>{formatMarketCap(coin.market_cap)}</td>
                      <td>
                        {coin.rsi_1d === 0 ? (
                          <span className="text-muted">---</span>
                        ) : (
                          <span className={`badge bg-${coin.rsi_1d > 70 ? 'danger' : coin.rsi_1d < 30 ? 'success' : 'secondary'}`}>
                            {coin.rsi_1d.toFixed(1)}
                          </span>
                        )}
                      </td>
                      <td>
                        {coin.liquidations_24h === 0 ? (
                          <span className="text-muted">---</span>
                        ) : (
                          <span className="text-muted">{formatVolume(coin.liquidations_24h)}</span>
                        )}
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
