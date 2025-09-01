# 💻 Frontend Integration Examples

## 🚀 React Hooks для API

### 1. Основной Hook для API данных

```javascript
import { useState, useEffect, useCallback } from 'react';

const useApiData = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(endpoint, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          ...options.headers
        },
        ...options
      });
      
      // Проверяем rate limiting
      const remaining = response.headers.get('RateLimit-Remaining');
      if (remaining && parseInt(remaining) < 10) {
        console.warn(`Rate limit warning: ${remaining} requests remaining`);
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
      
      // Retry логика для временных ошибок
      if (retryCount < 3 && (err.message.includes('500') || err.message.includes('timeout'))) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 1000 * (retryCount + 1));
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint, options, retryCount]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    setRetryCount(0);
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

// Использование:
const { data: marketData, loading, error, refetch } = useApiData('/api/v1/market/overview');
```

### 2. Hook для real-time обновлений

```javascript
import { useState, useEffect, useRef } from 'react';

const useRealTimeData = (endpoint, intervalMs = 30000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const isActive = useRef(true);

  const fetchData = async () => {
    try {
      const response = await fetch(endpoint, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (isActive.current) {
        setData(result);
        setLoading(false);
      }
    } catch (err) {
      if (isActive.current) {
        setError(err.message);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
    
    if (intervalMs > 0) {
      intervalRef.current = setInterval(fetchData, intervalMs);
    }

    return () => {
      isActive.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [endpoint, intervalMs]);

  return { data, loading, error };
};

// Использование:
const { data: marketData, loading } = useRealTimeData('/api/v1/market/overview', 60000);
```

### 3. Hook для кэширования

```javascript
import { useState, useEffect, useRef } from 'react';

const useCachedApiData = (endpoint, ttlMs = 30000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cacheRef = useRef(new Map());
  const lastFetchRef = useRef(0);

  const fetchData = async (force = false) => {
    const now = Date.now();
    const cached = cacheRef.current.get(endpoint);
    
    // Проверяем кэш
    if (!force && cached && (now - lastFetchRef.current) < ttlMs) {
      setData(cached);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(endpoint, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Сохраняем в кэш
      cacheRef.current.set(endpoint, result);
      lastFetchRef.current = now;
      
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
      
      // Возвращаем кэшированные данные при ошибке
      if (cached) {
        setData(cached);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  const refresh = () => fetchData(true);

  return { data, loading, error, refresh };
};

// Использование:
const { data: fearGreedData, loading, refresh } = useCachedApiData('/api/v1/market/fear-greed', 14400000); // 4 часа
```

## 🎨 UI Components

### 1. Market Overview Card

```jsx
import React from 'react';
import { useApiData } from '../hooks/useApiData';

const MarketOverviewCard = () => {
  const { data, loading, error } = useApiData('/api/v1/market/overview');

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-4"></div>
        <div className="h-8 bg-gray-200 rounded mb-2"></div>
        <div className="h-6 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600">Ошибка загрузки данных: {error}</p>
      </div>
    );
  }

  if (!data || data.status !== 'ok') {
    return null;
  }

  const { market_cap, market_cap_change_24h, volume_24h, volume_change_24h, active_coins, gainers_24h, losers_24h } = data.data;

  const formatNumber = (num) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  const formatChange = (change) => {
    const isPositive = change >= 0;
    return (
      <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? '+' : ''}{change.toFixed(2)}%
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Обзор рынка</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Market Cap</p>
          <p className="text-2xl font-bold text-gray-800">
            ${formatNumber(market_cap)}
          </p>
          <p className="text-sm">
            {formatChange(market_cap_change_24h)} за 24ч
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">Volume 24h</p>
          <p className="text-2xl font-bold text-gray-800">
            ${formatNumber(volume_24h)}
          </p>
          <p className="text-sm">
            {formatChange(volume_change_24h)} за 24ч
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">Активные монеты</p>
          <p className="text-xl font-bold text-gray-800">{active_coins}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">Gainers/Losers</p>
          <p className="text-xl font-bold text-green-600">{gainers_24h}</p>
          <p className="text-xl font-bold text-red-600">{losers_24h}</p>
        </div>
      </div>
      
      <p className="text-xs text-gray-500 mt-4">
        Обновлено: {new Date(data.timestamp).toLocaleString()}
      </p>
    </div>
  );
};

export default MarketOverviewCard;
```

