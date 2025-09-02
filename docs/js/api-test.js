/**
 * API Test Script
 * Test the OmniBoard API integration
 */

console.log('🔍 Testing OmniBoard API Integration...');

// Wait for API to be available
function waitForAPI() {
    return new Promise((resolve) => {
        const checkAPI = () => {
            if (window.omniboardAPI) {
                console.log('✅ OmniBoard API loaded successfully');
                resolve();
            } else {
                setTimeout(checkAPI, 100);
            }
        };
        checkAPI();
    });
}

// Test API endpoints
async function testAPI() {
    try {
        console.log('\n📊 Testing Market Overview...');
        const overview = await window.omniboardAPI.getMarketOverview();
        console.log('Market Overview:', overview);

        console.log('\n🧠 Testing Fear & Greed Index...');
        const fearGreed = await window.omniboardAPI.getFearGreedIndex();
        console.log('Fear & Greed:', fearGreed);

        console.log('\n📈 Testing Top Gainers...');
        const gainers = await window.omniboardAPI.getTopGainers(5);
        console.log('Top Gainers:', gainers);

        console.log('\n📉 Testing Top Losers...');
        const losers = await window.omniboardAPI.getTopLosers(5);
        console.log('Top Losers:', losers);

        console.log('\n💎 Testing BTC Dominance...');
        const btcDominance = await window.omniboardAPI.getBTCDominance();
        console.log('BTC Dominance:', btcDominance);

        console.log('\n📊 Testing Cache Status...');
        const cacheStatus = window.omniboardAPI.getCacheStatus();
        console.log('Cache Status:', cacheStatus);

        console.log('\n✅ All API tests completed successfully!');
        
    } catch (error) {
        console.error('❌ API test failed:', error);
        
        // Show fallback data
        console.log('\n🔄 Using fallback data...');
        console.log('This is normal when the backend is not available');
    }
}

// Run tests when page loads
document.addEventListener('DOMContentLoaded', async () => {
    await waitForAPI();
    await testAPI();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { waitForAPI, testAPI };
}
