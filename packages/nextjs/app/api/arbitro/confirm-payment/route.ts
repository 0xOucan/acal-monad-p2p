import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";

const ESCROW_ABI = [
  "function resolveDispute(uint256 id, uint8 verdict) external",
  "function orders(uint256) external view returns (address maker, address taker, bytes32 cr, bytes32 hashQR, uint256 mxn, uint256 mon, uint256 expiry, uint8 status, uint256 makerBond, uint256 takerBond)",
];

const CONFIG = {
  MONAD_RPC_URLS: [
    "https://rpc.ankr.com/monad_testnet",
    "https://testnet-rpc.monad.xyz",
    "https://monad-testnet.drpc.org",
    "https://monad-testnet.gateway.tatum.io",
  ],
  ESCROW_ADDRESS: "0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e",
};

const ORDER_STATUS = {
  OPEN: 0,
  LOCKED: 1,
  COMPLETED: 2,
  CANCELLED: 3,
  DISPUTED: 4,
  EXPIRED: 5,
};

async function createProviderWithFailover() {
  for (const rpcUrl of CONFIG.MONAD_RPC_URLS) {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      await provider.getNetwork();
      return provider;
    } catch {
      continue;
    }
  }
  throw new Error("All RPC endpoints failed");
}

async function autoResolveOrder(orderId: string, verdict: number) {
  try {
    const provider = await createProviderWithFailover();
    const arbitroWallet = new ethers.Wallet(process.env.ARBITRO_PRIVATE_KEY!, provider);
    const escrowContract = new ethers.Contract(CONFIG.ESCROW_ADDRESS, ESCROW_ABI, arbitroWallet);

    // Check order status
    const chainOrder = await escrowContract.orders(orderId);
    const status = Number(chainOrder[7]);

    if (status !== ORDER_STATUS.DISPUTED && status !== ORDER_STATUS.LOCKED) {
      console.log(`Order ${orderId} not in resolvable state (status: ${status})`);
      return false;
    }

    // Execute resolution
    const tx = await escrowContract.resolveDispute(orderId, verdict);
    console.log(`Resolution transaction sent: ${tx.hash}`);

    try {
      await tx.wait();
      console.log(`Order ${orderId} resolved successfully`);
      return true;
    } catch (receiptError) {
      // RPC timeout but transaction likely succeeded
      console.log("Receipt timeout, checking status...");
      await new Promise(resolve => setTimeout(resolve, 3000));

      const updatedOrder = await escrowContract.orders(orderId);
      const newStatus = Number(updatedOrder[7]);

      if (newStatus === ORDER_STATUS.COMPLETED) {
        console.log(`Order ${orderId} successfully resolved despite RPC error`);
        return true;
      } else {
        throw receiptError;
      }
    }
  } catch (error) {
    console.error(
      `Auto-resolution failed for order ${orderId}:`,
      error instanceof Error ? error.message : String(error),
    );
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orderId, takerAddress, proofHash } = await request.json();

    console.log(`Payment confirmation received for order ${orderId}`);
    console.log(`From taker: ${takerAddress}`);
    console.log(`Proof hash: ${proofHash}`);

    // Validate required fields
    if (!orderId || !takerAddress || !proofHash) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Validate order exists and get current status
    const provider = await createProviderWithFailover();
    const escrowContract = new ethers.Contract(CONFIG.ESCROW_ADDRESS, ESCROW_ABI, provider);

    try {
      const order = await escrowContract.orders(orderId);
      const status = Number(order[7]);
      const taker = order[1];

      // Validate taker address matches
      if (taker.toLowerCase() !== takerAddress.toLowerCase()) {
        return NextResponse.json({ success: false, error: "Unauthorized taker" }, { status: 403 });
      }

      // Validate order is in locked state
      if (status !== ORDER_STATUS.LOCKED) {
        return NextResponse.json({ success: false, error: "Order not in locked state" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    console.log(`Payment confirmed for order ${orderId}`);

    // AUTO-RESOLVE: Favor the maker (payment received)
    const resolved = await autoResolveOrder(orderId, 0); // 0 = Favor Maker

    if (resolved) {
      return NextResponse.json({
        success: true,
        message: "Payment confirmed and order auto-resolved",
        resolution: "MAKER_FAVOURED",
      });
    } else {
      return NextResponse.json({
        success: true,
        message: "Payment confirmed but auto-resolution failed",
        resolution: "PENDING_MANUAL",
      });
    }
  } catch (error) {
    console.error("Payment confirmation error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
