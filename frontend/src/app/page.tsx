'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="container-xl">
        <div className="text-center py-12">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Загружаем OmniBoard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-xl">
      {/* Hero Section */}
      <div className="page-header d-print-none">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              <h2 className="page-title">
                🚀 OmniBoard
              </h2>
              <p className="text-muted">
                Комплексный дашборд для криптотрейдеров
              </p>
            </div>
            <div className="col-auto">
              {user ? (
                <div className="d-flex align-items-center gap-3">
                  <span className="text-muted">Добро пожаловать, {user.email}</span>
                  <a href="/signals" className="btn btn-primary">
                    📡 Перейти к сигналам
                  </a>
                </div>
              ) : (
                <div className="d-flex gap-2">
                  <a href="/auth/login" className="btn btn-outline-primary">
                    Войти
                  </a>
                  <a href="/auth/signup" className="btn btn-primary">
                    Регистрация
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="row row-cards">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <div className="mb-3">
                <span className="avatar avatar-xl bg-primary text-white">
                  📊
                </span>
              </div>
              <h3 className="card-title">Market Overview</h3>
              <div className="text-muted">
                Анализ рынка криптовалют в реальном времени
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <div className="mb-3">
                <span className="avatar avatar-xl bg-success text-white">
                  📡
                </span>
              </div>
              <h3 className="card-title">Trading Signals</h3>
              <div className="text-muted">
                Сигналы из Telegram каналов и TradingView
              </div>
              {!user && (
                <div className="mt-3">
                  <span className="badge bg-warning text-dark">Требуется регистрация</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <div className="mb-3">
                <span className="avatar avatar-xl bg-info text-white">
                  📈
                </span>
              </div>
              <h3 className="card-title">Trading Journal</h3>
              <div className="text-muted">
                Автоматический журнал сделок с бирж
              </div>
              {!user && (
                <div className="mt-3">
                  <span className="badge bg-warning text-dark">Требуется регистрация</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Demo Section */}
      <div className="row mt-6">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h3 className="card-title">🎯 Демо-версия OmniBoard</h3>
              <p className="text-muted">
                Это демонстрационная версия криптотрейдинг дашборда. 
                Для доступа к полному функционалу необходимо зарегистрироваться.
              </p>
              
              <div className="row">
                <div className="col-md-6">
                  <h4>✅ Доступно сейчас:</h4>
                  <ul className="list-unstyled">
                    <li>📊 Market Overview (публично)</li>
                    <li>🔐 Регистрация и авторизация</li>
                    <li>📡 Просмотр торговых сигналов</li>
                    <li>💰 Тарифные планы</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h4>🚧 В разработке:</h4>
                  <ul className="list-unstyled">
                    <li>📈 Trading Journal</li>
                    <li>💬 Media Aggregator</li>
                    <li>📊 Детальная аналитика</li>
                    <li>🔄 Real-time обновления</li>
                  </ul>
                </div>
              </div>

              {!user && (
                <div className="mt-4">
                  <a href="/auth/signup" className="btn btn-primary btn-lg">
                    🚀 Начать бесплатно
                  </a>
                  <a href="/pricing" className="btn btn-outline-primary btn-lg ms-2">
                    💰 Посмотреть тарифы
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="row mt-6">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h3 className="card-title">🛠️ Технологический стек</h3>
              <div className="row">
                <div className="col-md-3">
                  <h5>Frontend</h5>
                  <ul className="list-unstyled text-muted">
                    <li>• Next.js 15</li>
                    <li>• Tabler UI</li>
                    <li>• TypeScript</li>
                    <li>• Tailwind CSS</li>
                  </ul>
                </div>
                <div className="col-md-3">
                  <h5>Backend</h5>
                  <ul className="list-unstyled text-muted">
                    <li>• Supabase</li>
                    <li>• PostgreSQL</li>
                    <li>• Python Flask</li>
                    <li>• Railway</li>
                  </ul>
                </div>
                <div className="col-md-3">
                  <h5>APIs</h5>
                  <ul className="list-unstyled text-muted">
                    <li>• Binance API</li>
                    <li>• CoinGecko API</li>
                    <li>• Telegram API</li>
                    <li>• TradingView</li>
                  </ul>
                </div>
                <div className="col-md-3">
                  <h5>Deployment</h5>
                  <ul className="list-unstyled text-muted">
                    <li>• Vercel (Frontend)</li>
                    <li>• Railway (Backend)</li>
                    <li>• Supabase (Database)</li>
                    <li>• GitHub Actions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}