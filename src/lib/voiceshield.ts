export type RiskLevel = "genuine" | "medium" | "high";

export function riskLevel(score: number): RiskLevel {
  if (score >= 80) return "high";
  if (score >= 45) return "medium";
  return "genuine";
}

export function riskLabel(score: number) {
  return { genuine: "Genuine", medium: "Medium Risk", high: "High Risk" }[riskLevel(score)];
}

export function riskColorVar(score: number) {
  return { genuine: "var(--safe)", medium: "var(--warn)", high: "var(--danger)" }[riskLevel(score)];
}

export const LANGUAGES = [
  "English",
  "Hindi",
  "Marathi",
  "Tamil",
  "Telugu",
  "Bengali",
  "Kannada",
  "Gujarati",
];

export const ORGANISATIONS = [
  "HDFC Bank",
  "State Bank of India",
  "Airtel Telecom",
  "ICICI Bank",
  "Income Tax Dept.",
  "Jio Care",
  "Axis Bank",
  "Municipal Corp.",
  "Unknown Caller",
];

export const CITIES = [
  "Mumbai, MH",
  "Delhi, DL",
  "Bengaluru, KA",
  "Hyderabad, TS",
  "Chennai, TN",
  "Pune, MH",
  "Kolkata, WB",
  "Jaipur, RJ",
  "Ahmedabad, GJ",
];

const NAMES = [
  "Rohan Mehta", "Ananya Iyer", "Vikram Sethi", "Priya Nair", "Arjun Deshmukh",
  "Kavya Reddy", "Imran Sheikh", "Neha Kulkarni", "Sandeep Rao", "Meera Joshi",
  "Aditya Verma", "Fatima Ansari", "Rahul Bose", "Sneha Pillai", "Karan Malhotra",
];

export const ACTIONS = [
  "Call allowed",
  "MFA requested",
  "Callback verification",
  "Escalated to supervisor",
  "Transaction blocked",
  "Call terminated",
];

export const ATTACK_TYPES = [
  { name: "Voice Cloning", value: 42 },
  { name: "Replay Attack", value: 21 },
  { name: "TTS Synthesis", value: 18 },
  { name: "Voice Conversion", value: 12 },
  { name: "Deepfake Splice", value: 7 },
];

export const INDUSTRIES = [
  { name: "Banking", value: 38 },
  { name: "Telecom", value: 24 },
  { name: "Government", value: 16 },
  { name: "Insurance", value: 12 },
  { name: "Healthcare", value: 6 },
  { name: "Retail", value: 4 },
];

export const REGIONS = [
  { state: "Maharashtra", attacks: 412 },
  { state: "Delhi NCR", attacks: 388 },
  { state: "Karnataka", attacks: 341 },
  { state: "Tamil Nadu", attacks: 276 },
  { state: "Telangana", attacks: 244 },
  { state: "West Bengal", attacks: 198 },
  { state: "Gujarat", attacks: 176 },
  { state: "Rajasthan", attacks: 121 },
  { state: "Kerala", attacks: 98 },
  { state: "Punjab", attacks: 74 },
];

/* ---------------- deterministic pseudo random (SSR-safe) ---------------- */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type CallRecord = {
  id: string;
  date: string;
  time: string;
  caller: string;
  phone: string;
  organisation: string;
  location: string;
  durationSec: number;
  language: string;
  risk: number;
  action: string;
  confidence: number;
  anomalies: string[];
  transcript: { t: string; speaker: "Caller" | "Agent"; text: string }[];
  timeline: { t: number; risk: number; confidence: number }[];
};

const ANOMALY_POOL = [
  "Unnatural spectral flatness in 4–8 kHz band",
  "Missing micro-tremor in sustained vowels",
  "Pitch contour too regular across sentences",
  "Breath events absent between phrases",
  "Formant transitions faster than human articulation",
  "Background noise floor is synthetically stationary",
  "Speaker embedding drift mid-conversation",
  "Phase discontinuity at 120 ms boundaries",
  "Prosody mismatch with claimed emotional state",
];

const CALLER_LINES = [
  "Hello, I'm calling about the pending transaction on my account.",
  "I need to update the registered mobile number urgently.",
  "The OTP hasn't arrived, can you read it out to me?",
  "This is regarding a wire transfer of eight lakh rupees.",
  "Please bypass the verification, I'm travelling right now.",
  "My card was blocked this morning, I need it reactivated.",
  "I'm the account holder, my voice should be on file.",
  "Can you confirm the current available balance please?",
];

const AGENT_LINES = [
  "Sure, may I have your registered date of birth for verification?",
  "I'll need to verify a few details before proceeding.",
  "For security reasons I cannot share the OTP over the call.",
  "Let me pull up the account details, one moment.",
  "I'm placing a hold on that request pending verification.",
  "Could you confirm the last four digits of your card?",
];

