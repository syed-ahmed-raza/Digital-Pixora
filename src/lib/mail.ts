import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

// --- 1. 🛡️ GLOBAL TYPES & CONFIG ---
export interface MailResult {
  success: boolean;
  messageId?: string;
  error?: any;
}

const SMTP_LOGIN = process.env.SMTP_USER;
const SMTP_KEY = process.env.SMTP_PASSWORD;
const SENDER_IDENTITY = process.env.MY_EMAIL || "hellodigitalpixora@gmail.com";

// --- 2. 🔐 SECURITY LAYER ---
const escapeHtml = (unsafe: string): string => {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
};

// --- 3. 🧠 INTELLIGENCE LAYER ---

// A. Lead Scoring
const calculateLeadScore = (text: string): number => {
    let score = 30; 
    const lower = text.toLowerCase();
    
    if (lower.includes('budget') || lower.includes('quote') || lower.includes('retainer')) score += 20;
    if (lower.includes('urgent') || lower.includes('launch') || lower.includes('deadline')) score += 25;
    if (lower.includes('hire') || lower.includes('contract') || lower.includes('proposal')) score += 20;
    if (text.length > 250) score += 15; 

    if (lower.includes('free') || lower.includes('intern') || lower.includes('guest post')) score -= 25;
    if (lower.includes('seo service') || lower.includes('ranking')) score -= 30; 

    return Math.min(Math.max(score, 0), 100);
};

// B. Smart Link Generator
const generateSmartLinks = (contact: string) => {
    const digits = contact.replace(/\D/g, '');
    const emailMatch = contact.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    
    let waLink = "#";
    if (digits.length >= 10) {
        let finalNumber = digits;
        if (digits.startsWith('03')) finalNumber = '92' + digits.substring(1);
        if (digits.startsWith('0')) finalNumber = '92' + digits.substring(1); 
        waLink = `https://wa.me/${finalNumber}`;
    }

    return {
        wa: waLink,
        call: digits.length > 5 ? `tel:${digits}` : "#",
        mail: emailMatch ? `mailto:${emailMatch[0]}?subject=Re: Digital Pixora Project` : "#"
    };
};

// --- 4. 🎨 GOD-TIER TEMPLATES (NEXT GEN VISUALS) ---

