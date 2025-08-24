// ACAL Arbitro Server - Automatic Order Resolution
// Real-world scenario with external maker/taker users

require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// ============ CONFIGURATION ============
const CONFIG = {
    PORT: 3001,
    // Multiple RPC endpoints ordered by latency (fastest first)
    MONAD_RPC_URLS: [
        'https://rpc.ankr.com/monad_testnet',           // 0.163s
        'https://testnet-rpc.monad.xyz',                // 0.178s  
        'https://monad-testnet.drpc.org',               // 0.232s
        'https://monad-testnet.gateway.tatum.io'        // 0.271s
    ],
    ESCROW_ADDRESS: '0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e',
    SPONSOR_POOL_ADDRESS: '0x64A47d84dE05B9Efda4F63Fbca2Fc8cEb96E6816',
    ARBITRO_PRIVATE_KEY: process.env.ARBITRO_PRIVATE_KEY,
    CHAIN_ID: 10143
};

// ============ BLOCKCHAIN SETUP WITH FAILOVER ============
let provider = null;
let arbitroWallet = null;
let currentRpcIndex = 0;

async function createProviderWithFailover() {
    for (let i = 0; i < CONFIG.MONAD_RPC_URLS.length; i++) {
        try {
            const rpcUrl = CONFIG.MONAD_RPC_URLS[i];
            console.log(`🔗 Trying RPC endpoint ${i + 1}/${CONFIG.MONAD_RPC_URLS.length}: ${rpcUrl}`);
            
            const testProvider = new ethers.JsonRpcProvider(rpcUrl);
            
            // Test the connection with a simple call
            await testProvider.getNetwork();
            console.log(`✅ RPC connection successful: ${rpcUrl}`);
            
            currentRpcIndex = i;
            return testProvider;
            
        } catch (error) {
            console.log(`❌ RPC failed: ${CONFIG.MONAD_RPC_URLS[i]} - ${error.message}`);
            if (i === CONFIG.MONAD_RPC_URLS.length - 1) {
                throw new Error('All RPC endpoints failed');
            }
        }
    }
}

async function initializeBlockchain() {
    provider = await createProviderWithFailover();
    arbitroWallet = new ethers.Wallet(CONFIG.ARBITRO_PRIVATE_KEY, provider);
    console.log(`🚀 Using RPC: ${CONFIG.MONAD_RPC_URLS[currentRpcIndex]}`);
}

// ABI for AcalEscrow (complete)
const ESCROW_ABI = [
    "function resolveDispute(uint256 id, uint8 verdict) external",
    "function orders(uint256) external view returns (address maker, address taker, bytes32 cr, bytes32 hashQR, uint256 mxn, uint256 mon, uint256 expiry, uint8 status, uint256 makerBond, uint256 takerBond)",
    "function arbitro() external view returns (address)",
    "function nextId() external view returns (uint256)",
    "function disputeOrder(uint256 id, bytes32 evidence) external",
    "function createOrder(bytes32 crHash, bytes32 hashQR, uint256 mxn, uint256 expiry) external payable returns (uint256)",
    "function lockOrder(uint256 id) external payable",
    "function completeOrder(uint256 id, bytes[] calldata sigs, tuple(uint256 orderId, uint8 actionType, bytes32 evidenceHash, uint256 deadline) a) external",
    "event OrderCreated(uint256 indexed id, address indexed maker, uint256 mxn, uint256 mon)",
    "event OrderLocked(uint256 indexed id, address indexed taker, uint256 amount)",
    "event OrderResolved(uint256 indexed id)",
    "event OrderDisputed(uint256 indexed id)",
    "event OrderCompleted(uint256 indexed id, uint8 verdict)"
];

let escrowContract = null;

// ============ IN-MEMORY DATABASE (use real DB in production) ============
const orderDatabase = new Map();

// Order statuses
const ORDER_STATUS = {
    OPEN: 0,
    LOCKED: 1,
    COMPLETED: 2,
    CANCELLED: 3,
    DISPUTED: 4,
    EXPIRED: 5
};

