import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { riskColorVar, riskLabel, riskLevel } from "@/lib/voiceshield";

export function GlassCard({
  className,
  children,
  glow,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { glow?: boolean }) {
  return (
    <div
      className={cn(
        "glass rounded-2xl p-5 transition-all duration-300",
        glow && "glow-ring",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {right}
    </div>
  );
}

export function Counter({
  value,
  decimals = 0,
  suffix = "",
  className,
}: {
  value: number;
  decimals?: number | undefined;
  suffix?: string | undefined;
  className?: string | undefined;
}) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 90, damping: 20 });
  const text = useTransform(spring, (v) =>
    v.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }),
  );
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    mv.set(value);
  }, [value, mv]);
  useEffect(() => text.on("change", (v) => setDisplay(v)), [text]);

  return (
    <span className={cn("tabular-nums", className)}>
      {display}
      {suffix}
    </span>
  );
}

export function StatCard({
  label,
  value,
  suffix,
  decimals,
  delta,
  icon,
  tone = "primary",
  index = 0,
}: {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
  delta?: string;
  icon: ReactNode;
  tone?: "primary" | "cyan" | "violet" | "safe" | "warn" | "danger";
  index?: number;
}) {
  const toneVar = {
    primary: "var(--primary)",
    cyan: "var(--cyan)",
    violet: "var(--violet)",
    safe: "var(--safe)",
    warn: "var(--warn)",
    danger: "var(--danger)",
  }[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -3 }}
      className="glass relative overflow-hidden rounded-2xl p-4"
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-25 blur-2xl"
        style={{ background: toneVar }}
      />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold" style={{ color: toneVar }}>
            <Counter value={value} suffix={suffix} decimals={decimals} />
          </p>
          {delta ? <p className="mt-1 text-xs text-muted-foreground">{delta}</p> : null}
        </div>
        <div
          className="grid size-10 shrink-0 place-items-center rounded-xl"
          style={{ background: `color-mix(in oklab, ${toneVar} 18%, transparent)`, color: toneVar }}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

export function RiskBadge({ score }: { score: number }) {
  const color = riskColorVar(score);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{
        color,
        background: `color-mix(in oklab, ${color} 16%, transparent)`,
        border: `1px solid color-mix(in oklab, ${color} 38%, transparent)`,
      }}
    >
      <span className="size-1.5 rounded-full" style={{ background: color }} />
      {riskLabel(score)}
    </span>
  );
}

export function Waveform({
  active,
  intensity = 0.5,
  bars = 64,
  className,
}: {
  active: boolean;
  intensity?: number;
  bars?: number;
  className?: string;
}) {
  const [heights, setHeights] = useState<number[]>(() => Array(bars).fill(8));
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      setHeights(Array(bars).fill(6));
      return;
    }
    let frame = 0;
    const loop = () => {
      frame += 1;
      setHeights(
        Array.from({ length: bars }, (_, i) => {
          const wave = Math.sin(i * 0.35 + frame * 0.16) * 0.5 + 0.5;
          const noise = Math.random() * 0.6 + 0.4;
          return 8 + wave * noise * (26 + intensity * 62);
        }),
      );
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [active, bars, intensity]);

  return (
    <div className={cn("flex h-32 items-center justify-center gap-[3px]", className)}>
      {heights.map((h, i) => (
        <span
          key={i}
          className="w-[4px] rounded-full transition-[height] duration-100"
          style={{
            height: `${h}px`,
            background:
              i % 3 === 0
                ? "var(--cyan)"
                : i % 3 === 1
                  ? "var(--primary)"
                  : "var(--violet)",
            opacity: active ? 0.9 : 0.35,
            boxShadow: active ? `0 0 12px color-mix(in oklab, var(--cyan) 45%, transparent)` : "none",
          }}
        />
      ))}
    </div>
  );
}

export function RiskMeter({ score }: { score: number }) {
  const color = riskColorVar(score);
  const level = riskLevel(score);
  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Overall Risk Score</p>
          <p className="text-4xl font-semibold" style={{ color }}>
            <Counter value={score} suffix="%" />
          </p>
        </div>
        <RiskBadge score={score} />
      </div>
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-secondary/60">
        <motion.div
          className="h-full rounded-full"
          animate={{ width: `${score}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
          style={{
            background: `linear-gradient(90deg, color-mix(in oklab, ${color} 55%, transparent), ${color})`,
            boxShadow: `0 0 18px color-mix(in oklab, ${color} 60%, transparent)`,
          }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
        <span>0 · Genuine</span>
        <span>45 · Medium</span>
        <span>80 · High</span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Classification:{" "}
        <span style={{ color }} className="font-medium">
          {level === "genuine" ? "Human speaker" : level === "medium" ? "Requires verification" : "Synthetic voice suspected"}
        </span>
      </p>
    </div>
  );
}

export function MetricCard({
  label,
  value,
  hint,
  invert,
}: {
  label: string;
  value: number;
  hint?: string;
  invert?: boolean;
}) {
  const good = invert ? value < 45 : value >= 55;
  const color = good ? "var(--safe)" : value > (invert ? 70 : 45) && !good ? "var(--danger)" : "var(--warn)";
  return (
    <div className="glass rounded-xl p-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums" style={{ color }}>
          {Math.round(value)}%
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary/70">
        <motion.div
          className="h-full rounded-full"
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6 }}
          style={{ background: color, boxShadow: `0 0 10px color-mix(in oklab, ${color} 60%, transparent)` }}
        />
      </div>
      {hint ? <p className="mt-1.5 text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="glass flex flex-col items-center justify-center rounded-2xl px-6 py-14 text-center">
      <div className="grid size-12 place-items-center rounded-2xl bg-secondary/70 text-muted-foreground">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
