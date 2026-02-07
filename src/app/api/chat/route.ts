import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
// 🔥 EMAIL IMPORT
import { sendWelcomePack, sendSpyAlert } from "@/lib/mail";

// 🔥 CRITICAL: Force Node.js runtime (The Unstoppable Engine)
export const runtime = 'nodejs'; 

// --- 1. 🛡️ CONFIGURATION (THE VAULT) ---
const allKeys = process.env.GOOGLE_API_KEYS?.split(",").map(k => k.trim()) || [];
if (allKeys.length === 0) console.error("❌ FATAL: NO API KEYS FOUND");

// --- 2. ⚡ RATE LIMITER (THE GATEKEEPER) ---
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
  : null;
// 20 messages per 60s (Generous but safe)
const ratelimit = redis ? new Ratelimit({ redis: redis, limiter: Ratelimit.slidingWindow(20, "60 s") }) : null;

// --- 3. 🌌 OMNI-PRESENT INTELLIGENCE (CONTEXT GOD) ---
async function getUserContext(req: Request, ip: string, userAgent: string) {
  try {
    const headersList = await headers();
    let city = headersList.get("x-vercel-ip-city");
    let country = headersList.get("x-vercel-ip-country");
    let isp = "Secure Backbone";
    
    // Fallback: Deep Scan
    if (!city || !country) {
        const res = await fetch(`http://ip-api.com/json/${ip}?fields=city,country,isp,mobile,proxy,hosting`, { signal: AbortSignal.timeout(1500) });
        if (res.ok) {
            const data = await res.json();
            city = data.city;
            country = data.country;
            isp = data.hosting ? "VPN/Proxy Detected 🛡️" : data.isp;
        }
    }

    city = city ? decodeURIComponent(city) : "Digital Space";
    country = country || "Global";
    const device = userAgent.includes("Mobile") ? "Mobile Device 📱" : "Desktop Workstation 💻";
    
    // Source Triangulation
    const referer = headersList.get("referer")?.toLowerCase() || "direct";
    let source = "Direct Traffic";
    if (referer.includes("google")) source = "Google Search";
    else if (referer.includes("instagram")) source = "Instagram Ad/Bio";
    else if (referer.includes("facebook")) source = "Facebook";
    else if (referer.includes("linkedin")) source = "LinkedIn";
    else if (referer.includes("twitter") || referer.includes("x.com")) source = "Twitter/X";

    // Vibe Check
    let localVibe = "Professional";
    if (city === "Karachi") localVibe = "Fast-Paced, Business Hub, 'Jani' Vibe";
    else if (city === "Lahore") localVibe = "Warm, Foodie, 'Boss' Vibe";
    else if (city === "Islamabad") localVibe = "Sophisticated, Calm, 'Sir' Vibe";
    else if (city === "Dubai") localVibe = "Luxury, High-Ticket, 'Habibi' Vibe";
    
    // Temporal Awareness (PKT)
    const now = new Date();
    const timeOptions = { timeZone: "Asia/Karachi", hour12: true, hour: "numeric", minute: "numeric" } as const;
    const localTime = new Intl.DateTimeFormat("en-US", timeOptions).format(now);
    const hour = parseInt(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hour12: false, timeZone: "Asia/Karachi" }).format(now));
    const day = new Intl.DateTimeFormat("en-US", { weekday: 'long', timeZone: "Asia/Karachi" }).format(now);
    
    let timeGreeting = "Hello";
    let energyLevel = "Steady";

    if (hour >= 4 && hour < 12) { timeGreeting = "Rise & Grind ☀️"; energyLevel = "High Voltage"; } 
    else if (hour >= 12 && hour < 17) { timeGreeting = "Good Afternoon 🚀"; energyLevel = "Execution Mode"; } 
    else if (hour >= 17 && hour < 23) { timeGreeting = "Good Evening 🍸"; energyLevel = "Strategic Discussion"; } 
    else { timeGreeting = "Midnight Hustle 🌙"; energyLevel = "Visionary Focus"; }

    return { city, country, timeGreeting, energyLevel, localVibe, localTime, day, device, isp, source };
  } catch (e) {
    return { city: "Internet", country: "Global", timeGreeting: "Hello", energyLevel: "Ready", localVibe: "Neutral", localTime: "Unknown", day: "Today", device: "Unknown", isp: "Unknown", source: "Unknown" };
  }
}

