// debug-kling.js - Complete debugging script
import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const KLING_API_BASE = "https://api.klingai.com/v1";
const ACCESS_KEY = process.env.VITE_KLING_ACCESS_KEY;
const SECRET_KEY = process.env.VITE_KLING_SECRET_KEY;

console.log("🔍 ===== KLING AI COMPREHENSIVE DEBUG =====\n");

// Step 1: Check environment variables
console.log("📋 STEP 1: Environment Variables Check");
console.log("─────────────────────────────────────────");
console.log("Access Key exists:", !!ACCESS_KEY);
console.log("Access Key length:", ACCESS_KEY?.length || 0);
console.log('Access Key starts with "Ag_":', ACCESS_KEY?.startsWith("Ag_"));
console.log("Access Key (first 25 chars):", ACCESS_KEY?.substring(0, 25) + "...");
console.log("");
console.log("Secret Key exists:", !!SECRET_KEY);
console.log("Secret Key length:", SECRET_KEY?.length || 0);
console.log("Secret Key (first 25 chars):", SECRET_KEY?.substring(0, 25) + "...");
console.log("");

if (!ACCESS_KEY || !SECRET_KEY) {
  console.log("❌ CRITICAL: API keys are missing!");
  console.log("Check your .env file\n");
  process.exit(1);
}

if (!ACCESS_KEY.startsWith("Ag_")) {
  console.log('⚠️ WARNING: Access Key should start with "Ag_"\n');
}

// Step 2: Check .env file directly
console.log("📋 STEP 2: Direct .env File Check");
console.log("─────────────────────────────────────────");
try {
  const envContent = fs.readFileSync(".env", "utf8");
  const lines = envContent.split("\n");

  lines.forEach((line) => {
    if (line.includes("KLING")) {
      const key = line.split("=")[0];
      const value = line.split("=")[1];
      console.log(`${key}: ${value?.substring(0, 25)}...`);

      // Check for common issues
      if (line.includes(" = ")) {
        console.log('⚠️ WARNING: Space around "=" detected in .env');
      }
      if (value?.startsWith('"') || value?.startsWith("'")) {
        console.log("⚠️ WARNING: Quotes detected in .env value");
      }
    }
  });
  console.log("");
} catch (error) {
  console.log("❌ Cannot read .env file:", error.message);
  console.log("");
}

// Step 3: Generate token
console.log("📋 STEP 3: Token Generation Test");
console.log("─────────────────────────────────────────");

const generateKlingToken = () => {
  try {
    const header = { alg: "HS256", typ: "JWT" };
    const payload = {
      iss: ACCESS_KEY,
      exp: Math.floor(Date.now() / 1000) + 1800,
      nbf: Math.floor(Date.now() / 1000) - 5,
    };

    const base64UrlEncode = (obj) => {
      return Buffer.from(JSON.stringify(obj))
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
    };

    const headerEncoded = base64UrlEncode(header);
    const payloadEncoded = base64UrlEncode(payload);

    const signature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(`${headerEncoded}.${payloadEncoded}`)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    const token = `${headerEncoded}.${payloadEncoded}.${signature}`;

    console.log("✅ Token generated successfully");
    console.log("Token (first 50 chars):", token.substring(0, 50) + "...");
    console.log("Token length:", token.length);
    console.log("");

    return token;
  } catch (error) {
    console.log("❌ Token generation failed:", error.message);
    console.log("");
    return null;
  }
};

const token = generateKlingToken();

if (!token) {
  console.log("❌ Cannot proceed without valid token\n");
  process.exit(1);
}

// Step 4: Test multiple API endpoints
console.log("📋 STEP 4: API Endpoint Tests");
console.log("─────────────────────────────────────────");

