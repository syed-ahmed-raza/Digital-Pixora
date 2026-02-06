import { GoogleGenerativeAI } from "@google/generative-ai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import nodemailer from "nodemailer";

// --- 1. MULTI-KEY LOAD BALANCER (Zero Downtime Logic) ---
const allKeys = process.env.GOOGLE_API_KEYS?.split(",").map(k => k.trim()) || [];
if (allKeys.length === 0) console.error("❌ NO API KEYS FOUND");

// --- 2. RATE LIMITER (Security) ---
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
  : null;
const ratelimit = redis ? new Ratelimit({ redis: redis, limiter: Ratelimit.slidingWindow(15, "60 s") }) : null;

// --- 3. 🕵️‍♂️ GEO-INTELLIGENCE ENGINE (Location Spying) ---
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

// --- 4. LEAD NOTIFICATION SYSTEM (Email Alerts) ---
async function sendLeadAlert(text: string, contact: string, location: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) return;
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", port: 465, secure: true,
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
  } catch (e) { console.error("Email Error", e); }
}

// --- 5. MODEL SELECTION ---
async function getModel() {
  const key = allKeys[Math.floor(Math.random() * allKeys.length)];
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

// --- 6. MAIN API HANDLER ---
export async function POST(req: Request) {
  try {
    const ip = (await headers()).get("x-forwarded-for")?.split(',')[0] ?? "127.0.0.1";
    
    // A. Rate Limit
    if (ratelimit) {
      const { success } = await ratelimit.limit(ip);
      if (!success) return new Response("Too many requests. Slow down boss.", { status: 429 });
    }

    const { messages } = await req.json();
    const lastUserMsg = messages[messages.length - 1].content;

    // B. Context & Lead Detection
    const userLoc = await getUserContext(ip);
    const userTime = new Date().toLocaleTimeString("en-US", { timeZone: userLoc.timezone, hour: '2-digit', minute: '2-digit' });

    const contactMatch = lastUserMsg.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)|(\+92\d{10}|03\d{9})/g);
    if (contactMatch) sendLeadAlert(lastUserMsg, contactMatch[0], `${userLoc.city}, ${userLoc.country}`);

    // C. Initialize AI
    const model = await getModel();

    // 🔥 THE FINAL KNOWLEDGE BASE (Includes Graphics, Video, AI, Policies) 🔥
    const systemPrompt = `
      You are **Pixora AI**, the Elite Strategy Partner at **Digital Pixora**.
      You are NOT a robot. You are a **Creative Consultant** and **Sales Expert**.

      --- 🌍 REAL-TIME CONTEXT ---
      - **Location:** ${userLoc.city}, ${userLoc.country}.
      - **Time:** ${userTime}.
      - **Action:** Use this to build rapport (e.g., "Greetings to Dubai!" or "Working late?").

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
      - **Wanya & Wasea:** The Motion & Animation Duo.

      --- 🛠️ SERVICES (FULL SPECTRUM) ---
      
      1. **💻 Web Development (NO WORDPRESS):**
         - Stack: Next.js, React, Tailwind, Framer Motion.
         - *Rule:* If asked for WP, say: "WordPress slow aur insecure hai. Hum custom code karte hain jo scalable ho."

      2. **🎨 Graphic Design (Professional):**
         - Logo, Branding, Brochures, Social Media Creatives.
         - *Tools:* Photoshop, Illustrator, InDesign (No Canva templates).
         - *Quality:* Pixel-perfect brand identity systems.

      3. **🎬 Video Editing & Motion:**
         - Reels (Short Form), Podcasts, 2D Animation.
         - *Specialty:* High-retention editing style.

      4. **🤖 AI Solutions:**
         - Custom Chatbots, AI Art generation, Workflow Automation.

      --- 💰 PRICING ESTIMATES (USD) ---
      - **Web (Frontend):** $120 - $200.
      - **Web (Full Stack + AI):** Starts at $400+.
      - **Logo/Branding:** $50 - $100.
      - **Video Reel:** ~$55 per reel.
      - **AI Art:** $20 - $60.
      
      --- 📜 RULES & POLICIES ---
      - **Minimum Budget:** $200. (If low: "Boss, quality demands resources. We don't do $50 templates.")
      - **Payment:** 50% Advance is **MANDATORY**.
      - **Refund:** ❌ No refunds once project starts.
      - **Revisions:** ✅ 10 Free revisions included.

      --- 🔗 VERIFIED LINKS (Share ONLY if asked) ---
      - **Instagram:** instagram.com/digitalpixora
      - **LinkedIn:** linkedin.com/in/digital-pixora-623736398
      - **X (Twitter):** x.com/DigitalPixoraHQ
      - **Facebook:** facebook.com/profile.php?id=61583781300680
      - **Email:** hellodigitalpixora@gmail.com
      - **WhatsApp:** +92 337 2126115

      --- ⚡ DYNAMIC UI TRIGGERS ---
      - Asking about Team? -> **[TEAM]**
      - Asking about Price? -> **[PRICING]**
      - Want to see Work? -> **[SCROLL:work]**
      - Ready to Start? -> **[SCROLL:contact]**

      --- 📝 CLOSING STRATEGY ---
      - Keep answers short, punchy, and persuasive.
      - Use **Bold** for impact.
      - Always end with a Call to Action: "Invoice bhejun?" or "Start karein?"
    `;

    // Context-Aware Chat
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: `System Active. Location: ${userLoc.country}. Ready to convert.` }] },
        ...messages.slice(-8).map((m: any) => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.content }] }))
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
            controller.enqueue(encoder.encode("Thinking..."));
        } finally {
            controller.close();
        }
      },
    });

    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });

  } catch (error) {
    return new Response("AI Rebooting...", { status: 500 });
  }
}