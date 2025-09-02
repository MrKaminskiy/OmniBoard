// OmniBoard Configuration
window.OMNIBOARD_CONFIG = {
  // API Base URL - временно пустой для mock режима
  API_BASE: '',
  
  // Mock mode flags - включаем mock режим для демонстрации
  USE_MOCK_MARKET: true,
  USE_MOCK_SIGNALS: true,
  USE_MOCK_JOURNAL: true,
  USE_MOCK_MEDIA: true,
  
  // Auto-refresh intervals (in seconds)
  REFRESH_INTERVALS: {
    MARKET_OVERVIEW: 60,
    TICKERS: 30,
    SIGNALS: 60,
    MEDIA: 300
  }
};

// Override config from environment variables if available
if (typeof process !== 'undefined' && process.env) {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    window.OMNIBOARD_CONFIG.API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
  }
}

// Override config from meta tags if available
document.addEventListener('DOMContentLoaded', function() {
  const apiBaseMeta = document.querySelector('meta[name="api-base-url"]');
  if (apiBaseMeta) {
    window.OMNIBOARD_CONFIG.API_BASE = apiBaseMeta.getAttribute('content');
  }
  
  const mockMarketMeta = document.querySelector('meta[name="use-mock-market"]');
  if (mockMarketMeta) {
    window.OMNIBOARD_CONFIG.USE_MOCK_MARKET = mockMarketMeta.getAttribute('content') === 'true';
  }
  
  const mockSignalsMeta = document.querySelector('meta[name="use-mock-signals"]');
  if (mockSignalsMeta) {
    window.OMNIBOARD_CONFIG.USE_MOCK_SIGNALS = mockSignalsMeta.getAttribute('content') === 'true';
  }
  
  const mockJournalMeta = document.querySelector('meta[name="use-mock-journal"]');
  if (mockJournalMeta) {
    window.OMNIBOARD_CONFIG.USE_MOCK_JOURNAL = mockJournalMeta.getAttribute('content') === 'true';
  }
  
  const mockMediaMeta = document.querySelector('meta[name="use-mock-media"]');
  if (mockMediaMeta) {
    window.OMNIBOARD_CONFIG.USE_MOCK_MEDIA = mockMediaMeta.getAttribute('content') === 'true';
  }
});
