// OmniBoard UI Components
class OmniBoardComponents {
  constructor() {
    this.init();
  }

  init() {
    // Инициализация компонентов после загрузки DOM
    document.addEventListener('DOMContentLoaded', () => {
      this.initTooltips();
      this.initModals();
    });
  }

  // Инициализация tooltips
  initTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  // Инициализация модальных окон
  initModals() {
    // Connect Exchange Modal
    const connectExchangeBtn = document.getElementById('connect-exchange-btn');
    if (connectExchangeBtn) {
      connectExchangeBtn.addEventListener('click', () => {
        this.showConnectExchangeModal();
      });
    }

    // Sync Now Button
    const syncNowBtn = document.getElementById('sync-now-btn');
    if (syncNowBtn) {
      syncNowBtn.addEventListener('click', () => {
        this.syncJournal();
      });
    }
  }

  // Показать модальное окно Connect Exchange
  showConnectExchangeModal() {
    const modal = new bootstrap.Modal(document.getElementById('connect-exchange-modal'));
    modal.show();
  }

  // Синхронизация журнала
  async syncJournal() {
    const accountId = document.getElementById('account-id').value;
    if (!accountId) {
      this.showAlert('Please select an account first', 'warning');
      return;
    }

    try {
      this.showLoading('Syncing journal...');
      await window.omniboardAPI.syncJournal(accountId);
      this.hideLoading();
      this.showAlert('Journal synced successfully!', 'success');
      
      // Обновить данные на странице
      this.loadJournalData();
    } catch (error) {
      this.hideLoading();
      this.showAlert('Failed to sync journal: ' + error.message, 'danger');
    }
  }

