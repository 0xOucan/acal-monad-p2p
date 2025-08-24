import { NextResponse } from "next/server";
import { ethers } from "ethers";

export async function GET() {
  try {
    const arbitroPrivateKey = process.env.ARBITRO_PRIVATE_KEY;

    if (!arbitroPrivateKey) {
      return NextResponse.json({ error: "ARBITRO_PRIVATE_KEY not configured" }, { status: 500 });
    }

    // Create wallet to get address
    const wallet = new ethers.Wallet(arbitroPrivateKey);

    return NextResponse.json({
      status: "healthy",
      arbitro: wallet.address,
      timestamp: new Date().toISOString(),
      environment: "vercel",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Health check failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