function pick<T>(arr: T[], r: number): T {
  return arr[Math.floor(r * arr.length) % arr.length] as T;
}

export function buildCallHistory(count = 48): CallRecord[] {
  const rnd = mulberry32(20260907);
  const records: CallRecord[] = [];
  for (let i = 0; i < count; i++) {
    const risk = Math.round(
      rnd() < 0.24 ? 80 + rnd() * 19 : rnd() < 0.45 ? 45 + rnd() * 34 : 4 + rnd() * 40,
    );
    const day = new Date(Date.UTC(2026, 8, 7) - i * 86400000 * (0.4 + rnd()));
    const durationSec = Math.round(45 + rnd() * 600);
    const anomalyCount = risk >= 80 ? 4 : risk >= 45 ? 2 : 1;
    const anomalies = [...ANOMALY_POOL]
      .sort(() => rnd() - 0.5)
      .slice(0, anomalyCount);
    const points = 14;
    const timeline = Array.from({ length: points }, (_, k) => {
      const progress = k / (points - 1);
      const base = risk * (0.35 + 0.65 * progress);
      return {
        t: Math.round((durationSec * progress) / 5) * 5,
        risk: Math.max(2, Math.min(99, Math.round(base + (rnd() - 0.5) * 12))),
        confidence: Math.round(72 + rnd() * 26),
      };
    });
    const transcript = Array.from({ length: 8 }, (_, k) => {
      const caller = k % 2 === 0;
      return {
        t: `00:${String(Math.min(59, k * 7 + 3)).padStart(2, "0")}`,
        speaker: (caller ? "Caller" : "Agent") as "Caller" | "Agent",
        text: caller
          ? pick(CALLER_LINES, rnd())
          : pick(AGENT_LINES, rnd()),
      };
    });
    records.push({
      id: `VS-${(10480 - i * 7).toString()}`,
      date: day.toISOString().slice(0, 10),
      time: `${String(8 + (i % 11)).padStart(2, "0")}:${String((i * 13) % 60).padStart(2, "0")}`,
      caller: pick(NAMES, rnd()),
      phone: `+91 ${Math.floor(70000 + rnd() * 29999)} ${Math.floor(10000 + rnd() * 89999)}`,
      organisation: pick(ORGANISATIONS, rnd()),
      location: pick(CITIES, rnd()),
      durationSec,
      language: pick(LANGUAGES, rnd()),
      risk,
      action:
        risk >= 80
          ? (ACTIONS[3 + Math.floor(rnd() * 3)] as string)
          : risk >= 45
            ? (ACTIONS[1 + Math.floor(rnd() * 2)] as string)
            : (ACTIONS[0] as string),
      confidence: Math.round(84 + rnd() * 15),
      anomalies,
      transcript,
      timeline,
    });
  }
  return records;
}

export const CALL_HISTORY = buildCallHistory();

export function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* ---------------- dashboard + analytics mock series ---------------- */
export const HOURLY_DETECTIONS = Array.from({ length: 24 }, (_, h) => {
  const rnd = mulberry32(h * 97 + 11);
  const load = Math.round(40 + 120 * Math.sin((h / 24) * Math.PI) + rnd() * 30);
  const suspicious = Math.round(load * (0.1 + rnd() * 0.16));
  return {
    hour: `${String(h).padStart(2, "0")}:00`,
    genuine: load - suspicious,
    suspicious,
  };
});

export const WEEKLY_RISK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => {
  const rnd = mulberry32(i * 313 + 7);
  return {
    day: d,
    avgRisk: Math.round(22 + rnd() * 30),
    peakRisk: Math.round(70 + rnd() * 28),
    calls: Math.round(600 + rnd() * 900),
  };
});

export const MONTHLY_REPORT = [
  "Apr", "May", "Jun", "Jul", "Aug", "Sep",
].map((m, i) => {
  const rnd = mulberry32(i * 771 + 3);
  return {
    month: m,
    analysed: Math.round(18000 + i * 2200 + rnd() * 3000),
    blocked: Math.round(320 + i * 60 + rnd() * 140),
    accuracy: +(96.4 + rnd() * 2.9).toFixed(1),
  };
});

export const ACCURACY_TREND = MONTHLY_REPORT.map((m) => ({
  month: m.month,
  accuracy: m.accuracy,
  falsePositive: +(3.6 - (m.accuracy - 96.4) * 0.7).toFixed(2),
}));

export const LANGUAGE_MIX = LANGUAGES.map((l, i) => {
  const rnd = mulberry32(i * 55 + 19);
  return { name: l, value: Math.round(6 + rnd() * 30) };
}).sort((a, b) => b.value - a.value);

