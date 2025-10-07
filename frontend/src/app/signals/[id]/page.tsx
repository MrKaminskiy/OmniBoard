'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import TradingViewWidget from '@/components/TradingViewWidget';
import type { Signal } from '@/lib/supabase';

export default function SignalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [signal, setSignal] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSignal = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🌐 Fetching signal details for ID:', params.id);
      
      const response = await fetch(`/api/signals/${params.id}`);
      const data = await response.json();
      
      console.log('📊 Signal details response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch signal details');
      }
      
      setSignal(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch signal details');
      console.error('💥 Error fetching signal details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchSignal();
    }
  }, [params.id]);

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
      case 'TP_HIT':
        return <span className="badge bg-info">TP достигнут</span>;
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
    return direction === 'LONG' ? '📈' : '📉';
  };

  if (loading) {
    return (
      <div className="container-xl">
        <div className="page-header d-print-none">
          <div className="container-xl">
            <div className="row g-2 align-items-center">
              <div className="col">
                <h2 className="page-title">Детали сигнала</h2>
                <p className="text-muted">Загружаем информацию о сигнале...</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Загружаем детали сигнала...</p>
        </div>
      </div>
    );
  }

  if (error || !signal) {
    return (
      <div className="container-xl">
        <div className="page-header d-print-none">
          <div className="container-xl">
            <div className="row g-2 align-items-center">
              <div className="col">
                <h2 className="page-title">Ошибка</h2>
              </div>
            </div>
          </div>
        </div>

        <div className="alert alert-danger" role="alert">
          <h4 className="alert-title">Ошибка загрузки сигнала</h4>
          <p>{error || 'Сигнал не найден'}</p>
          <Link href="/signals" className="btn btn-primary">
            Вернуться к списку сигналов
          </Link>
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
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link href="/signals">Сигналы</Link>
                  </li>
                  <li className="breadcrumb-item active">
                    {getDirectionIcon(signal.direction)} {signal.pair}
                  </li>
                </ol>
              </nav>
              <h2 className="page-title">
                {getDirectionIcon(signal.direction)} {signal.pair} {signal.timeframe}
              </h2>
              <p className="text-muted">
                Создан: {new Date(signal.created_at).toLocaleString('ru-RU')}
              </p>
            </div>
            <div className="col-auto">
              {getStatusBadge(signal.status)}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Основная информация */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Информация о сигнале</h3>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-6">
                  <small className="text-muted">Направление</small>
                  <div className="h4 mb-0">
                    {getDirectionIcon(signal.direction)} {signal.direction}
                  </div>
                </div>
                <div className="col-6">
                  <small className="text-muted">Таймфрейм</small>
                  <div className="h4 mb-0">{signal.timeframe || '---'}</div>
                </div>
              </div>

              <div className="mb-3">
                <small className="text-muted">Entry цена</small>
                <div className="h3 mb-0">{formatPrice(signal.entry_price)}</div>
              </div>

              {signal.dca_price && (
                <div className="mb-3">
                  <small className="text-muted">DCA цена</small>
                  <div className="h4 mb-0">{formatPrice(signal.dca_price)}</div>
                </div>
              )}

              <div className="mb-3">
                <small className="text-muted">Текущая цена</small>
                <div className="h3 mb-0 text-primary">
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

              {signal.stop_loss && (
                <div className="mb-3">
                  <small className="text-muted">Stop Loss</small>
                  <div className="h4 mb-0 text-danger">{formatPrice(signal.stop_loss)}</div>
                </div>
              )}
            </div>
          </div>

          {/* TP Levels */}
          {signal.tp_levels && signal.tp_levels.length > 0 && (
            <div className="card mt-4">
              <div className="card-header">
                <h3 className="card-title">Take Profit Levels</h3>
              </div>
              <div className="card-body">
                {signal.tp_levels.map((tp, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center mb-3 p-2 border rounded">
                    <div className="d-flex align-items-center">
                      <span className="badge bg-primary me-2">TP{tp.level}</span>
                      {tp.confidence && (
                        <span className="badge bg-info bg-opacity-25 text-info small me-2">
                          {(tp.confidence * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <div className="text-end">
                      <div className="h5 mb-0">{formatPrice(tp.price)}</div>
                      {tp.hit && tp.hit_at && (
                        <small className="text-success">
                          ✅ {new Date(tp.hit_at).toLocaleString('ru-RU')}
                        </small>
                      )}
                      {!tp.hit && (
                        <small className="text-muted">⏳ Ожидание</small>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* График */}
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">График цены</h3>
              <p className="text-muted">
                Таймфрейм: {signal.timeframe} | Пара: {signal.pair}
              </p>
            </div>
            <div className="card-body">
              <TradingViewWidget 
                symbol={signal.pair}
                timeframe={signal.timeframe || '1h'}
                height={500}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Raw Message */}
      {signal.raw_data?.raw_text && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Оригинальное сообщение</h3>
              </div>
              <div className="card-body">
                <pre className="bg-light p-3 rounded" style={{ whiteSpace: 'pre-wrap' }}>
                  {signal.raw_data.raw_text}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