const testEndpoints = async () => {
  const endpoints = [
    {
      name: "User Info",
      method: "GET",
      url: `${KLING_API_BASE}/users/me`,
    },
    {
      name: "User Credits",
      method: "GET",
      url: `${KLING_API_BASE}/users/credits`,
    },
    {
      name: "Account Info",
      method: "GET",
      url: `${KLING_API_BASE}/account`,
    },
    {
      name: "Balance Check",
      method: "GET",
      url: `${KLING_API_BASE}/balance`,
    },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\nTesting: ${endpoint.name}`);
      console.log(`URL: ${endpoint.url}`);

      const response = await axios({
        method: endpoint.method,
        url: endpoint.url,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
        validateStatus: () => true,
      });

      console.log(`Status: ${response.status}`);
      console.log("Response:", JSON.stringify(response.data, null, 2));

      if (response.status === 200) {
        console.log("✅ Endpoint working!");
        if (response.data.credits || response.data.balance) {
          console.log("💰 FOUND CREDITS:", response.data);
        }
      } else if (response.status === 404) {
        console.log("⚠️ Endpoint not found");
      } else if (response.status === 401 || response.status === 403) {
        console.log("❌ Authentication failed - Wrong keys!");
      } else if (response.status === 429) {
        console.log("❌ No balance on this account");
      }
    } catch (error) {
      console.log("❌ Error:", error.message);
    }
  }
};

await testEndpoints();

// Step 5: Test actual video generation
console.log("\n📋 STEP 5: Video Generation API Test");
console.log("─────────────────────────────────────────");

const testVideoGeneration = async () => {
  try {
    console.log("Testing video generation endpoint...");

    const videoRequest = {
      model_name: "kling-v1-5",
      image: "https://via.placeholder.com/512x512/FF5733/FFFFFF?text=Test+Image",
      image_tail: "",
      prompt: "test video generation",
      negative_prompt: "blurry, low quality",
      cfg_scale: 0.5,
      mode: "std",
      duration: "5",
    };

    console.log("Request payload:", JSON.stringify(videoRequest, null, 2));
    console.log("");

    const response = await axios.post(`${KLING_API_BASE}/videos/image2video`, videoRequest, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
      validateStatus: () => true,
    });

    console.log("📡 Video Generation Response:");
    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);
    console.log("Response Data:", JSON.stringify(response.data, null, 2));
    console.log("");

    if (response.status === 200) {
      console.log("✅ SUCCESS! Video generation started!");
      console.log("Your account HAS credits and API is working!");
      console.log("Task ID:", response.data.data?.task_id);
    } else if (response.status === 429 && response.data.code === 1102) {
      console.log("❌ PROBLEM IDENTIFIED:");
      console.log("   Error Code: 1102");
      console.log("   Message: Account balance not enough");
      console.log("");
      console.log("🔍 This means:");
      console.log("   1. Your API keys are VALID (authentication works)");
      console.log("   2. But they belong to an account with ZERO credits");
      console.log("");
      console.log("📝 Possible Reasons:");
      console.log("   a) You're using keys from the OLD account (Dom's email)");
      console.log("   b) The NEW account keys were not properly saved in .env");
      console.log("   c) The invoice is not fully processed yet (wait 1 hour)");
      console.log("   d) Credits are in a different organization/team account");
      console.log("");
      console.log("✅ SOLUTION:");
      console.log("   1. Log in to the NEW account (with 166 credits)");
      console.log("   2. Go to: https://app.klingai.com/global/dev/apiKey");
      console.log("   3. Copy the EXACT Access Key and Secret Key");
      console.log("   4. Open your .env file");
      console.log("   5. Replace BOTH keys completely");
      console.log("   6. Save .env file");
      console.log("   7. Run: pkill -9 node");
      console.log("   8. Restart server");
      console.log("   9. Run this debug script again");
    } else if (response.status === 401 || response.status === 403) {
      console.log("❌ AUTHENTICATION FAILED");
      console.log("   Your API keys are INVALID or EXPIRED");
      console.log("   Generate new keys from: https://app.klingai.com/global/dev/apiKey");
    } else {
      console.log("⚠️ Unexpected response:", response.status);
    }
  } catch (error) {
    console.log("❌ Request failed:", error.message);
    if (error.response) {
      console.log("Response data:", JSON.stringify(error.response.data, null, 2));
    }
  }
};

await testVideoGeneration();

// Step 6: Final recommendations
console.log("\n📋 STEP 6: Recommendations");
console.log("─────────────────────────────────────────");
console.log("");
console.log("🎯 Next Steps:");
console.log("");
console.log("1. Review the output above carefully");
console.log("");
console.log('2. If you see "code: 1102" error:');
console.log("   → Your keys are valid but account has no credits");
console.log("   → Double-check you're using keys from the NEW account");
console.log("   → Log in to Kling AI and verify which account has credits");
console.log("");
console.log("3. If you see 401/403 errors:");
console.log("   → Your keys are invalid or expired");
console.log("   → Generate fresh keys from the API Key page");
console.log("");
console.log("4. If you see 200 success:");
console.log("   → Everything is working! Your main server should work too");
console.log("");
console.log("5. To verify which account has credits:");
console.log("   → Log in to: https://app.klingai.com/global/dev");
console.log("   → Check Order Management → Trial Package order");
console.log("   → Check Usage Query → See remaining credits");
console.log("   → Make sure you copy keys from THIS account");
console.log("");
console.log("═══════════════════════════════════════════");
console.log("🔍 DEBUG COMPLETE");
console.log("═══════════════════════════════════════════\n");