### 2. Fear & Greed Indicator

```jsx
import React from 'react';
import { useCachedApiData } from '../hooks/useCachedApiData';

const FearGreedIndicator = () => {
  const { data, loading, error } = useCachedApiData('/api/v1/market/fear-greed', 14400000);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error || !data || data.status !== 'ok') {
    return null;
  }

  const { value, status } = data.data;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Extreme Fear': return 'text-red-600 bg-red-50';
      case 'Fear': return 'text-orange-600 bg-orange-50';
      case 'Neutral': return 'text-yellow-600 bg-yellow-50';
      case 'Greed': return 'text-blue-600 bg-blue-50';
      case 'Extreme Greed': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'Extreme Fear': return '😱';
      case 'Fear': return '😨';
      case 'Neutral': return '😐';
      case 'Greed': return '😏';
      case 'Extreme Greed': return '🤑';
      default: return '🤔';
    }
  };

  const getTradingAdvice = (status) => {
    switch (status) {
      case 'Extreme Fear': return 'Возможность покупки на дне';
      case 'Fear': return 'Рассмотрите покупку';
      case 'Neutral': return 'Нейтральный рынок';
      case 'Greed': return 'Будьте осторожны';
      case 'Extreme Greed': return 'Возможность продажи на пике';
      default: return '';
    }
  };

  // Создаем круговой индикатор
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Fear & Greed Index</h2>
      
      <div className="flex items-center justify-center mb-4">
        <div className="relative">
          <svg className="w-32 h-32 transform -rotate-90">
            {/* Фоновый круг */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Прогресс */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className={`${getStatusColor(status).split(' ')[0]}`}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
            />
          </svg>
          
          {/* Центральное значение */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800">{value}</div>
              <div className="text-sm text-gray-600">/100</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Статус */}
      <div className="text-center mb-4">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
          <span className="mr-2">{getStatusEmoji(status)}</span>
          {status}
        </div>
      </div>
      
      {/* Торговый совет */}
      {getTradingAdvice(status) && (
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 font-medium">
            💡 {getTradingAdvice(status)}
          </p>
        </div>
      )}
      
      <p className="text-xs text-gray-500 mt-4 text-center">
        Обновлено: {new Date(data.timestamp).toLocaleString()}
      </p>
    </div>
  );
};

export default FearGreedIndicator;
```

### 3. BTC Dominance Chart

```jsx
import React from 'react';
import { useApiData } from '../hooks/useApiData';

const BTCDominanceChart = () => {
  const { data, loading, error } = useApiData('/api/v1/market/btc-dominance');

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error || !data || data.status !== 'ok') {
    return null;
  }

  const { value, eth, progress } = data.data;
  const others = 100 - value - eth;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Доминирование BTC</h2>
      
      {/* Круговая диаграмма */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90">
            {/* BTC */}
            <circle
              cx="64"
              cy="64"
              r="50"
              fill="transparent"
              stroke="#f7931a"
              strokeWidth="20"
              strokeDasharray={`${(value / 100) * 314} 314`}
              strokeDashoffset="0"
            />
            {/* ETH */}
            <circle
              cx="64"
              cy="64"
              r="50"
              fill="transparent"
              stroke="#627eea"
              strokeWidth="20"
              strokeDasharray={`${(eth / 100) * 314} 314`}
              strokeDashoffset={`-${(value / 100) * 314}`}
            />
            {/* Others */}
            <circle
              cx="64"
              cy="64"
              r="50"
              fill="transparent"
              stroke="#6b7280"
              strokeWidth="20"
              strokeDasharray={`${(others / 100) * 314} 314`}
              strokeDashoffset={`-${((value + eth) / 100) * 314}`}
            />
          </svg>
          
          {/* Центральное значение */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{value.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">BTC</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Легенда */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Bitcoin (BTC)</span>
          </div>
          <span className="text-sm font-medium text-gray-800">{value.toFixed(1)}%</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Ethereum (ETH)</span>
          </div>
          <span className="text-sm font-medium text-gray-800">{eth.toFixed(1)}%</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Другие монеты</span>
          </div>
          <span className="text-sm font-medium text-gray-800">{others.toFixed(1)}%</span>
        </div>
      </div>
      
      {/* Прогресс бар */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-orange-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${value}%` }}
          ></div>
        </div>
      </div>
      
      <p className="text-xs text-gray-500 text-center">
        Обновлено: {new Date(data.timestamp).toLocaleString()}
      </p>
    </div>
  );
};

