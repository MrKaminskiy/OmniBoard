/**
 * Crypto Dashboard Controller
 * Manages the crypto market overview page with real-time data updates
 */

class CryptoDashboard {
    constructor() {
        this.api = window.omniboardAPI;
        this.currentFilter = 'all';
        this.currentPage = 0;
        this.itemsPerPage = 10;
        this.coinsData = [];
        this.isLoading = false;
        
        this.init();
    }

    /**
     * Initialize the dashboard
     */
    init() {
        console.log('🚀 Initializing Crypto Dashboard...');
        this.bindEvents();
        this.loadDashboardData();
        this.setupAutoRefresh();
        
        console.log('✅ Crypto Dashboard initialized');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Filter buttons
        document.querySelectorAll('[data-filter]').forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleFilterChange(e.target.dataset.filter);
            });
        });

        // Refresh buttons
        document.querySelectorAll('[data-action="refresh"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const kpi = e.target.closest('[data-kpi]')?.dataset.kpi;
                if (kpi) {
                    this.refreshKPI(kpi);
                } else {
                    this.refreshAllData();
                }
            });
        });

        // Pagination buttons
        document.querySelectorAll('[data-page]').forEach(button => {
            button.addEventListener('click', (e) => {
                const page = e.target.dataset.page;
                this.handlePageChange(page);
            });
        });

        // Select all checkbox
        const selectAllCheckbox = document.getElementById('select-all');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                this.handleSelectAll(e.target.checked);
            });
        }
    }

    /**
     * Load all dashboard data
     */
    async loadDashboardData() {
        try {
            console.log('📊 Loading dashboard data...');
            this.setLoadingState(true);
            
            // Load data in parallel
            const [
                marketOverview,
                fearGreed,
                altseason,
                openInterest,
                liquidations,
                longShortRatio,
                btcDominance,
                coinsList
            ] = await Promise.allSettled([
                this.api.getMarketOverview(),
                this.api.getFearGreedIndex(),
                this.api.getAltseasonIndex(),
                this.api.getOpenInterest(),
                this.api.getLiquidations(),
                this.api.getLongShortRatio(),
                this.api.getBTCDominance(),
                this.api.getCoinsList(100, 0)
            ]);

            console.log('📈 API responses received:', {
                marketOverview: marketOverview.status,
                fearGreed: fearGreed.status,
                altseason: altseason.status,
                openInterest: openInterest.status,
                liquidations: liquidations.status,
                longShortRatio: longShortRatio.status,
                btcDominance: btcDominance.status,
                coinsList: coinsList.status
            });

            // Update KPI cards
            this.updateKPICards(marketOverview, fearGreed, altseason, openInterest, liquidations, longShortRatio, btcDominance);
            
            // Update coins table
            if (coinsList.status === 'fulfilled') {
                console.log('🪙 Coins list received:', coinsList.value);
                if (coinsList.value && coinsList.value.data && coinsList.value.data.coins) {
                    this.coinsData = coinsList.value.data.coins;
                    console.log('📊 Processed coins data:', this.coinsData.length, 'coins');
                    this.updateCoinsTable();
                } else {
                    console.warn('⚠️ No coins data in response');
                    this.coinsData = [];
                }
            }

            // Update market stats
            if (marketOverview.status === 'fulfilled') {
                this.updateMarketStats(marketOverview.value);
            }

            this.updateDataSource();
            
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.showError('Failed to load data. Using cached data if available.');
        } finally {
            this.setLoadingState(false);
        }
    }

    /**
     * Update KPI cards with data
     */
    updateKPICards(marketOverview, fearGreed, altseason, openInterest, liquidations, longShortRatio, btcDominance) {
        // Market Cap
        if (marketOverview.status === 'fulfilled') {
            const data = marketOverview.value;
            console.log('📊 Market Overview data received:', data);
            
            if (data && data.data) {
                console.log('📊 Processing market data:', data.data);
                console.log('💰 Market Cap:', data.data.market_cap_formatted, 'T');
                console.log('📈 Volume:', data.data.volume_formatted, 'B');
                console.log('🪙 Active Coins:', data.data.active_coins);
                
                this.updateKPICard('market-cap', {
                    main: `$${data.data.market_cap_formatted}T`,
                    change: `${data.data.market_cap_change_24h > 0 ? '+' : ''}${data.data.market_cap_change_24h.toFixed(2)}%`,
                    progress: data.data.market_cap_progress
                });

                // Volume
                this.updateKPICard('volume', {
                    main: `$${data.data.volume_formatted}B`,
                    change: `${data.data.volume_change_24h > 0 ? '+' : ''}${data.data.volume_change_24h.toFixed(2)}%`,
                    progress: data.data.volume_progress
                });

                // Active Coins
                this.updateKPICard('active-coins', {
                    main: data.data.active_coins,
                    change: `${data.data.gainers_24h} gainers, ${data.data.losers_24h} losers`
                });
            } else {
                console.warn('⚠️ No data.data in market overview response');
                console.log('🔍 Full response:', data);
            }
        }

        // Fear & Greed
        if (fearGreed.status === 'fulfilled') {
            const data = fearGreed.value;
            this.updateKPICard('fear-greed', {
                main: data.value,
                status: data.status,
                change: data.status
            });
        }

        // Altseason
        if (altseason.status === 'fulfilled') {
            const data = altseason.value;
            this.updateKPICard('altseason', {
                main: data.value,
                status: data.status,
                change: data.status
            });
        }

        // Open Interest
        if (openInterest.status === 'fulfilled') {
            const data = openInterest.value;
            this.updateKPICard('open-interest', {
                main: this.formatCurrency(data.value),
                change: `${data.change > 0 ? '+' : ''}${data.change.toFixed(2)}%`,
                progress: data.progress
            });
        }

        // Liquidations
        if (liquidations.status === 'fulfilled') {
            const data = liquidations.value;
            this.updateKPICard('liquidations', {
                main: this.formatCurrency(data.value),
                ratio: data.ratio.toFixed(1),
                progress: data.progress
            });
        }

        // Long/Short Ratio
        if (longShortRatio.status === 'fulfilled') {
            const data = longShortRatio.value;
            this.updateKPICard('long-short-ratio', {
                main: data.value.toFixed(2),
                accounts: data.accounts,
                progress: data.progress
            });
        }

        // BTC Dominance
        if (btcDominance.status === 'fulfilled') {
            const data = btcDominance.value;
            this.updateKPICard('btc-dominance', {
                main: `${data.value.toFixed(1)}%`,
                eth: `${data.eth.toFixed(1)}%`,
                progress: data.progress
            });
        }
    }

    /**
     * Update individual KPI card
     */
    updateKPICard(kpiType, data) {
        const card = document.querySelector(`[data-kpi="${kpiType}"]`);
        if (!card) return;

        // Update main value
        const mainElement = card.querySelector('[data-value="main"]');
        if (mainElement && data.main) {
            mainElement.textContent = data.main;
        }

        // Update change value
        const changeElement = card.querySelector('[data-value="change"]');
        if (changeElement && data.change) {
            changeElement.textContent = data.change;
        }

        // Update status badge
        const statusElement = card.querySelector('[data-value="status"]');
        if (statusElement && data.status) {
            statusElement.textContent = data.status;
            statusElement.className = `badge ${this.getStatusBadgeClass(data.status)}`;
        }

        // Update ratio badge
        const ratioElement = card.querySelector('[data-value="ratio"]');
        if (ratioElement && data.ratio) {
            ratioElement.textContent = data.ratio;
        }

        // Update ETH badge
        const ethElement = card.querySelector('[data-value="eth"]');
        if (ethElement && data.eth) {
            ethElement.textContent = data.eth;
        }

        // Update progress bar
        const progressElement = card.querySelector('[data-value="progress"]');
        if (progressElement && data.progress) {
            progressElement.style.width = `${data.progress}%`;
        }
    }

    /**
     * Update coins table
     */
    updateCoinsTable() {
        const tbody = document.querySelector('tbody');
        if (!tbody) return;

        const filteredData = this.getFilteredCoins();
        const paginatedData = this.getPaginatedData(filteredData);
        
        tbody.innerHTML = '';
        
        paginatedData.forEach(coin => {
            const row = this.createCoinRow(coin);
            tbody.appendChild(row);
        });

        this.updatePagination(filteredData.length);
        this.updateCounters(filteredData.length);
    }

    /**
     * Create coin table row
     */
    createCoinRow(coin) {
        const row = document.createElement('tr');
        
        const priceChangeClass = coin.price_change_24h >= 0 ? 'text-green' : 'text-red';
        const priceChangeIcon = coin.price_change_24h >= 0 ? 'trending-up' : 'trending-down';
        
        row.innerHTML = `
            <td>
                <input class="form-check-input" type="checkbox" value="${coin.id}">
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <img src="${coin.image}" class="avatar avatar-sm me-2" alt="${coin.symbol}">
                    <div>
                        <div class="fw-bold">${coin.symbol?.toUpperCase()}</div>
                        <div class="text-muted small">${coin.name}</div>
                    </div>
                </div>
            </td>
            <td>${this.formatCurrency(coin.price)}</td>
            <td>
                <span class="${priceChangeClass}">
                    ${coin.price_change_24h >= 0 ? '+' : ''}${coin.price_change_24h?.toFixed(2)}%
                    <svg class="icon icon-sm ms-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                    </svg>
                </span>
            </td>
            <td>${this.formatCurrency(coin.market_cap)}</td>
            <td>${this.formatCurrency(coin.volume_24h)}</td>
            <td>${this.formatCurrency(coin.open_interest)}</td>
            <td>${coin.funding_rate?.toFixed(4)}%</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" title="View Details">
                        <svg class="icon icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                    </button>
                    <button class="btn btn-outline-secondary" title="Add to Watchlist">
                        <svg class="icon icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                    </button>
                </div>
            </td>
        `;
        
        return row;
    }

    /**
     * Get filtered coins based on current filter
     */
    getFilteredCoins() {
        if (this.currentFilter === 'all') {
            return this.coinsData;
        } else if (this.currentFilter === 'gainers') {
            return this.coinsData.filter(coin => coin.price_change_24h > 0);
        } else if (this.currentFilter === 'losers') {
            return this.coinsData.filter(coin => coin.price_change_24h < 0);
        }
        return this.coinsData;
    }

    /**
     * Get paginated data
     */
    getPaginatedData(data) {
        const start = this.currentPage * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return data.slice(start, end);
    }

    /**
     * Update pagination controls
     */
    updatePagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const prevButton = document.querySelector('[data-page="prev"]');
        const nextButton = document.querySelector('[data-page="next"]');
        
        if (prevButton) {
            prevButton.disabled = this.currentPage === 0;
        }
        
        if (nextButton) {
            nextButton.disabled = this.currentPage >= totalPages - 1;
        }
    }

    /**
     * Update counters
     */
    updateCounters(totalItems) {
        const showingElement = document.querySelector('[data-count="showing"]');
        const totalElement = document.querySelector('[data-count="total"]');
        
        if (showingElement) {
            const start = this.currentPage * this.itemsPerPage + 1;
            const end = Math.min((this.currentPage + 1) * this.itemsPerPage, totalItems);
            showingElement.textContent = `${start}-${end}`;
        }
        
        if (totalElement) {
            totalElement.textContent = totalItems;
        }
    }

    /**
     * Update market stats
     */
    updateMarketStats(data) {
        const activeCoinsElement = document.querySelector('[data-stat="active-coins"]');
        const gainersElement = document.querySelector('[data-stat="gainers"]');
        const losersElement = document.querySelector('[data-stat="losers"]');
        const lastUpdateElement = document.querySelector('[data-stat="last-update"]');
        
        if (activeCoinsElement) {
            activeCoinsElement.textContent = this.formatNumber(data.activeCoins);
        }
        
        if (gainersElement) {
            gainersElement.textContent = this.formatNumber(data.gainers);
        }
        
        if (losersElement) {
            losersElement.textContent = this.formatNumber(data.losers);
        }
        
        if (lastUpdateElement) {
            lastUpdateElement.textContent = data.lastUpdate;
        }
    }

    /**
     * Update data source indicator
     */
    updateDataSource() {
        const dataSourceElement = document.getElementById('data-source');
        if (dataSourceElement) {
            const now = new Date();
            dataSourceElement.textContent = `OmniBoard API - ${now.toLocaleTimeString()}`;
        }
    }

    /**
     * Handle filter change
     */
    handleFilterChange(filter) {
        this.currentFilter = filter;
        this.currentPage = 0;
        
        // Update active filter button
        document.querySelectorAll('[data-filter]').forEach(button => {
            button.dataset.active = button.dataset.filter === filter;
            button.classList.toggle('active', button.dataset.filter === filter);
        });
        
        this.updateCoinsTable();
    }

    /**
     * Handle page change
     */
    handlePageChange(page) {
        if (page === 'prev' && this.currentPage > 0) {
            this.currentPage--;
        } else if (page === 'next') {
            this.currentPage++;
        }
        
        this.updateCoinsTable();
    }

    /**
     * Handle select all
     */
    handleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
        });
    }

    /**
     * Refresh specific KPI
     */
    async refreshKPI(kpiType) {
        try {
            let data;
            
            switch (kpiType) {
                case 'market-cap':
                case 'volume':
                    data = await this.api.getMarketOverview();
                    break;
                case 'fear-greed':
                    data = await this.api.getFearGreedIndex();
                    break;
                case 'altseason':
                    data = await this.api.getAltseasonIndex();
                    break;
                case 'open-interest':
                    data = await this.api.getOpenInterest();
                    break;
                case 'liquidations':
                    data = await this.api.getLiquidations();
                    break;
                case 'long-short-ratio':
                    data = await this.api.getLongShortRatio();
                    break;
                case 'btc-dominance':
                    data = await this.api.getBTCDominance();
                    break;
            }
            
            if (data) {
                this.updateKPICard(kpiType, data);
            }
            
        } catch (error) {
            console.error(`Failed to refresh ${kpiType}:`, error);
            this.showError(`Failed to refresh ${kpiType}`);
        }
    }

    /**
     * Refresh all data
     */
    async refreshAllData() {
        this.api.clearCache();
        await this.loadDashboardData();
        this.showSuccess('Data refreshed successfully');
    }

    /**
     * Setup auto refresh
     */
    setupAutoRefresh() {
        // Refresh data every 5 minutes
        setInterval(() => {
            this.refreshAllData();
        }, 5 * 60 * 1000);
    }

    /**
     * Set loading state
     */
    setLoadingState(loading) {
        this.isLoading = loading;
        
        const refreshButtons = document.querySelectorAll('[data-action="refresh"]');
        refreshButtons.forEach(button => {
            button.disabled = loading;
            if (loading) {
                button.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
            } else {
                button.innerHTML = '<svg class="icon icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>';
            }
        });
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        // You can implement toast notifications here
        console.log('Success:', message);
    }

    /**
     * Show error message
     */
    showError(message) {
        // You can implement toast notifications here
        console.error('Error:', message);
    }

    /**
     * Format currency
     */
    formatCurrency(value) {
        if (!value || value === 0) return '$000';
        
        if (value >= 1e12) {
            return `$${(value / 1e12).toFixed(2)}T`;
        } else if (value >= 1e9) {
            return `$${(value / 1e9).toFixed(2)}B`;
        } else if (value >= 1e6) {
            return `$${(value / 1e6).toFixed(2)}M`;
        } else if (value >= 1e3) {
            return `$${(value / 1e3).toFixed(2)}K`;
        } else {
            return `$${value.toFixed(2)}`;
        }
    }

    /**
     * Format number with commas
     */
    formatNumber(value) {
        if (!value || value === 0) return '000';
        return value.toLocaleString();
    }

    /**
     * Get status badge class
     */
    getStatusBadgeClass(status) {
        const statusMap = {
            'Extreme Fear': 'bg-red',
            'Fear': 'bg-orange',
            'Neutral': 'bg-yellow',
            'Greed': 'bg-lime',
            'Extreme Greed': 'bg-green',
            'Bitcoin Season': 'bg-red',
            'Altcoin Season': 'bg-green'
        };
        
        return statusMap[status] || 'bg-secondary';
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cryptoDashboard = new CryptoDashboard();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CryptoDashboard;
}
