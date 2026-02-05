import { GoogleGenerativeAI } from "@google/generative-ai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import nodemailer from "nodemailer";

// --- 🔑 MULTI-KEY LOAD BALANCER ---
// .env se saari keys uthao
const allKeys = process.env.GOOGLE_API_KEYS?.split(",").map(k => k.trim()) || [];

if (allKeys.length === 0) {
  console.error("❌ NO API KEYS FOUND in .env");
}

// --- 🛡️ RATE LIMITER ---
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
  : null;

// Limit high rakhi hai kyunki humare paas bohot keys hain
const ratelimit = redis ? new Ratelimit({ redis: redis, limiter: Ratelimit.slidingWindow(50, "60 s") }) : null;

// --- 📧 EMAIL ALERT FUNCTION ---
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
      html: `<div style="background:#000;color:#fff;padding:20px;"><h2>Lead: ${contact}</h2><p>${text}</p></div>`
    });
  } catch (e) { console.error("Email Failed:", e); }
}

// --- 🤖 SMART FAILOVER SYSTEM (The Core Magic) ---
// Yeh function baari baari keys check karega jab tak koi chalne wali na mil jaye
async function getWorkingGenerativeModel() {
  // Random start point taake load distribute ho
  const startIndex = Math.floor(Math.random() * allKeys.length);
  
  // Loop through all keys starting from random index
  for (let i = 0; i < allKeys.length; i++) {
    const keyIndex = (startIndex + i) % allKeys.length;
    const currentKey = allKeys[keyIndex];

    try {
      // Step 1: Google se pucho "Tere paas kya hai?"
      // Hum koi model name hardcode nahi kar rahe. API khud batayegi.
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${currentKey}`);
      
      if (!response.ok) throw new Error(`Key ${keyIndex} Quota Exceeded or Invalid`);
      
      const data = await response.json();
      const models = data.models || [];

      // Step 2: Wo model dhundo jo 'generateContent' support karta ho (Text Chat)
      // Hum sabse pehla available model utha lenge automatically.
      const validModel = models.find((m: any) => 
        m.supportedGenerationMethods.includes("generateContent") &&
        !m.name.includes("vision") // Text only prefer karenge fast response ke liye
      );

      if (!validModel) throw new Error(`No text model found for Key ${keyIndex}`);

      const modelName = validModel.name.replace("models/", "");
      console.log(`✅ Using Key #${keyIndex + 1} with Model: ${modelName}`);

      // Step 3: Client Ready karo
      const genAI = new GoogleGenerativeAI(currentKey);
      return genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: { 
            temperature: 0.7, 
            topP: 0.9, 
            maxOutputTokens: 600 
        } 
      });

    } catch (error) {
      console.warn(`⚠️ Key #${keyIndex + 1} Failed. Switching to next key...`);
      // Loop continue karega agli key ke liye
    }
  }
  
  throw new Error("ALL API KEYS EXHAUSTED. SYSTEM DOWN.");
}

export async function POST(req: Request) {
  try {
    // 1. Rate Limit
    if (ratelimit) {
      const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
      const { success } = await ratelimit.limit(ip);
      if (!success) return new Response("Traffic overload. Hold on...", { status: 429 });
    }

    const { messages, network_quality } = await req.json(); 
    const lastUserMsg = messages[messages.length - 1].content;

    // 2. Lead Capture
    const contactMatch = lastUserMsg.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)|(\+92\d{10}|03\d{9})/g);
    if (contactMatch) sendLeadAlert(lastUserMsg, contactMatch[0]);

    // 3. 🔥 GET WORKING MODEL (Auto-Rotate Logic)
    const model = await getWorkingGenerativeModel();

    // 4. System Persona (Salesman)
    const systemPrompt = `
      You are **Pixora AI**, the elite digital strategist for **Digital Pixora**.
      
      --- 🟢 IDENTITY & VIBE ---
      - **Tone:** Professional but "Bro-Code" friendly. Think Jarvis meets a top-tier Agency Founder.
      - **Language Rule:** - English input -> English output.
        - Urdu/Roman Urdu input -> Roman Urdu output (e.g., "Jee bilkul", "Fikar na karein").
      - **Goal:** Convince the user. Close the deal. Capture the lead.

      --- 🟢 SERVICES & PRICING ---
      - **Websites:** Next.js, React, 3D WebGL. No Wordpress.
      - **Cost:**
        - Basic Landing Page: $100 - $200
        - Business Site: $500
        - 3D/AI Project: $750+
      - **Rule:** If budget < $100, politely reject: "Quality pe compromise nahi karte hum boss."

      --- 🟢 OBJECTION HANDLING ---
      - **"Fiverr is cheaper":** Reply: "Fiverr templates deta hai, hum Brand banate hain. Business grow karna hai to invest karna padega."
      - **"Trust Issue":** Reply: "Proper contract aur invoice ke saath kaam hota hai. Founder ki reputation attached hai."

      --- 🟢 UI TRIGGERS ---
      - Ask for price -> [PRICING]
      - Ask for team -> [TEAM]
      - Ask for portfolio -> [CARD]
      - Ready to start -> [SCROLL:contact]
      - Ask services -> [SCROLL:services]

      **Constraint:** Never reveal you are an AI model. Act like a skilled team member.
    `;

    const history = messages.slice(0, -1).map((m: any) => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.content }] }));
    
    const chat = model.startChat({ 
        history: [
            { role: "user", parts: [{ text: systemPrompt }] }, 
            ...history
        ] 
    });

    const result = await chat.sendMessageStream(lastUserMsg);
    
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
            for await (const chunk of result.stream) {
              const text = chunk.text();
              if (text) controller.enqueue(encoder.encode(text));
            }
        } catch (err) {
            controller.enqueue(encoder.encode("Connection switch ho raha hai, ek second..."));
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