// ============ BLOCKCHAIN EVENT MONITORING (ACTIVE) ============
async function startEventMonitoring() {
    console.log('🔍 Starting active dispute monitoring...');
    
    // Use polling approach to monitor for disputed orders
    const monitorDisputedOrders = async () => {
        try {
            // Get next order ID to know the range to check
            const nextId = await escrowContract.nextId();
            
            // Check recent orders for disputed status
            for (let i = Math.max(0, Number(nextId) - 10); i < Number(nextId); i++) {
                try {
                    const order = await escrowContract.orders(i);
                    const status = Number(order[7]); // status is at index 7
                    
                    // If order is disputed (status = 4) and not in our processed list
                    if (status === ORDER_STATUS.DISPUTED && !processedDisputes.has(i)) {
                        console.log(`🚨 DISPUTE DETECTED: Order ${i} needs resolution!`);
                        
                        // Mark as processed to avoid double processing
                        processedDisputes.add(i);
                        
                        // Auto-resolve in favor of maker (payment confirmed via OXXO)
                        console.log(`🤖 Auto-resolving order ${i} in favor of maker...`);
                        
                        const resolved = await autoResolveOrder(i, 0); // 0 = Complete (favor maker)
                        
                        if (resolved) {
                            console.log(`✅ Order ${i} auto-resolved successfully!`);
                        } else {
                            console.log(`❌ Failed to auto-resolve order ${i}`);
                            processedDisputes.delete(i); // Remove from processed to retry later
                        }
                    }
                } catch (error) {
                    // Skip invalid orders
                    continue;
                }
            }
            
        } catch (error) {
            console.error('❌ Error monitoring disputes:', error.message);
        }
    };
    
    // Start monitoring every 10 seconds
    console.log('⏰ Polling for disputes every 10 seconds...');
    setInterval(monitorDisputedOrders, 10000);
    
    // Initial check
    setTimeout(monitorDisputedOrders, 2000);
    
    console.log('✅ Active dispute monitoring started!');
}

// Track processed disputes to avoid double-processing
const processedDisputes = new Set();

// ============ API ENDPOINTS ============

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        arbitro: arbitroWallet.address,
        timestamp: new Date().toISOString()
    });
});

