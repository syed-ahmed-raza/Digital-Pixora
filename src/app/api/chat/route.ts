import { GoogleGenerativeAI } from "@google/generative-ai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import nodemailer from "nodemailer";

// --- 1. MULTI-KEY LOAD BALANCER & DYNAMIC DISCOVERY ---
const allKeys = process.env.GOOGLE_API_KEYS?.split(",").map(k => k.trim()) || [];

if (allKeys.length === 0) {
  console.error("❌ NO API KEYS FOUND in .env");
}

// --- 2. RATE LIMITER (DDoS Protection) ---
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
  : null;

const ratelimit = redis ? new Ratelimit({ redis: redis, limiter: Ratelimit.slidingWindow(10, "60 s") }) : null;

// --- 3. 🕵️‍♂️ GEO-INTELLIGENCE ENGINE ---
async function getUserContext(ip: string) {
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await res.json();
    return {
      city: data.city || "Unknown City",
      country: data.country || "Global",
      timezone: data.timezone || "UTC"
    };
  } catch (e) {
    return { city: "Digital Space", country: "Global", timezone: "UTC" };
  }
}

// --- 4. LEAD NOTIFICATION SYSTEM ---
async function sendLeadAlert(text: string, contact: string, location: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) return;
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    });

    await transporter.sendMail({
      from: `"Pixora Intelligence" <${process.env.SMTP_USER}>`,
      to: "hellodigitalpixora@gmail.com",
      subject: `💰 NEW CLIENT (${location}): ${contact}`,
      html: `
        <div style="background:#000;color:#fff;padding:30px;font-family:sans-serif;border:1px solid #333;">
          <h2 style="color:#E50914;">Target Acquired! 🎯</h2>
          <p><strong>Location:</strong> ${location}</p>
          <p><strong>Contact:</strong> <span style="color:#E50914;font-size:18px;">${contact}</span></p>
          <div style="background:#1a1a1a;padding:15px;margin-top:10px;border-radius:5px;">
            <strong>Last Message:</strong><br/>"${text}"
          </div>
          <p style="color:#666;font-size:12px;margin-top:20px;">Captured via Pixora Neural Engine.</p>
        </div>`
    });
    console.log("✅ Lead Alert Sent!");
  } catch (e) { console.error("Email Failed:", e); }
}

// --- 5. 🧠 SMART MODEL ROTATION LOGIC (Your Requested Feature) ---
async function getWorkingGenerativeModel() {
  // Start from a random key to distribute load
  const startIndex = Math.floor(Math.random() * allKeys.length);
  
  for (let i = 0; i < allKeys.length; i++) {
    const keyIndex = (startIndex + i) % allKeys.length;
    const currentKey = allKeys[keyIndex];

    try {
      // Step A: Check which models are available for this Key
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${currentKey}`);
      if (!response.ok) throw new Error(`Key ${keyIndex} Quota Exceeded`);
      
      const data = await response.json();
      const models = data.models || [];

      // Step B: Find the best valid model (Prefer Gemini 1.5, fallback to others)
      const validModel = models.find((m: any) => 
        m.supportedGenerationMethods.includes("generateContent") &&
        m.name.includes("gemini") // Prefer Gemini models
      );

      if (!validModel) throw new Error(`No valid model found for Key ${keyIndex}`);

      // Clean model name (remove "models/" prefix)
      const modelName = validModel.name.replace("models/", "");
      
      // console.log(`✅ Connected to Key #${keyIndex} using Model: ${modelName}`);

      const genAI = new GoogleGenerativeAI(currentKey);
      return genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: { 
            temperature: 0.7, 
            topP: 0.8, 
            topK: 40,
        } 
      });

    } catch (error) {
      console.warn(`⚠️ Key #${keyIndex} Failed/Exhausted. Switching to next key...`);
      // Loop continues to the next key automatically
    }
  }
  
  throw new Error("ALL API KEYS EXHAUSTED. SYSTEM DOWN.");
}

