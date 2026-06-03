import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, startOfDay, addDays } from "date-fns";
import { Scissors, LogOut, Calendar as CalIcon, DollarSign, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — Noir & Blade" }],
  }),
  component: DashboardPage,
});

type Appt = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  starts_at: string;
  ends_at: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes: string | null;
  services: { name: string; price_cents: number } | null;
};

const statusColors: Record<Appt["status"], string> = {
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-primary/15 text-primary border-primary/40",
  completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-muted text-muted-foreground border-border line-through",
};

function DashboardPage() {
  const navigate = useNavigate();
  const [barberName, setBarberName] = useState("");
  const [appts, setAppts] = useState<Appt[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) return;
    const [{ data: barber }, { data: list }] = await Promise.all([
      supabase.from("barbers").select("name").eq("id", uid).single(),
      supabase
        .from("appointments")
        .select("id, customer_name, customer_phone, customer_email, starts_at, ends_at, status, notes, services(name, price_cents)")
        .eq("barber_id", uid)
        .gte("starts_at", startOfDay(addDays(new Date(), -1)).toISOString())
        .order("starts_at", { ascending: true }),
    ]);
    if (barber) setBarberName(barber.name);
    if (list) setAppts(list as unknown as Appt[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

  async function setStatus(id: string, status: Appt["status"]) {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Marked ${status}`);
    load();
  }

  const today = useMemo(() => appts.filter((a) => isSameDay(new Date(a.starts_at), new Date())), [appts]);
  const dayAppts = useMemo(() => appts.filter((a) => isSameDay(new Date(a.starts_at), date)), [appts, date]);
  const next = useMemo(
    () => today.find((a) => new Date(a.starts_at) > new Date() && a.status !== "cancelled"),
    [today],
  );
  const revenueToday = today
    .filter((a) => a.status === "completed")
    .reduce((sum, a) => sum + (a.services?.price_cents ?? 0), 0);

  const datesWithAppts = useMemo(
    () => appts.filter((a) => a.status !== "cancelled").map((a) => new Date(a.starts_at)),
    [appts],
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-primary" />
            <span className="font-display tracking-wide">
              <span className="gold-text">NOIR</span>
              <span> & BLADE</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden text-right text-sm sm:block">
              <div className="text-muted-foreground">Signed in as</div>
              <div className="font-medium">{barberName || "Barber"}</div>
            </div>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Dashboard</p>
        <h1 className="mt-1 font-display text-4xl">Today's chair</h1>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Stat icon={CalIcon} label="Appointments today" value={today.length.toString()} />
          <Stat
            icon={Clock}
            label="Next up"
            value={next ? format(new Date(next.starts_at), "h:mm a") : "—"}
            sub={next?.customer_name}
          />
          <Stat icon={DollarSign} label="Revenue today" value={`$${(revenueToday / 100).toFixed(0)}`} />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[auto_1fr]">
          <div className="rounded-lg border border-border bg-card p-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
              modifiers={{ booked: datesWithAppts }}
              modifiersClassNames={{ booked: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-primary" }}
              className="pointer-events-auto"
            />
          </div>

          <div>
            <h2 className="mb-4 font-display text-2xl">
              {format(date, "EEEE, MMMM d")}{" "}
              <span className="text-sm text-muted-foreground">({dayAppts.length})</span>
            </h2>
            {loading ? (
              <p className="text-muted-foreground">Loading…</p>
            ) : dayAppts.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                No appointments on this day.
              </div>
            ) : (
              <div className="space-y-3">
                {dayAppts.map((a) => (
                  <div key={a.id} className="rounded-lg border border-border bg-card p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display text-lg">{a.customer_name}</span>
                          <Badge variant="outline" className={statusColors[a.status]}>
                            {a.status}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {format(new Date(a.starts_at), "h:mm a")} – {format(new Date(a.ends_at), "h:mm a")}
                          {" · "}
                          {a.services?.name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {a.customer_phone}
                          {a.customer_email ? ` · ${a.customer_email}` : ""}
                        </p>
                        {a.notes && (
                          <p className="mt-2 rounded border border-border/60 bg-background/60 p-2 text-xs italic text-muted-foreground">
                            "{a.notes}"
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {a.status === "pending" && (
                          <Button size="sm" onClick={() => setStatus(a.id, "confirmed")}>
                            Confirm
                          </Button>
                        )}
                        {a.status === "confirmed" && (
                          <Button size="sm" onClick={() => setStatus(a.id, "completed")}>
                            Complete
                          </Button>
                        )}
                        {a.status !== "cancelled" && a.status !== "completed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setStatus(a.id, "cancelled")}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </div>
      <div className="mt-3 font-display text-3xl">{value}</div>
      {sub && <div className="mt-1 text-sm text-muted-foreground">{sub}</div>}
    </div>
  );
}
