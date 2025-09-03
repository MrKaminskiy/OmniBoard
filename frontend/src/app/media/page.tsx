'use client';

import { useState, useEffect } from 'react';

export default function PublicMedia() {
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
                <h2 className="page-title">Public Media</h2>
                <p className="text-muted">Загружаем медиа ленту...</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center py-12">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Загружаем медиа ленту...</p>
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
              <h2 className="page-title">💬 Public Media</h2>
              <p className="text-muted">Анализируйте настроения криптовалютного рынка через социальные сети, новости и мнения экспертов</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="row">
        {/* Main Feed */}
        <div className="col-lg-8">
          {/* Featured Post */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="avatar avatar-sm me-3">
                  <span className="avatar-initials bg-primary">CN</span>
                </div>
                <div>
                  <h4 className="font-weight-medium mb-0">Crypto News</h4>
                  <p className="text-muted mb-0">2 часа назад</p>
                </div>
              </div>
              <h3 className="card-title mb-3">
                Bitcoin достиг нового максимума: что дальше?
              </h3>
              <p className="text-muted mb-3">
                Bitcoin показал впечатляющий рост на 15% за последние 24 часа, достигнув уровня $45,000. 
                Эксперты связывают это с институциональным спросом и позитивными новостями о регуляторных решениях.
              </p>
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center text-muted">
                  <span className="me-3">📈 156 лайков</span>
                  <span className="me-3">💬 23 комментария</span>
                  <span>🔄 45 репостов</span>
                </div>
                <span className="text-primary font-weight-medium">#Bitcoin #Crypto</span>
              </div>
            </div>
          </div>

          {/* Regular Posts */}
          {[
            {
              author: "Trading Expert",
              time: "4 часа назад",
              content: "Ethereum показывает признаки разворота тренда. RSI на дневном графике указывает на перепроданность.",
              tags: ["#Ethereum", "#TechnicalAnalysis"],
              likes: 89,
              comments: 12
            },
            {
              author: "Crypto Analyst",
              time: "6 часов назад",
              content: "Анализ альткоинов: Solana и Cardano демонстрируют сильную корреляцию с Bitcoin. Внимание на уровни поддержки.",
              tags: ["#Solana", "#Cardano", "#Altcoins"],
              likes: 67,
              comments: 8
            },
            {
              author: "Market Researcher",
              time: "8 часов назад",
              content: "Институциональные инвесторы увеличивают позиции в DeFi токенах. Объем торгов вырос на 40%.",
              tags: ["#DeFi", "#Institutional"],
              likes: 134,
              comments: 31
            }
          ].map((post, index) => (
            <div key={index} className="card mb-3">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="avatar avatar-sm me-3">
                    <span className="avatar-initials bg-secondary">{post.author.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-weight-medium mb-0">{post.author}</h4>
                    <p className="text-muted mb-0">{post.time}</p>
                  </div>
                </div>
                <p className="text-muted mb-3">{post.content}</p>
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center text-muted">
                    <span className="me-3">📈 {post.likes} лайков</span>
                    <span>💬 {post.comments} комментариев</span>
                  </div>
                  <div className="d-flex align-items-center">
                    {post.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="text-primary font-weight-medium me-2">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          {/* Trending Topics */}
          <div className="card mb-4">
            <div className="card-body">
              <h3 className="card-title">🔥 Trending Topics</h3>
              <div className="list-group list-group-flush">
                {[
                  { topic: "Bitcoin ETF", mentions: "2.4K", change: "+15%" },
                  { topic: "Ethereum Merge", mentions: "1.8K", change: "+8%" },
                  { topic: "DeFi Summer", mentions: "1.2K", change: "+22%" },
                  { topic: "NFT Market", mentions: "956", change: "-5%" },
                  { topic: "Regulation", mentions: "789", change: "+12%" }
                ].map((item, index) => (
                  <div key={index} className="list-group-item d-flex align-items-center justify-content-between px-0">
                    <span className="font-weight-medium">#{item.topic}</span>
                    <div className="text-end">
                      <div className="text-sm font-weight-medium">{item.mentions}</div>
                      <div className={`text-xs ${item.change.startsWith('+') ? 'text-success' : 'text-danger'}`}>
                        {item.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sentiment Overview */}
          <div className="card mb-4">
            <div className="card-body">
              <h3 className="card-title">📊 Market Sentiment</h3>
              <div className="space-y-3">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-sm font-weight-medium">Bitcoin</span>
                    <span className="text-sm text-success font-weight-medium">75% Bullish</span>
                  </div>
                  <div className="progress">
                    <div className="progress-bar bg-success" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-sm font-weight-medium">Ethereum</span>
                    <span className="text-sm text-primary font-weight-medium">68% Bullish</span>
                  </div>
                  <div className="progress">
                    <div className="progress-bar bg-primary" style={{ width: '68%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-sm font-weight-medium">Altcoins</span>
                    <span className="text-sm text-warning font-weight-medium">52% Neutral</span>
                  </div>
                  <div className="progress">
                    <div className="progress-bar bg-warning" style={{ width: '52%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Influencers */}
          <div className="card">
            <div className="card-body">
              <h3 className="card-title">👑 Top Influencers</h3>
              <div className="list-group list-group-flush">
                {[
                  { name: "CryptoWhale", followers: "2.1M", sentiment: "Bullish" },
                  { name: "TradingGuru", followers: "1.8M", sentiment: "Neutral" },
                  { name: "DeFiExpert", followers: "1.5M", sentiment: "Bullish" },
                  { name: "NFTCollector", followers: "1.2M", sentiment: "Bearish" }
                ].map((influencer, index) => (
                  <div key={index} className="list-group-item d-flex align-items-center justify-content-between px-0">
                    <div>
                      <div className="font-weight-medium">{influencer.name}</div>
                      <div className="text-muted text-sm">{influencer.followers} followers</div>
                    </div>
                    <span className={`badge bg-${influencer.sentiment === 'Bullish' ? 'success' : influencer.sentiment === 'Bearish' ? 'danger' : 'secondary'}`}>
                      {influencer.sentiment}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="card bg-purple-lt">
        <div className="card-body text-center">
          <div className="display-1 mb-4">🚀</div>
          <h2 className="card-title">Функционал в разработке</h2>
          <p className="text-muted mb-4">
            Мы создаем мощную платформу для анализа настроений рынка с интеграцией Twitter, Reddit, 
            Telegram и других социальных сетей.
          </p>
          
          <div className="row g-3">
            <div className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">🔍 AI Анализ</h4>
                  <p className="text-muted">Машинное обучение для анализа настроений</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">📱 Real-time</h4>
                  <p className="text-muted">Мгновенные уведомления о важных событиях</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">📊 Аналитика</h4>
                  <p className="text-muted">Детальные отчеты и графики</p>
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
          <p className="text-muted mb-4">Будьте первыми, кто попробует новый Media Analytics</p>
          <div className="row g-3 justify-content-center">
            <div className="col-md-6">
              <input
                type="email"
                placeholder="Ваш email"
                className="form-control"
              />
            </div>
            <div className="col-md-auto">
              <button className="btn btn-purple">
                Подписаться
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

