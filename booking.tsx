import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { format, addMinutes, startOfDay, isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { CheckCircle2, Scissors } from "lucide-react";

export const Route = createFileRoute("/booking")({
  head: () => ({
    meta: [
      { title: "Book a Chair — Noir & Blade" },
      {
        name: "description",
        content: "Reserve your appointment with our barbers. Quick, easy booking.",
      },
      { property: "og:title", content: "Book a Chair — Noir & Blade" },
      {
        property: "og:description",
        content: "Reserve your appointment with our barbers.",
      },
    ],
  }),
  component: BookingPage,
});

type Service = { id: string; name: string; duration_minutes: number; price_cents: number };
type Barber = { id: string; name: string; bio: string | null };

const bookingSchema = z.object({
  customer_name: z.string().trim().min(1, "Required").max(100),
  customer_phone: z.string().trim().min(5, "Enter a valid phone").max(30),
  customer_email: z.string().trim().email().max(255).optional().or(z.literal("")),
  notes: z.string().max(500).optional(),
});

// Working hours: 9:00 – 19:00, 30-min slots
function generateSlots(date: Date) {
  const slots: Date[] = [];
  const base = startOfDay(date);
  for (let h = 9; h < 19; h++) {
    slots.push(addMinutes(base, h * 60));
    slots.push(addMinutes(base, h * 60 + 30));
  }
  return slots;
}

function BookingPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [barberId, setBarberId] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [taken, setTaken] = useState<Date[]>([]);
  const [slot, setSlot] = useState<Date | null>(null);
  const [form, setForm] = useState({ customer_name: "", customer_phone: "", customer_email: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      const [s, b] = await Promise.all([
        supabase.from("services").select("*").order("price_cents"),
        supabase.from("barbers").select("id, name, bio").eq("active", true).order("name"),
      ]);
      if (s.data) setServices(s.data);
      if (b.data) setBarbers(b.data);
    })();
  }, []);

  useEffect(() => {
    if (!barberId || !date) return;
    (async () => {
      const start = startOfDay(date).toISOString();
      const end = addMinutes(startOfDay(date), 24 * 60).toISOString();
      const { data } = await supabase
        .from("appointments")
        .select("starts_at, ends_at")
        .eq("barber_id", barberId)
        .gte("starts_at", start)
        .lt("starts_at", end)
        .neq("status", "cancelled");
      setTaken((data ?? []).map((a) => new Date(a.starts_at)));
      setSlot(null);
    })();
  }, [barberId, date]);

  const service = useMemo(() => services.find((s) => s.id === serviceId), [services, serviceId]);
  const slots = useMemo(() => (date ? generateSlots(date) : []), [date]);

  const isTaken = (s: Date) =>
    taken.some((t) => Math.abs(t.getTime() - s.getTime()) < 60 * 1000);
  const isPast = (s: Date) => s.getTime() < Date.now();

  async function submit() {
    if (!service || !barberId || !slot) {
      toast.error("Please complete all steps");
      return;
    }
    const parsed = bookingSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const ends_at = addMinutes(slot, service.duration_minutes);
    const { error } = await supabase.from("appointments").insert({
      barber_id: barberId,
      service_id: service.id,
      customer_name: parsed.data.customer_name,
      customer_phone: parsed.data.customer_phone,
      customer_email: parsed.data.customer_email || null,
      notes: parsed.data.notes || null,
      starts_at: slot.toISOString(),
      ends_at: ends_at.toISOString(),
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
          <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
          <h1 className="mt-6 font-display text-4xl">You're booked.</h1>
          <p className="mt-3 text-muted-foreground">
            We sent your request to the chair. {service?.name} with{" "}
            {barbers.find((b) => b.id === barberId)?.name} on{" "}
            {slot && format(slot, "EEE, MMM d 'at' h:mm a")}.
          </p>
          <Button
            className="mt-8"
            onClick={() => {
              setSuccess(false);
              setSlot(null);
              setForm({ customer_name: "", customer_phone: "", customer_email: "", notes: "" });
            }}
          >
            Book another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Reserve</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">Book your chair</h1>

        {/* 1. Service */}
        <Section step={1} title="Choose a service">
          <div className="grid gap-3 sm:grid-cols-2">
            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => setServiceId(s.id)}
                className={`flex items-center justify-between rounded-lg border p-4 text-left transition ${
                  serviceId === s.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Scissors className="h-4 w-4 text-primary" />
                    <span className="font-display text-lg">{s.name}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{s.duration_minutes} min</p>
                </div>
                <span className="gold-text font-display text-lg">${(s.price_cents / 100).toFixed(0)}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* 2. Barber */}
        <Section step={2} title="Pick a barber">
          {barbers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No barbers available yet. Check back soon.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {barbers.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBarberId(b.id)}
                  className={`rounded-lg border p-4 text-left transition ${
                    barberId === b.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="font-display text-lg">{b.name}</div>
                  {b.bio && <p className="mt-1 text-xs text-muted-foreground">{b.bio}</p>}
                </button>
              ))}
            </div>
          )}
        </Section>

        {/* 3. Date + time */}
        <Section step={3} title="Pick date & time">
          <div className="grid gap-6 md:grid-cols-[auto_1fr]">
            <div className="rounded-lg border border-border bg-card p-2">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(d) => d < startOfDay(new Date())}
                className="pointer-events-auto"
              />
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                {date ? format(date, "EEEE, MMMM d") : "Select a date"}
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((s) => {
                  const disabled = isTaken(s) || isPast(s) || !barberId;
                  const active = slot && isSameDay(slot, s) && slot.getTime() === s.getTime();
                  return (
                    <button
                      key={s.toISOString()}
                      disabled={disabled}
                      onClick={() => setSlot(s)}
                      className={`rounded-md border px-2 py-2 text-sm transition ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : disabled
                            ? "border-border/40 text-muted-foreground/40 line-through"
                            : "border-border hover:border-primary/50"
                      }`}
                    >
                      {format(s, "h:mm a")}
                    </button>
                  );
                })}
              </div>
              {!barberId && (
                <p className="mt-3 text-xs text-muted-foreground">Pick a barber to see availability.</p>
              )}
            </div>
          </div>
        </Section>

        {/* 4. Details */}
        <Section step={4} title="Your details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <Input
                value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
              />
            </Field>
            <Field label="Phone">
              <Input
                value={form.customer_phone}
                onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
              />
            </Field>
            <Field label="Email (optional)" className="sm:col-span-2">
              <Input
                type="email"
                value={form.customer_email}
                onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
              />
            </Field>
            <Field label="Notes (optional)" className="sm:col-span-2">
              <Textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </Field>
          </div>
        </Section>

        <div className="mt-8 flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">
            {service ? service.name : "—"} ·{" "}
            {slot ? format(slot, "EEE MMM d, h:mm a") : "Pick a time"}
          </div>
          <Button
            size="lg"
            disabled={submitting || !serviceId || !barberId || !slot}
            onClick={submit}
            className="gold-glow"
          >
            {submitting ? "Booking…" : "Confirm booking"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Section({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/50 text-xs text-primary">
          {step}
        </span>
        <h2 className="font-display text-2xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
