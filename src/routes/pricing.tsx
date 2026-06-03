import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PricingSection } from "@/components/PricingSection";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing for Barbers — Noir & Blade" },
      { name: "description", content: "Simple, fair pricing for independent barbers and small shops. Start free for 14 days." },
      { property: "og:title", content: "Pricing for Barbers — Noir & Blade" },
      { property: "og:description", content: "Start free for 14 days. No card required." },
    ],
  }),
  component: PricingPage,
});

const faqs = [
  { q: "Do I need a credit card to start?", a: "No. The 14-day trial is fully free and requires no payment details. Set up your chair, take bookings, and decide afterwards." },
  { q: "Can I cancel anytime?", a: "Yes. There are no contracts. Cancel from your dashboard and your account stays accessible until the end of your billing cycle." },
  { q: "How are appointments protected?", a: "Every booking is locked to your chair. The system blocks double-bookings at the database level — not just in the UI." },
  { q: "Can I bring my own clients?", a: "Of course. Share your booking link, embed it on Instagram, or hand out a QR code. Your customers book directly with you." },
];

function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-4 pt-20 text-center sm:px-6">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Pricing</p>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">
          Simple. <span className="gold-text">Honest.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
          Pick the plan that matches your chair. Upgrade or downgrade whenever your book grows.
        </p>
      </section>
      <PricingSection />

      <section className="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
        <h2 className="mb-8 font-display text-3xl">Frequently asked</h2>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-lg border border-border bg-card p-5 transition hover:border-primary/40"
            >
              <summary className="cursor-pointer list-none font-display text-lg marker:hidden">
                <span className="flex items-center justify-between">
                  {f.q}
                  <span className="text-primary transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
