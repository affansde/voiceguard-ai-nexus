import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Building2,
  Clock,
  Download,
  Languages,
  MapPin,
  Mic,
  Phone,
  Play,
  Square,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard, MetricCard, RiskMeter, SectionTitle, Waveform } from "@/components/vs/primitives";
import {
  createEngine,
  formatDuration,
  LIVE_TRANSCRIPT_SCRIPT,
  type EngineFrame,
} from "@/lib/voiceshield";
import { toast } from "sonner";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "Live Call Monitor — VoiceShield AI" },
      {
        name: "description",
        content:
          "Monitor an inbound call in real time with live waveform, transcription and AI voice-clone risk scoring.",
      },
      { property: "og:title", content: "Live Call Monitor — VoiceShield AI" },
      {
        property: "og:description",
        content: "Waveform, transcript and per-second AI analysis of caller authenticity.",
      },
    ],
  }),
  component: LiveMonitor,
});

const IDLE_FRAME: EngineFrame = {
  tick: 0,
  risk: 0,
  confidence: 0,
  spectral: 0,
  prosody: 0,
  rhythm: 0,
  speakerMatch: 0,
  noise: 0,
  authenticity: 0,
};

function LiveMonitor() {
  const [running, setRunning] = useState(false);
  const [frame, setFrame] = useState<EngineFrame>(IDLE_FRAME);
  const [seconds, setSeconds] = useState(0);
  const [lines, setLines] = useState<{ speaker: "Caller" | "Agent"; text: string; t: string }[]>([]);
  const [alertShown, setAlertShown] = useState(false);
  const [report, setReport] = useState<EngineFrame | null>(null);
  const engine = useMemo(() => createEngine("demo"), []);
  const scrollRef = useRef<HTMLDivElement>(null);

  const stop = useCallback(
    (final?: EngineFrame) => {
      setRunning(false);
      if (final) setReport(final);
    },
    [],
  );

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const f = engine.next();
      setFrame(f);
      setSeconds((s) => s + 1);
      setLines((prev) => {
        const next = LIVE_TRANSCRIPT_SCRIPT[prev.length];
        if (!next || prev.length >= LIVE_TRANSCRIPT_SCRIPT.length) return prev;
        if (f.tick % 2 !== 0) return prev;
        return [...prev, { ...next, t: formatDuration(f.tick) }];
      });
      if (f.risk >= 80) {
        setAlertShown((shown) => {
          if (!shown) toast.error("High risk detected — synthetic voice signature", { description: "Risk score crossed the 80% threshold." });
          return true;
        });
      }
      if (f.tick >= 34) {
        clearInterval(id);
        stop(f);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [running, engine, stop]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [lines]);

  const start = () => {
    engine.reset();
    setFrame(IDLE_FRAME);
    setSeconds(0);
    setLines([]);
    setAlertShown(false);
    setReport(null);
    setRunning(true);
    toast.success("Live analysis started", { description: "Streaming inbound call VS-10487." });
  };

  const status = running ? "Analysing" : report ? "Ended" : "Idle";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Live Call Monitor</h1>
          <p className="text-sm text-muted-foreground">
            Inbound call · Priority banking desk · Agent console
          </p>
        </div>
        <div className="flex gap-2">
          {running ? (
            <Button variant="destructive" onClick={() => stop(frame)}>
              <Square className="mr-1.5 size-4" /> End analysis
            </Button>
          ) : (
            <Button onClick={start} style={{ background: "var(--gradient-brand)", color: "var(--background)" }}>
              <Play className="mr-1.5 size-4" /> Start Live Demo
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
        {/* Caller details */}
        <GlassCard>
          <SectionTitle title="Caller details" />
          <div className="space-y-3 text-sm">
            <Row icon={<User className="size-4" />} label="Caller Name" value="Rohan Mehta" />
            <Row icon={<Phone className="size-4" />} label="Phone Number" value="+91 98204 41120" />
            <Row icon={<MapPin className="size-4" />} label="Location" value="Mumbai, MH" />
            <Row icon={<Building2 className="size-4" />} label="Organisation" value="HDFC Bank — Priority" />
            <Row icon={<Clock className="size-4" />} label="Call Duration" value={formatDuration(seconds)} />
            <Row icon={<Languages className="size-4" />} label="Language" value="English (IN)" />
            <div className="flex items-center justify-between pt-1">
              <span className="text-muted-foreground">Call Status</span>
              <Badge
                variant="outline"
                style={{
                  color: running ? "var(--cyan)" : "var(--muted-foreground)",
                  borderColor: running ? "var(--cyan)" : "var(--border)",
                }}
              >
                {status}
              </Badge>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-border bg-card/40 p-3 text-xs text-muted-foreground">
            Voice profile enrolled on 12 Feb 2024 · 3 prior verified calls · Device: VoLTE handset
          </div>
        </GlassCard>

        {/* Center */}
        <div className="space-y-4">
          <GlassCard className="relative overflow-hidden">
            <div className="flex items-center justify-between">
              <SectionTitle title="Audio stream" subtitle="16 kHz mono · live capture" />
              <div className="relative">
                <motion.div
                  animate={running ? { scale: [1, 1.25, 1], opacity: [0.5, 0.1, 0.5] } : {}}
                  transition={{ repeat: Infinity, duration: 1.6 }}
                  className="absolute inset-0 rounded-full"
                  style={{ background: "var(--cyan)" }}
                />
                <div
                  className="relative grid size-11 place-items-center rounded-full"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  <Mic className="size-5 text-background" />
                </div>
              </div>
            </div>
            <Waveform active={running} intensity={frame.risk / 100} />
            <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
              <span>Frame {frame.tick.toString().padStart(4, "0")}</span>
              <span>{running ? "Streaming" : "Paused"}</span>
              <span>Buffer 320 ms</span>
            </div>
          </GlassCard>

          <GlassCard>
            <SectionTitle title="Real-time transcription" subtitle="Speech-to-text with speaker diarisation" />
            <div ref={scrollRef} className="scrollbar-thin h-[300px] space-y-3 overflow-y-auto pr-1">
              {lines.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted-foreground">
                  Transcript will appear here once the call analysis starts.
                </p>
              ) : (
                lines.map((l, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                      l.speaker === "Caller"
                        ? "bg-secondary/60"
                        : "ml-auto bg-primary/15 border border-primary/25"
                    }`}
                  >
                    <div className="mb-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="font-medium">{l.speaker}</span>
                      <span>{l.t}</span>
                    </div>
                    {l.text}
                  </motion.div>
                ))
              )}
              {running ? (
                <div className="flex gap-1 pl-1">
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{ repeat: Infinity, duration: 1.1, delay: d * 0.2 }}
                      className="size-1.5 rounded-full"
                      style={{ background: "var(--cyan)" }}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </GlassCard>
        </div>

        {/* Right analysis */}
        <div className="space-y-4">
          <GlassCard>
            <SectionTitle title="Live AI analysis" subtitle="Updated every second" />
            <div className="space-y-2.5">
              <MetricCard label="Spectral Analysis" value={frame.spectral} hint="Harmonic naturalness" />
              <MetricCard label="Prosody Analysis" value={frame.prosody} hint="Pitch & stress variation" />
              <MetricCard label="Speech Rhythm" value={frame.rhythm} hint="Pause and tempo profile" />
              <MetricCard label="Speaker Consistency" value={frame.speakerMatch} hint="Embedding vs enrolled voice" />
              <MetricCard label="Noise Level" value={frame.noise} hint="Ambient stationarity" invert />
              <MetricCard label="Confidence Score" value={frame.confidence} hint="Model certainty" />
            </div>
          </GlassCard>

          <GlassCard glow>
            <RiskMeter score={frame.risk} />
          </GlassCard>
        </div>
      </div>

      {/* Final report */}
      <AnimatePresence>
        {report ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard>
              <SectionTitle
                title="Final call report"
                subtitle="Generated at end of analysis session"
                right={
                  <Button variant="outline" onClick={() => toast.success("Report exported as PDF")}>
                    <Download className="mr-1.5 size-4" /> Export report
                  </Button>
                }
              />
              <div className="grid gap-4 md:grid-cols-4">
                <Stat label="Voice Clone Probability" value={`${report.risk}%`} color="var(--danger)" />
                <Stat label="Overall Confidence" value={`${report.confidence}%`} color="var(--cyan)" />
                <Stat label="Speaker Match" value={`${report.speakerMatch}%`} color="var(--warn)" />
                <Stat label="Voice Authenticity" value={`${report.authenticity}%`} color="var(--violet)" />
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium">Detected indicators</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                    <li>· Spectral flatness anomaly in the 4–8 kHz band</li>
                    <li>· Absent breath events across 7 consecutive phrases</li>
                    <li>· Speaker embedding drift of 0.42 cosine distance</li>
                    <li>· Requests for OTP disclosure and verification bypass</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-border bg-card/40 p-4">
                  <p className="text-sm font-medium">Recommended action</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {report.risk >= 80
                      ? "Reject the sensitive transaction, verify the customer via outbound callback and escalate to the fraud supervisor."
                      : "Complete step-up MFA before processing any financial instruction."}
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* High risk popup */}
      <AnimatePresence>
        {alertShown && running ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-strong w-full max-w-lg rounded-3xl p-6"
              style={{ boxShadow: "var(--glow-danger)" }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="grid size-12 place-items-center rounded-2xl"
                  style={{ background: "color-mix(in oklab, var(--danger) 22%, transparent)" }}
                >
                  <AlertTriangle className="size-6" style={{ color: "var(--danger)" }} />
                </motion.div>
                <div>
                  <h2 className="text-xl font-semibold" style={{ color: "var(--danger)" }}>
                    Possible AI Voice Clone Detected
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Risk score {frame.risk}% · Confidence {frame.confidence}%
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm font-medium">Recommended actions</p>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                {[
                  "Verify the caller using an outbound callback to the registered number",
                  "Require multi-factor authentication before any instruction",
                  "Escalate the session to the fraud supervisor",
                  "Reject all sensitive transactions on this call",
                ].map((a) => (
                  <li key={a} className="flex gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full" style={{ background: "var(--danger)" }} />
                    {a}
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button variant="destructive" onClick={() => { setAlertShown(false); stop(frame); }}>
                  Terminate call
                </Button>
                <Button variant="outline" onClick={() => setAlertShown(false)}>
                  Continue monitoring
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
