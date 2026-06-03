import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Daniel R.",
    role: "Regular since 2022",
    body: "Sharpest fade in the city. Marco doesn't just cut — he composes. The hot towel finish ruined other barbershops for me.",
  },
  {
    name: "Priya K.",
    role: "Wedding cut",
    body: "Walked out feeling like a different person. The atmosphere, the music, the precision. Worth every dollar.",
  },
  {
    name: "Marcus T.",
    role: "Beard regular",
    body: "Booking is effortless and the chair feels like a private suite. Leo's beard work is on another level entirely.",
  },
];

export function Testimonials() {
  return (
    <section className="border-y border-border bg-card/30 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Word from the chair</p>
          <h2 className="mt-2 font-display text-4xl sm:text-5xl">Loved by regulars</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="relative rounded-xl border border-border bg-background/60 p-7"
            >
              <Quote className="absolute right-5 top-5 h-6 w-6 text-primary/30" />
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed text-foreground/90">
                "{t.body}"
              </blockquote>
              <figcaption className="mt-5 border-t border-border/60 pt-4">
                <div className="font-display text-base">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
