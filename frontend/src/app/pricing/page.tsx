'use client';

import { useState } from 'react';

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<'30' | '90' | '365'>('30');
  const [loading, setLoading] = useState(false);

  const plans = {
    30: { price: 29, days: 30, discount: 0 },
    90: { price: 79, days: 90, discount: 9 },
    365: { price: 299, days: 365, discount: 49 }
  };

  const handlePayment = async () => {
    setLoading(true);
    // Временная заглушка для деплоя
    alert('Платежи временно недоступны. Это демо-версия.');
    setLoading(false);
  };

  return (
    <div className="container-xl">
      <div className="page-header d-print-none">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              <h2 className="page-title">💰 Тарифные планы</h2>
              <p className="text-muted">Выберите подходящий план для доступа к премиум функциям</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row row-cards">
        {Object.entries(plans).map(([key, plan]) => (
          <div key={key} className="col-md-4">
            <div className={`card ${selectedPlan === key ? 'card-selected' : ''}`}>
              <div className="card-body text-center">
                <div className="mb-3">
                  <span className="avatar avatar-xl bg-primary text-white">
                    {plan.days}д
                  </span>
                </div>
                <h3 className="card-title">
                  {plan.days} дней
                </h3>
                <div className="text-muted">
                  {plan.discount > 0 && (
                    <span className="text-decoration-line-through me-2">
                      ${plan.price + plan.discount}
                    </span>
                  )}
                  <span className="h2">${plan.price}</span>
                </div>
                <div className="mt-3">
                  <label className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="plan"
                      checked={selectedPlan === key}
                      onChange={() => setSelectedPlan(key as '30' | '90' | '365')}
                    />
                    <span className="form-check-label">
                      Выбрать план
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Что включено в премиум:</h4>
              <ul className="list-unstyled">
                <li>✅ Доступ к торговым сигналам</li>
                <li>✅ Автоматический журнал сделок</li>
                <li>✅ Агрегатор медиа</li>
                <li>✅ Real-time обновления</li>
                <li>✅ Приоритетная поддержка</li>
              </ul>
              
              <div className="mt-4">
                <button
                  className="btn btn-primary btn-lg w-100"
                  onClick={handlePayment}
                  disabled={loading}
                >
                  {loading ? 'Обработка...' : 'Оплатить криптовалютой'}
                </button>
              </div>
              
              <div className="mt-3 text-center text-muted">
                <small>Демо-версия - платежи временно недоступны</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}