export default BTCDominanceChart;
```

### 4. Coin Price Display

```jsx
import React from 'react';
import { useRealTimeData } from '../hooks/useRealTimeData';

const CoinPriceDisplay = ({ symbol }) => {
  const { data, loading, error } = useRealTimeData(`/api/v1/coins/price?symbol=${symbol}`, 10000);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error || !data || data.status !== 'ok') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 text-sm">Ошибка загрузки цены {symbol}</p>
      </div>
    );
  }

  const { price, priceChange, priceChangePercent, volume, high, low } = data.data;

  const formatPrice = (price) => {
    if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(4);
    if (price >= 0.01) return price.toFixed(6);
    return price.toFixed(8);
  };

  const formatVolume = (vol) => {
    if (vol >= 1e9) return `${(vol / 1e9).toFixed(2)}B`;
    if (vol >= 1e6) return `${(vol / 1e6).toFixed(2)}M`;
    if (vol >= 1e3) return `${(vol / 1e3).toFixed(2)}K`;
    return vol.toFixed(2);
  };

  const isPositive = priceChangePercent >= 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800">{symbol}</h3>
        <span className="text-sm text-gray-500">Live</span>
      </div>
      
      <div className="mb-3">
        <div className="text-2xl font-bold text-gray-800">
          ${formatPrice(price)}
        </div>
        
        <div className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}% ({isPositive ? '+' : ''}${priceChange.toFixed(4)})
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Volume 24h:</span>
          <span className="ml-2 font-medium">{formatVolume(volume)}</span>
        </div>
        
        <div>
          <span className="text-gray-600">High 24h:</span>
          <span className="ml-2 font-medium text-green-600">${formatPrice(high)}</span>
        </div>
        
        <div>
          <span className="text-gray-600">Low 24h:</span>
          <span className="ml-2 font-medium text-red-600">${formatPrice(low)}</span>
        </div>
        
        <div>
          <span className="text-gray-600">Change 24h:</span>
          <span className={`ml-2 font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%
          </span>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Обновлено: {new Date(data.timestamp).toLocaleTimeString()}</span>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
            <span>Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinPriceDisplay;
```

## 🔧 Utility Functions

### 1. API Client

```javascript
class ApiClient {
  constructor(baseURL = 'http://localhost:3001') {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Content-Type': 'application/json'
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: { ...this.defaultHeaders, ...options.headers },
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      // Проверяем rate limiting
      this.checkRateLimit(response);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  checkRateLimit(response) {
    const remaining = response.headers.get('RateLimit-Remaining');
    const reset = response.headers.get('RateLimit-Reset');
    
    if (remaining && parseInt(remaining) < 10) {
      console.warn(`Rate limit warning: ${remaining} requests remaining. Reset in ${reset}s`);
    }
    
    if (remaining && parseInt(remaining) === 0) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
  }

  // Market endpoints
  async getMarketOverview() {
    return this.request('/api/v1/market/overview');
  }

  async getFearGreedIndex() {
    return this.request('/api/v1/market/fear-greed');
  }

  async getAltseasonIndex() {
    return this.request('/api/v1/market/altseason');
  }

  async getBTCDominance() {
    return this.request('/api/v1/market/btc-dominance');
  }

  // Coin endpoints
  async getCoinsList(limit = 100, offset = 0) {
    return this.request(`/api/v1/coins/list?limit=${limit}&offset=${offset}`);
  }

  async getCoinDetails(symbol) {
    return this.request(`/api/v1/coins/details?symbol=${symbol}`);
  }

  async getCoinPrice(symbol) {
    return this.request(`/api/v1/coins/price?symbol=${symbol}`);
  }

  // Webhook endpoints
  async getSignals(limit = 50, type = null, symbol = null) {
    const params = new URLSearchParams({ limit });
    if (type) params.append('type', type);
    if (symbol) params.append('symbol', symbol);
    
    return this.request(`/api/v1/webhook/signals?${params}`);
  }

  async getSignalsStats() {
    return this.request('/api/v1/webhook/signals/stats');
  }

  // Health check
  async getHealth() {
    return this.request('/health');
  }
}

// Создаем экземпляр
const apiClient = new ApiClient();

export default apiClient;
```

### 2. Error Handler

```javascript
export class ApiError extends Error {
  constructor(message, status, code, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const handleApiError = (error) => {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        return {
          type: 'validation',
          message: 'Неверные параметры запроса',
          details: error.details
        };
      
      case 401:
        return {
          type: 'unauthorized',
          message: 'Требуется авторизация',
          action: 'redirect_to_login'
        };
      
      case 404:
        return {
          type: 'not_found',
          message: 'Запрашиваемый ресурс не найден'
        };
      
      case 429:
        return {
          type: 'rate_limit',
          message: 'Превышен лимит запросов. Попробуйте позже.',
          action: 'show_retry_timer'
        };
      
      case 500:
        return {
          type: 'server_error',
          message: 'Внутренняя ошибка сервера',
          action: 'retry_later'
        };
      
      default:
        return {
          type: 'unknown',
          message: 'Произошла неизвестная ошибка',
          action: 'contact_support'
        };
    }
  }
  
  // Network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return {
      type: 'network_error',
      message: 'Ошибка сети. Проверьте подключение к интернету.',
      action: 'retry_immediately'
    };
  }
  
  return {
    type: 'unknown',
    message: error.message || 'Произошла ошибка',
    action: 'show_generic_error'
  };
};
```

### 3. Data Formatters

```javascript
export const formatters = {
  // Форматирование чисел
  number: {
    compact: (num) => {
      if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
      if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
      if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
      if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
      return num.toFixed(2);
    },
    
    currency: (num, currency = 'USD') => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 8
      }).format(num);
    },
    
    percentage: (num, decimals = 2) => {
      return `${num >= 0 ? '+' : ''}${num.toFixed(decimals)}%`;
    }
  },
  
  // Форматирование времени
  time: {
    relative: (timestamp) => {
      const now = Date.now();
      const diff = now - new Date(timestamp).getTime();
      
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (days > 0) return `${days}д назад`;
      if (hours > 0) return `${hours}ч назад`;
      if (minutes > 0) return `${minutes}м назад`;
      if (seconds > 0) return `${seconds}с назад`;
      return 'только что';
    },
    
    format: (timestamp, format = 'short') => {
      const date = new Date(timestamp);
      
      if (format === 'short') {
        return date.toLocaleDateString();
      }
      
      if (format === 'long') {
        return date.toLocaleString();
      }
      
      if (format === 'time') {
        return date.toLocaleTimeString();
      }
      
      return date.toISOString();
    }
  },
  
  // Форматирование цены криптовалюты
  crypto: {
    price: (price, symbol = 'USD') => {
      if (price >= 1000) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
      if (price >= 1) return `$${price.toFixed(4)}`;
      if (price >= 0.01) return `$${price.toFixed(6)}`;
      return `$${price.toFixed(8)}`;
    },
    
    volume: (volume) => {
      if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
      if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
      if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
      return volume.toFixed(2);
    },
    
    change: (change, showSign = true) => {
      const sign = showSign && change >= 0 ? '+' : '';
      return `${sign}${change.toFixed(2)}%`;
    }
  }
};
```

## 📱 Responsive Design Helpers

```javascript
// Хук для определения размера экрана
export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 768,
        isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
        isDesktop: window.innerWidth >= 1024
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
};

// Компонент для адаптивного отображения
export const ResponsiveWrapper = ({ children, mobile, tablet, desktop }) => {
  const { isMobile, isTablet, isDesktop } = useScreenSize();
  
  if (isMobile && mobile) return mobile;
  if (isTablet && tablet) return tablet;
  if (isDesktop && desktop) return desktop;
  
  return children;
};
```

---

**Эти примеры готовы к использованию! 🚀**

Просто скопируйте нужный код и адаптируйте под ваш проект. Все компоненты используют современные React паттерны и готовы к продакшену.