  // Создать KPI карточку
  createKpiCard(title, value, subtitle = '', icon = '', color = 'primary') {
    return `
      <div class="col-sm-6 col-lg-3">
        <div class="card">
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col-auto">
                <span class="bg-${color} text-white avatar">
                  <i class="ti ti-${icon}"></i>
                </span>
              </div>
              <div class="col">
                <div class="font-weight-medium">
                  ${title}
                </div>
                <div class="text-muted">
                  ${value}
                </div>
                ${subtitle ? `<div class="text-muted small">${subtitle}</div>` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Создать badge для изменения цены
  createPriceBadge(change) {
    const isPositive = change >= 0;
    const color = isPositive ? 'success' : 'danger';
    const icon = isPositive ? 'trending-up' : 'trending-down';
    
    return `
      <span class="badge bg-${color}">
        <i class="ti ti-${icon} me-1"></i>
        ${isPositive ? '+' : ''}${change.toFixed(2)}%
      </span>
    `;
  }

  // Создать карточку сигнала
  createSignalCard(signal) {
    const getSignalColor = (signal) => {
      switch (signal.toUpperCase()) {
        case 'BUY': return 'success';
        case 'SELL': return 'danger';
        case 'HOLD': return 'warning';
        default: return 'secondary';
      }
    };

    return `
      <div class="col-md-6 col-lg-4">
        <div class="card">
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col-auto">
                <span class="bg-primary text-white avatar">
                  ${signal.symbol}
                </span>
              </div>
              <div class="col">
                <div class="font-weight-medium">
                  ${signal.symbol}
                </div>
                <div class="text-muted">
                  $${signal.price.toLocaleString()}
                </div>
              </div>
            </div>
            <div class="mt-3">
              <div class="row g-2">
                <div class="col-4">
                  <div class="text-muted small">1H RSI</div>
                  <div class="font-weight-medium">${signal.rsi_1h}</div>
                  <span class="badge bg-${getSignalColor(signal.signal_1h)}">${signal.signal_1h}</span>
                </div>
                <div class="col-4">
                  <div class="text-muted small">4H RSI</div>
                  <div class="font-weight-medium">${signal.rsi_4h}</div>
                  <span class="badge bg-${getSignalColor(signal.signal_4h)}">${signal.signal_4h}</span>
                </div>
                <div class="col-4">
                  <div class="text-muted small">1D RSI</div>
                  <div class="font-weight-medium">${signal.rsi_1d}</div>
                  <span class="badge bg-${getSignalColor(signal.signal_1d)}">${signal.signal_1d}</span>
                </div>
              </div>
            </div>
            <div class="mt-3">
              <div class="placeholder" style="height: 40px; background: #f1f3f4; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #6c757d;">
                sparkline
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Создать таблицу
  createTable(headers, data, options = {}) {
    const tableId = options.id || 'data-table';
    const stickyHeader = options.stickyHeader !== false;
    const exportable = options.exportable || false;
    
    let tableHtml = `
      <div class="card">
        ${stickyHeader ? '<div class="card-header sticky-top bg-white">' : '<div class="card-header">'}
          <h3 class="card-title">${options.title || 'Data Table'}</h3>
          ${exportable ? `
            <div class="card-actions">
              <button class="btn btn-primary btn-sm" onclick="omniboardComponents.exportTable('${tableId}')">
                <i class="ti ti-download me-1"></i>
                Export CSV
              </button>
            </div>
          ` : ''}
        </div>
        <div class="table-responsive">
          <table class="table table-vcenter card-table" id="${tableId}">
            <thead>
              <tr>
    `;

    headers.forEach(header => {
      tableHtml += `<th>${header}</th>`;
    });

    tableHtml += `
              </tr>
            </thead>
            <tbody>
    `;

    data.forEach(row => {
      tableHtml += '<tr>';
      Object.values(row).forEach(value => {
        tableHtml += `<td>${value}</td>`;
      });
      tableHtml += '</tr>';
    });

    tableHtml += `
            </tbody>
          </table>
        </div>
      </div>
    `;

    return tableHtml;
  }

  // Экспорт таблицы в CSV
  exportTable(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const rows = Array.from(table.querySelectorAll('tr'));
    const csvContent = rows.map(row => {
      return Array.from(row.querySelectorAll('th, td'))
        .map(cell => `"${cell.textContent.trim()}"`)
        .join(',');
    }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${tableId}_export.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Показать уведомление
  showAlert(message, type = 'info', duration = 5000) {
    const alertId = 'alert-' + Date.now();
    const alertHtml = `
      <div class="alert alert-${type} alert-dismissible" id="${alertId}" role="alert">
        <div class="d-flex">
          <div>
            ${message}
          </div>
        </div>
        <a href="#" class="btn-close" data-bs-dismiss="alert" aria-label="close"></a>
      </div>
    `;

    // Добавить в начало страницы
    const container = document.querySelector('.container-xl');
    if (container) {
      container.insertAdjacentHTML('afterbegin', alertHtml);
    }

    // Автоматически скрыть через указанное время
    if (duration > 0) {
      setTimeout(() => {
        const alert = document.getElementById(alertId);
        if (alert) {
          alert.remove();
        }
      }, duration);
    }
  }

  // Показать загрузку
  showLoading(message = 'Loading...') {
    const loadingId = 'loading-' + Date.now();
    const loadingHtml = `
      <div class="loading-overlay" id="${loadingId}">
        <div class="loading-content">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <div class="mt-2">${message}</div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', loadingHtml);
  }

  // Скрыть загрузку
  hideLoading() {
    const loadingElements = document.querySelectorAll('.loading-overlay');
    loadingElements.forEach(element => element.remove());
  }

  // Форматировать числа
  formatNumber(number, decimals = 2) {
    if (typeof number !== 'number') return number;
    
    if (number >= 1e9) {
      return (number / 1e9).toFixed(decimals) + 'B';
    } else if (number >= 1e6) {
      return (number / 1e6).toFixed(decimals) + 'M';
    } else if (number >= 1e3) {
      return (number / 1e3).toFixed(decimals) + 'K';
    } else {
      return number.toFixed(decimals);
    }
  }

  // Форматировать валюту
  formatCurrency(amount, currency = 'USD') {
    if (typeof amount !== 'number') return amount;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  // Форматировать процент
  formatPercentage(value, decimals = 2) {
    if (typeof value !== 'number') return value;
    
    return value.toFixed(decimals) + '%';
  }

  // Форматировать время
  formatTime(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// Создаем глобальный экземпляр компонентов
window.omniboardComponents = new OmniBoardComponents();
