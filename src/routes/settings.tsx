import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { Bell, Languages, ShieldCheck, SlidersHorizontal, Users } from "lucide-react";
import { toast } from "sonner";
import { GlassCard, SectionTitle } from "@/components/vs/primitives";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { LANGUAGES } from "@/lib/voiceshield";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — VoiceShield AI" },
      {
        name: "description",
        content:
          "Tune detection sensitivity, alert thresholds, supported languages, team access and compliance controls for VoiceShield AI.",
      },
      { property: "og:title", content: "Settings — VoiceShield AI" },
      {
        property: "og:description",
        content: "Detection thresholds, alerting, languages and team access controls.",
      },
    ],
  }),
  component: SettingsPage,
});

const TEAM = [
  { name: "Sarangraj Yejare", email: "sarangraj@bank.example", role: "Owner" },
  { name: "Priya Nair", email: "priya.n@bank.example", role: "Security analyst" },
  { name: "Imran Sheikh", email: "imran.s@bank.example", role: "Fraud ops" },
  { name: "Kavya Reddy", email: "kavya.r@bank.example", role: "Read only" },
];

function SettingsPage() {
  const [mediumThreshold, setMediumThreshold] = useState(45);
  const [highThreshold, setHighThreshold] = useState(80);
  const [sensitivity, setSensitivity] = useState(72);
  const [languages, setLanguages] = useState<string[]>(LANGUAGES.slice(0, 5));
  const [toggles, setToggles] = useState({
    autoBlock: true,
    mfaOnMedium: true,
    emailAlerts: true,
    smsAlerts: false,
    recordCalls: true,
    retainAudio: false,
  });

  const set = (k: keyof typeof toggles) => (v: boolean) => {
    setToggles((t) => ({ ...t, [k]: v }));
    toast.success("Preference updated");
  };

  const toggleLang = (l: string) =>
    setLanguages((ls) => (ls.includes(l) ? ls.filter((x) => x !== l) : [...ls, l]));

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard>
          <div className="flex flex-wrap items-center gap-4">
            <div
              className="grid size-12 place-items-center rounded-2xl"
              style={{ background: "var(--gradient-brand)" }}
            >
              <SlidersHorizontal className="size-6 text-background" />
            </div>
            <div className="min-w-[240px] flex-1">
              <h1 className="font-display text-2xl font-semibold">Settings</h1>
              <p className="text-sm text-muted-foreground">
                Detection thresholds, alerting, language coverage and access control.
              </p>
            </div>
            <Button
              style={{ background: "var(--gradient-brand)", color: "var(--background)" }}
              onClick={() => toast.success("Configuration saved across 14 edge nodes")}
            >
              Save changes
            </Button>
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <SectionTitle
            title="Detection thresholds"
            subtitle="Risk score boundaries used to classify a call"
          />
          <div className="space-y-6">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <Label>Medium risk from</Label>
                <span style={{ color: "var(--warn)" }}>{mediumThreshold}</span>
              </div>
              <Slider
                value={[mediumThreshold]}
                min={20}
                max={70}
                step={1}
                onValueChange={(v) => setMediumThreshold(v[0] ?? mediumThreshold)}
              />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <Label>High risk from</Label>
                <span style={{ color: "var(--danger)" }}>{highThreshold}</span>
              </div>
              <Slider
                value={[highThreshold]}
                min={60}
                max={98}
                step={1}
                onValueChange={(v) => setHighThreshold(v[0] ?? highThreshold)}
              />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <Label>Model sensitivity</Label>
                <span style={{ color: "var(--cyan)" }}>{sensitivity}%</span>
              </div>
              <Slider
                value={[sensitivity]}
                min={30}
                max={100}
                step={1}
                onValueChange={(v) => setSensitivity(v[0] ?? sensitivity)}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Higher sensitivity catches more clones but raises false positives.
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <SectionTitle title="Automated response" subtitle="What the platform does on detection" />
          <div className="space-y-1">
            {[
              { k: "autoBlock" as const, label: "Block transactions on high risk", icon: ShieldCheck },
              { k: "mfaOnMedium" as const, label: "Require MFA on medium risk", icon: ShieldCheck },
              { k: "emailAlerts" as const, label: "Email alerts to fraud ops", icon: Bell },
              { k: "smsAlerts" as const, label: "SMS alerts to on-call analyst", icon: Bell },
              { k: "recordCalls" as const, label: "Record flagged calls", icon: ShieldCheck },
              { k: "retainAudio" as const, label: "Retain raw audio beyond 30 days", icon: ShieldCheck },
            ].map(({ k, label, icon: Icon }) => (
              <div
                key={k}
                className="flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-secondary/40"
              >
                <Icon className="size-4 text-muted-foreground" />
                <span className="text-sm">{label}</span>
                <Switch className="ml-auto" checked={toggles[k]} onCheckedChange={set(k)} />
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <SectionTitle
            title="Language coverage"
            subtitle="Models loaded on the detection edge nodes"
            right={<Languages className="size-4 text-muted-foreground" />}
          />
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((l) => {
              const on = languages.includes(l);
              return (
                <button
                  key={l}
                  onClick={() => toggleLang(l)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-all",
                    on
                      ? "border-transparent text-background"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                  style={on ? { background: "var(--gradient-brand)" } : undefined}
                >
                  {l}
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            {languages.length} of {LANGUAGES.length} languages active · adding a language adds ~8 ms
            latency.
          </p>
        </GlassCard>

        <GlassCard>
          <SectionTitle
            title="Team access"
            subtitle="Who can view and act on detections"
            right={<Users className="size-4 text-muted-foreground" />}
          />
          <div className="space-y-2">
            {TEAM.map((m) => (
              <div
                key={m.email}
                className="flex items-center gap-3 rounded-xl border border-border/60 px-3 py-2.5"
              >
                <div
                  className="grid size-8 place-items-center rounded-full text-xs font-semibold text-background"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  {m.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{m.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{m.email}</p>
                </div>
                <span className="ml-auto text-xs text-muted-foreground">{m.role}</span>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            className="mt-3 w-full"
            onClick={() => toast.success("Invitation sent")}
          >
            Invite teammate
          </Button>
        </GlassCard>
      </div>
    </div>
  );
}