// 🔥 TEMPLATE A: CLIENT AUTO-REPLY (The "Black Card" Experience)
const getClientTemplate = (safeName: string, ticketId: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Protocol Initiated</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
    body { background-color: #000000; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', Helvetica, Arial, sans-serif; color: #ffffff; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #000; padding-bottom: 40px; }
    .main-box { max-width: 600px; margin: 0 auto; background: #080808; border: 1px solid #1a1a1a; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 80px rgba(229, 9, 20, 0.08); }
    
    /* HEADER */
    .header { background: linear-gradient(180deg, #111 0%, #080808 100%); padding: 40px 30px; text-align: center; border-bottom: 1px solid #1a1a1a; position: relative; }
    .logo { color: #fff; font-weight: 800; letter-spacing: 2px; font-size: 20px; text-transform: uppercase; display: inline-block; padding: 10px 20px; border: 1px solid #333; border-radius: 100px; background: #000; }
    .logo span { color: #E50914; }
    
    /* CONTENT */
    .body-content { padding: 40px 30px; text-align: center; }
    .h1 { font-size: 28px; font-weight: 800; margin: 0 0 15px 0; color: #fff; line-height: 1.2; letter-spacing: -0.5px; }
    .p { color: #888; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0; font-weight: 400; }
    
    /* THE TICKET CARD */
    .ticket-container { background: linear-gradient(145deg, #111, #0a0a0a); border: 1px solid #222; border-radius: 20px; padding: 25px; margin: 20px 0 40px 0; text-align: left; position: relative; overflow: hidden; }
    .ticket-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #333; padding-bottom: 15px; margin-bottom: 15px; }
    .status-badge { background: rgba(34, 197, 94, 0.1); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.2); padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
    .ticket-id { font-family: monospace; color: #666; font-size: 12px; letter-spacing: 1px; }
    
    .ticket-body { display: flex; justify-content: space-between; align-items: center; }
    .ticket-info h3 { margin: 0; color: #fff; font-size: 16px; font-weight: 600; }
    .ticket-info p { margin: 5px 0 0 0; color: #555; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
    
    /* QR CODE BOX */
    .qr-box { background: #fff; padding: 6px; border-radius: 8px; box-shadow: 0 0 20px rgba(255,255,255,0.1); }
    .qr-img { display: block; width: 60px; height: 60px; }

    /* ACTION BUTTON */
    .btn-container { margin-top: 20px; }
    .btn { display: inline-block; background: #fff; color: #000; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s ease; box-shadow: 0 10px 30px rgba(255,255,255,0.1); }
    .btn:hover { background: #E50914; color: #fff; box-shadow: 0 10px 40px rgba(229, 9, 20, 0.4); transform: translateY(-2px); }

    /* FOOTER */
    .footer { padding: 30px; text-align: center; border-top: 1px solid #1a1a1a; background: #050505; }
    .social-links { margin-bottom: 20px; }
    .social-link { color: #666; text-decoration: none; margin: 0 10px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
    .social-link:hover { color: #fff; }
    .copyright { color: #333; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="main-box">
      <div class="header">
        <div class="logo">Digital <span>Pixora</span></div>
      </div>
      
      <div class="body-content">
        <div class="h1">Protocol Initiated.</div>
        <p class="p">Greeting ${safeName},<br>Your request has successfully breached our secure servers. A Revenue Architect has been assigned to analyze your project parameters.</p>
        
        <div class="ticket-container">
          <div class="ticket-header">
            <span class="ticket-id">REF: ${ticketId}</span>
            <span class="status-badge">● PRIORITY</span>
          </div>
          <div class="ticket-body">
            <div class="ticket-info">
              <p>Strategy Session</p>
              <h3>${safeName}'s Project</h3>
            </div>
            <div class="qr-box">
              <img class="qr-img" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticketId}&color=000000" alt="QR" />
            </div>
          </div>
        </div>

        <div class="btn-container">
          <a href="https://digitalpixora.com" class="btn">Access Command Center</a>
        </div>
      </div>

      <div class="footer">
        <div class="social-links">
          <a href="#" class="social-link">Instagram</a>
          <a href="#" class="social-link">LinkedIn</a>
          <a href="#" class="social-link">Twitter</a>
        </div>
        <div class="copyright">
          Encrypted Transmission // Secure Uplink
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

// 🔥 TEMPLATE B: ADMIN INTELLIGENCE REPORT ("The HUD")
const getAdminTemplate = (data: any, score: number, type: "FORM" | "CHAT", context: any) => {
    const isHighValue = score > 65;
    const accent = isHighValue ? "#22c55e" : "#E50914"; 
    const links = generateSmartLinks(data.email || "000");
    const safeMsg = escapeHtml(data.message);
    const safeName = escapeHtml(data.name);

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
        body { background: #000; font-family: 'JetBrains Mono', monospace; color: #0f0; margin: 0; padding: 20px; font-size: 13px; }
        .console-container { max-width: 650px; margin: 0 auto; border: 1px solid #333; background: #050505; border-radius: 12px; overflow: hidden; box-shadow: 0 0 50px rgba(0,0,0,0.8); }
        
        /* HEADER */
        .top-bar { background: #111; padding: 15px 25px; border-bottom: 1px solid #222; display: flex; justify-content: space-between; align-items: center; }
        .sys-status { display: flex; align-items: center; gap: 10px; font-weight: bold; color: #666; font-size: 11px; letter-spacing: 1px; }
        .blink { width: 8px; height: 8px; background: ${accent}; border-radius: 50%; box-shadow: 0 0 10px ${accent}; }
        .lead-type { color: #fff; background: #222; padding: 4px 10px; border-radius: 4px; font-size: 10px; border: 1px solid #444; }

        /* METRICS GRID */
        .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid #222; }
        .metric-box { padding: 20px; border-right: 1px solid #222; }
        .metric-box:last-child { border-right: none; }
        .metric-label { font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; display: block; }
        .metric-value { font-size: 16px; color: #fff; font-weight: bold; }
        
        /* SCORE BAR */
        .score-wrap { padding: 20px 25px; border-bottom: 1px solid #222; background: rgba(0,0,0,0.3); }
        .score-bar-bg { width: 100%; height: 6px; background: #222; border-radius: 10px; overflow: hidden; margin-top: 8px; }
        .score-fill { height: 100%; width: ${score}%; background: linear-gradient(90deg, #E50914, ${accent}); box-shadow: 0 0 15px ${accent}; }

        /* DATA TABLE */
        .data-table { width: 100%; padding: 25px; border-collapse: collapse; }
        .data-row td { padding: 8px 0; vertical-align: top; }
        .key-col { width: 30%; color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
        .val-col { color: #ddd; font-weight: 600; }
        
        /* MESSAGE BOX */
        .msg-box { background: #000; border: 1px dashed #333; padding: 20px; margin: 0 25px 25px; color: #bbb; line-height: 1.5; font-family: sans-serif; border-left: 2px solid ${accent}; font-size: 13px; }

        /* ACTION BUTTONS */
        .action-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; padding: 0 25px 25px; }
        .act-btn { text-align: center; padding: 12px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 11px; text-transform: uppercase; font-family: sans-serif; transition: 0.2s; }
        .wa-btn { background: #22c55e; color: #000; }
        .em-btn { background: #fff; color: #000; }
        .cl-btn { background: #222; color: #fff; border: 1px solid #444; }
        
        .footer-line { background: #080808; padding: 10px 25px; text-align: right; color: #444; font-size: 9px; border-top: 1px solid #222; text-transform: uppercase; letter-spacing: 1px; }
      </style>
    </head>
    <body>
      <div class="console-container">
        
        <div class="top-bar">
          <div class="sys-status"><div class="blink"></div> LIVE SIGNAL</div>
          <div class="lead-type">${type} INTEL</div>
        </div>

        <div class="metrics-grid">
          <div class="metric-box">
            <span class="metric-label">LEAD SOURCE</span>
            <span class="metric-value" style="color:${accent}">${safeName}</span>
          </div>
          <div class="metric-box">
            <span class="metric-label">ORIGIN</span>
            <span class="metric-value">${context.location}</span>
          </div>
        </div>

        <div class="score-wrap">
          <div style="display:flex; justify-content:space-between; color:#fff;">
            <span class="metric-label">LEAD QUALITY SCORE</span>
            <span style="font-weight:bold; color:${accent}">${score}/100</span>
          </div>
          <div class="score-bar-bg"><div class="score-fill"></div></div>
        </div>

        <table class="data-table">
          <tr class="data-row"><td class="key-col">CONTACT</td><td class="val-col" style="color:#fff;">${data.email}</td></tr>
          <tr class="data-row"><td class="key-col">TIMESTAMP</td><td class="val-col">${context.localTime}</td></tr>
        </table>

        <div class="msg-box">${safeMsg}</div>

        <div class="action-grid">
          <a href="${links.wa}" class="act-btn wa-btn">WhatsApp</a>
          <a href="${links.mail}" class="act-btn em-btn">Reply</a>
          <a href="${links.call}" class="act-btn cl-btn">Call</a>
        </div>

        <div class="footer-line">
          SECURE CONNECTION // ID: ${Math.random().toString(36).substring(7).toUpperCase()}
        </div>

      </div>
    </body>
    </html>
    `;
};

// --- 5. 🚀 TRANSPORT ENGINE ---
const sendWithRetry = async (mailOptions: nodemailer.SendMailOptions, retries = 2): Promise<MailResult> => {
  if (!SMTP_LOGIN || !SMTP_KEY) {
      console.error("❌ SMTP CREDENTIALS MISSING");
      return { success: false, error: "Config Error" };
  }

  // ⚠️ SERVERLESS OPTIMIZED: No 'pool: true' needed here.
  const transportConfig: SMTPTransport.Options = {
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false, 
    auth: { user: SMTP_LOGIN, pass: SMTP_KEY },
  };

  const transporter = nodemailer.createTransport(transportConfig);

  // Add Professional Tracking Headers
  const enhancedMailOptions = {
      ...mailOptions,
      headers: {
          ...mailOptions.headers,
          'X-Entity-Ref-ID': `DPX-${Date.now()}`, 
          'X-Auto-Response-Suppress': 'OOF, AutoReply',
          'X-Priority': '1'
      }
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const info = await transporter.sendMail(enhancedMailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.warn(`⚠️ Email Attempt ${attempt} Failed. Retrying...`);
      if (attempt === retries) {
        console.error("❌ Final Email Failure:", error);
        return { success: false, error };
      }
      await new Promise(res => setTimeout(res, 1000));
    }
  }
  return { success: false, error: "Unknown Error" };
};

// --- 6. 🌟 EXPORTED API FUNCTIONS ---

// A. SEND WELCOME PACK (Auto-Reply)
export async function sendWelcomePack(clientEmail: string) {
  const ticketId = `DPX-${Math.random().toString(36).substring(2, 6).toUpperCase()}-PRIORITY`;
  const nameRaw = clientEmail.split('@')[0];
  const name = nameRaw.charAt(0).toUpperCase() + nameRaw.slice(1).replace(/[0-9._-]/g, ' ');
  const safeName = escapeHtml(name);

  console.log(`📨 Dispatching Welcome Pack to: ${clientEmail}`);

  return await sendWithRetry({
    from: `"Digital Pixora HQ" <${SENDER_IDENTITY}>`,
    to: clientEmail,
    subject: `⚡ Protocol Initiated: Ticket [${ticketId}]`,
    html: getClientTemplate(safeName, ticketId),
  });
}

// B. SEND ADMIN NOTIFICATION (Contact Form)
export async function sendAdminNotification(data: { name: string; email: string; message: string }, context: any) {
  const score = calculateLeadScore(data.message);
  
  console.log(`🚨 Admin Alert: New Form Submission (Score: ${score})`);

  return await sendWithRetry({
    from: `"Pixora Secure" <${SENDER_IDENTITY}>`,
    to: SENDER_IDENTITY,
    replyTo: data.email,
    subject: `📩 FORM LEAD [${score}%]: ${data.name}`,
    html: getAdminTemplate(data, score, "FORM", context),
  });
}

// C. SEND SPY ALERT (Chatbot Intelligence)
export async function sendSpyAlert(transcript: string, contact: string, location: string) {
  const score = calculateLeadScore(transcript);
  
  console.log(`🕵️ SPY MODE: Processing Chat Intel (Score: ${score})...`);

  // Re-format for template
  const data = { name: contact, email: "Chat Visitor", message: transcript };
  const context = { location, localTime: new Date().toLocaleTimeString() };

  return await sendWithRetry({
    from: `"Pixora Intelligence" <${SENDER_IDENTITY}>`,
    to: SENDER_IDENTITY,
    subject: `🔥 HOT LEAD [${score}%]: ${contact}`,
    html: getAdminTemplate(data, score, "CHAT", context),
  });
}