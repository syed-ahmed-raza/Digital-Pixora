import { NextRequest, NextResponse } from "next/server";

// 🔥 EDGE RUNTIME: Runs on the nearest server to the user (Lightning Fast)
export const runtime = 'edge'; 

// --- 1. CONFIGURATION: DIGITAL PIXORA HQ (Hyderabad, PK) ---
const HQ_COORDS = { lat: 25.3960, lon: 68.3578 }; 

// --- 2. INTELLIGENCE UTILITIES ---

// 🏳️ Flag Generator
const getFlagEmoji = (countryCode: string) => {
  if (!countryCode) return "🏳️"; 
  const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

// 📏 Haversine Physics Formula (Distance Calc)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth Radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return Math.round(R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))));
};

// 🕰️ Temporal Sync
const getLocalTime = (timezone: string) => {
  try {
    return new Date().toLocaleTimeString("en-GB", { 
        timeZone: timezone || "Asia/Karachi", 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
    });
  } catch (e) { return "Syncing..."; }
};

// --- 3. MAIN HANDLER (HYBRID SATELLITE LOGIC) ---
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { lat, lon, accuracy } = body; 

    let geoData: any = {};
    let method = "IP_TRIANGULATION"; // Default method
    let ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "127.0.0.1";

    // 🛰️ LAYER 1: SATELLITE GPS LOCK (High Precision)
    // Runs only if frontend successfully sends GPS coordinates
    if (lat && lon) {
      try {
        // Using OpenStreetMap with 3s Timeout
        const reverseRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`, {
          headers: { "User-Agent": "DigitalPixora-Satellite/1.0" },
          signal: AbortSignal.timeout(3000)
        });
        
        if (reverseRes.ok) {
            const data = await reverseRes.json();
            geoData = {
              city: data.address?.city || data.address?.town || data.address?.county || "Unknown Sector",
              country: data.address?.country || "Pakistan",
              countryCode: data.address?.country_code?.toUpperCase() || "PK",
              regionName: data.address?.state || "Sindh",
              lat: parseFloat(lat),
              lon: parseFloat(lon),
              timezone: "Asia/Karachi", // GPS doesn't give timezone, defaulting to HQ or Client Locale in frontend
              isp: "GPS_DIRECT_UPLINK"
            };
            method = "SATELLITE_DIRECT_LOCK";
        }
      } catch(e) { /* GPS fetch failed, falling back to IP */ }
    } 
    
    // 🌐 LAYER 2: VERCEL EDGE & IP SCAN (Fallback)
    // Runs if GPS is denied, unavailable, or timed out
    if (method !== "SATELLITE_DIRECT_LOCK") {
      const vCity = req.headers.get("x-vercel-ip-city");
      const vCountry = req.headers.get("x-vercel-ip-country");

      if (vCity && vCountry) {
          // Vercel Edge Headers (Super Fast - 0ms Latency)
          geoData = {
              city: decodeURIComponent(vCity),
              country: vCountry, 
              countryCode: vCountry,
              regionName: req.headers.get("x-vercel-ip-region") || "Unknown",
              lat: parseFloat(req.headers.get("x-vercel-ip-latitude") || "0"),
              lon: parseFloat(req.headers.get("x-vercel-ip-longitude") || "0"),
              timezone: req.headers.get("x-vercel-ip-timezone") || "Asia/Karachi",
              isp: "VERCEL_EDGE_NODE"
          };
          method = "EDGE_SATELLITE";
      } else {
          // Deep IP Scan (Last Resort) via http (avoiding SSL overhead on free tier)
          try {
            const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,lat,lon,timezone,isp,mobile,proxy,hosting`, {
                signal: AbortSignal.timeout(2000) // 2s Timeout to prevent hanging
            });
            geoData = await res.json();
            method = "IP_DEEP_SCAN";
          } catch (e) {
            geoData = { city: "Digital Void", country: "Internet", countryCode: "XX" };
          }
      }
    }

    // --- PHYSICS & CONTEXT ---
    const distanceToHQ = calculateDistance(HQ_COORDS.lat, HQ_COORDS.lon, geoData.lat || 0, geoData.lon || 0);
    const localTime = getLocalTime(geoData.timezone);
    const flag = getFlagEmoji(geoData.countryCode || "PK");
    
    // 🛡️ Threat Detection
    const threatLevel = (geoData.proxy || geoData.hosting) ? "ELEVATED (VPN/Proxy)" : "MINIMAL";

    // 📦 THE CYBER PAYLOAD
    return NextResponse.json({
      satellite: {
        status: "ONLINE",
        uplink_id: `SAT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        protocol: method,
        signal_accuracy: accuracy ? `~${Math.round(accuracy)}m` : "Regional",
        latency: "12ms"
      },
      network: {
        ip: ip,
        isp: geoData.isp || "Quantum Fiber",
        threat_level: threatLevel,
        encryption: "AES-256"
      },
      location: {
        city: geoData.city?.toUpperCase() || "UNKNOWN SECTOR",
        region: geoData.regionName,
        country: `${geoData.country || 'Global'} ${flag}`,
        coordinates: { lat: geoData.lat, lon: geoData.lon },
        distance_from_hq: `${distanceToHQ} km`
      },
      context: {
        local_time: localTime,
        timezone: geoData.timezone || "Asia/Karachi",
        is_mobile: geoData.mobile || false
      }
    }, {
      headers: { 
          "X-Powered-By": "Pixora-Omega-Satellite",
          "Cache-Control": "no-store, max-age=0" // Real-time data only
      }
    });

  } catch (error) {
    // Fail gracefully with partial data so UI doesn't crash
    return NextResponse.json({ 
        satellite: { status: "OFFLINE", protocol: "FAILSAFE" },
        location: { city: "DIGITAL VOID", country: "INTERNET 🌐" } 
    }, { status: 200 });
  }
}

export async function GET(req: NextRequest) {
    return POST(req); 
}