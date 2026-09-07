import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Activity,
  AlertTriangle,
  Cpu,
  Gauge,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  Target,
  Timer,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GlassCard, SectionTitle, StatCard, Counter } from "@/components/vs/primitives";
import { Button } from "@/components/ui/button";
import {
  HOURLY_DETECTIONS,
  LANGUAGE_MIX,
  RECENT_ALERTS,
  SYSTEM_HEALTH,
} from "@/lib/voiceshield";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VoiceShield AI — Voice Clone Detection Command Centre" },
      {
        name: "description",
        content:
          "Enterprise dashboard for real-time detection of AI voice cloning attacks across banking, telecom and government call centres.",
      },
      { property: "og:title", content: "VoiceShield AI — Voice Clone Detection Command Centre" },
      {
        property: "og:description",
        content: "Monitor call risk scores, alerts and detection accuracy in real time.",
      },
    ],
  }),
  component: Dashboard,
});

const RISK_SPLIT = [
  { name: "Genuine", value: 1462, color: "var(--safe)" },
  { name: "Medium Risk", value: 318, color: "var(--warn)" },
  { name: "High Risk", value: 104, color: "var(--danger)" },
];

function Dashboard() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass grid-noise relative overflow-hidden rounded-3xl p-6 md:p-8"
      >
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            <span className="size-1.5 animate-pulse rounded-full" style={{ background: "var(--safe)" }} />
            All detection clusters operational
          </span>
          <h1 className="mt-4 text-3xl font-semibold md:text-4xl">
            <span className="text-gradient">Real-time detection</span> of AI voice cloning
            impersonation attacks
          </h1>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">
            VoiceShield analyses every inbound call stream for synthetic speech signatures — spectral
            artefacts, prosody drift and speaker-embedding mismatch — and scores caller risk within
            900 milliseconds.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              asChild
              style={{ background: "var(--gradient-brand)", color: "var(--background)" }}
            >
              <Link to="/live">Start Live Demo</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/analytics">View analytics</Link>
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard index={0} label="Calls Analysed Today" value={1884} icon={<PhoneCall className="size-5" />} delta="+12.4% vs yesterday" tone="primary" />
        <StatCard index={1} label="Genuine Calls" value={1462} icon={<ShieldCheck className="size-5" />} delta="77.6% of volume" tone="safe" />
        <StatCard index={2} label="Suspicious Calls" value={318} icon={<AlertTriangle className="size-5" />} delta="Flagged for verification" tone="warn" />
        <StatCard index={3} label="High Risk Calls" value={104} icon={<ShieldAlert className="size-5" />} delta="Blocked or escalated" tone="danger" />
        <StatCard index={4} label="Average Risk Score" value={28.6} decimals={1} suffix="%" icon={<Gauge className="size-5" />} delta="Rolling 24 hours" tone="cyan" />
        <StatCard index={5} label="Detection Accuracy" value={98.7} decimals={1} suffix="%" icon={<Target className="size-5" />} delta="F1 0.981" tone="violet" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <GlassCard className="xl:col-span-2">
          <SectionTitle title="Hourly detection volume" subtitle="Genuine vs suspicious classifications" />
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={HOURLY_DETECTIONS}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--danger)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="var(--danger)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} interval={3} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={32} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="genuine" stroke="var(--primary)" fill="url(#g1)" strokeWidth={2} />
              <Area type="monotone" dataKey="suspicious" stroke="var(--danger)" fill="url(#g2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <SectionTitle title="Risk distribution" subtitle="Today's classified calls" />
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={RISK_SPLIT} dataKey="value" innerRadius={58} outerRadius={90} paddingAngle={4} stroke="none">
                {RISK_SPLIT.map((s) => (
                  <Cell key={s.name} fill={s.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-2">
            {RISK_SPLIT.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="size-2 rounded-full" style={{ background: s.color }} />
                  {s.name}
                </span>
                <span className="tabular-nums font-medium">{s.value}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <GlassCard>
          <SectionTitle title="Recent alerts" subtitle="Auto-escalated events" />
          <div className="space-y-3">
            {RECENT_ALERTS.map((a) => {
              const color =
                a.severity === "high" ? "var(--danger)" : a.severity === "medium" ? "var(--warn)" : "var(--safe)";
              return (
                <div key={a.id} className="rounded-xl border border-border/70 bg-card/40 p-3">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
                    <p className="text-sm font-medium">{a.title}</p>
                    <span className="ml-auto text-[11px] text-muted-foreground">{a.ago}</span>
                  </div>
                  <p className="mt-1 pl-4 text-xs text-muted-foreground">{a.detail}</p>
                </div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard>
          <SectionTitle title="Languages detected" subtitle="Share of analysed audio" />
          <div className="space-y-3">
            {LANGUAGE_MIX.slice(0, 6).map((l, i) => (
              <div key={l.name}>
                <div className="flex justify-between text-sm">
                  <span>{l.name}</span>
                  <span className="tabular-nums text-muted-foreground">{l.value}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary/70">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${l.value * 3}%` }}
                    transition={{ delay: i * 0.06, duration: 0.7 }}
                    className="h-full rounded-full"
                    style={{ background: "var(--gradient-brand)" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard>
            <SectionTitle title="System health" />
            <div className="space-y-2.5">
              {SYSTEM_HEALTH.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Activity
                      className="size-3.5"
                      style={{ color: s.status === "Operational" ? "var(--safe)" : "var(--warn)" }}
                    />
                    {s.name}
                  </span>
                  <span className="tabular-nums text-muted-foreground">{s.value}%</span>
                </div>
              ))}
            </div>
          </GlassCard>

          <div className="grid grid-cols-2 gap-4">
            <GlassCard className="text-center">
              <Cpu className="mx-auto size-5" style={{ color: "var(--cyan)" }} />
              <p className="mt-2 text-xs text-muted-foreground">API Status</p>
              <p className="text-lg font-semibold" style={{ color: "var(--safe)" }}>
                Healthy
              </p>
              <p className="text-[11px] text-muted-foreground">99.98% uptime</p>
            </GlassCard>
            <GlassCard className="text-center">
              <Timer className="mx-auto size-5" style={{ color: "var(--violet)" }} />
              <p className="mt-2 text-xs text-muted-foreground">Processing Latency</p>
              <p className="text-lg font-semibold">
                <Counter value={62} suffix=" ms" />
              </p>
              <p className="text-[11px] text-muted-foreground">p95 · 148 ms</p>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}

export const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  fontSize: "12px",
  color: "var(--popover-foreground)",
};
