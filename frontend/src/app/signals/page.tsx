'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Signal } from '@/lib/supabase';

export default function Signals() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSignals, setTotalSignals] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState({
    pair: '',
    status: '',
    direction: '',
    timeframe: '', // Показывать все таймфреймы по умолчанию
  });

  const fetchSignals = async (page: number = 1, reset: boolean = true) => {
    try {
      console.log('🚀 Frontend: Starting to fetch signals, page:', page);
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters.pair) params.set('pair', filters.pair);
      if (filters.status) params.set('status', filters.status);
      if (filters.direction) params.set('direction', filters.direction);
      if (filters.timeframe) params.set('timeframe', filters.timeframe);
      params.set('limit', '50');
      params.set('offset', ((page - 1) * 50).toString());
      
      const url = `/api/signals?${params.toString()}`;
      console.log('🌐 Frontend: Making request to:', url);
      
      const response = await fetch(url);
      console.log('📡 Frontend: Response status:', response.status);
      console.log('📡 Frontend: Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('📊 Frontend: Response data:', {
        hasData: !!data.data,
        dataLength: data.data?.length || 0,
        success: data.success,
        error: data.error,
        firstSignal: data.data?.[0] ? {
          id: data.data[0].id,
          pair: data.data[0].pair,
          direction: data.data[0].direction
        } : null
      });
      
      if (!response.ok) {
        console.error('❌ Frontend: Request failed:', response.status, data);
        throw new Error(data.error || 'Failed to fetch signals');
      }
      
      console.log('✅ Frontend: Setting signals:', data.data?.length || 0);
      
      if (reset || page === 1) {
        setSignals(data.data || []);
      } else {
        setSignals(prev => [...prev, ...(data.data || [])]);
      }
      
      setTotalSignals(data.count || 0);
      setHasMore(data.pagination?.hasMore || false);
      setCurrentPage(page);
    } catch (err) {
      console.error('💥 Frontend: Error fetching signals:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch signals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchSignals(1, true);
  }, [filters]);

  const loadMoreSignals = () => {
    if (hasMore && !loading) {
      fetchSignals(currentPage + 1, false);
    }
  };

  const refreshSignals = () => {
    setCurrentPage(1);
    fetchSignals(1, true);
  };

  const formatPrice = (price: number | null | undefined): string => {
    if (!price) return '---';
    if (price >= 1) return `$${price.toFixed(2)}`;
    if (price >= 0.01) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(6)}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="badge bg-success">Активен</span>;
      case 'SL_HIT':
        return <span className="badge bg-danger">SL достигнут</span>;
      case 'CLOSED':
        return <span className="badge bg-secondary">Закрыт</span>;
      case 'CANCELLED':
        return <span className="badge bg-warning text-dark">Отменен</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const getDirectionIcon = (direction: string) => {
    return direction === 'LONG' ? '↗️' : '↘️';
  };

  if (loading) {
    return (
      <div className="container-xl">
        <div className="page-header d-print-none">
          <div className="container-xl">
            <div className="row g-2 align-items-center">
              <div className="col">
                <h2 className="page-title">Trading Signals</h2>
                <p className="text-muted">Загружаем торговые сигналы...</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center py-12">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Загружаем торговые сигналы...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-xl">
        <div className="page-header d-print-none">
          <div className="container-xl">
            <div className="row g-2 align-items-center">
              <div className="col">
                <h2 className="page-title">Trading Signals</h2>
              </div>
            </div>
          </div>
        </div>
        
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-title">Ошибка загрузки сигналов</h4>
          <p>{error}</p>
          <button onClick={fetchSignals} className="btn btn-primary">
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
              <h2 className="page-title">📡 Trading Signals</h2>
              <p className="text-muted">Актуальные торговые сигналы из Telegram каналов</p>
            </div>
            <div className="col-auto">
              <button 
                onClick={refreshSignals} 
                className="btn btn-outline-primary"
                disabled={loading}
              >
                <i className="ti ti-refresh me-1"></i>
                Обновить
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Торговая пара</label>
              <input
                type="text"
                className="form-control"
                placeholder="BTC, ETH, ADA..."
                value={filters.pair}
                onChange={(e) => setFilters(prev => ({ ...prev, pair: e.target.value }))}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Статус</label>
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">Все</option>
                <option value="ACTIVE">Активные</option>
                <option value="CLOSED">Закрытые</option>
                <option value="CANCELLED">Отмененные</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Направление</label>
              <select
                className="form-select"
                value={filters.direction}
                onChange={(e) => setFilters(prev => ({ ...prev, direction: e.target.value }))}
              >
                <option value="">Все</option>
                <option value="LONG">LONG</option>
                <option value="SHORT">SHORT</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Таймфрейм</label>
              <select
                className="form-select"
                value={filters.timeframe}
                onChange={(e) => setFilters(prev => ({ ...prev, timeframe: e.target.value }))}
              >
                <option value="">Все</option>
                <option value="5m">5m</option>
                <option value="15m">15m</option>
                <option value="30m">30m</option>
                <option value="1h">1h</option>
                <option value="4h">4h</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Signals List */}
      {signals.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <div className="display-1 mb-4">📊</div>
            <h3 className="card-title">Нет сигналов</h3>
            <p className="text-muted">
              {Object.values(filters).some(f => f) 
                ? 'По выбранным фильтрам сигналы не найдены'
                : 'Пока нет доступных торговых сигналов'
              }
            </p>
            {Object.values(filters).some(f => f) && (
              <button 
                onClick={() => setFilters({ pair: '', status: '', direction: '', timeframe: '' })}
                className="btn btn-primary"
              >
                Сбросить фильтры
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="row row-cards">
          {signals.map((signal) => (
            <div key={signal.id} className="col-md-6 col-lg-4">
              <div className="card" style={{
                borderLeft: `1px solid ${signal.direction === 'LONG' ? '#28a745' : '#dc3545'}`,
                borderLeftWidth: '2px'
              }}>
                <div className="card-header bg-transparent">
                  <div className="d-flex justify-content-between align-items-center">
                    <h3 className="card-title mb-0">
                      <span className="fw-bold me-2">{signal.pair}</span>
                      <span className={`badge ${signal.direction === 'LONG' ? 'bg-success-lt' : 'bg-danger-lt'}`}>
                        {signal.direction}
                      </span>
                    </h3>
                    <div className="text-muted small position-absolute" style={{top: '1rem', right: '1rem'}}>
                      {signal.timeframe || '---'}
                    </div>
                  </div>
                </div>
                
                        <div className="card-body">
                          <div className="row">
                            <div className="col-4">
                              <div className="mb-2">
                                <small className="text-muted">Entry</small>
                                <div className="h4 mb-0">{formatPrice(signal.entry_price)}</div>
                              </div>
                            </div>
                            <div className="col-4">
                              <div className="mb-2">
                                <small className="text-muted">DCA</small>
                                <div className="h5 mb-0">{formatPrice(signal.dca_price)}</div>
                              </div>
                            </div>
                            <div className="col-4">
                              <div className="mb-2">
                                <small className="text-muted">Текущая цена</small>
                                <div className="h4 mb-0 text-primary">
                                  {signal.current_price ? formatPrice(signal.current_price) : '---'}
                                </div>
                                {signal.price_change_percent && (
                                  <div className={`small ${
                                    signal.price_change_percent.startsWith('+') 
                                      ? 'text-success' 
                                      : 'text-danger'
                                  }`}>
                                    {signal.price_change_percent}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {signal.stop_loss && (
                            <div className="mb-2">
                              <small className="text-muted">Stop Loss</small>
                              <div className="h5 mb-0 text-danger">{formatPrice(signal.stop_loss)}</div>
                            </div>
                          )}

                          {signal.tp_levels && signal.tp_levels.length > 0 && (
                            <div className="mb-3">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <small className="text-muted">Take Profit Levels</small>
                                <div className="progress progress-sm" style={{width: '60px'}}>
                                  <div 
                                    className={`progress-bar ${signal.direction === 'LONG' ? 'bg-success' : 'bg-danger'}`}
                                    style={{
                                      width: `${(signal.tp_levels.filter(tp => tp.hit).length / signal.tp_levels.length) * 100}%`
                                    }}
                                  ></div>
                                </div>
                              </div>
                              <div className="row g-1">
                                {signal.tp_levels.map((tp, index) => (
                                  <div key={index} className="col-6">
                                    <div className={`p-2 rounded ${tp.hit ? 'bg-success-lt' : 'bg-muted-lt'}`}>
                                      <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                          <div className="fw-bold small">TP{tp.level}</div>
                                          <div className={`small ${tp.hit ? 'text-success' : 'text-muted'}`}>
                                            {formatPrice(tp.price)}
                                          </div>
                                        </div>
                                        <div>
                                          {tp.hit ? (
                                            <i className="ti ti-check text-success"></i>
                                          ) : (
                                            <span className="badge bg-outline-secondary small">
                                              {(tp.confidence * 100).toFixed(0)}%
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>
                        
                        <div className="card-footer bg-transparent">
                          <div className="row align-items-center">
                            <div className="col">
                              <small className="text-muted">
                                {new Date(signal.created_at).toLocaleString('ru-RU')}
                              </small>
                            </div>
                            <div className="col-auto d-flex align-items-center gap-2">
                              <span className="badge bg-outline-secondary small">
                                {getStatusBadge(signal.status)}
                              </span>
                              <Link
                                href={`/signals/${signal.id}`}
                                className="btn btn-sm btn-outline-primary"
                              >
                                Детали
                              </Link>
                            </div>
                          </div>
                        </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        {hasMore && (
          <div className="text-center mt-4">
            <button 
              onClick={loadMoreSignals}
              className="btn btn-outline-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Загрузка...
                </>
              ) : (
                <>
                  <i className="ti ti-plus me-1"></i>
                  Загрузить еще
                </>
              )}
            </button>
          </div>
        )}
        
        {/* Signals count info */}
        {signals.length > 0 && (
          <div className="text-center mt-3">
            <small className="text-muted">
              Показано {signals.length} из {totalSignals} сигналов
            </small>
          </div>
        )}
      )}
    </div>
  );
}

