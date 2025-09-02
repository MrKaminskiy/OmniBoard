'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient, Signal } from '@/lib/api';
import { usePolling } from '@/hooks/usePolling';

export default function SignalsPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSignals = useCallback(async () => {
    try {
      const response = await apiClient.getSignals(50);
      setSignals(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch signals');
      console.error('Error fetching signals:', err);
    }
  }, []);

  // Polling every 30 seconds
  usePolling(fetchSignals, 30000);

  useEffect(() => {
    fetchSignals();
  }, [fetchSignals]);

  const getSignalColor = (signal: string): string => {
    switch (signal) {
      case 'buy': return 'success';
      case 'sell': return 'danger';
      case 'hold': return 'warning';
      default: return 'secondary';
    }
  };

  const getSignalIcon = (signal: string): string => {
    switch (signal) {
      case 'buy': return 'ti-trending-up';
      case 'sell': return 'ti-trending-down';
      case 'hold': return 'ti-minus';
      default: return 'ti-help';
    }
  };

  const formatStrength = (strength: number): string => {
    if (strength >= 80) return 'Very Strong';
    if (strength >= 60) return 'Strong';
    if (strength >= 40) return 'Moderate';
    if (strength >= 20) return 'Weak';
    return 'Very Weak';
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
              <h2 className="page-title">TradingView Signals</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Signals Grid */}
      <div className="row row-cards">
        {loading ? (
          // Skeleton loading
          Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="col-sm-6 col-lg-4 col-xl-3">
              <div className="card">
                <div className="card-body">
                  <div className="placeholder-glow">
                    <div className="placeholder col-8 mb-2"></div>
                    <div className="placeholder col-6 mb-2"></div>
                    <div className="placeholder col-4"></div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          signals.map((signal) => (
            <div key={signal.id} className="col-sm-6 col-lg-4 col-xl-3">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <span className="avatar avatar-sm me-2">
                      <span className="avatar-initials bg-primary">
                        {signal.symbol.charAt(0)}
                      </span>
                    </span>
                    <div>
                      <div className="font-weight-medium">{signal.symbol}</div>
                      <div className="text-muted">{signal.timeframe}</div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <span className={`badge bg-${getSignalColor(signal.signal)}`}>
                      <i className={`${getSignalIcon(signal.signal)} me-1`}></i>
                      {signal.signal.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <div className="text-muted">Strength</div>
                    <div className="font-weight-medium">{formatStrength(signal.strength)}</div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="text-muted">Price</div>
                    <div className="font-weight-medium">${signal.price.toFixed(2)}</div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="text-muted">Source</div>
                    <div className="font-weight-medium">{signal.source}</div>
                  </div>
                  
                  <div className="text-muted small">
                    {new Date(signal.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

