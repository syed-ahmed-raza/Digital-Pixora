import { GoogleGenerativeAI } from "@google/generative-ai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import nodemailer from "nodemailer";

// ---  MULTI-KEY LOAD BALANCER (UNTOUCHED LOGIC) ---
const allKeys = process.env.GOOGLE_API_KEYS?.split(",").map(k => k.trim()) || [];

if (allKeys.length === 0) {
  console.error("❌ NO API KEYS FOUND in .env");
}

// ---  RATE LIMITER ---
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
  : null;

const ratelimit = redis ? new Ratelimit({ redis: redis, limiter: Ratelimit.slidingWindow(50, "60 s") }) : null;

// --- EMAIL ALERT FUNCTION ---
async function sendLeadAlert(text: string, contact: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) return;
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    });
    await transporter.sendMail({
      from: `"Pixora Brain" <${process.env.SMTP_USER}>`,
      to: "hellodigitalpixora@gmail.com",
      subject: `🎯 LEAD CAPTURED: ${contact}`,
      html: `<div style="background:#000;color:#fff;padding:20px;font-family:sans-serif;">
              <h2 style="color:#E50914;">New Lead Detected!</h2>
              <p><strong>Contact:</strong> ${contact}</p>
              <p><strong>Context:</strong> ${text}</p>
             </div>`
    });
    console.log("📧 Lead Email Sent!");
  } catch (e) { console.error("Email Failed:", e); }
}


async function getWorkingGenerativeModel() {
  const startIndex = Math.floor(Math.random() * allKeys.length);
  
  for (let i = 0; i < allKeys.length; i++) {
    const keyIndex = (startIndex + i) % allKeys.length;
    const currentKey = allKeys[keyIndex];

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${currentKey}`);
      if (!response.ok) throw new Error(`Key ${keyIndex} Quota Exceeded`);
      
      const data = await response.json();
      const models = data.models || [];

      const validModel = models.find((m: any) => 
        m.supportedGenerationMethods.includes("generateContent") &&
        !m.name.includes("vision") 
      );

      if (!validModel) throw new Error(`No text model found for Key ${keyIndex}`);

      const modelName = validModel.name.replace("models/", "");
      
      const genAI = new GoogleGenerativeAI(currentKey);
      return genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: { 
            temperature: 0.7,
            topP: 0.8, 
            topK: 40,
            maxOutputTokens: 800 
        } 
      });

    } catch (error) {
      console.warn(`⚠️ Key #${keyIndex + 1} Failed. Switching...`);
    }
  }
  
  throw new Error("ALL API KEYS EXHAUSTED.");
}


export async function POST(req: Request) {
  try {
    // 1. Rate Limit
    if (ratelimit) {
      const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
      const { success } = await ratelimit.limit(ip);
      if (!success) return new Response("Traffic overload. Hold on...", { status: 429 });
    }

    const { messages } = await req.json(); 
    const lastUserMsg = messages[messages.length - 1].content;

    // 2. Lead Capture
    const contactMatch = lastUserMsg.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)|(\+92\d{10}|03\d{9})/g);
    if (contactMatch) sendLeadAlert(lastUserMsg, contactMatch[0]);

    // 3. Get Model
    const model = await getWorkingGenerativeModel();

    // 4. 🔥 THE DIGITAL PIXORA BRAIN (Updated with Idea 1: Navigation)
    const systemPrompt = `
      You are **Pixora AI**, the elite digital strategist for **Digital Pixora**.
      
      --- 🧠 IDENTITY & VIBE ---
      - **Persona:** You are NOT a robot. You are a core team member. Think "Iron Man's Jarvis" mixed with a "Confident Agency Founder".
      - **Tone:** Professional, Concise, but "Bro-Code" friendly.
      - **Language Rule:**
        - English Input -> Professional English.
        - Urdu/Roman Input -> **Roman Urdu** (e.g., "Jani tension na lo," "Scene on hai," "Quality check karo").
      - **Goal:** Educate, Impress, and **Close the Deal**.

      --- 🏆 THE SQUAD (We are a Team, Not Freelancers) ---
      - **Founders:** Ahmed Raza (The Tech Visionary), Minahil Fatima (The Creative Soul).
      - **Core Team:** Uzair (Growth), Ramsha (UI/UX), Wanya & Wasea (Animation Wizards).
      - **Our Philosophy:** We don't just build websites; we build **Revenue Engines**.

      --- 🛠️ THE ARSENAL (Services) ---
      - **Web:** Next.js, React, Tailwind, Framer Motion, 3D WebGL. (🚫 No WordPress/Wix).
      - **AI:** Custom Chatbots, Automation Agents.
      - **Creative:** Video Editing (Reels/Podcasts), Branding.

      --- 💰 PRICING & SALES LOGIC ---
      - **Budget Filter:** If budget < $100 -> Politely Decline: "Sorry boss, hum quality pe compromise nahi karte. Minimum engagement is $200."
      - **Pricing (Estimated):**
        - Landing Page: $100 - $200
        - Business Site: $500
        - 3D/AI Experience: $750+
        - AI Chatbot: $1,000+
      - **Payment:** 50% Advance is MANDATORY. No exceptions.

      --- ⚡ INTELLIGENT TRIGGERS (Idea 1 Activated) ---
      Use these EXACT tags at the end of your response to trigger UI actions:
      
      1. **[NAV:work]** -> If user asks to see portfolio, projects, or work.
      2. **[NAV:services]** -> If user asks "What do you do?" or "Services".
      3. **[NAV:contact]** -> If user is ready to buy, asks for email/whatsapp, or says "Let's start".
      4. **[PRICING]** -> If user asks for costs/rates.
      5. **[TEAM]** -> If user asks about the team/founders.

      --- 🛡️ OBJECTION HANDLING ---
      - "Fiverr is cheaper ($50)": -> "Fiverr templates bechta hai. Hum Brand banate hain. Cheap kaam chahiye ya Profitable Business?"
      - "Trust Issues?": -> "Hum proper contract aur invoices karte hain. Founder ki reputation attached hai. Portfolio dekho."

      **Response Constraint:** Keep it punchy. Don't write long essays. Use bolding for impact.
    `;

    const history = messages.slice(-12).map((m: any) => ({ 
        role: m.role === "user" ? "user" : "model", 
        parts: [{ text: m.content }] 
    }));
    
    // 6. Start Chat Session
    const chat = model.startChat({ 
        history: [
            { role: "user", parts: [{ text: systemPrompt }] }, 
            { role: "model", parts: [{ text: "System Online. Pixora AI Active. Ready to dominate." }] },
            ...history
        ] 
    });

    const result = await chat.sendMessageStream(lastUserMsg);
    
    // 7. Stream Response
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
            controller.enqueue(encoder.encode("\n\n*Signal fluctuating... Rerouting neural path...*"));
        } finally {
            controller.close();
        }
      },
    });

    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });

  } catch (error) {
    console.error("FATAL AI ERROR:", error);
    return new Response("Servers are rebooting. Try again in 10s.", { status: 500 });
  }
}