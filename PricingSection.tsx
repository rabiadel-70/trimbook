import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Apprentice",
    price: "Free",
    period: "14-day trial",
    blurb: "Test-drive the full platform. No card required.",
    features: ["Up to 50 bookings", "Full dashboard access", "Customer database", "Mobile-optimized booking page"],
    cta: "Start free trial",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Solo",
    price: "$19",
    period: "per month",
    blurb: "For the independent barber building a clientele.",
    features: ["Unlimited bookings", "Custom working hours", "Service menu management", "Automated time-slot logic", "Public barber profile"],
    cta: "Choose Solo",
    href: "/signup",
    highlight: true,
  },
  {
    name: "Shop",
    price: "$49",
    period: "per month",
    blurb: "For multi-chair shops scaling the brand.",
    features: ["Everything in Solo", "Multiple barbers", "Team calendar", "Customer notes & history", "Priority support"],
    cta: "Choose Shop",
    href: "/signup",
    highlight: false,
  },
];

export function PricingSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6" id="pricing">
      <div className="mb-12 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">For barbers</p>
        <h2 className="mt-2 font-display text-4xl sm:text-5xl">Pricing that respects the craft</h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Start free for 14 days. No card, no commitment. Built for barbers who care about their book.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`relative flex flex-col rounded-xl border p-7 ${
              t.highlight
                ? "gold-glow border-primary/60 bg-gradient-to-b from-primary/10 to-card"
                : "border-border bg-card"
            }`}
          >
            {t.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary-foreground">
                Most popular
              </div>
            )}
            <h3 className="font-display text-2xl">{t.name}</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-5xl gold-text">{t.price}</span>
              <span className="text-sm text-muted-foreground">/ {t.period}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{t.blurb}</p>
            <ul className="mt-6 flex-1 space-y-3 text-sm">
              {t.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              to={t.href}
              className={`mt-7 inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium uppercase tracking-wider transition ${
                t.highlight
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : "border border-border hover:border-primary/50"
              }`}
            >
              {t.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
