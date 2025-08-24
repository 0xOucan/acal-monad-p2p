// Test script to simulate real-world flow with external users
// This simulates the complete P2P escrow flow

const axios = require('axios');

// ============ SIMULATION CONFIGURATION ============
const CONFIG = {
    ARBITRO_SERVER: 'http://localhost:3001',
    ESCROW_ADDRESS: '0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e',
    
    // Simulated external users (in real world, these would be different wallets)
    MAKER: {
        address: '0xc095c7cA2B56b0F0DC572d5d4A9Eb1B37f4306a0',
        name: 'Carlos (Peso Seller)'
    },
    TAKER: {
        address: '0x742D35cc6634C0532925a3b8D34A32D11a8C5C95', 
        name: 'Maria (Peso Buyer)'
    }
};

// ============ SIMULATION FUNCTIONS ============

async function checkServerHealth() {
    try {
        console.log('🔍 Checking arbitro server health...');
        const response = await axios.get(`${CONFIG.ARBITRO_SERVER}/health`);
        console.log('✅ Server healthy:', response.data);
        return true;
    } catch (error) {
        console.log('❌ Server not running:', error.message);
        return false;
    }
}

async function simulateRealWorldFlow() {
    console.log('\n🌟 SIMULATING REAL-WORLD P2P ESCROW FLOW');
    console.log('==========================================\n');
    
    // STEP 1: Order Creation (would be done via mobile app)
    console.log('📱 STEP 1: Maker creates order via mobile app');
    console.log(`👤 ${CONFIG.MAKER.name} wants to sell 150 pesos for MON`);
    console.log('🔗 Transaction: createOrder(crHash, hashQR, 150, expiry)');
    console.log('📦 Order ID 3 created and SponsorPool funds maker bond\n');
    
    // STEP 2: Order Locking (would be done via mobile app)
    console.log('📱 STEP 2: Taker locks order via mobile app');
    console.log(`👤 ${CONFIG.TAKER.name} wants to buy those 150 pesos`);
    console.log('💰 Pays 1.55 ETH (1.5 MON + 0.05 taker bond)');
    console.log('🔒 Order locked, waiting for real-world payment\n');
    
    // STEP 3: Off-chain peso transfer
    console.log('🏪 STEP 3: Real-world peso transfer');
    console.log(`💵 ${CONFIG.MAKER.name} transfers 150 pesos to ${CONFIG.TAKER.name}`);
    console.log('📸 Maria takes photo of received cash');
    console.log('⏳ Maria confirms payment in mobile app...\n');
    
    // STEP 4: Payment confirmation to arbitro server
    console.log('🤖 STEP 4: Auto-resolution by arbitro server');
    console.log('📡 Mobile app sends payment confirmation to arbitro server...');
    
    const orderExists = await checkOrderStatus('3');
    if (!orderExists) {
        console.log('⚠️  Order 3 not found in server. Make sure:');
        console.log('   1. Arbitro server is running');
        console.log('   2. Order 3 is locked on blockchain');
        console.log('   3. Server is monitoring blockchain events');
        return;
    }
    
    // Simulate payment confirmation
    await simulatePaymentConfirmation('3');
}

async function checkOrderStatus(orderId) {
    try {
        console.log(`🔍 Checking order ${orderId} status...`);
        const response = await axios.get(`${CONFIG.ARBITRO_SERVER}/order/${orderId}`);
        
        if (response.data.success) {
            console.log('📊 Order status:', response.data);
            return true;
        } else {
            console.log('❌ Order not found');
            return false;
        }
    } catch (error) {
        console.log('❌ Error checking order:', error.message);
        return false;
    }
}

async function simulatePaymentConfirmation(orderId) {
    try {
        console.log(`💰 Simulating payment confirmation for order ${orderId}...`);
        
        const confirmationData = {
            orderId: orderId,
            takerAddress: CONFIG.TAKER.address,
            proofHash: '0x' + 'deadbeef'.repeat(8), // 32-byte hash of payment proof
            signature: '0x' + '1234567890'.repeat(13) // Simulated signature
        };
        
        console.log('📡 Sending to arbitro server...');
        const response = await axios.post(
            `${CONFIG.ARBITRO_SERVER}/confirm-payment`, 
            confirmationData
        );
        
        if (response.data.success) {
            console.log('✅ PAYMENT CONFIRMED AND AUTO-RESOLVED!');
            console.log('📄 Response:', response.data);
            console.log('\n🎉 FLOW COMPLETED SUCCESSFULLY!');
            console.log('💰 Maker received: 1.5 MON + 0.12 subsidy = 1.62 MON');
            console.log('🏦 SponsorPool: Paid 0.12 subsidy, recovered 0.05 maker bond');
            console.log('⚡ Total time: ~30 seconds from confirmation to resolution');
        } else {
            console.log('❌ Payment confirmation failed:', response.data);
        }
        
    } catch (error) {
        console.log('❌ Error confirming payment:', error.message);
        
        if (error.response) {
            console.log('📄 Server response:', error.response.data);
        }
    }
}

async function showProductionScenario() {
    console.log('\n🏭 PRODUCTION SCENARIO');
    console.log('=====================\n');
    
    console.log('📱 MOBILE APP INTEGRATION:');
    console.log('  • Maker creates order → calls createOrder() directly');
    console.log('  • Taker locks order → calls lockOrder() directly');
    console.log('  • Payment confirmation → POST /confirm-payment\n');
    
    console.log('🤖 ARBITRO SERVER:');
    console.log('  • Monitors OrderLocked events');
    console.log('  • Receives payment confirmations');
    console.log('  • Auto-resolves with resolveDispute(id, 0)');
    console.log('  • Logs all actions for audit\n');
    
    console.log('🔐 SECURITY FEATURES:');
    console.log('  • Private key in HSM/secure storage');
    console.log('  • Rate limiting on API endpoints');
    console.log('  • Signature validation for confirmations');
    console.log('  • Manual override for edge cases\n');
    
    console.log('⚡ PERFORMANCE:');
    console.log('  • Auto-resolution in ~5-10 seconds');
    console.log('  • Handles multiple concurrent orders');
    console.log('  • Fallback to manual resolution if needed');
}

// ============ MAIN EXECUTION ============
async function main() {
    console.log('🚀 ACAL ARBITRO SERVER - REAL WORLD FLOW TEST\n');
    
    // Check if server is running
    const serverReady = await checkServerHealth();
    
    if (serverReady) {
        await simulateRealWorldFlow();
    } else {
        console.log('\n🛠️  TO START THE ARBITRO SERVER:');
        console.log('1. cd arbitro-server');
        console.log('2. npm install');
        console.log('3. cp config.env.template .env');
        console.log('4. Edit .env with your ARBITRO_PRIVATE_KEY');
        console.log('5. npm start');
        console.log('\nThen run this test again: npm test');
    }
    
    await showProductionScenario();
}

// Run the simulation
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { simulateRealWorldFlow, checkOrderStatus };
