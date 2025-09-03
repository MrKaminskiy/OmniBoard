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
      console.log('Dominance values:', {
        btc: response.data?.btc_dominance,
        eth: response.data?.eth_dominance,
        usdt: response.data?.usdt_dominance
      });
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
          {[...Array(8)].map((_, i) => (
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

  const formatDominance = (dominance: string): string => {
  if (!dominance || dominance === '---') return '---';
  const num = parseFloat(dominance);
  if (isNaN(num)) return '---';
  return `${num.toFixed(1)}%`;
};

  const getFearGreedColor = (value: string): string => {
    if (!value || value === '---') return 'secondary';
    const num = parseFloat(value);
    if (num >= 75) return 'success'; // Extreme Greed
    if (num >= 60) return 'info'; // Greed
    if (num >= 40) return 'warning'; // Neutral
    if (num >= 25) return 'danger'; // Fear
    return 'dark'; // Extreme Fear
  };

  const getFearGreedLabel = (value: string): string => {
    if (!value || value === '---') return '---';
    const num = parseFloat(value);
    if (num >= 75) return 'Extreme Greed';
    if (num >= 60) return 'Greed';
    if (num >= 40) return 'Neutral';
    if (num >= 25) return 'Fear';
    return 'Extreme Fear';
  };

  const getAltseasonColor = (value: string): string => {
    if (!value || value === '---') return 'secondary';
    const num = parseFloat(value);
    if (num >= 75) return 'success'; // Strong Altseason
    if (num >= 50) return 'info'; // Altseason
    return 'warning'; // Bitcoin Season
  };

  const getDataSourceBadgeClass = (source: string): string => {
    switch (source) {
      case 'binance_futures':
        return 'badge-outline text-success';
      case 'mock_data':
        return 'badge-outline text-warning';
      case 'error':
        return 'badge-outline text-danger';
      case 'fallback':
        return 'badge-outline text-secondary';
      default:
        return 'badge-outline text-info';
    }
  };

  const getDataSourceLabel = (source: string): string => {
    switch (source) {
      case 'binance_futures':
        return 'Binance';
      case 'mock_data':
        return 'Mock';
      case 'error':
        return 'Error';
      case 'fallback':
        return 'Fallback';
      default:
        return 'Unknown';
    }
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
                <div className="subheader">
                  <i className="ti ti-chart-line me-2"></i>
                  Market Cap
                </div>
              </div>
              <div className="h1 mb-2">{formatMarketCap(marketData?.market_cap || 0)}</div>
              <div className="d-flex align-items-center mb-2">
                <span className={`badge ${marketData?.market_cap_change_24h && marketData.market_cap_change_24h !== 0 ? (marketData.market_cap_change_24h > 0 ? 'bg-success' : 'bg-danger') : 'bg-secondary'} me-2`}>
                  {marketData?.market_cap_change_24h && marketData.market_cap_change_24h !== 0 ? `${marketData.market_cap_change_24h > 0 ? '+' : ''}${marketData.market_cap_change_24h.toFixed(2)}%` : '---'}
                </span>
                <span className="text-muted small">24h</span>
              </div>
              <div className="text-muted">Общая капитализация рынка</div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="subheader">
                  <i className="ti ti-activity me-2"></i>
                  24h Volume
                </div>
              </div>
              <div className="h1 mb-2">{formatVolume(marketData?.volume_24h || 0)}</div>
              <div className="d-flex align-items-center mb-2">
                <span className={`badge ${marketData?.volume_change_24h && marketData.volume_change_24h !== 0 ? (marketData.volume_change_24h > 0 ? 'bg-success' : 'bg-danger') : 'bg-secondary'} me-2`}>
                  {marketData?.volume_change_24h && marketData.volume_change_24h !== 0 ? `${marketData.volume_change_24h > 0 ? '+' : ''}${marketData.volume_change_24h.toFixed(2)}%` : '---'}
                </span>
                <span className="text-muted small">24h</span>
              </div>
              <div className="text-muted">Объем торгов за 24 часа</div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="subheader">
                  <i className="ti ti-mood-smile me-2"></i>
                  Fear & Greed
                </div>
              </div>
              <div className="h1 mb-2">{marketData?.fear_greed || '---'}</div>
              <div className="text-muted mb-2">{getFearGreedLabel(marketData?.fear_greed || '')}</div>
              <div className="progress mb-2" style={{ height: '8px' }}>
                <div 
                  className={`progress-bar bg-${getFearGreedColor(marketData?.fear_greed || '')}`}
                  style={{ 
                    width: `${marketData?.fear_greed && marketData.fear_greed !== '---' ? parseFloat(marketData.fear_greed) : 0}%` 
                  }}
                ></div>
              </div>
              <div className="d-flex justify-content-between small text-muted">
                <span>Fear</span>
                <span>Greed</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="subheader">
                  <i className="ti ti-moon me-2"></i>
                  Altseason
                </div>
              </div>
              <div className="h1 mb-2">{marketData?.altseason || '---'}</div>
              <div className="text-muted mb-2">Индекс альткоин сезона</div>
              <div className="progress mb-2" style={{ height: '8px' }}>
                <div 
                  className={`progress-bar bg-${getAltseasonColor(marketData?.altseason || '')}`}
                  style={{ 
                    width: `${marketData?.altseason && marketData.altseason !== '---' ? parseFloat(marketData.altseason) : 0}%` 
                  }}
                ></div>
              </div>
              <div className="d-flex justify-content-between small text-muted">
                <span>Bitcoin</span>
                <span>Altcoin</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="subheader">
                  <i className="ti ti-chart-pie me-2"></i>
                  Market Dominance
                </div>
              </div>
              
              {/* Bitcoin Dominance */}
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center">
                  <div className="avatar avatar-sm me-3" style={{ backgroundColor: '#f7931a' }}>
                    <i className="ti ti-bitcoin text-white" style={{ fontSize: '16px' }}></i>
                  </div>
                  <div>
                    <div className="text-muted small">Bitcoin</div>
                    <div className="h3 mb-0">{formatDominance(marketData?.btc_dominance || '')}</div>
                    <div className="d-flex align-items-center">
                      <span className={`badge ${marketData?.btc_dominance_change_24h && marketData.btc_dominance_change_24h !== 0 ? (marketData.btc_dominance_change_24h > 0 ? 'bg-success' : 'bg-danger') : 'bg-secondary'} me-2`} style={{ fontSize: '10px' }}>
                        {marketData?.btc_dominance_change_24h && marketData.btc_dominance_change_24h !== 0 ? `${marketData.btc_dominance_change_24h > 0 ? '+' : ''}${marketData.btc_dominance_change_24h.toFixed(1)}%` : '---'}
                      </span>
                      <span className="text-muted small" style={{ fontSize: '10px' }}>24h</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ethereum Dominance */}
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center">
                  <div className="avatar avatar-sm me-3" style={{ backgroundColor: '#627eea' }}>
                    <i className="ti ti-currency-ethereum text-white" style={{ fontSize: '16px' }}></i>
                  </div>
                  <div>
                    <div className="text-muted small">Ethereum</div>
                    <div className="h3 mb-0">{formatDominance(marketData?.eth_dominance || '')}</div>
                    <div className="d-flex align-items-center">
                      <span className={`badge ${marketData?.eth_dominance_change_24h && marketData.eth_dominance_change_24h !== 0 ? (marketData.eth_dominance_change_24h > 0 ? 'bg-success' : 'bg-danger') : 'bg-secondary'} me-2`} style={{ fontSize: '10px' }}>
                        {marketData?.eth_dominance_change_24h && marketData.eth_dominance_change_24h !== 0 ? `${marketData.eth_dominance_change_24h > 0 ? '+' : ''}${marketData.eth_dominance_change_24h.toFixed(1)}%` : '---'}
                      </span>
                      <span className="text-muted small" style={{ fontSize: '10px' }}>24h</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* USDT Dominance */}
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center">
                  <div className="avatar avatar-sm me-3" style={{ backgroundColor: '#26a17b' }}>
                    <i className="ti ti-currency-dollar text-white" style={{ fontSize: '16px' }}></i>
                  </div>
                  <div>
                    <div className="text-muted small">USDT</div>
                    <div className="h3 mb-0">{formatDominance(marketData?.usdt_dominance || '')}</div>
                  </div>
                </div>
              </div>

              <div className="text-muted small">Рыночное доминирование</div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div className="subheader">
                  <i className="ti ti-trash me-2"></i>
                  24h Liquidations
                </div>
                {marketData?.liquidations_data_source && (
                  <span className={`badge ${getDataSourceBadgeClass(marketData.liquidations_data_source)}`}>
                    {getDataSourceLabel(marketData.liquidations_data_source)}
                  </span>
                )}
              </div>
              <div className="h1 mb-3">{marketData?.total_liquidations_24h || '---'}</div>
              <div className="text-muted">Общие ликвидации за 24ч</div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div className="subheader">
                  <i className="ti ti-scale me-2"></i>
                  Long/Short Ratio
                </div>
                {marketData?.long_short_data_source && (
                  <span className={`badge ${getDataSourceBadgeClass(marketData.long_short_data_source)}`}>
                    {getDataSourceLabel(marketData.long_short_data_source)}
                  </span>
                )}
              </div>
              <div className="h1 mb-3">{marketData?.long_short_ratio || '---'}</div>
              <div className="text-muted">Соотношение лонг/шорт</div>
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
                          <span className="badge badge-outline text-secondary">---</span>
                        ) : (
                          <span className={`badge badge-outline ${coin.price_change_24h >= 0 ? 'text-success' : 'text-danger'}`}>
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
                          <span className={`badge badge-outline ${coin.rsi_1d > 70 ? 'text-danger' : coin.rsi_1d < 30 ? 'text-success' : 'text-secondary'}`}>
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

