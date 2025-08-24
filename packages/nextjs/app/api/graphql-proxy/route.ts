import { NextRequest, NextResponse } from "next/server";

const ENVIO_ENDPOINT = process.env.NEXT_PUBLIC_ENVIO_PRODUCTION_URL || "http://localhost:8080/v1/graphql";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(ENVIO_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error("Envio GraphQL request failed:", response.status, response.statusText);
      return NextResponse.json(
        {
          error: "Indexer service unavailable",
          message: "Please try again later. The indexer may be syncing.",
        },
        { status: 503 },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("GraphQL proxy error:", error);
    return NextResponse.json(
      {
        error: "Service temporarily unavailable",
        message: "The indexer service is currently unavailable. Please try again later.",
      },
      { status: 503 },
    );
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
