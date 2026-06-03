import { Link } from "@tanstack/react-router";
import { Scissors, Instagram, Twitter, Facebook, MapPin, Phone, Mail } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-card/30">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-primary" />
            <span className="font-display text-lg tracking-wide">
              <span className="gold-text">NOIR</span>
              <span className="text-foreground"> & BLADE</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Premium booking software for independent barbers and modern shops.
          </p>
          <div className="mt-5 flex gap-2">
            {[Instagram, Twitter, Facebook].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="social"
                className="rounded-full border border-border p-2 text-muted-foreground transition hover:border-primary/50 hover:text-primary"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-widest text-primary">Platform</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/booking" className="hover:text-foreground">Book an appointment</Link></li>
            <li><Link to="/pricing" className="hover:text-foreground">For barbers</Link></li>
            <li><Link to="/signup" className="hover:text-foreground">Start free trial</Link></li>
            <li><Link to="/login" className="hover:text-foreground">Sign in</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-widest text-primary">Visit</h4>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2"><MapPin className="h-4 w-4 mt-0.5 text-primary" /> 221 Ember Street, Downtown</li>
            <li className="flex gap-2"><Phone className="h-4 w-4 mt-0.5 text-primary" /> (555) 010-1934</li>
            <li className="flex gap-2"><Mail className="h-4 w-4 mt-0.5 text-primary" /> hello@noirblade.co</li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-widest text-primary">Hours</h4>
          <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
            <li className="flex justify-between"><span>Tue – Fri</span><span>9am – 7pm</span></li>
            <li className="flex justify-between"><span>Saturday</span><span>9am – 6pm</span></li>
            <li className="flex justify-between"><span>Sun – Mon</span><span>Closed</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Noir & Blade. Crafted with discipline.</p>
          <p>Premium barber booking platform.</p>
        </div>
      </div>
    </footer>
  );
}
