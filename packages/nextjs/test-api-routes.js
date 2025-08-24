#!/usr/bin/env node

/**
 * Simple test script to verify API routes work locally
 * Run with: node test-api-routes.js
 */

const http = require("http");

const BASE_URL = "http://localhost:3000";

async function testEndpoint(endpoint, method = "GET", body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 3000,
      path: endpoint,
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (body && method !== "GET") {
      options.headers["Content-Length"] = Buffer.byteLength(JSON.stringify(body));
    }

    const req = http.request(options, res => {
      let data = "";
      res.on("data", chunk => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on("error", error => {
      reject(error);
    });

    if (body && method !== "GET") {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log("🧪 Testing ACAL API Routes...\n");

  const tests = [
    {
      name: "Health Check",
      endpoint: "/api/arbitro/health",
      method: "GET",
    },
    {
      name: "Get Order (ID: 0)",
      endpoint: "/api/arbitro/order/0",
      method: "GET",
    },
    {
      name: "Payment Confirmation (Mock)",
      endpoint: "/api/arbitro/confirm-payment",
      method: "POST",
      body: {
        orderId: "0",
        takerAddress: "0x1234567890123456789012345678901234567890",
        proofHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      },
    },
  ];

  for (const test of tests) {
    try {
      console.log(`🔍 Testing: ${test.name}`);
      const result = await testEndpoint(test.endpoint, test.method, test.body);

      if (result.status === 200) {
        console.log(`✅ Success: ${test.name}`);
        console.log(`   Status: ${result.status}`);
        if (typeof result.data === "object") {
          console.log(`   Response:`, JSON.stringify(result.data, null, 2));
        } else {
          console.log(`   Response: ${result.data}`);
        }
      } else {
        console.log(`❌ Failed: ${test.name}`);
        console.log(`   Status: ${result.status}`);
        console.log(`   Response:`, result.data);
      }
    } catch (error) {
      console.log(`❌ Error testing ${test.name}:`, error.message);
    }
    console.log(""); // Empty line for spacing
  }

  console.log("🏁 Testing completed!\n");
  console.log("💡 Next steps:");
  console.log("   1. If health check fails, ensure ARBITRO_PRIVATE_KEY is set in .env.local");
  console.log("   2. If order tests fail, verify Monad RPC connectivity");
  console.log("   3. Ready to deploy to Vercel once tests pass!");
}

// Check if Next.js server is running
async function checkServer() {
  try {
    await testEndpoint("/api/arbitro/health");
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();

  if (!serverRunning) {
    console.log("❌ Next.js server not running on localhost:3000");
    console.log("");
    console.log("🚀 Start the server first:");
    console.log("   cd packages/nextjs");
    console.log("   yarn dev");
    console.log("");
    console.log("Then run this test script again.");
    return;
  }

  await runTests();
}

main().catch(console.error);
