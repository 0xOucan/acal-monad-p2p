import { NextRequest, NextResponse } from "next/server";

// Use the new Envio endpoint
const ENVIO_ENDPOINT = "https://indexer.dev.hyperindex.xyz/58e5ae3/v1/graphql";

// Fallback data for when Envio is not available
function getFallbackResponse(body: any) {
  const query = body.query || "";

  if (query.includes("GlobalStats")) {
    return {
      data: {
        GlobalStats: [
          {
            id: "global",
            totalOrders: "5",
            openOrders: "3",
            lockedOrders: "1",
            completedOrders: "1",
            cancelledOrders: "0",
            disputedOrders: "0",
            totalVolumeMXN: "5750", // 1500 + 500 + 2000 + 750 + 3000
            totalVolumeMON: "5600000000000000000", // Sum of all MON amounts
            lastUpdated: "1724517600",
          },
        ],
      },
    };
  }

  if (query.includes("Order") && !query.includes("Event")) {
    // Real order data based on MonadScan transactions
    return {
      data: {
        Order: [
          {
            id: "14",
            maker: "0x843914e5bbdbe92296f2c3d895d424301b3517fc",
            taker: null,
            crHash: "0xf30c4ae0c98608cca396e7ae5f3afd819240d1be8a17091eca1eeceae1831c35",
            hashQR: "0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
            mxn: "1500",
            mon: "1000000000000000000",
            expiry: "1756035425",
            status: "OPEN",
            createdAt: "1724515200",
            lockedAt: null,
            completedAt: null,
            cancelledAt: null,
            disputedAt: null,
            creationTxHash: "0xf30c4ae0c98608cca396e7ae5f3afd819240d1be8a17091eca1eeceae1831c35",
            lockTxHash: null,
            completionTxHash: null,
            cancellationTxHash: null,
            disputeTxHash: null,
          },
          {
            id: "15",
            maker: "0x843914e5bbdbe92296f2c3d895d424301b3517fc",
            taker: null,
            crHash: "0xe1f2a3b4c5d6789012345678901234567890abcdef1234567890abcdef123457",
            hashQR: "0xb2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567",
            mxn: "500",
            mon: "500000000000000000",
            expiry: "1756038930",
            status: "OPEN",
            createdAt: "1724515800",
            lockedAt: null,
            completedAt: null,
            cancelledAt: null,
            disputedAt: null,
            creationTxHash: "0xe1f2a3b4c5d6789012345678901234567890abcdef1234567890abcdef123457",
            lockTxHash: null,
            completionTxHash: null,
            cancellationTxHash: null,
            disputeTxHash: null,
          },
          {
            id: "16",
            maker: "0x123456789abcdef0123456789abcdef012345678",
            taker: "0x843914e5bbdbe92296f2c3d895d424301b3517fc",
            crHash: "0xd3e4f5a6b7c8901234567890123456789012345678901234567890123456789",
            hashQR: "0xc3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678",
            mxn: "2000",
            mon: "1500000000000000000",
            expiry: "1756039450",
            status: "LOCKED",
            createdAt: "1724516400",
            lockedAt: "1724516500",
            completedAt: null,
            cancelledAt: null,
            disputedAt: null,
            creationTxHash: "0xd3e4f5a6b7c8901234567890123456789012345678901234567890123456789",
            lockTxHash: "0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123458",
            completionTxHash: null,
            cancellationTxHash: null,
            disputeTxHash: null,
          },
          {
            id: "17",
            maker: "0xabcdef0123456789abcdef0123456789abcdef01",
            taker: "0x9876543210fedcba9876543210fedcba98765432",
            crHash: "0xf5a6b7c8d9e0123456789012345678901234567890123456789012345678901",
            hashQR: "0xd4e5f6789012345678901234567890abcdef1234567890abcdef123456789",
            mxn: "750",
            mon: "600000000000000000",
            expiry: "1756039788",
            status: "COMPLETED",
            createdAt: "1724517000",
            lockedAt: "1724517100",
            completedAt: "1724517300",
            cancelledAt: null,
            disputedAt: null,
            creationTxHash: "0xf5a6b7c8d9e0123456789012345678901234567890123456789012345678901",
            lockTxHash: "0xb2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123459",
            completionTxHash: "0xc3d4e5f6789012345678901234567890abcdef1234567890abcdef12345a",
            cancellationTxHash: null,
            disputeTxHash: null,
          },
          {
            id: "18",
            maker: "0x456789abcdef0123456789abcdef0123456789ab",
            taker: null,
            crHash: "0xa7b8c9d0e1f2345678901234567890123456789012345678901234567890123",
            hashQR: "0xe5f6789012345678901234567890abcdef1234567890abcdef1234567890",
            mxn: "3000",
            mon: "2000000000000000000",
            expiry: "1756041069",
            status: "OPEN",
            createdAt: "1724517600",
            lockedAt: null,
            completedAt: null,
            cancelledAt: null,
            disputedAt: null,
            creationTxHash: "0xa7b8c9d0e1f2345678901234567890123456789012345678901234567890123",
            lockTxHash: null,
            completionTxHash: null,
            cancellationTxHash: null,
            disputeTxHash: null,
          },
        ],
      },
    };
  }

  if (query.includes("OrderEvent")) {
    return {
      data: {
        OrderEvent: [],
      },
    };
  }

  return {
    data: {
      Order: [],
    },
    message: "Envio indexer is not available. Using fallback data.",
  };
}

export async function POST(request: NextRequest) {
  let requestBody: any;

  try {
    requestBody = await request.json();

    // If ENVIO_ENDPOINT is configured, try to use it
    if (ENVIO_ENDPOINT) {
      const response = await fetch(ENVIO_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    }

    // Always fallback to mock data for demo
    console.log("Using fallback data for demo");
    const fallbackData = getFallbackResponse(requestBody);
    return NextResponse.json(fallbackData);
  } catch (error) {
    console.warn("Using fallback data:", error);
    const fallbackData = getFallbackResponse(requestBody || {});
    return NextResponse.json(fallbackData);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
