import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Scissors, Calendar, BarChart3, Shield, ArrowRight, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BarberCard } from "@/components/BarberCard";
import { Testimonials } from "@/components/Testimonials";
import { PricingSection } from "@/components/PricingSection";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Noir & Blade — Premium Barber Booking Platform" },
      {
        name: "description",
        content:
          "The booking platform for modern barbers. Manage appointments, grow your clientele, and run your chair like a brand.",
      },
      { property: "og:title", content: "Noir & Blade — Premium Barber Booking" },
      { property: "og:description", content: "The booking platform for modern barbers." },
    ],
  }),
  component: HomePage,
});

const services = [
  { name: "Classic Haircut", price: "$35", duration: "30 min" },
  { name: "Beard Trim", price: "$20", duration: "20 min" },
  { name: "Haircut + Beard", price: "$50", duration: "50 min" },
  { name: "Hot Towel Shave", price: "$40", duration: "40 min" },
];

const platformFeatures = [
  { icon: Calendar, title: "Smart Calendar", body: "Auto-managed time slots, no more double bookings." },
  { icon: BarChart3, title: "Real Dashboard", body: "Track revenue, retention, and your busiest hours." },
  { icon: Shield, title: "Your Brand", body: "A polished public profile customers actually trust." },
];

function HomePage() {
  const { data: barbers } = useQuery({
    queryKey: ["public-barbers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("barbers")
        .select("id, name, bio, avatar_url, specialties, years_experience")
        .eq("active", true)
        .eq("accepting_bookings", true)
        .order("created_at", { ascending: true });
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Barber at work" className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 md:py-44">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-3 w-3" /> The modern barber's platform
            </div>
            <h1 className="font-display text-5xl leading-[1.05] sm:text-6xl md:text-7xl">
              Sharp lines.<br />
              <span className="gold-text">Timeless craft.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base text-muted-foreground sm:text-lg">
              Book a chair in seconds — or run yours like a brand. Built for independent
              barbers and small shops who care about the details.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/booking"
                className="gold-glow inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition hover:opacity-90"
              >
                Book an appointment <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center rounded-md border border-primary/40 bg-primary/5 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary transition hover:bg-primary/10"
              >
                Start free trial
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span>✓ 14-day free trial</span>
              <span>✓ No card required</span>
              <span>✓ Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Meet our barbers */}
      <section id="barbers" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.25em] text-primary">The crew</p>
            <h2 className="font-display text-4xl sm:text-5xl">Meet our barbers</h2>
          </div>
          <Link
            to="/booking"
            className="text-sm uppercase tracking-wider text-primary transition hover:text-foreground"
          >
            See availability →
          </Link>
        </div>
        {barbers && barbers.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {barbers.map((b) => (
              <BarberCard key={b.id} barber={b} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            Our roster is loading.
          </div>
        )}
      </section>

      {/* Services */}
      <section id="services" className="border-t border-border bg-card/30">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="mb-12 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-primary">The menu</p>
            <h2 className="mt-2 font-display text-4xl sm:text-5xl">Services & pricing</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {services.map((s) => (
              <div
                key={s.name}
                className="group flex items-center justify-between rounded-lg border border-border bg-background/40 p-6 transition hover:border-primary/50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Scissors className="h-4 w-4 text-primary" />
                    <h3 className="font-display text-xl">{s.name}</h3>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{s.duration}</p>
                </div>
                <div className="gold-text font-display text-2xl">{s.price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Platform features */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="mb-12 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-primary">For barbers</p>
          <h2 className="mt-2 font-display text-4xl sm:text-5xl">Run your chair like a brand</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {platformFeatures.map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-7">
              <f.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-display text-xl">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <PricingSection />

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="gold-glow relative overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/15 via-card to-card p-12 text-center sm:p-16">
          <h2 className="font-display text-4xl sm:text-5xl">
            Your chair, <span className="gold-text">your rules.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Start your 14-day free trial. No card required. Be live in five minutes.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/signup"
              className="gold-glow inline-flex items-center justify-center gap-2 rounded-md bg-primary px-7 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition hover:opacity-90"
            >
              Start free trial <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center rounded-md border border-border px-7 py-3 text-sm font-semibold uppercase tracking-wider transition hover:border-primary/50"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