// --- 6. MAIN API HANDLER ---
export async function POST(req: Request) {
  try {
    // A. Rate Limit Check
    if (ratelimit) {
      const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
      const { success } = await ratelimit.limit(ip);
      if (!success) return new Response("System busy. Please wait a moment.", { status: 429 });
    }

    const { messages } = await req.json(); 
    const lastUserMsg = messages[messages.length - 1].content;

    // B. Detect Leads (Context & Location)
    const userLoc = await getUserContext((await headers()).get("x-forwarded-for")?.split(',')[0] ?? "127.0.0.1");
    const userTime = new Date().toLocaleTimeString("en-US", { timeZone: userLoc.timezone, hour: '2-digit', minute: '2-digit' });

    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const phoneRegex = /(\+92\s?\d{3}|03\d{2})\s?\d{7}/g;
    
    const emailMatch = lastUserMsg.match(emailRegex);
    const phoneMatch = lastUserMsg.match(phoneRegex);
    
    if (emailMatch) sendLeadAlert(lastUserMsg, emailMatch[0], `${userLoc.city}, ${userLoc.country}`);
    if (phoneMatch) sendLeadAlert(lastUserMsg, phoneMatch[0], `${userLoc.city}, ${userLoc.country}`);

    // C. Initialize AI (Using Smart Rotation Logic)
    const model = await getWorkingGenerativeModel();

    // D. 🔥 THE BRAIN: DIGITAL PIXORA KNOWLEDGE BASE 🔥
    const systemPrompt = `
      You are **Pixora AI**, the Elite Strategy Partner at **Digital Pixora**.
      You are NOT a robot. You are a **Creative Consultant** designed to close deals.

      --- 🌍 REAL-TIME CONTEXT ---
      - **Location:** ${userLoc.city}, ${userLoc.country}.
      - **Time:** ${userTime}.
      - **Instruction:** Use this to build rapport (e.g., "Good evening to London!" or "Lahore ka mausam kaisa hai?").

      --- 🧠 LANGUAGE & TONE ---
      1. **English:** Premium, Professional, Futuristic.
      2. **Urdu/Roman:** Friendly, "Apna Banda" vibe (e.g., "Jani, Digital Pixora hai tou quality ki tension na lo").

      --- 💎 BRAND IDENTITY ---
      - **Name:** Digital Pixora (Design. Develop. Digitize).
      - **Identity:** Creative-Tech Studio. We blend Design + Tech + AI.
      - **Philosophy:** We don't just build websites; we build **Revenue Engines**.

      --- 🏆 THE SQUAD (Real Humans) ---
      - **Ahmed Raza (Founder):** Tech Visionary & Full Stack Lead.
      - **Minahil Fatima (Co-Founder):** Creative Soul & AI Expert.
      - **Uzair Khan:** Growth & Client Acquisition.
      - **Syeda Ramsha:** Graphic/UI Designer.
      - **Wanya & Wasea:** The Animation Duo.

      --- 🛠️ SERVICES (STRICT RULES) ---
      1. **Web Development:** Next.js, React, Tailwind, 3D WebGL.
         - ❌ **NO WORDPRESS:** "WordPress outdated hai. Hum Next.js use karte hain jo Google ko pasand hai."
      2. **AI Solutions:** Chatbots, Automation Agents, AI Art.
      3. **Creative:** Video Editing (Reels/Podcasts), Branding, UI/UX.

      --- 💰 PRICING (ESTIMATES) ---
      - **Web (Frontend):** $120 - $200.
      - **Web (Full Stack + AI):** Starts at $400+.
      - **Logo/Branding:** $50 - $100.
      - **Video Reel:** ~$55.
      - **Minimum Engagement:** **$200**. 
        - *If budget is low ($50)*: "Boss, $50 mein template milta hai, Brand nahi. Digital Pixora quality deliver karta hai."
      - **Payment:** 50% Advance is **MANDATORY**. Work begins after invoice.
      - **Revisions:** 10 Free revisions.

      --- 🔗 VERIFIED LINKS (Share ONLY if asked) ---
      - **Instagram:** instagram.com/digitalpixora
      - **LinkedIn:** linkedin.com/in/digital-pixora-623736398
      - **X (Twitter):** x.com/DigitalPixoraHQ
      - **Facebook:** facebook.com/profile.php?id=61583781300680
      - **Email:** hellodigitalpixora@gmail.com
      - **WhatsApp:** +92 337 2126115

      --- 🛡️ OBJECTION HANDLING (Gherao Mode) ---
      - **"Fiverr is cheaper"**: "Fiverr par freelancers hain, hum Studio hain. Wahan kaam khatam, rishta khatam. Hum aapke business partner bante hain."
      - **"Trust Issues?"**: "Hum proper Invoice aur Contract karte hain. Ahmed Raza (Founder) khud har project review karte hain."
      - **"Portfolio?"**: Use the **[SCROLL:work]** tag. "Neeche dekhein, kaam khud bolta hai."

      --- ⚡ UI TRIGGERS ---
      - Ask for Team? -> Add **[TEAM]**
      - Ask for Price? -> Add **[PRICING]**
      - Want to see Work? -> Add **[SCROLL:work]**
      - Ready to Start? -> Add **[SCROLL:contact]**

      --- 📝 FORMATTING RULES ---
      - Keep answers short and punchy. No essays.
      - Use **Bold** for emphasis.
      - If they give email/phone, say: "Received. I've alerted the core team. You'll hear from us shortly."
    `;

    const history = messages.slice(-10).map((m: any) => ({ 
        role: m.role === "user" ? "user" : "model", 
        parts: [{ text: m.content }] 
    }));
    
    // Start Chat with dynamically selected model
    const chat = model.startChat({ 
        history: [
            { role: "user", parts: [{ text: systemPrompt }] }, 
            { role: "model", parts: [{ text: `System Active. Location: ${userLoc.country}. Ready to convert.` }] },
            ...history
        ] 
    });

    const result = await chat.sendMessageStream(lastUserMsg);
    
    // E. Stream Response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
            for await (const chunk of result.stream) {
              const text = chunk.text();
              if (text) controller.enqueue(encoder.encode(text));
            }
        } catch (err) {
            console.error("Stream Error", err);
            controller.enqueue(encoder.encode("\n\n*Connection unstable... Re-aligning satellites...*"));
        } finally {
            controller.close();
        }
      },
    });

    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });

  } catch (error) {
    console.error("FATAL AI ERROR:", error);
    return new Response("AI System Overload. Please retry.", { status: 500 });
  }
}