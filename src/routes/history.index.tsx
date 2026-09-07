import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { ChevronRight, Download, Search, SearchX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlassCard, EmptyState, RiskBadge } from "@/components/vs/primitives";
import { CALL_HISTORY, formatDuration, riskColorVar } from "@/lib/voiceshield";
import { toast } from "sonner";

export const Route = createFileRoute("/history/")({
  head: () => ({
    meta: [
      { title: "Call History — VoiceShield AI" },
      {
        name: "description",
        content:
          "Searchable archive of analysed calls with risk scores, languages, verdicts and the action taken by the agent.",
      },
      { property: "og:title", content: "Call History — VoiceShield AI" },
      { property: "og:description", content: "Browse every analysed call and open its detection report." },
    ],
  }),
  component: History,
});

function History() {
  const [q, setQ] = useState("");
  const [level, setLevel] = useState("all");

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return CALL_HISTORY.filter((c) => {
      const matches =
        !term ||
        [c.caller, c.organisation, c.phone, c.language, c.id, c.location]
          .join(" ")
          .toLowerCase()
          .includes(term);
      const lvl =
        level === "all" ||
        (level === "high" && c.risk >= 80) ||
        (level === "medium" && c.risk >= 45 && c.risk < 80) ||
        (level === "genuine" && c.risk < 45);
      return matches && lvl;
    });
  }, [q, level]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Call History</h1>
          <p className="text-sm text-muted-foreground">
            {CALL_HISTORY.length} analysed sessions · retention 180 days
          </p>
        </div>
        <Button variant="outline" onClick={() => toast.success("CSV export queued")}>
          <Download className="mr-1.5 size-4" /> Export CSV
        </Button>
      </div>

      <GlassCard className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search caller, organisation, number or call ID…"
              className="pl-9"
            />
          </div>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All risk levels</SelectItem>
              <SelectItem value="genuine">Genuine</SelectItem>
              <SelectItem value="medium">Medium risk</SelectItem>
              <SelectItem value="high">High risk</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      {rows.length === 0 ? (
        <EmptyState
          icon={<SearchX className="size-6" />}
          title="No calls match this filter"
          description="Try a different caller name, organisation or risk level."
          action={
            <Button variant="outline" onClick={() => { setQ(""); setLevel("all"); }}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <GlassCard className="overflow-hidden p-0">
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[960px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  {["Date", "Caller", "Organisation", "Duration", "Language", "Risk", "Status", "Action taken", ""].map(
                    (h) => (
                      <th key={h} className="px-4 py-3 font-medium">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.015, 0.4) }}
                    className="group border-b border-border/50 last:border-0 hover:bg-secondary/40"
                  >
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.date}
                      <span className="ml-2 text-xs">{c.time}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Link to="/history/$id" params={{ id: c.id }} className="font-medium hover:underline">
                        {c.caller}
                      </Link>
                      <div className="text-xs text-muted-foreground">{c.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.organisation}</td>
                    <td className="px-4 py-3 tabular-nums">{formatDuration(c.durationSec)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.language}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold tabular-nums" style={{ color: riskColorVar(c.risk) }}>
                        {c.risk}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge score={c.risk} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.action}</td>
                    <td className="px-4 py-3">
                      <Link
                        to="/history/$id"
                        params={{ id: c.id }}
                        className="inline-flex items-center text-muted-foreground transition-colors group-hover:text-foreground"
                      >
                        <ChevronRight className="size-4" />
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
