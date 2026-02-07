"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { sendAdminNotification, sendWelcomePack } from "@/lib/mail"; 

// --- 1. 🛡️ CONFIGURATION ---
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
  : null;

// Rate Limit: 3 Emails per minute per IP (Anti-Spam Shield)
const ratelimit = redis 
  ? new Ratelimit({ redis: redis, limiter: Ratelimit.slidingWindow(3, "60 s") }) 
  : null;

// --- 2. 📝 VALIDATION SCHEMA (Strict) ---
const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Name requires at least 2 characters.").max(100),
  email: z.string().trim().email("Please enter a valid email address.").max(100),
  message: z.string().trim().min(10, "Please provide more details (min 10 chars).").max(5000, "Message limit exceeded."),
});

// --- 3. 🕵️ INTELLIGENCE GATHERING (Hybrid: Edge + Fallback) ---
async function getUserContext(ip: string) {
  try {
    const headersList = await headers();
    
    // 🛡️ LAYER 1: VERCEL EDGE (0ms Latency)
    const vCity = headersList.get("x-vercel-ip-city");
    const vCountry = headersList.get("x-vercel-ip-country");
    const vTimezone = headersList.get("x-vercel-ip-timezone");

    if (vCity && vCountry) {
        return { 
            location: `${decodeURIComponent(vCity)}, ${vCountry}`, 
            localTime: new Date().toLocaleTimeString('en-US', { timeZone: vTimezone || 'Asia/Karachi' }) 
        };
    }

    // 🛡️ LAYER 2: API FALLBACK (Only if Layer 1 fails)
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=city,country,timezone`, { 
        cache: 'no-store',
        signal: AbortSignal.timeout(1500) 
    });
    
    if (!res.ok) throw new Error("IP Service Unreachable");
    
    const data = await res.json();
    return { 
        location: data.city ? `${data.city}, ${data.country}` : "Unknown Sector", 
        localTime: new Date().toLocaleTimeString('en-US', { timeZone: data.timezone || 'UTC' }) 
    };

  } catch (e) {
    // Fallback instantly if everything fails
    return { location: "Digital Space", localTime: "Unknown" };
  }
}

// --- 4. ⚡ MAIN SERVER ACTION ---
export async function sendEmail(prevState: any, formData: FormData) {
  try {
    const ip = (await headers()).get("x-forwarded-for")?.split(',')[0] ?? "127.0.0.1";

    // A. 🛡️ Security Check (Rate Limit)
    if (ratelimit) {
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return { success: false, message: "⚠️ System Busy. Please wait 1 minute before retrying." };
      }
    }

    // B. 📥 Data Extraction & Sanitization
    const rawData = {
      name: (formData.get("name") as string) || "",
      email: (formData.get("email") as string) || "",
      message: (formData.get("message") as string) || "",
    };

    // C. 🕵️ Validation
    const validated = contactFormSchema.safeParse(rawData);
    if (!validated.success) {
      return { success: false, message: validated.error.issues[0].message };
    }

    // D. 🧠 Context Enrichment
    const userCtx = await getUserContext(ip);

    // E. 🚀 Execution (Parallel Dispatch)
    // Both emails fly out simultaneously.
    await Promise.all([
      sendAdminNotification(rawData, userCtx),
      sendWelcomePack(rawData.email)
    ]);

    return { success: true, message: "Transmission Successful. Protocol Initiated." };

  } catch (error) {
    console.error("🔥 ACTION ERROR:", error);
    return { success: false, message: "Network Error. Please try again later." };
  }
}