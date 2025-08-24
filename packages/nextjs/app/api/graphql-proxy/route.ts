import { NextRequest, NextResponse } from "next/server";

const ENVIO_ENDPOINT = process.env.NEXT_PUBLIC_ENVIO_PRODUCTION_URL || "http://localhost:8080/v1/graphql";

// Fallback data for when Envio is not available
function getFallbackResponse(body: any) {
  const query = body.query || "";

  if (query.includes("GlobalStats")) {
    return {
      data: {
        globalStats: {
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
      },
    };
  }

  if (query.includes("orders")) {
    return {
      data: {
        orders: [],
      },
    };
  }

  if (query.includes("orderEvents")) {
    return {
      data: {
        orderEvents: [],
      },
    };
  }

  return {
    data: {},
    message: "Envio indexer is not available. Using fallback data.",
  };
}

export async function POST(request: NextRequest) {
  let requestBody: any;

  try {
    requestBody = await request.json();

    const response = await fetch(ENVIO_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.warn("Envio service unavailable, using fallback data");
      const fallbackData = getFallbackResponse(requestBody);
      return NextResponse.json(fallbackData);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.warn("Envio service error, using fallback data:", error);
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
