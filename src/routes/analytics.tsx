import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GlassCard, SectionTitle, StatCard } from "@/components/vs/primitives";
import {
  ACCURACY_TREND,
  ATTACK_TYPES,
  INDUSTRIES,
  LANGUAGE_MIX,
  LATENCY_SERIES,
  MONTHLY_REPORT,
  REGIONS,
  WEEKLY_RISK,
} from "@/lib/voiceshield";
import { Activity, Globe2, ShieldAlert, Timer } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — VoiceShield AI" },
      {
        name: "description",
        content:
          "Detection accuracy, attack types, regional attack density across India, targeted industries and processing latency analytics.",
      },
      { property: "og:title", content: "Analytics — VoiceShield AI" },
      { property: "og:description", content: "Deep analytics on voice cloning attack patterns and model performance." },
    ],
  }),
  component: Analytics,
});

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  fontSize: "12px",
  color: "var(--popover-foreground)",
};

const PALETTE = ["var(--primary)", "var(--cyan)", "var(--violet)", "var(--warn)", "var(--danger)", "var(--safe)"];

function Analytics() {
  const maxRegion = Math.max(...REGIONS.map((r) => r.attacks));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Model performance and threat intelligence · last 6 months</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Detection Accuracy" value={98.7} decimals={1} suffix="%" icon={<ShieldAlert className="size-5" />} tone="primary" delta="+0.6 pts QoQ" />
        <StatCard index={1} label="Attacks Blocked" value={2384} icon={<Activity className="size-5" />} tone="danger" delta="Across 6 months" />
        <StatCard index={2} label="Languages Supported" value={22} icon={<Globe2 className="size-5" />} tone="violet" delta="8 in active production" />
        <StatCard index={3} label="Median Latency" value={62} suffix=" ms" icon={<Timer className="size-5" />} tone="cyan" delta="Edge inference" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <GlassCard className="xl:col-span-2">
          <SectionTitle title="Detection accuracy vs false positives" subtitle="Monthly model evaluation" />
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={ACCURACY_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis yAxisId="l" domain={[94, 100]} stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={34} />
              <YAxis yAxisId="r" orientation="right" domain={[0, 6]} stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={30} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line yAxisId="l" type="monotone" dataKey="accuracy" stroke="var(--cyan)" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line yAxisId="r" type="monotone" dataKey="falsePositive" stroke="var(--danger)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <SectionTitle title="Attack types" subtitle="Share of confirmed attacks" />
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={ATTACK_TYPES} dataKey="value" innerRadius={55} outerRadius={92} paddingAngle={3} stroke="none">
                {ATTACK_TYPES.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 text-sm">
            {ATTACK_TYPES.map((a, i) => (
              <div key={a.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="size-2 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
                  {a.name}
                </span>
                <span className="tabular-nums">{a.value}%</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <GlassCard>
          <SectionTitle title="Weekly risk trends" subtitle="Average vs peak risk score" />
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={WEEKLY_RISK}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={28} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="avgRisk" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="peakRisk" fill="var(--violet)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <SectionTitle title="Languages detected" subtitle="Analysed audio distribution" />
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={LANGUAGE_MIX}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
              <Radar dataKey="value" stroke="var(--cyan)" fill="var(--cyan)" fillOpacity={0.3} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <SectionTitle title="Top targeted industries" subtitle="Attack attempts by sector" />
          <div className="mt-2 space-y-3">
            {INDUSTRIES.map((ind, i) => (
              <div key={ind.name}>
                <div className="flex justify-between text-sm">
                  <span>{ind.name}</span>
                  <span className="tabular-nums text-muted-foreground">{ind.value}%</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary/70">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${ind.value * 2.4}%` }}
                    transition={{ delay: i * 0.07, duration: 0.7 }}
                    className="h-full rounded-full"
                    style={{ background: PALETTE[i % PALETTE.length] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <GlassCard className="xl:col-span-2">
          <SectionTitle title="Regional attack heatmap — India" subtitle="Confirmed clone attempts by state" />
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {REGIONS.map((r, i) => {
              const heat = r.attacks / maxRegion;
              return (
                <motion.div
                  key={r.state}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-xl border p-3"
                  style={{
                    borderColor: `color-mix(in oklab, var(--danger) ${Math.round(heat * 55)}%, var(--border))`,
                    background: `color-mix(in oklab, var(--danger) ${Math.round(heat * 22)}%, transparent)`,
                  }}
                >
                  <p className="text-sm font-medium">{r.state}</p>
                  <p className="text-xs text-muted-foreground">{r.attacks} attempts</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary/70">
                    <div className="h-full rounded-full" style={{ width: `${heat * 100}%`, background: "var(--danger)" }} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard>
          <SectionTitle title="Average processing latency" subtitle="Edge vs cloud inference (ms)" />
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={LATENCY_SERIES}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="t" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={32} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="edge" stroke="var(--safe)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="cloud" stroke="var(--violet)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <GlassCard className="p-0">
        <div className="p-5 pb-0">
          <SectionTitle title="Monthly reports" subtitle="Volume, blocked attacks and accuracy" />
        </div>
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Month</th>
                <th className="px-5 py-3 font-medium">Calls analysed</th>
                <th className="px-5 py-3 font-medium">Attacks blocked</th>
                <th className="px-5 py-3 font-medium">Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {MONTHLY_REPORT.map((m) => (
                <tr key={m.month} className="border-b border-border/50 last:border-0 hover:bg-secondary/40">
                  <td className="px-5 py-3 font-medium">{m.month} 2026</td>
                  <td className="px-5 py-3 tabular-nums text-muted-foreground">{m.analysed.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3 tabular-nums" style={{ color: "var(--danger)" }}>{m.blocked}</td>
                  <td className="px-5 py-3 tabular-nums" style={{ color: "var(--safe)" }}>{m.accuracy}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
