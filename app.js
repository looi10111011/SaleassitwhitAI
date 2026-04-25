
const AI_PROVIDER = "groq";
const GROQ_CONFIG = {
  url: "https://api.groq.com/openai/v1/chat/completions",
  apiKey: GROQ_API_KEY,
  model: "llama-3.3-70b-versatile"
};

const OLLAMA_CONFIG = {
  url: "http://localhost:11434/api/generate",
  model: "llama3.2"
};

// ── Product Info ─────────────────────────────────────────
const PRODUCT_INFO = {
  "VoIP": `
    VoIP คือระบบโทรศัพท์ผ่านอินเทอร์เน็ต (Internet Phone)
    - ลดค่าโทรได้สูงสุด 60-70% เทียบกับสายโทรศัพท์ธรรมดา
    - รองรับ Work from Home: พนักงานโทรผ่านมือถือหรือแล็ปท็อปได้เลย
    - ระบบ IVR (กด 1 สำหรับ... กด 2 สำหรับ...) จัดการสายอัตโนมัติ
    - บันทึกเสียงสนทนาทุกสายสำหรับ QA และการฝึกอบรม
    - Dashboard real-time: ดูสถิติสายทั้งหมด
    - ขยายสายหรือเพิ่มผู้ใช้ได้ทันที ไม่ต้องรอช่างเดินสาย
  `,
  "SIP Trunk": `
    SIP Trunk คือสายโทรศัพท์แบบ Virtual ผ่านอินเทอร์เน็ต
    - ไม่ต้องติดตั้งสายทองแดงจริง ลดค่าเช่าสายรายเดือน
    - รองรับหลายสายพร้อมกัน (Concurrent Calls) ไม่มีสายยุ่ง
    - ขยาย/ลดจำนวนสายได้ตามฤดูกาลหรือ demand
    - เชื่อมต่อกับ PABX เดิมได้เลย ไม่ต้องเปลี่ยนอุปกรณ์
    - มี Number Portability: โอนเบอร์เดิมมาได้
  `,
  "OrderJini": `
    OrderJini คือระบบรับออเดอร์อัจฉริยะขับเคลื่อนด้วย AI
    - รับออเดอร์ผ่าน QR Code บนโต๊ะ, Line OA, หรือเว็บ
    - ลดภาระพนักงานรับออเดอร์ได้ 40-60%
    - ลด error จากการจดออเดอร์ผิด
    - เชื่อมกับ Kitchen Display และ POS เดิมได้
    - รายงาน: เมนูขายดี, peak time, ยอดขายรายวัน
    - ทำงาน 24/7 ไม่มีวันหยุด
  `,
  "VoIP+SIP Trunk": `
    แพ็กเกจ VoIP + SIP Trunk ครบวงจร
    - รวมระบบโทรศัพท์ภายใน (Extension) และสายนอก (PSTN) ในระบบเดียว
    - ลดค่าใช้จ่ายรวมสูงสุด 60% เทียบกับระบบเก่า
    - Single vendor: ดูแลรักษาง่าย ติดต่อเดียวจบ
    - รองรับ Multi-site: หลายสาขาใช้ระบบเดียวกัน
  `
};

// ── State ────────────────────────────────────────────────
let selectedType = "email";

// ── UI Helpers ───────────────────────────────────────────
function setIndustry(el, val) {
  document.getElementById("industry").value = val;
  document.querySelectorAll(".tag").forEach(t => t.classList.remove("active"));
  el.classList.add("active");
}

function setType(el, val) {
  selectedType = val;
  document.querySelectorAll(".type-tab").forEach(t => t.classList.remove("active"));
  el.classList.add("active");
}

// ── Build Prompt ─────────────────────────────────────────
function buildPrompt(industry, product, bizsize, extra) {
  const typeLabel = {
    email:    "อีเมลนำเสนอสินค้าแบบมืออาชีพ ประกอบด้วย: หัวเรื่อง (Subject), เนื้อหา (opening ที่จับใจ, Pain Point, วิธีแก้ปัญหา, ประโยชน์ชัดเจน), และ Call-to-Action",
    script:   "สคริปต์โทรศัพท์สำหรับทีมขาย ประกอบด้วย: Opening (แนะนำตัว), การถาม Pain Point, การ Pitch, การจัดการ Objection, และ Closing",
    line:     "ข้อความสั้นสำหรับส่งทาง Line หรือ LinkedIn ไม่เกิน 5 ประโยค เน้น Hook และ CTA ที่กระตุ้นให้ตอบกลับ",
    proposal: "ย่อหน้าสรุปข้อเสนอ 3-4 ประโยค สำหรับใส่ใน Proposal หรือใบเสนอราคา เน้นคุณค่าและ ROI"
  }[selectedType];

  return `คุณคือผู้เชี่ยวชาญด้านการขาย B2B ในไทย ที่มีประสบการณ์มากกว่า 10 ปี
เขียน${typeLabel} สำหรับสินค้า "${product}"

ข้อมูลลูกค้าเป้าหมาย:
- อุตสาหกรรม: ${industry}
- ขนาดธุรกิจ: ${bizsize}
${extra ? `- ข้อมูลเพิ่มเติม: ${extra}` : ""}

ข้อมูลสินค้า:
${PRODUCT_INFO[product] || ""}

กฎสำคัญ:
1. เน้น Pain Point จริงๆ ของอุตสาหกรรม "${industry}" โดยเฉพาะ
2. เชื่อมโยง Pain Point กับฟีเจอร์สินค้าอย่างเป็นธรรมชาติ
3. ใช้ภาษาไทยที่เป็นมืออาชีพ อบอุ่น ไม่แข็งกระด้าง
4. มี Call-to-Action ที่ชัดเจน
5. ห้ามโกหกหรือเกินจริง
6. ถ้าเป็นอีเมล ให้ขึ้นต้นด้วย "Subject:" เสมอ`;
}

