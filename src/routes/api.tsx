import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { Check, Copy, Cpu, KeyRound, Plug, Terminal, Webhook } from "lucide-react";
import { toast } from "sonner";
import { GlassCard, SectionTitle } from "@/components/vs/primitives";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/api")({
  head: () => ({
    meta: [
      { title: "API & Integrations — VoiceShield AI" },
      {
        name: "description",
        content:
          "Integrate VoiceShield AI voice-clone detection into contact centres with REST, WebSocket streaming, SDKs and webhooks.",
      },
      { property: "og:title", content: "API & Integrations — VoiceShield AI" },
      {
        property: "og:description",
        content: "REST, streaming and SDK access to real-time AI voice clone detection.",
      },
    ],
  }),
  component: ApiPage,
});

const SNIPPETS: Record<string, { label: string; lang: string; code: string }> = {
  rest: {
    label: "REST",
    lang: "bash",
    code: `curl -X POST https://api.voiceshield.ai/v1/analyze \\
  -H "Authorization: Bearer vs_live_••••••••••••" \\
  -H "Content-Type: application/json" \\
  -d '{
    "call_id": "VS-10480",
    "audio_url": "https://cdn.example.com/calls/10480.wav",
    "language": "auto",
    "mode": "realtime"
  }'`,
  },
  stream: {
    label: "WebSocket",
    lang: "javascript",
    code: `const ws = new WebSocket("wss://stream.voiceshield.ai/v1/live");

ws.onopen = () => ws.send(JSON.stringify({
  token: "vs_live_••••••••••••",
  sample_rate: 16000,
  channels: 1,
}));

ws.onmessage = (event) => {
  const frame = JSON.parse(event.data);
  // { risk: 87, confidence: 96, speakerMatch: 22, verdict: "high" }
  if (frame.risk >= 80) escalateToSupervisor(frame);
};`,
  },
  sdk: {
    label: "Node SDK",
    lang: "typescript",
    code: `import { VoiceShield } from "@voiceshield/sdk";

const vs = new VoiceShield({ apiKey: process.env.VOICESHIELD_KEY! });

const result = await vs.calls.analyze({
  callId: "VS-10480",
  stream: micStream,
  onFrame: (f) => console.log(f.risk, f.anomalies),
});

console.log(result.verdict); // "high" | "medium" | "genuine"`,
  },
  webhook: {
    label: "Webhook",
    lang: "json",
    code: `POST https://your-app.example.com/hooks/voiceshield

{
  "event": "call.high_risk",
  "call_id": "VS-10480",
  "risk": 91,
  "confidence": 97,
  "clone_probability": 0.93,
  "anomalies": ["missing micro-tremor", "spectral flatness"],
  "recommended_action": "Escalate to supervisor",
  "signature": "sha256=..."
}`,
  },
};

const ENDPOINTS = [
  { method: "POST", path: "/v1/analyze", desc: "Analyse a recorded call file or URL" },
  { method: "GET", path: "/v1/calls/{id}", desc: "Fetch the full detection report" },
  { method: "GET", path: "/v1/calls", desc: "List and filter analysed calls" },
  { method: "POST", path: "/v1/enroll", desc: "Enrol a trusted speaker voiceprint" },
  { method: "WS", path: "/v1/live", desc: "Stream audio frames for real-time scoring" },
  { method: "POST", path: "/v1/webhooks", desc: "Register a webhook endpoint" },
];

const INTEGRATIONS = [
  { name: "Genesys Cloud", note: "Contact centre" },
  { name: "Amazon Connect", note: "Contact centre" },
  { name: "Twilio Voice", note: "Telephony" },
  { name: "Cisco Webex CC", note: "Contact centre" },
  { name: "Avaya OneCloud", note: "Telephony" },
  { name: "Splunk / SIEM", note: "Security ops" },
];

function ApiPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const copy = (key: string, code: string) => {
    void navigator.clipboard?.writeText(code);
    setCopied(key);
    toast.success("Snippet copied to clipboard");
    setTimeout(() => setCopied(null), 1600);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard className="relative overflow-hidden">
          <div className="flex flex-wrap items-center gap-4">
            <div
              className="grid size-12 place-items-center rounded-2xl"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Cpu className="size-6 text-background" />
            </div>
            <div className="min-w-[240px] flex-1">
              <h1 className="font-display text-2xl font-semibold">API & Integrations</h1>
              <p className="text-sm text-muted-foreground">
                Drop real-time voice-clone detection into any call flow — REST, streaming, SDKs and
                signed webhooks.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => toast.success("Documentation opened in the docs portal")}
              >
                <Terminal className="mr-1.5 size-4" /> Docs
              </Button>
              <Button
                style={{ background: "var(--gradient-brand)", color: "var(--background)" }}
                onClick={() => toast.success("Sandbox key generated")}
              >
                <KeyRound className="mr-1.5 size-4" /> Generate key
              </Button>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <SectionTitle title="Quick start" subtitle="Copy a snippet and start scoring calls" />
          <Tabs defaultValue="rest">
            <TabsList>
              {Object.entries(SNIPPETS).map(([k, v]) => (
                <TabsTrigger key={k} value={k}>
                  {v.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {Object.entries(SNIPPETS).map(([k, v]) => (
              <TabsContent key={k} value={k}>
                <div className="relative rounded-xl border border-border bg-secondary/40 p-4">
                  <button
                    onClick={() => copy(k, v.code)}
                    className="absolute right-3 top-3 rounded-lg border border-border bg-background/60 p-1.5 text-muted-foreground hover:text-foreground"
                    aria-label="Copy snippet"
                  >
                    {copied === k ? (
                      <Check className="size-3.5" style={{ color: "var(--safe)" }} />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                  <pre className="overflow-x-auto font-mono text-[12px] leading-relaxed text-muted-foreground">
                    <code>{v.code}</code>
                  </pre>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </GlassCard>

        <GlassCard>
          <SectionTitle title="Your API key" subtitle="Sandbox environment" />
          <div className="rounded-xl border border-border bg-secondary/40 p-3 font-mono text-xs break-all">
            {revealed ? "vs_test_9f2c41ab77de4b0d8e51c3aa66f0d914" : "vs_test_••••••••••••••••••••••••"}
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setRevealed((v) => !v)}>
              {revealed ? "Hide" : "Reveal"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                void navigator.clipboard?.writeText("vs_test_9f2c41ab77de4b0d8e51c3aa66f0d914");
                toast.success("API key copied");
              }}
            >
              Copy
            </Button>
            <Button size="sm" variant="ghost" onClick={() => toast("Key rotation scheduled")}>
              Rotate
            </Button>
          </div>
          <div className="mt-5 space-y-2 text-xs text-muted-foreground">
            <p>Rate limit · 600 requests / minute</p>
            <p>Streaming concurrency · 120 live calls</p>
            <p>Median scoring latency · 62 ms</p>
            <p>Data residency · ap-south-1 (Mumbai)</p>
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <SectionTitle title="Endpoints" subtitle="v1 REST & streaming surface" />
          <div className="space-y-2">
            {ENDPOINTS.map((e) => (
              <div
                key={e.path}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-border/60 px-3 py-2.5 transition-colors hover:bg-secondary/40"
              >
                <span
                  className="rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold"
                  style={{
                    background: "color-mix(in oklab, var(--cyan) 16%, transparent)",
                    color: "var(--cyan)",
                  }}
                >
                  {e.method}
                </span>
                <span className="font-mono text-sm">{e.path}</span>
                <span className="ml-auto text-xs text-muted-foreground">{e.desc}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard>
            <SectionTitle title="Platform integrations" subtitle="One-click connectors" />
            <div className="grid gap-2 sm:grid-cols-2">
              {INTEGRATIONS.map((i) => (
                <div
                  key={i.name}
                  className="flex items-center gap-3 rounded-xl border border-border/60 px-3 py-2.5"
                >
                  <Plug className="size-4" style={{ color: "var(--violet)" }} />
                  <div>
                    <p className="text-sm font-medium">{i.name}</p>
                    <p className="text-[11px] text-muted-foreground">{i.note}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-auto"
                    onClick={() => toast.success(`${i.name} connector enabled`)}
                  >
                    Connect
                  </Button>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <SectionTitle title="Webhooks" subtitle="Signed events pushed to your stack" />
            <div className="flex items-center gap-3 rounded-xl border border-border/60 px-3 py-2.5">
              <Webhook className="size-4" style={{ color: "var(--cyan)" }} />
              <span className="truncate font-mono text-xs">
                https://ops.example.com/hooks/voiceshield
              </span>
              <span
                className="ml-auto text-[11px] font-medium"
                style={{ color: "var(--safe)" }}
              >
                Active
              </span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Events: call.high_risk · call.completed · speaker.enrolled · key.rotated
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
