import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
 
    
    const cityHeader = req.headers.get("x-vercel-ip-city");
    const countryHeader = req.headers.get("x-vercel-ip-country");
    const regionHeader = req.headers.get("x-vercel-ip-country-region");
    const latHeader = req.headers.get("x-vercel-ip-latitude");
    const longHeader = req.headers.get("x-vercel-ip-longitude");


    if (cityHeader && countryHeader) {
      return NextResponse.json({
        city: cityHeader.toUpperCase(),
        region: regionHeader,
        country: countryHeader,
        lat: latHeader,
        lon: longHeader,
        method: "EDGE_CACHE" 
      }, {
        headers: {
         
          "Cache-Control": "s-maxage=3600, stale-while-revalidate"
        }
      });
    }



    let ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "127.0.0.1";
    
  
    if (ip === "127.0.0.1" || ip === "::1") {
    
       const ipRes = await fetch('https://api.ipify.org?format=json');
       const ipData = await ipRes.json();
       ip = ipData.ip;
    }

   
   
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,org,as`);
    const data = await res.json();

    if (data.status === "fail") {
        throw new Error("IP Lookup Failed");
    }

    return NextResponse.json({
      city: data.city ? data.city.toUpperCase() : "UNKNOWN SECTOR",
      region: data.regionName,
      country: data.countryCode, 
      country_full: data.country,
      lat: data.lat,
      lon: data.lon,
      isp: data.isp, 
      timezone: data.timezone,
      method: "DEEP_SCAN"
    }, {
        headers: {
          "Cache-Control": "s-maxage=3600, stale-while-revalidate"
        }
    });

  } catch (error) {
    console.error("📍 Location Intelligence Error:", error);
    
   
    return NextResponse.json({ 
        city: "UNKNOWN SECTOR", 
        region: "N/A", 
        country: "N/A",
        method: "FAILSAFE"
    });
  }
}