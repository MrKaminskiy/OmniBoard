'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { usePolling } from '@/hooks/usePolling';

interface JournalSummary {
  totalPnL: number;
  winRate: number;
  avgFee: number;
  avgDuration: number;
  totalTrades: number;
}

interface Trade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  price: number;
  quantity: number;
  fee: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export default function JournalPage() {
  const [summary, setSummary] = useState<JournalSummary | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJournalData = useCallback(async () => {
    try {
      // Пока используем заглушку
      setSummary({
        totalPnL: 1250.50,
        winRate: 68.5,
        avgFee: 12.50,
        avgDuration: 45,
        totalTrades: 156
      });
      
      setTrades([
        {
          id: '1',
          symbol: 'BTC',
          side: 'buy',
          price: 45000,
          quantity: 0.1,
          fee: 15.00,
          timestamp: '2025-01-15T10:30:00Z',
          status: 'completed'
        },
        {
          id: '2',
          symbol: 'ETH',
          side: 'sell',
          price: 3200,
          quantity: 2.5,
          fee: 12.50,
          timestamp: '2025-01-15T09:15:00Z',
          status: 'completed'
        }
      ]);
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch journal data');
      console.error('Error fetching journal data:', err);
    }
  }, []);

  // Polling every 60 seconds
  usePolling(fetchJournalData, 60000);

  useEffect(() => {
    fetchJournalData();
  }, [fetchJournalData]);

  const formatNumber = (num: number): string => {
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  const getPnLColor = (pnl: number): string => {
    return pnl >= 0 ? 'text-success' : 'text-danger';
  };

  const getSideColor = (side: string): string => {
    return side === 'buy' ? 'success' : 'danger';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
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
              <h2 className="page-title">Trading Journal</h2>
            </div>
            <div className="col-auto ms-auto">
              <button className="btn btn-primary">
                <i className="ti ti-plus me-1"></i>
                Connect Exchange
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
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
        ) : summary ? (
          <>
            <div className="col-sm-6 col-lg-3">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="subheader">Total PnL</div>
                  </div>
                  <div className={`h1 mb-3 ${getPnLColor(summary.totalPnL)}`}>
                    {formatNumber(summary.totalPnL)}
                  </div>
                  <div className="text-muted">All time profit/loss</div>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="subheader">Win Rate</div>
                  </div>
                  <div className="h1 mb-3">{formatPercentage(summary.winRate)}</div>
                  <div className="text-muted">Successful trades</div>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="subheader">Avg Fee</div>
                  </div>
                  <div className="h1 mb-3">{formatNumber(summary.avgFee)}</div>
                  <div className="text-muted">Per trade</div>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="subheader">Avg Duration</div>
                  </div>
                  <div className="h1 mb-3">{summary.avgDuration}h</div>
                  <div className="text-muted">Hold time</div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Trades Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Trades</h3>
          <div className="card-actions">
            <button className="btn btn-outline-primary btn-sm">
              <i className="ti ti-download me-1"></i>
              Export CSV
            </button>
          </div>
        </div>
        <div className="card-body">
          {loading ? (
            // Skeleton loading for table
            <div className="placeholder-glow">
              <div className="placeholder col-12 mb-2"></div>
              <div className="placeholder col-12 mb-2"></div>
              <div className="placeholder col-12 mb-2"></div>
              <div className="placeholder col-12"></div>
            </div>
          ) : trades.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-vcenter">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Side</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Fee</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade) => (
                    <tr key={trade.id}>
                      <td>
                        <div className="font-weight-medium">{trade.symbol}</div>
                      </td>
                      <td>
                        <span className={`badge bg-${getSideColor(trade.side)}`}>
                          {trade.side.toUpperCase()}
                        </span>
                      </td>
                      <td>{formatNumber(trade.price)}</td>
                      <td>{trade.quantity}</td>
                      <td>{formatNumber(trade.fee)}</td>
                      <td>
                        <span className={`badge bg-${getStatusColor(trade.status)}`}>
                          {trade.status}
                        </span>
                      </td>
                      <td>
                        <div className="text-muted">
                          {new Date(trade.timestamp).toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-muted py-4">
              <i className="ti ti-chart-line ti-3x mb-3"></i>
              <p>No trades available</p>
              <button className="btn btn-primary">
                <i className="ti ti-plus me-1"></i>
                Connect Exchange
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