// ── Call Groq  ──────────────────────────────────
async function callGroq(prompt) {
  const response = await fetch(GROQ_CONFIG.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_CONFIG.apiKey}`
    },
    body: JSON.stringify({
      model: GROQ_CONFIG.model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Groq HTTP ${response.status}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

// ── Call Ollama (Local) ───────────────────────────────────
async function callOllama(prompt) {
  const response = await fetch(OLLAMA_CONFIG.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_CONFIG.model,
      prompt: prompt,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama HTTP ${response.status} — ตรวจสอบว่า Ollama รันอยู่ไหม (ollama serve)`);
  }
  const data = await response.json();
  return data.response || "";
}

// ── Call Anthropic (Cloud) ────────────────────────────────
async function callAnthropic(prompt) {
  const response = await fetch(ANTHROPIC_CONFIG.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_CONFIG.apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: ANTHROPIC_CONFIG.model,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Anthropic HTTP ${response.status}`);
  }
  const data = await response.json();
  return data.content?.map(b => b.text || "").join("") || "";
}

// ── Main Generate ─────────────────────────────────────────
async function generate() {
  const industry = document.getElementById("industry").value.trim();
  const statusEl = document.getElementById("status");

  if (!industry) {
    statusEl.textContent = "⚠ กรุณาระบุอุตสาหกรรมของลูกค้าก่อนนะครับ";
    document.getElementById("industry").focus();
    return;
  }

  const product  = document.getElementById("product").value;
  const bizsize  = document.getElementById("bizsize").value;
  const extra    = document.getElementById("extra").value.trim();
  const prompt   = buildPrompt(industry, product, bizsize, extra);

  const btn           = document.getElementById("gen-btn");
  const resultBox     = document.getElementById("result-box");
  const resultActions = document.getElementById("result-actions");

  btn.disabled = true;
  document.getElementById("btn-text").textContent = "กำลังสร้าง...";

  const loadingMsg = {
    groq:      `⚡ กำลังใช้ Groq (${GROQ_CONFIG.model})...`,
    ollama:    `🤖 กำลังใช้ ${OLLAMA_CONFIG.model} บนเครื่อง (10-30 วิ)...`,
    anthropic: `☁️ กำลังเชื่อมต่อ Anthropic API...`
  }[AI_PROVIDER];
  statusEl.textContent = loadingMsg;

  resultActions.style.display = "none";
  resultBox.innerHTML = '<div class="placeholder"><div class="loading-text">AI กำลังวิเคราะห์ Pain Point และเขียนสคริปต์...</div></div>';

  try {
    let text = "";

    if (AI_PROVIDER === "groq") {
      text = await callGroq(prompt);
      updateBadge(`⚡ Groq — ${GROQ_CONFIG.model}`);
    } else if (AI_PROVIDER === "ollama") {
      text = await callOllama(prompt);
      updateBadge(`🟢 Local — ${OLLAMA_CONFIG.model}`);
    } else {
      text = await callAnthropic(prompt);
      updateBadge(`☁️ Anthropic — ${ANTHROPIC_CONFIG.model}`);
    }

    if (!text) throw new Error("AI ไม่ส่งข้อมูลกลับมา");
    resultBox.textContent = text;
    resultActions.style.display = "flex";
    statusEl.textContent = "";

  } catch (err) {
    resultBox.innerHTML = `<div class="placeholder"><p style="color:#c0392b">❌ ${err.message}</p></div>`;
    const hint = {
      groq:      "💡 ตรวจสอบ Groq API Key ใน app.js — ขอฟรีได้ที่ console.groq.com",
      ollama:    "💡 เปิด Terminal แล้วรัน: ollama serve",
      anthropic: "💡 ตรวจสอบ Anthropic API Key ใน app.js"
    }[AI_PROVIDER];
    statusEl.textContent = hint;
  } finally {
    btn.disabled = false;
    document.getElementById("btn-text").textContent = "✨ สร้างเนื้อหาขาย";
  }
}

function updateBadge(text) {
  const el = document.getElementById("provider-badge");
  if (el) el.textContent = text;
}

// ── Copy ─────────────────────────────────────────────────
function copyResult() {
  const text = document.getElementById("result-box").textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelectorAll(".result-actions button")[0];
    btn.textContent = "✓ คัดลอกแล้ว!";
    setTimeout(() => btn.textContent = "คัดลอก", 2000);
  });
}

// ── Keyboard shortcut ─────────────────────────────────────
document.addEventListener("keydown", e => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") generate();
});

// ── Show provider badge on load ───────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  const badge = {
    groq:      `⚡ Groq — ${GROQ_CONFIG.model}`,
    ollama:    `🟢 Local — ${OLLAMA_CONFIG.model}`,
    anthropic: `☁️ Anthropic — ${ANTHROPIC_CONFIG.model}`
  }[AI_PROVIDER];
  updateBadge(badge);
});
