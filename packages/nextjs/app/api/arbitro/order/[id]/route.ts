import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";

const ESCROW_ABI = [
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

async function createProviderWithFailover() {
  for (const rpcUrl of CONFIG.MONAD_RPC_URLS) {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      await provider.getNetwork(); // Test connection
      return provider;
    } catch (error) {
      console.log(`RPC failed: ${rpcUrl} - ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }
  }
  throw new Error("All RPC endpoints failed");
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id;

    // Create provider with failover
    const provider = await createProviderWithFailover();

    // Create contract instance
    const escrowContract = new ethers.Contract(CONFIG.ESCROW_ADDRESS, ESCROW_ABI, provider);

    // Get order from blockchain
    const chainOrder = await escrowContract.orders(orderId);

    return NextResponse.json({
      success: true,
      blockchain: {
        maker: chainOrder[0],
        taker: chainOrder[1],
        cr: chainOrder[2],
        hashQR: chainOrder[3],
        mxn: chainOrder[4].toString(),
        mon: ethers.formatEther(chainOrder[5]),
        expiry: chainOrder[6].toString(),
        status: chainOrder[7].toString(),
        makerBond: ethers.formatEther(chainOrder[8]),
        takerBond: ethers.formatEther(chainOrder[9]),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
