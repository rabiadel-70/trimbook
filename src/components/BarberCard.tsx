import { Link } from "@tanstack/react-router";
import { Scissors, Award } from "lucide-react";

export type BarberCardData = {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  specialties: string[];
  years_experience: number;
};

export function BarberCard({ barber }: { barber: BarberCardData }) {
  const initials = barber.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/50">
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-card to-background">
        {barber.avatar_url ? (
          <img
            src={barber.avatar_url}
            alt={barber.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-card via-background to-card">
            <span className="font-display text-7xl text-primary/40">{initials}</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-card to-transparent" />
        {barber.years_experience > 0 && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-primary/40 bg-background/80 px-2.5 py-1 text-xs text-primary backdrop-blur">
            <Award className="h-3 w-3" /> {barber.years_experience}y
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-display text-2xl">{barber.name}</h3>
        {barber.bio && (
          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{barber.bio}</p>
        )}
        {barber.specialties.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {barber.specialties.slice(0, 3).map((s) => (
              <span
                key={s}
                className="rounded-full border border-border bg-background/50 px-2.5 py-0.5 text-[11px] uppercase tracking-wider text-muted-foreground"
              >
                {s}
              </span>
            ))}
          </div>
        )}
        <Link
          to="/booking"
          search={{ barber: barber.id }}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-4 py-2.5 text-sm font-medium uppercase tracking-wider text-primary transition hover:bg-primary/20"
        >
          <Scissors className="h-3.5 w-3.5" /> Book with {barber.name.split(" ")[0]}
        </Link>
      </div>
    </div>
  );
}
