import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  BarChart3,
  Bell,
  Command as CommandIcon,
  Cpu,
  LayoutDashboard,
  Menu,
  Moon,
  PhoneCall,
  Radio,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  Sun,
  X,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RECENT_ALERTS } from "@/lib/voiceshield";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/live", label: "Live Call Monitor", icon: Radio },
  { to: "/history", label: "Call History", icon: PhoneCall },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/api", label: "API & Integrations", icon: Cpu },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [light, setLight] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    setLight((v) => {
      document.documentElement.classList.toggle("light", !v);
      return !v;
    });
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden"
          />
        ) : null}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[268px] flex-col border-r border-sidebar-border bg-sidebar/85 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 px-5 py-5">
          <div
            className="grid size-10 place-items-center rounded-xl"
            style={{ background: "var(--gradient-brand)" }}
          >
            <ShieldCheck className="size-5 text-background" />
          </div>
          <div>
            <p className="font-display text-base font-semibold leading-tight">VoiceShield AI</p>
            <p className="text-[11px] text-muted-foreground">Voice Clone Defence</p>
          </div>
          <button
            className="ml-auto rounded-md p-1 text-muted-foreground lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground glow-ring"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
                )}
              >
                <Icon className="size-4" style={active ? { color: "var(--cyan)" } : undefined} />
                <span className="font-medium">{label}</span>
                {active ? (
                  <motion.span
                    layoutId="nav-dot"
                    className="ml-auto size-1.5 rounded-full"
                    style={{ background: "var(--cyan)" }}
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="m-3 rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Activity className="size-3.5" style={{ color: "var(--safe)" }} />
            Engine v4.2 · Online
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            14 edge nodes · 62 ms median latency
          </p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-h-screen w-full flex-1 flex-col lg:pl-[268px]">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/70 px-4 py-3 backdrop-blur-xl md:px-6">
          <button
            className="rounded-lg border border-border p-2 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="size-4" />
          </button>

          <button
            onClick={() => setPaletteOpen(true)}
            className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-card/50 px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-ring md:max-w-md"
          >
            <Search className="size-4" />
            <span className="truncate">Search calls, alerts, pages…</span>
            <kbd className="ml-auto hidden items-center gap-1 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] md:inline-flex">
              <CommandIcon className="size-3" />K
            </kbd>
          </button>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {light ? <Moon className="size-4" /> : <Sun className="size-4" />}
            </Button>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAlertsOpen((v) => !v)}
                aria-label="Notifications"
              >
                <Bell className="size-4" />
                <span
                  className="absolute right-1.5 top-1.5 size-2 rounded-full"
                  style={{ background: "var(--danger)" }}
                />
              </Button>
              <AnimatePresence>
                {alertsOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    className="glass-strong absolute right-0 mt-2 w-[320px] rounded-2xl p-2"
                  >
                    <p className="px-2 py-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                      Live alerts
                    </p>
                    {RECENT_ALERTS.slice(0, 4).map((a) => (
                      <div key={a.id} className="rounded-xl px-2 py-2 hover:bg-secondary/50">
                        <div className="flex items-center gap-2">
                          <span
                            className="size-1.5 rounded-full"
                            style={{
                              background:
                                a.severity === "high"
                                  ? "var(--danger)"
                                  : a.severity === "medium"
                                    ? "var(--warn)"
                                    : "var(--safe)",
                            }}
                          />
                          <p className="text-sm font-medium">{a.title}</p>
                        </div>
                        <p className="pl-3.5 text-xs text-muted-foreground">{a.detail}</p>
                        <p className="pl-3.5 text-[11px] text-muted-foreground/70">{a.ago}</p>
                      </div>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
            <Button
              onClick={() => navigate({ to: "/live" })}
              className="hidden md:inline-flex"
              style={{ background: "var(--gradient-brand)", color: "var(--background)" }}
            >
              <Radio className="mr-1.5 size-4" />
              Start Live Demo
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 py-5 md:px-6 md:py-7">{children}</main>

        <footer className="border-t border-border px-4 py-4 text-xs text-muted-foreground md:px-6">
          VoiceShield AI · Prototype build for demonstration · Simulated detection data
        </footer>
      </div>

      <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen}>
        <CommandInput placeholder="Jump to a page or action…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {NAV.map(({ to, label, icon: Icon }) => (
              <CommandItem
                key={to}
                value={label}
                onSelect={() => {
                  setPaletteOpen(false);
                  navigate({ to });
                }}
              >
                <Icon className="mr-2 size-4" />
                {label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Actions">
            <CommandItem
              value="Start live demo"
              onSelect={() => {
                setPaletteOpen(false);
                navigate({ to: "/live" });
              }}
            >
              <Radio className="mr-2 size-4" />
              Start live demo
            </CommandItem>
            <CommandItem value="Toggle theme" onSelect={() => { setPaletteOpen(false); toggleTheme(); }}>
              <Sun className="mr-2 size-4" />
              Toggle theme
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