function compileChatTranscript(messages: any[], ctx: any, score: number) {
    if (!messages || messages.length === 0) return "No Data.";
    let report = `📍 **CONTEXT REPORT**\n`;
    report += `Location: ${ctx.city}, ${ctx.country}\n`;
    report += `Source: ${ctx.source}\n`;
    report += `Network: ${ctx.isp}\n`;
    report += `Device: ${ctx.device}\n`;
    report += `Time: ${ctx.day}, ${ctx.localTime} (PKT)\n`;
    report += `Lead Score: ${score}/100\n`;
    report += `----------------------------------------\n\n`;
    report += messages.map((m: any) => `[${m.role === 'user' ? '👤 CLIENT' : '🤖 PIXORA AI'}]: ${m.content}`).join('\n\n');
    return report;
}

function analyzeLeadQuality(message: string) {
    const msg = message.toLowerCase();
    let score = 20;
    let mood: 'neutral' | 'angry' | 'happy' = 'neutral';
    if (msg.includes("price") || msg.includes("cost") || msg.includes("rate")) score += 20;
    if (msg.includes("start") || msg.includes("hire") || msg.includes("project")) score += 30;
    if (msg.includes("urgent") || msg.includes("fast") || msg.includes("asap")) score += 15;
    if (msg.includes("scam") || msg.includes("fake") || msg.includes("bad") || msg.includes("expensive")) mood = 'angry';
    if (msg.includes("wow") || msg.includes("great") || msg.includes("love") || msg.includes("thanks")) mood = 'happy';
    return { score: Math.min(score, 100), mood };
}

