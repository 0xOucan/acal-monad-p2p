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
    console.log(`Auto-resolving order ${orderId} with verdict ${verdict}`);

    const provider = await createProviderWithFailover();
    const arbitroWallet = new ethers.Wallet(process.env.ARBITRO_PRIVATE_KEY!, provider);
    const escrowContract = new ethers.Contract(CONFIG.ESCROW_ADDRESS, ESCROW_ABI, arbitroWallet);

    // Check if order is in disputed state
    const chainOrder = await escrowContract.orders(orderId);
    const status = Number(chainOrder[7]);

    if (status !== ORDER_STATUS.DISPUTED && status !== ORDER_STATUS.LOCKED) {
      console.log(`Order ${orderId} not in resolvable state (status: ${status})`);
      return false;
    }

    // Execute resolution on blockchain
    const tx = await escrowContract.resolveDispute(orderId, verdict);
    console.log(`Resolution transaction sent: ${tx.hash}`);

    try {
      const receipt = await tx.wait();
      console.log(`Order ${orderId} resolved in block ${receipt.blockNumber}`);
      return true;
    } catch (receiptError) {
      console.log("Receipt timeout, checking order status...");

      // Wait and check if order status changed
      await new Promise(resolve => setTimeout(resolve, 3000));

      const updatedOrder = await escrowContract.orders(orderId);
      const newStatus = Number(updatedOrder[7]);

      if (newStatus === ORDER_STATUS.COMPLETED) {
        console.log(`Order ${orderId} was successfully resolved despite RPC error`);
        return true;
      } else {
        console.log(`Order ${orderId} status unchanged: ${newStatus}`);
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

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const orderId = params.id;
    const { verdict, reason } = await request.json();

    console.log(`Manual resolution for order ${orderId}: verdict ${verdict}`);

    // Validate verdict is a valid number (0=maker, 1=taker, 2=split)
    if (verdict === undefined || verdict < 0 || verdict > 2) {
      return NextResponse.json(
        { success: false, error: "Invalid verdict. Must be 0 (maker), 1 (taker), or 2 (split)" },
        { status: 400 },
      );
    }

    const resolved = await autoResolveOrder(orderId, verdict);

    if (resolved) {
      return NextResponse.json({
        success: true,
        message: "Order resolved manually",
        orderId,
        verdict,
        reason,
      });
    } else {
      return NextResponse.json({ success: false, error: "Resolution failed" }, { status: 500 });
    }
  } catch (error) {
    console.error("Manual resolution error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
