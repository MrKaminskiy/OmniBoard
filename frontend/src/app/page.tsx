'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient, type MarketOverview, type Ticker } from '@/lib/api';
import { usePolling } from '@/hooks/usePolling';

export default function MarketOverview() {
  const [marketData, setMarketData] = useState<MarketOverview | null>(null);
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = useCallback(async () => {
    try {
      const response = await apiClient.getMarketOverview();
      setMarketData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch market data');
      console.error('Error fetching market data:', err);
    }
  }, []);

  const fetchTickers = useCallback(async () => {
    try {
      // Пока используем заглушку для тикеров
      setTickers([]);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tickers');
      console.error('Error fetching tickers:', err);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchMarketData(), fetchTickers()]);
    setLoading(false);
  }, [fetchMarketData, fetchTickers]);

  // Polling every 30 seconds
  usePolling(fetchData, 30000);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatNumber = (num: number): string => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatPercentage = (num: number): string => {
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(2)}%`;
  };

  if (error) {
    return (
      <div className="container-xl">
        <div className="alert alert-danger" role="alert">
          {error}
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
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="row row-cards mb-4">
        {loading ? (
          // Skeleton loading
          Array.from({ length: 4 }).map((_, i) => (
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
          ))
        ) : marketData ? (
          <>
            <div className="col-sm-6 col-lg-3">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="subheader">Market Cap</div>
                  </div>
                  <div className="h1 mb-3">{marketData.market_cap_formatted}</div>
                  <div className={`d-flex align-items-center ${marketData.market_cap_change_24h >= 0 ? 'text-success' : 'text-danger'}`}>
                    <i className={`ti ti-trending-${marketData.market_cap_change_24h >= 0 ? 'up' : 'down'} me-1`}></i>
                    {formatPercentage(marketData.market_cap_change_24h)}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="subheader">24h Volume</div>
                  </div>
                  <div className="h1 mb-3">{marketData.volume_formatted}</div>
                  <div className={`d-flex align-items-center ${marketData.volume_change_24h >= 0 ? 'text-success' : 'text-danger'}`}>
                    <i className={`ti ti-trending-${marketData.volume_change_24h >= 0 ? 'up' : 'down'} me-1`}></i>
                    {formatPercentage(marketData.volume_change_24h)}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="subheader">Fear & Greed Index</div>
                  </div>
                  <div className="h1 mb-3">75/100</div>
                  <div className="text-muted">
                    <span className="text-success">Greed</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="subheader">Altseason Index</div>
                  </div>
                  <div className="h1 mb-3">65/100</div>
                  <div className="text-muted">
                    <span className="text-success">Alt Season</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Tickers Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Top Coins</h3>
        </div>
        <div className="card-body">
          {loading ? (
            // Skeleton loading for table
            <div className="placeholder-glow">
              <div className="placeholder col-12 mb-2"></div>
              <div className="placeholder col-12 mb-2"></div>
              <div className="placeholder col-12 mb-2"></div>
              <div className="placeholder col-12 mb-2"></div>
              <div className="placeholder col-12"></div>
            </div>
          ) : tickers.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-vcenter">
                <thead>
                  <tr>
                    <th>Coin</th>
                    <th>Price</th>
                    <th>24h Change</th>
                    <th>Volume (24h)</th>
                    <th>Market Cap</th>
                    <th>Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {tickers.map((ticker) => (
                    <tr key={ticker.symbol}>
                      <td>
                        <div className="d-flex align-items-center">
                          <span className="avatar avatar-sm me-2">
                            <span className="avatar-initials bg-primary">
                              {ticker.symbol.charAt(0)}
                            </span>
                          </span>
                          <div>
                            <div className="font-weight-medium">{ticker.symbol}</div>
                            <div className="text-muted">{ticker.name}</div>
                          </div>
                        </div>
                      </td>
                      <td>{formatNumber(ticker.price)}</td>
                      <td>
                        <span className={`badge bg-${ticker.priceChangePercent24h >= 0 ? 'success' : 'danger'}`}>
                          {formatPercentage(ticker.priceChangePercent24h)}
                        </span>
                      </td>
                      <td>{formatNumber(ticker.volume24h)}</td>
                      <td>{formatNumber(ticker.marketCap)}</td>
                      <td>#{ticker.marketCapRank}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-muted py-4">
              <i className="ti ti-coins ti-3x mb-3"></i>
              <p>No ticker data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
