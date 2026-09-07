import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowLeft, Download, FileWarning, ShieldAlert } from "lucide-react";
import {
  Area,
  AreaChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { GlassCard, RiskBadge, SectionTitle } from "@/components/vs/primitives";
import { CALL_HISTORY, formatDuration, riskColorVar, riskLabel } from "@/lib/voiceshield";
import { toast } from "sonner";

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  fontSize: "12px",
  color: "var(--popover-foreground)",
};

export const Route = createFileRoute("/history/$id")({
  loader: ({ params }) => {
    const call = CALL_HISTORY.find((c) => c.id === params.id);
    if (!call) throw notFound();
    return { call };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Call unavailable — VoiceShield AI" }, { name: "robots", content: "noindex" }] };
    }
    const { call } = loaderData;
    const title = `Call ${call.id} · ${call.caller} — VoiceShield AI`;
    const description = `Detection report for call ${call.id}: risk ${call.risk}%, verdict ${riskLabel(call.risk)}, action ${call.action}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  notFoundComponent: CallNotFound,
  component: CallDetail,
});

function CallNotFound() {
  return (
    <div className="glass mx-auto max-w-md rounded-2xl p-8 text-center">
      <FileWarning className="mx-auto size-8 text-muted-foreground" />
      <h1 className="mt-3 text-lg font-semibold">Call report not found</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        This call ID is not present in the retention window.
      </p>
      <Button asChild variant="outline" className="mt-4">
        <Link to="/history">Back to call history</Link>
      </Button>
    </div>
  );
}

function CallDetail() {
  const { call } = Route.useLoaderData();
  const color = riskColorVar(call.risk);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/history" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Call history
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">
            Call {call.id} · {call.caller}
          </h1>
          <p className="text-sm text-muted-foreground">
            {call.date} {call.time} · {call.organisation} · {call.location}
          </p>
        </div>
        <Button variant="outline" onClick={() => toast.success("Report downloaded", { description: `${call.id}-detection-report.pdf` })}>
          <Download className="mr-1.5 size-4" /> Download report
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <Info label="Duration" value={formatDuration(call.durationSec)} />
        <Info label="Language" value={call.language} />
        <Info label="Risk Score" value={`${call.risk}%`} color={color} />
        <Info label="Confidence" value={`${call.confidence}%`} color="var(--cyan)" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <SectionTitle title="Risk timeline" subtitle="Score evolution across the call" />
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={call.timeline}>
              <defs>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.55} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}s`} />
              <YAxis domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={30} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="risk" stroke={color} strokeWidth={2} fill="url(#riskGrad)" />
              <Line type="monotone" dataKey="confidence" stroke="var(--cyan)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <SectionTitle title="Final verdict" />
          <div className="rounded-2xl border p-4" style={{ borderColor: `color-mix(in oklab, ${color} 40%, transparent)` }}>
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-5" style={{ color }} />
              <p className="text-lg font-semibold" style={{ color }}>
                {riskLabel(call.risk)}
              </p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {call.risk >= 80
                ? "Synthetic speech signature detected with high certainty. The transaction was withheld pending verification."
                : call.risk >= 45
                  ? "Partial anomalies observed. Step-up authentication was requested before proceeding."
                  : "Speech characteristics consistent with an enrolled human speaker."}
            </p>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Action taken</span>
              <span className="font-medium">{call.action}</span>
            </div>
          </div>

          <p className="mt-4 text-sm font-medium">Detected anomalies</p>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            {call.anomalies.map((a) => (
              <li key={a} className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full" style={{ background: color }} />
                {a}
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <SectionTitle title="Transcript" subtitle="Diarised speech-to-text" />
          <div className="scrollbar-thin max-h-[340px] space-y-3 overflow-y-auto pr-1">
            {call.transcript.map((l, i) => (
              <div
                key={i}
                className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm ${
                  l.speaker === "Caller" ? "bg-secondary/60" : "ml-auto border border-primary/25 bg-primary/15"
                }`}
              >
                <div className="mb-0.5 text-[11px] text-muted-foreground">
                  {l.speaker} · {l.t}
                </div>
                {l.text}
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <SectionTitle title="AI analysis timeline" subtitle="Engine events during the session" />
          <div className="relative space-y-4 pl-5">
            <div className="absolute left-1.5 top-1 h-[calc(100%-1rem)] w-px bg-border" />
            {call.timeline.slice(0, 7).map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="relative"
              >
                <span
                  className="absolute -left-[15px] top-1.5 size-2.5 rounded-full"
                  style={{ background: riskColorVar(p.risk) }}
                />
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium tabular-nums">{p.t}s</span>
                  <RiskBadge score={p.risk} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Risk {p.risk}% · confidence {p.confidence}% ·{" "}
                  {p.risk >= 80
                    ? "clone indicators dominant"
                    : p.risk >= 45
                      ? "prosody irregularity observed"
                      : "voice within human baseline"}
                </p>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function Info({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <GlassCard className="p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold" style={color ? { color } : undefined}>
        {value}
      </p>
    </GlassCard>
  );
}