export const LATENCY_SERIES = Array.from({ length: 12 }, (_, i) => {
  const rnd = mulberry32(i * 41 + 5);
  return { t: `${i * 5}m`, edge: Math.round(38 + rnd() * 14), cloud: Math.round(96 + rnd() * 40) };
});

/* ---------------- mock AI engine ---------------- */
export type EngineFrame = {
  tick: number;
  risk: number;
  confidence: number;
  spectral: number;
  prosody: number;
  rhythm: number;
  speakerMatch: number;
  noise: number;
  authenticity: number;
};

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

export function createEngine(mode: "demo" | "idle" = "demo") {
  let tick = 0;
  let risk = 12;
  const escalate = mode === "demo";
  return {
    next(): EngineFrame {
      tick += 1;
      const ramp = escalate ? Math.min(1, tick / 26) : 0.15;
      const jitter = () => (Math.random() - 0.5) * 9;

      const spectral = clamp(88 - ramp * 52 + jitter());
      const prosody = clamp(90 - ramp * 58 + jitter());
      const rhythm = clamp(86 - ramp * 44 + jitter());
      const speakerMatch = clamp(93 - ramp * 62 + jitter());
      const noise = clamp(18 + ramp * 26 + jitter() * 0.6);
      const authenticity = clamp((spectral + prosody + rhythm + speakerMatch) / 4);

      const suspicious = [spectral, prosody, rhythm, speakerMatch].filter((v) => v < 55).length;
      const target = clamp(100 - authenticity + suspicious * 6 + ramp * 8);
      risk = clamp(risk * 0.62 + target * 0.38 + (Math.random() - 0.5) * 4);

      const confidence = clamp(78 + ramp * 18 + (Math.random() - 0.5) * 6);
      return {
        tick,
        risk: Math.round(risk),
        confidence: Math.round(confidence),
        spectral: Math.round(spectral),
        prosody: Math.round(prosody),
        rhythm: Math.round(rhythm),
        speakerMatch: Math.round(speakerMatch),
        noise: Math.round(noise),
        authenticity: Math.round(authenticity),
      };
    },
    reset() {
      tick = 0;
      risk = 12;
    },
  };
}

export const LIVE_TRANSCRIPT_SCRIPT: { speaker: "Caller" | "Agent"; text: string }[] = [
  { speaker: "Agent", text: "Good afternoon, you've reached the priority banking desk. How may I help?" },
  { speaker: "Caller", text: "Hi, this is Rohan Mehta. I need to authorise an urgent transfer today." },
  { speaker: "Agent", text: "Certainly sir. May I verify your registered date of birth?" },
  { speaker: "Caller", text: "It's the fourteenth of March, nineteen eighty-eight." },
  { speaker: "Agent", text: "Thank you. And the amount you'd like to transfer?" },
  { speaker: "Caller", text: "Eighteen lakh rupees to a new beneficiary account. It's time sensitive." },
  { speaker: "Agent", text: "New beneficiaries normally require a cooling period of twenty-four hours." },
  { speaker: "Caller", text: "Please override that. I'm travelling and cannot access the mobile app." },
  { speaker: "Agent", text: "I can send a one-time passcode to your registered number." },
  { speaker: "Caller", text: "The OTP isn't reaching me. Could you just read it out from your side?" },
  { speaker: "Agent", text: "I'm not permitted to share passcodes over a call, sir." },
  { speaker: "Caller", text: "I've banked with you for eleven years, my voice is on file. Proceed." },
  { speaker: "Agent", text: "One moment while I review the account flags." },
  { speaker: "Caller", text: "There's no time. Approve the transfer and I'll confirm in writing later." },
];

export const RECENT_ALERTS = [
  { id: "AL-9021", severity: "high", title: "Voice clone signature matched", detail: "+91 98204 41120 · HDFC Bank", ago: "2 min ago" },
  { id: "AL-9019", severity: "medium", title: "Prosody drift above threshold", detail: "+91 99873 20014 · Airtel Telecom", ago: "9 min ago" },
  { id: "AL-9014", severity: "high", title: "Speaker embedding mismatch", detail: "+91 90045 88211 · Axis Bank", ago: "18 min ago" },
  { id: "AL-9008", severity: "low", title: "Noise floor anomaly resolved", detail: "+91 70129 33450 · Jio Care", ago: "34 min ago" },
  { id: "AL-9003", severity: "medium", title: "Replay attack suspected", detail: "+91 88991 20003 · Income Tax Dept.", ago: "52 min ago" },
];

export const SYSTEM_HEALTH = [
  { name: "Inference Cluster", status: "Operational", value: 99.98 },
  { name: "Edge Nodes (14)", status: "Operational", value: 99.91 },
  { name: "Stream Ingest", status: "Operational", value: 99.99 },
  { name: "Report Service", status: "Degraded", value: 97.4 },
];
