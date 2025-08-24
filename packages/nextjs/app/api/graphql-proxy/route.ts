import { NextRequest, NextResponse } from "next/server";

// Always use fallback data for Vercel deployment until Envio indexer is properly deployed
const ENVIO_ENDPOINT = null; // Force fallback data

// Fallback data for when Envio is not available
function getFallbackResponse(body: any) {
  const query = body.query || "";

  if (query.includes("GlobalStats")) {
    return {
      data: {
        GlobalStats: [
          {
            id: "global",
            totalOrders: "0",
            openOrders: "0",
            lockedOrders: "0",
            completedOrders: "0",
            cancelledOrders: "0",
            disputedOrders: "0",
            totalVolumeMXN: "0",
            totalVolumeMON: "0",
            lastUpdated: "0",
          },
        ],
      },
    };
  }

  if (query.includes("Order") && !query.includes("Event")) {
    return {
      data: {
        Order: [],
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
