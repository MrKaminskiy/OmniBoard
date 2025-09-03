'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function PublicMedia() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Имитация загрузки
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingSpinner text="Загружаем медиа ленту..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">💬 Public Media</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Анализируйте настроения криптовалютного рынка через социальные сети, новости и мнения экспертов
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Featured Post */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">CN</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Crypto News</h4>
                <p className="text-sm text-gray-500">2 часа назад</p>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Bitcoin достиг нового максимума: что дальше?
            </h3>
            <p className="text-gray-600 mb-4">
              Bitcoin показал впечатляющий рост на 15% за последние 24 часа, достигнув уровня $45,000. 
              Эксперты связывают это с институциональным спросом и позитивными новостями о регуляторных решениях.
            </p>
            <div className="flex items-center justify-between">
              <div className="flex space-x-4 text-sm text-gray-500">
                <span>📈 156 лайков</span>
                <span>💬 23 комментария</span>
                <span>🔄 45 репостов</span>
              </div>
              <span className="text-blue-600 font-medium">#Bitcoin #Crypto</span>
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
            <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-semibold">{post.author.charAt(0)}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{post.author}</h4>
                  <p className="text-sm text-gray-500">{post.time}</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{post.content}</p>
              <div className="flex items-center justify-between">
                <div className="flex space-x-4 text-sm text-gray-500">
                  <span>📈 {post.likes} лайков</span>
                  <span>💬 {post.comments} комментариев</span>
                </div>
                <div className="flex space-x-2">
                  {post.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="text-blue-600 font-medium">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trending Topics */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔥 Trending Topics</h3>
            <div className="space-y-3">
              {[
                { topic: "Bitcoin ETF", mentions: "2.4K", change: "+15%" },
                { topic: "Ethereum Merge", mentions: "1.8K", change: "+8%" },
                { topic: "DeFi Summer", mentions: "1.2K", change: "+22%" },
                { topic: "NFT Market", mentions: "956", change: "-5%" },
                { topic: "Regulation", mentions: "789", change: "+12%" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">#{item.topic}</span>
                  <div className="text-right">
                    <div className="text-sm font-medium">{item.mentions}</div>
                    <div className={`text-xs ${item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {item.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sentiment Overview */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Market Sentiment</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Bitcoin</span>
                  <span className="text-sm text-green-600 font-semibold">75% Bullish</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Ethereum</span>
                  <span className="text-sm text-blue-600 font-semibold">68% Bullish</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Altcoins</span>
                  <span className="text-sm text-yellow-600 font-semibold">52% Neutral</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '52%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Influencers */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">👑 Top Influencers</h3>
            <div className="space-y-3">
              {[
                { name: "CryptoWhale", followers: "2.1M", sentiment: "Bullish" },
                { name: "TradingGuru", followers: "1.8M", sentiment: "Neutral" },
                { name: "DeFiExpert", followers: "1.5M", sentiment: "Bullish" },
                { name: "NFTCollector", followers: "1.2M", sentiment: "Bearish" }
              ].map((influencer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{influencer.name}</div>
                    <div className="text-sm text-gray-500">{influencer.followers} followers</div>
                  </div>
                  <span className={`text-sm font-medium px-2 py-1 rounded ${
                    influencer.sentiment === 'Bullish' ? 'bg-green-100 text-green-800' :
                    influencer.sentiment === 'Bearish' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {influencer.sentiment}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">🚀</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Функционал в разработке</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Мы создаем мощную платформу для анализа настроений рынка с интеграцией Twitter, Reddit, 
          Telegram и других социальных сетей.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-2">🔍 AI Анализ</h4>
            <p className="text-sm text-gray-600">Машинное обучение для анализа настроений</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-2">📱 Real-time</h4>
            <p className="text-sm text-gray-600">Мгновенные уведомления о важных событиях</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-2">📊 Аналитика</h4>
            <p className="text-sm text-gray-600">Детальные отчеты и графики</p>
          </div>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Получайте уведомления о запуске</h3>
        <p className="text-gray-600 mb-4">Будьте первыми, кто попробует новый Media Analytics</p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Ваш email"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors">
            Подписаться
          </button>
        </div>
      </div>
    </div>
  );
}

