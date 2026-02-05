import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // ⚡ VERCEL BUILT-IN GEOLOCATION (Zero Latency)
    // Vercel deployment par ye headers automatically milte hain
    const city = req.headers.get("x-vercel-ip-city") || "UNKNOWN SECTOR";
    const country = req.headers.get("x-vercel-ip-country") || "PK";
    const region = req.headers.get("x-vercel-ip-country-region") || "N/A";

    // 🖥️ Development Check (Localhost bypass)
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    if (ip === "127.0.0.1" || ip === "::1") {
      return NextResponse.json({ 
        city: "HYDERABAD", // Dev mode mein Hyderabad dikhao
        region: "SINDH", 
        country_name: "Pakistan" 
      });
    }

    return NextResponse.json({
      city: city.toUpperCase(),
      region: region,
      country_name: country
    });

  } catch (error) {
    console.error("📍 Location Error:", error);
    return NextResponse.json({ 
        city: "UNKNOWN SECTOR", 
        region: "N/A" 
    });
  }
}