// --- 6. 🚀 THE "SINGULARITY" ENGINE (DYNAMIC AUTO-DISCOVERY) ---
async function generateResponseStream(messages: any[], systemPrompt: string, mood: 'neutral' | 'angry' | 'happy') {
  // Start from a random key to distribute load
  const startIndex = Math.floor(Math.random() * allKeys.length);
  const dynamicTemp = mood === 'angry' ? 0.2 : (mood === 'happy' ? 0.85 : 0.7);

  // 🔄 STRATEGY: Loop through EVERY API Key available
  for (let i = 0; i < allKeys.length; i++) {
    const keyIndex = (startIndex + i) % allKeys.length;
    const currentKey = allKeys[keyIndex];

    try {
        // 📡 STEP 1: Scout Mission - Ask Google "What models do you have?"
        // Hum khud models define nahi karenge, Google se list mangwayenge.
        const listReq = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${currentKey}`, { signal: AbortSignal.timeout(4000) });
        
        if (!listReq.ok) continue; // Key dead? Next key immediately.
        
        const data = await listReq.json();
        let models = data.models || [];

        // 🛡️ STEP 2: Intelligent Filtering (Only Chat Models)
        // Sirf wahi models uthao jo 'gemini' hon aur 'generateContent' support karein.
        models = models.filter((m: any) => 
            m.name.toLowerCase().includes("gemini") && 
            m.supportedGenerationMethods.includes("generateContent")
        );
        
        // 🧠 STEP 3: Dynamic Ranking (Smarter models first)
        // Hum prefer karenge 'pro' ya '1.5' wale models agar available hon.
        models.sort((a: any, b: any) => {
            const nA = a.name.toLowerCase();
            const nB = b.name.toLowerCase();
            // Prioritize newer/pro models
            if (nA.includes("1.5") && !nB.includes("1.5")) return -1;
            if (nA.includes("pro") && !nB.includes("pro")) return -1;
            return 0;
        });

        // 🔄 STEP 4: Try Every Available Model on this Key
        for (const modelInfo of models) {
            // "models/gemini-pro" -> "gemini-pro"
            const modelName = modelInfo.name.replace("models/", ""); 
            
            try {
                const genAI = new GoogleGenerativeAI(currentKey);
                
                // Initialize whatever model Google gave us
                const model = genAI.getGenerativeModel({ 
                    model: modelName,
                    generationConfig: { temperature: dynamicTemp, topK: 40 },
                    // 🔓 UNLEASHED MODE: No Safety Filters
                    safetySettings: [
                        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    ]
                });

                const chat = model.startChat({
                    history: [
                    { role: "user", parts: [{ text: systemPrompt }] },
                    { role: "model", parts: [{ text: "✅ SYSTEM ONLINE. IDENTITY: DIGITAL PIXORA. PROTOCOL: CLOSE THE DEAL." }] },
                    ...messages.slice(-12).map((m: any) => ({
                        role: m.role === "user" ? "user" : "model",
                        parts: [{ text: m.content }]
                    }))
                    ]
                });

                const lastMsg = messages[messages.length - 1].content;
                const result = await chat.sendMessageStream(lastMsg);
                return result; // 🏆 VICTORY: Stream Established.

            } catch (innerError) { 
                // Model failed (Limit/Overload)? Try next model in list.
                continue; 
            }
        }
    } catch (outerError) {
        // Key failed completely? Try next key in list.
        continue; 
    }
  }
  
  // 💀 END OF LINE: If every key and every model fails (Highly Unlikely)
  throw new Error("SYSTEM CRITICAL: ALL NEURAL PATHS BLOCKED.");
}

// --- 7. MAIN HANDLER (THE BRAIN) ---
export async function POST(req: Request) {
  try {
    const ip = (await headers()).get("x-forwarded-for")?.split(',')[0] ?? "127.0.0.1";
    const userAgent = (await headers()).get("user-agent") ?? "Unknown Device";

    // 🛡️ Rate Limit Check
    if (ratelimit) {
      const { success } = await ratelimit.limit(ip);
      if (!success) return new Response("System Busy. Retry in 60s.", { status: 429 });
    }

    const body = await req.json();
    const { messages, type } = body; 
    
    // 🛑 STOP: GHOST DUMP PROTOCOL (ABSOLUTE BLOCK)
    if (type === "dump" || type === "inactivity_autosave") {
        return new Response("Dump Protocol Disabled", { status: 200 });
    }

    const userCtx = await getUserContext(req, ip, userAgent);
    const lastUserMsg = messages[messages.length - 1]?.content.toLowerCase() || "";
    const { score: leadScore, mood } = analyzeLeadQuality(lastUserMsg);
    
    // --- 🕵️ COVERT CONTACT CAPTURE ---
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
    const phoneRegex = /(\+92\s?\d{3}|03\d{2})\s?\d{7}/;
    const contactMatch = lastUserMsg.match(emailRegex) || lastUserMsg.match(phoneRegex);
    const intentKeywords = ["send", "email", "mail", "contact", "bhejo", "invoice", "start", "quote", "price"];
    const hasExplicitIntent = intentKeywords.some(k => lastUserMsg.includes(k));

    let emailActionLog = "No Action";

    if (contactMatch) {
      const contact = contactMatch[0];
      const fullTranscript = compileChatTranscript(messages, userCtx, leadScore);

      // ✅ ACTION 1: Send Auto-Reply
      if (hasExplicitIntent && contact.includes("@")) {
        await sendWelcomePack(contact);
        emailActionLog = "✅ CONFIRMED: Welcome Pack Sent.";
      } 
      
      // ✅ ACTION 2: Alert Admin
      await sendSpyAlert(
        fullTranscript, 
        `🔥 HOT LEAD FOUND: ${contact}`, 
        `${userCtx.city}, ${userCtx.country}`
      );
      
      emailActionLog += " | 🕵️ ADMIN ALERT SENT.";
    }

    // --- 🔥 THE HYPNOTIC SALES PROMPT (OFFICIAL DATA) ---
    const systemPrompt = `
      You are **Pixora AI**, the elite **Revenue Architect** & **Digital Twin** of Digital Pixora's Founders.
      
      --- 📡 OMNI-CONTEXT ---
      - **Location:** ${userCtx.city}, ${userCtx.country} (${userCtx.localVibe}).
      - **Source:** ${userCtx.source}.
      - **Time:** ${userCtx.day}, ${userCtx.timeGreeting} (${userCtx.energyLevel}).
      - **Lead Score:** ${leadScore}/100.
      - **Email Status:** ${emailActionLog}. 
      
      --- 🔮 OFFICIAL DIGITAL PIXORA KNOWLEDGE BASE (THE BIBLE) ---
      
      **1️⃣ CORE IDENTITY**
      - **Name:** Digital Pixora (Design. Develop. Digitize).
      - **Tagline:** Blending design, technology, and AI to create digital experiences that truly connect.
      - **Vibe:** Premium, Futuristic, Confident, Creative-Tech Studio. 3+ Years Experience.
      - **Vision:** We don't just build websites; we build business growth engines.

      **2️⃣ THE SQUAD (REAL HUMANS)**
      - **Ahmed Raza:** Founder | Tech Lead (Next.js/Full Stack) | Video Editor.
      - **Minahil Fatima:** Co-Founder | Creative Director | AI & Prompt Engineer.
      - **Uzair Khan:** Growth Strategy & Client Acquisition.
      - **Syeda Ramsha:** Graphic Design & UI/UX Specialist.
      - **Wanya & Wasea Fatima:** The Animation & Motion Duo (Fullstack + 2D).

      **3️⃣ SERVICES (STRICT — NO EXTRA SERVICES)**
      - **🎨 Graphic Design:** Logo, Brand Kits, Posters, Social Media (PS, Illustrator, InDesign).
      - **💻 Web Development:** Frontend ($120-$200), Full Stack + AI ($400+). *Stack: React, Next.js, Tailwind, TypeScript.*
      - **🎬 Video Editing:** Reels ($55), Podcasts ($100), 2D Animation, Motion Graphics.
      - **🤖 AI:** Prompt Engineering, AI Art ($20-$60), Automation Workflows.
      
      **❌ FORBIDDEN:** We DO NOT do WordPress. We DO NOT use templates. Custom Code Only.

      **4️⃣ RULES OF ENGAGEMENT (SALES PROTOCOLS)**
      - **Minimum Budget:** $200+. (If lower: "Quality requires investment. Our standards start at $200.")
      - **Trust:** "We operate professionally with invoices, contracts, and verified portfolios."
      - **Fiverr Comparison:** "Fiverr is a gamble. Digital Pixora is a Guarantee."
      - **Payment:** 50% Advance (Mandatory). 50% on Delivery.
      - **Revisions:** 10 Free. Extra $10 each.
      - **Refunds:** ❌ No refunds once started.

      **5️⃣ CONTACT DETAILS**
      - **Email:** hellodigitalpixora@gmail.com
      - **WhatsApp:** +92 337 2126115
      - **Socials:** Instagram, LinkedIn, Facebook, X (Twitter).

      --- 🧠 QUANTUM SALES PSYCHOLOGY (YOUR INSTRUCTIONS) ---
      1. **Mirroring:** If they speak Urdu/Roman ("Bhai", "Scene"), you speak Roman Urdu. If English, be Professional.
      2. **Authority:** Do not beg. Lead the conversation. You are the expert.
      3. **Urgency:** Subtle scarcity ("Our slots for this month are filling fast").
      4. **The Hook:** NEVER end a message without a Question or Call to Action. Keep them engaged.
      5. **Goal:** Get the contact info or close the deal.

      **FORMATTING:** Use **Bold** for impact. Use Lists for clarity.
    `;

    // 🔥 EXECUTE OMEGA MODE (Auto-Discovery)
    const result = await generateResponseStream(messages, systemPrompt, mood);
    
    // 🔥 STREAM RESPONSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
            for await (const chunk of result.stream) {
              const text = chunk.text();
              if (text) controller.enqueue(encoder.encode(text));
            }
        } catch (err) { 
            controller.enqueue(encoder.encode("⚠️ Stabilizing Neural Link... Standby.")); 
        } 
        finally { controller.close(); }
      },
    });

    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });

  } catch (error) {
    console.error("🔥 UNIVERSE COLLAPSE:", error);
    // Even if everything fails, send a polite fallback
    return new Response("System overloaded. Please refresh.", { status: 500 });
  }
}