import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Calendar,
  Scissors,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const items = [
  { to: "/dashboard" as const, label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/appointments" as const, label: "Appointments", icon: Calendar },
  { to: "/dashboard/services" as const, label: "Services", icon: Scissors },
  { to: "/dashboard/customers" as const, label: "Customers", icon: Users },
  { to: "/dashboard/settings" as const, label: "Settings", icon: Settings },
];

export function DashboardNav({ barberName }: { barberName: string }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/login" });
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card/30 lg:flex lg:flex-col">
        <Link to="/" className="flex items-center gap-2 border-b border-border px-6 py-5">
          <Scissors className="h-5 w-5 text-primary" />
          <span className="font-display tracking-wide">
            <span className="gold-text">NOIR</span>
            <span> & BLADE</span>
          </span>
        </Link>
        <nav className="flex-1 space-y-1 p-3">
          {items.map((item) => {
            const active = item.exact
              ? pathname === item.to
              : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-card hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <div className="px-3 py-2 text-xs">
            <div className="text-muted-foreground">Signed in as</div>
            <div className="truncate font-medium">{barberName}</div>
          </div>
          <button
            onClick={signOut}
            className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-card hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="border-b border-border bg-card/30 lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <Scissors className="h-4 w-4 text-primary" />
            <span className="font-display text-sm tracking-wide">
              <span className="gold-text">NOIR</span>
              <span> & BLADE</span>
            </span>
          </Link>
          <button
            onClick={signOut}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Sign out
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-border px-2 py-1.5">
          {items.map((item) => {
            const active = item.exact
              ? pathname === item.to
              : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition ${
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
