import { Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { differenceInDays } from "date-fns";

export function TrialBanner({ createdAt }: { createdAt: string | null }) {
  if (!createdAt) return null;
  const daysUsed = differenceInDays(new Date(), new Date(createdAt));
  const daysLeft = Math.max(0, 14 - daysUsed);
  if (daysLeft <= 0) return null;
  return (
    <div className="border-b border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-xs sm:px-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-foreground">
            <strong className="gold-text font-display text-sm">{daysLeft} {daysLeft === 1 ? "day" : "days"}</strong> left on your free trial
          </span>
        </div>
        <Link
          to="/pricing"
          className="rounded-md border border-primary/40 px-3 py-1 text-primary transition hover:bg-primary/10"
        >
          Upgrade plan →
        </Link>
      </div>
    </div>
  );
}
