'use client';

import { useState, useEffect } from 'react';

export default function TradingJournal() {
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
                <h2 className="page-title">Trading Journal</h2>
                <p className="text-muted">Загружаем дневник торговли...</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center py-12">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Загружаем дневник торговли...</p>
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
              <h2 className="page-title">📈 Trading Journal</h2>
              <p className="text-muted">Ведите детальный учет всех ваших торговых операций, анализируйте результаты и улучшайте стратегии</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="row row-cards mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card text-center">
            <div className="card-body">
              <div className="h1 text-success mb-2">+24.5%</div>
              <h3 className="subheader">Общий ROI</h3>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card text-center">
            <div className="card-body">
              <div className="h1 text-primary mb-2">156</div>
              <h3 className="subheader">Всего сделок</h3>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card text-center">
            <div className="card-body">
              <div className="h1 text-success mb-2">68%</div>
              <h3 className="subheader">Успешных сделок</h3>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card text-center">
            <div className="card-body">
              <div className="h1 text-purple mb-2">$12.4K</div>
              <h3 className="subheader">Общая прибыль</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="row row-cards mb-4">
        <div className="col-sm-6">
          <div className="card">
            <div className="card-body">
              <div className="display-4 mb-3">📝</div>
              <h3 className="card-title">Детальная запись сделок</h3>
              <ul className="list-unstyled">
                <li className="mb-2">• Дата и время входа/выхода</li>
                <li className="mb-2">• Цена входа и выхода</li>
                <li className="mb-2">• Размер позиции и риск</li>
                <li className="mb-2">• Причина входа и выхода</li>
                <li>• Эмоциональное состояние</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-sm-6">
          <div className="card">
            <div className="card-body">
              <div className="display-4 mb-3">📊</div>
              <h3 className="card-title">Аналитика и отчеты</h3>
              <ul className="list-unstyled">
                <li className="mb-2">• Графики доходности</li>
                <li className="mb-2">• Анализ по монетам</li>
                <li className="mb-2">• Статистика по времени</li>
                <li className="mb-2">• Анализ ошибок</li>
                <li>• Сравнение стратегий</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="card bg-success-lt">
        <div className="card-body text-center">
          <div className="display-1 mb-4">🚀</div>
          <h2 className="card-title">Функционал в разработке</h2>
          <p className="text-muted mb-4">
            Мы создаем мощный инструмент для профессиональных трейдеров с интеграцией бирж, 
            автоматическим импортом сделок и продвинутой аналитикой.
          </p>
          
          <div className="row g-3">
            <div className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">🔗 Интеграция бирж</h4>
                  <p className="text-muted">Binance, Coinbase, Kraken</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">📱 Мобильное приложение</h4>
                  <p className="text-muted">iOS и Android</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">🤖 Автоимпорт</h4>
                  <p className="text-muted">Автоматический импорт сделок</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Journal Entry */}
      <div className="card">
        <div className="card-body">
          <h3 className="card-title">Пример записи в дневнике</h3>
          <div className="card bg-light">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="font-weight-medium">BTC/USDT</span>
                <span className="badge bg-success">+$450</span>
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-3">
                  <span className="text-muted">Вход:</span>
                  <span className="ms-2 font-weight-medium">$42,500</span>
                </div>
                <div className="col-md-3">
                  <span className="text-muted">Выход:</span>
                  <span className="ms-2 font-weight-medium">$43,200</span>
                </div>
                <div className="col-md-3">
                  <span className="text-muted">Размер:</span>
                  <span className="ms-2 font-weight-medium">0.1 BTC</span>
                </div>
                <div className="col-md-3">
                  <span className="text-muted">Длительность:</span>
                  <span className="ms-2 font-weight-medium">2ч 15м</span>
                </div>
              </div>
              <div className="text-muted mb-2">
                <strong>Причина входа:</strong> Пробой уровня сопротивления $42,300, объем выше среднего
              </div>
              <div className="text-muted">
                <strong>Причина выхода:</strong> Достижение целевого уровня $43,200, RSI перекуплен
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="card">
        <div className="card-body text-center">
          <h3 className="card-title">Получайте уведомления о запуске</h3>
          <p className="text-muted mb-4">Будьте первыми, кто попробует новый Trading Journal</p>
          <div className="row g-3 justify-content-center">
            <div className="col-md-6">
              <input
                type="email"
                placeholder="Ваш email"
                className="form-control"
              />
            </div>
            <div className="col-md-auto">
              <button className="btn btn-success">
                Подписаться
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

