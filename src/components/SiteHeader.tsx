import { Link } from "@tanstack/react-router";
import { Scissors, Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { to: "/" as const, label: "Home", exact: true },
  { to: "/booking" as const, label: "Book" },
  { to: "/pricing" as const, label: "For Barbers" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <Scissors className="h-5 w-5 text-primary" />
          <span className="font-display text-lg tracking-wide">
            <span className="gold-text">NOIR</span>
            <span className="text-foreground"> & BLADE</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={l.exact ? { exact: true } : undefined}
              className="rounded px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/login"
            className="ml-2 rounded-md px-3 py-1.5 text-muted-foreground transition hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="ml-1 rounded-md border border-primary/40 bg-primary/10 px-4 py-1.5 text-primary transition hover:bg-primary/20"
          >
            Start free trial
          </Link>
        </nav>

        <button
          className="rounded-md p-2 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-4 py-3 sm:px-6">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-card hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="rounded px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-card hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-md border border-primary/40 bg-primary/10 px-3 py-2.5 text-center text-sm text-primary"
            >
              Start free trial
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
