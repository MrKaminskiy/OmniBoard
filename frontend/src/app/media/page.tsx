'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { usePolling } from '@/hooks/usePolling';

interface MediaPost {
  id: string;
  source: 'twitter' | 'telegram' | 'reddit';
  handle: string;
  text: string;
  symbols: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  timestamp: string;
  link: string;
  engagement: number;
}

interface CoinMention {
  symbol: string;
  count: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  change24h: number;
}

export default function MediaPage() {
  const [posts, setPosts] = useState<MediaPost[]>([]);
  const [topCoins, setTopCoins] = useState<CoinMention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMediaData = useCallback(async () => {
    try {
      // Пока используем заглушку
      setPosts([
        {
          id: '1',
          source: 'twitter',
          handle: '@crypto_analyst',
          text: 'Bitcoin showing strong support at $45K level. Accumulation phase continues. #BTC #crypto',
          symbols: ['BTC'],
          sentiment: 'positive',
          timestamp: '2025-01-15T10:30:00Z',
          link: 'https://twitter.com/crypto_analyst/status/123',
          engagement: 1250
        },
        {
          id: '2',
          source: 'telegram',
          handle: 'Crypto Signals Pro',
          text: 'ETH/USDT: Strong bearish momentum. Support at $3,100. Consider short position. #ETH #trading',
          symbols: ['ETH'],
          sentiment: 'negative',
          timestamp: '2025-01-15T09:15:00Z',
          link: 'https://t.me/cryptosignals',
          engagement: 890
        },
        {
          id: '3',
          source: 'reddit',
          handle: 'r/cryptocurrency',
          text: 'SOL ecosystem growing rapidly. New DeFi protocols launching daily. What\'s your favorite? #SOL #DeFi',
          symbols: ['SOL'],
          sentiment: 'positive',
          timestamp: '2025-01-15T08:45:00Z',
          link: 'https://reddit.com/r/cryptocurrency/comments/123',
          engagement: 567
        }
      ]);
      
      setTopCoins([
        { symbol: 'BTC', count: 1250, sentiment: 'positive', change24h: 5.2 },
        { symbol: 'ETH', count: 890, sentiment: 'negative', change24h: -2.1 },
        { symbol: 'SOL', count: 567, sentiment: 'positive', change24h: 8.7 },
        { symbol: 'XRP', count: 432, sentiment: 'neutral', change24h: 1.3 },
        { symbol: 'BNB', count: 398, sentiment: 'positive', change24h: 3.4 },
        { symbol: 'DOGE', count: 345, sentiment: 'negative', change24h: -1.8 },
        { symbol: 'ADA', count: 298, sentiment: 'neutral', change24h: 0.9 },
        { symbol: 'DOT', count: 267, sentiment: 'positive', change24h: 4.2 },
        { symbol: 'LINK', count: 234, sentiment: 'positive', change24h: 2.7 },
        { symbol: 'MATIC', count: 198, sentiment: 'negative', change24h: -0.5 }
      ]);
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch media data');
      console.error('Error fetching media data:', err);
    }
  }, []);

  // Polling every 5 minutes
  usePolling(fetchMediaData, 300000);

  useEffect(() => {
    fetchMediaData();
  }, [fetchMediaData]);

  const getSourceIcon = (source: string): string => {
    switch (source) {
      case 'twitter': return 'ti ti-brand-twitter';
      case 'telegram': return 'ti ti-brand-telegram';
      case 'reddit': return 'ti ti-brand-reddit';
      default: return 'ti ti-link';
    }
  };

  const getSourceColor = (source: string): string => {
    switch (source) {
      case 'twitter': return 'primary';
      case 'telegram': return 'info';
      case 'reddit': return 'warning';
      default: return 'secondary';
    }
  };

  const getSentimentColor = (sentiment: string): string => {
    switch (sentiment) {
      case 'positive': return 'success';
      case 'negative': return 'danger';
      case 'neutral': return 'secondary';
      default: return 'secondary';
    }
  };

  const getSentimentIcon = (sentiment: string): string => {
    switch (sentiment) {
      case 'positive': return 'ti ti-mood-smile';
      case 'negative': return 'ti ti-mood-sad';
      case 'neutral': return 'ti ti-mood-neutral';
      default: return 'ti ti-help';
    }
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
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
              <h2 className="page-title">Public Media</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Main Feed */}
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Latest Posts</h3>
            </div>
            <div className="card-body">
              {loading ? (
                // Skeleton loading
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="mb-4">
                    <div className="placeholder-glow">
                      <div className="placeholder col-8 mb-2"></div>
                      <div className="placeholder col-12 mb-2"></div>
                      <div className="placeholder col-6"></div>
                    </div>
                  </div>
                ))
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <div key={post.id} className="mb-4 pb-4 border-bottom">
                    <div className="d-flex align-items-start">
                      <div className="avatar avatar-sm me-3">
                        <span className={`avatar-initials bg-${getSourceColor(post.source)}`}>
                          <i className={getSourceIcon(post.source)}></i>
                        </span>
                      </div>
                      <div className="flex-fill">
                        <div className="d-flex align-items-center mb-2">
                          <div className="font-weight-medium me-2">{post.handle}</div>
                          <span className={`badge bg-${getSentimentColor(post.sentiment)}`}>
                            <i className={`${getSentimentIcon(post.sentiment)} me-1`}></i>
                            {post.sentiment}
                          </span>
                          <div className="text-muted ms-auto">
                            {formatTime(post.timestamp)}
                          </div>
                        </div>
                        <div className="mb-2">{post.text}</div>
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            {post.symbols.map((symbol) => (
                              <span key={symbol} className="badge bg-primary me-1">
                                {symbol}
                              </span>
                            ))}
                          </div>
                          <div className="d-flex align-items-center">
                            <span className="text-muted me-3">
                              <i className="ti ti-eye me-1"></i>
                              {post.engagement}
                            </span>
                            <a href={post.link} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                              <i className="ti ti-external-link me-1"></i>
                              Open
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted py-4">
                  <i className="ti ti-message-circle ti-3x mb-3"></i>
                  <p>No posts available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Top Coin Mentions</h3>
            </div>
            <div className="card-body">
              {loading ? (
                // Skeleton loading
                <div className="placeholder-glow">
                  <div className="placeholder col-12 mb-2"></div>
                  <div className="placeholder col-12 mb-2"></div>
                  <div className="placeholder col-12 mb-2"></div>
                  <div className="placeholder col-12 mb-2"></div>
                  <div className="placeholder col-12"></div>
                </div>
              ) : topCoins.length > 0 ? (
                <div className="list-group list-group-flush">
                  {topCoins.map((coin, index) => (
                    <div key={coin.symbol} className="list-group-item px-0">
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          <span className="badge bg-primary">{index + 1}</span>
                        </div>
                        <div className="flex-fill">
                          <div className="font-weight-medium">{coin.symbol}</div>
                          <div className="text-muted small">
                            {coin.count} mentions
                          </div>
                        </div>
                        <div className="text-end">
                          <div className={`badge bg-${getSentimentColor(coin.sentiment)} mb-1`}>
                            {coin.sentiment}
                          </div>
                          <div className={`small ${coin.change24h >= 0 ? 'text-success' : 'text-danger'}`}>
                            {coin.change24h >= 0 ? '+' : ''}{coin.change24h}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <i className="ti ti-trending-up ti-3x mb-3"></i>
                  <p>No coin data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