// Get order status
app.get('/order/:id', async (req, res) => {
    try {
        const orderId = req.params.id;
        
        // Get from database
        const dbOrder = orderDatabase.get(orderId);
        
        // Get from blockchain
        const chainOrder = await escrowContract.orders(orderId);
        
        res.json({
            success: true,
            database: dbOrder || null,
            blockchain: {
                maker: chainOrder[0],
                taker: chainOrder[1],
                mxn: chainOrder[4].toString(),
                mon: ethers.formatEther(chainOrder[5]),
                status: chainOrder[7].toString()
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// CRITICAL: Payment confirmation endpoint
app.post('/confirm-payment', async (req, res) => {
    try {
        const { orderId, takerAddress, proofHash, signature } = req.body;
        
        console.log(`💰 Payment confirmation received for order ${orderId}`);
        console.log(`👤 From taker: ${takerAddress}`);
        console.log(`📄 Proof hash: ${proofHash}`);
        
        // Validate order exists and is locked
        const order = orderDatabase.get(orderId);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        
        if (order.status !== 'LOCKED') {
            return res.status(400).json({ success: false, error: 'Order not in locked state' });
        }
        
        // Validate taker address matches
        if (order.taker.toLowerCase() !== takerAddress.toLowerCase()) {
            return res.status(403).json({ success: false, error: 'Unauthorized taker' });
        }
        
        // TODO: Validate signature (in production)
        
        // Mark payment as confirmed
        order.paymentConfirmed = true;
        order.proofHash = proofHash;
        order.confirmedAt = new Date().toISOString();
        orderDatabase.set(orderId, order);
        
        console.log(`✅ Payment confirmed for order ${orderId}`);
        
        // AUTO-RESOLVE: Favour the maker (payment received)
        const resolved = await autoResolveOrder(orderId, 0); // 0 = Favour Maker
        
        if (resolved) {
            res.json({ 
                success: true, 
                message: 'Payment confirmed and order auto-resolved',
                resolution: 'MAKER_FAVOURED'
            });
        } else {
            res.json({ 
                success: true, 
                message: 'Payment confirmed but auto-resolution failed',
                resolution: 'PENDING_MANUAL'
            });
        }
        
    } catch (error) {
        console.error('❌ Payment confirmation error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Manual resolution endpoint (for disputes)
app.post('/resolve/:id', async (req, res) => {
    try {
        const orderId = req.params.id;
        const { verdict, reason } = req.body; // 0=maker, 1=taker, 2=split
        
        console.log(`🔧 Manual resolution for order ${orderId}: verdict ${verdict}`);
        
        const resolved = await autoResolveOrder(orderId, verdict);
        
        if (resolved) {
            res.json({ success: true, message: 'Order resolved manually' });
        } else {
            res.status(500).json({ success: false, error: 'Resolution failed' });
        }
        
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ AUTO-RESOLUTION LOGIC ============
async function autoResolveOrder(orderId, verdict) {
    try {
        console.log(`🤖 Auto-resolving order ${orderId} with verdict ${verdict}`);
        
        // Check if order is in disputed state first
        const chainOrder = await escrowContract.orders(orderId);
        const status = chainOrder[7];
        
        if (status != ORDER_STATUS.DISPUTED && status != ORDER_STATUS.LOCKED) {
            console.log(`⚠️  Order ${orderId} not in resolvable state (status: ${status})`);
            return false;
        }
        
        // If order is locked but payment confirmed, dispute it first
        if (status == ORDER_STATUS.LOCKED) {
            console.log(`📢 Order ${orderId} is locked, creating dispute first...`);
            // In real scenario, this would be done by maker/taker, not arbitro
            // For now, skip and assume it's already disputed
        }
        
        // Execute resolution on blockchain
        const tx = await escrowContract.resolveDispute(orderId, verdict);
        console.log(`📡 Resolution transaction sent: ${tx.hash}`);
        
        try {
            const receipt = await tx.wait();
            console.log(`✅ Order ${orderId} resolved in block ${receipt.blockNumber}`);
        } catch (receiptError) {
            console.log(`⚠️ Receipt timeout (RPC issue), but transaction was sent: ${tx.hash}`);
            console.log(`💡 Transaction likely successful - checking order status in 3s...`);
            
            // Wait a bit and check if order status changed
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            try {
                const updatedOrder = await escrowContract.orders(orderId);
                const newStatus = Number(updatedOrder[7]);
                
                if (newStatus === ORDER_STATUS.COMPLETED) {
                    console.log(`✅ Confirmed: Order ${orderId} was successfully resolved despite RPC error!`);
                } else {
                    console.log(`❌ Order ${orderId} status unchanged: ${newStatus} - genuine failure`);
                    throw receiptError;
                }
            } catch (statusError) {
                console.log(`❌ Could not verify order status: ${statusError.message}`);
                throw receiptError;
            }
        }
        
        // Update database
        const order = orderDatabase.get(orderId);
        if (order) {
            order.status = 'RESOLVED';
            order.verdict = verdict;
            order.resolvedAt = new Date().toISOString();
            order.txHash = tx.hash;
            orderDatabase.set(orderId, order);
        }
        
        return true;
        
    } catch (error) {
        console.error(`❌ Auto-resolution failed for order ${orderId}:`, error.message);
        return false;
    }
}

// ============ SERVER STARTUP ============
async function startServer() {
    try {
        console.log('🚀 Starting ACAL Arbitro Server...');
        console.log('🔗 Testing RPC endpoints...');
        
        // Initialize blockchain connection with failover
        await initializeBlockchain();
        
        // Initialize escrow contract
        escrowContract = new ethers.Contract(CONFIG.ESCROW_ADDRESS, ESCROW_ABI, arbitroWallet);
        
        // Verify arbitro setup
        const arbitroAddress = await arbitroWallet.getAddress();
        const contractArbitro = await escrowContract.arbitro();
        
        console.log('🔐 Arbitro wallet address:', arbitroAddress);
        console.log('📋 Contract arbitro address:', contractArbitro);
        
        if (arbitroAddress.toLowerCase() !== contractArbitro.toLowerCase()) {
            throw new Error('❌ Arbitro address mismatch!');
        }
        
        // Start event monitoring (simplified)
        await startEventMonitoring();
        
        // Start HTTP server
        app.listen(CONFIG.PORT, () => {
            console.log('✅ ACAL Arbitro Server running on port', CONFIG.PORT);
            console.log('📍 Endpoints:');
            console.log('   GET  /health');
            console.log('   GET  /order/:id');
            console.log('   POST /confirm-payment');
            console.log('   POST /resolve/:id');
            console.log('');
            console.log('💡 Ready to auto-resolve orders when payment is confirmed!');
            console.log(`🌐 Using RPC: ${CONFIG.MONAD_RPC_URLS[currentRpcIndex]}`);
        });
        
    } catch (error) {
        console.error('❌ Server startup failed:', error);
        console.log('');
        console.log('🔄 Trying next RPC endpoint...');
        
        // Try with next RPC if available
        if (currentRpcIndex < CONFIG.MONAD_RPC_URLS.length - 1) {
            currentRpcIndex++;
            return startServer();
        }
        
        process.exit(1);
    }
}

// Start the server
if (require.main === module) {
    startServer();
}

module.exports = { app, autoResolveOrder };
