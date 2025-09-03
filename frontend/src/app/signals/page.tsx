'use client';

import { useState, useEffect } from 'react';

export default function Signals() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Имитация загрузки
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

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

  return (
    <div className="container-xl">
      {/* Header */}
      <div className="page-header d-print-none">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              <h2 className="page-title">📡 Trading Signals</h2>
              <p className="text-muted">Получайте актуальные торговые сигналы от профессиональных трейдеров и алгоритмических систем</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="row row-cards mb-4">
        <div className="col-sm-6 col-lg-4">
          <div className="card text-center">
            <div className="card-body">
              <div className="display-4 mb-3">🎯</div>
              <h3 className="card-title">Точные сигналы</h3>
              <p className="text-muted">
                Сигналы основаны на техническом анализе, фундаментальных данных и машинном обучении
              </p>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-4">
          <div className="card text-center">
            <div className="card-body">
              <div className="display-4 mb-3">⚡</div>
              <h3 className="card-title">Real-time обновления</h3>
              <p className="text-muted">
                Получайте сигналы в реальном времени с push-уведомлениями
              </p>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-4">
          <div className="card text-center">
            <div className="card-body">
              <div className="display-4 mb-3">📊</div>
              <h3 className="card-title">Детальная аналитика</h3>
              <p className="text-muted">
                Каждый сигнал сопровождается подробным анализом и рекомендациями
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="card bg-primary-lt">
        <div className="card-body text-center">
          <div className="display-1 mb-4">🚀</div>
          <h2 className="card-title">Функционал в разработке</h2>
          <p className="text-muted mb-4">
            Мы работаем над интеграцией с TradingView, Binance, Coinbase и другими платформами для предоставления 
            вам самых актуальных и точных торговых сигналов.
          </p>
          
          <div className="row g-3">
            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">🔔 Уведомления</h4>
                  <p className="text-muted">Telegram, Email, Push</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">📈 Фильтры</h4>
                  <p className="text-muted">По монетам, времени, силе сигнала</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">📊 Статистика</h4>
                  <p className="text-muted">Успешность, ROI, история</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">🤖 Автотрейдинг</h4>
                  <p className="text-muted">Автоматическое исполнение сигналов</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="card">
        <div className="card-body text-center">
          <h3 className="card-title">Получайте уведомления о запуске</h3>
          <p className="text-muted mb-4">Будьте первыми, кто узнает о запуске торговых сигналов</p>
          <div className="row g-3 justify-content-center">
            <div className="col-md-6">
              <input
                type="email"
                placeholder="Ваш email"
                className="form-control"
              />
            </div>
            <div className="col-md-auto">
              <button className="btn btn-primary">
                Подписаться
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

