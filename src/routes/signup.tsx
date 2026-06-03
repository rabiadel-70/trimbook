import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/SiteHeader";
import { toast } from "sonner";
import { Scissors, Check } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Start Free Trial — Noir & Blade" },
      { name: "description", content: "Create your barber account and start your 14-day free trial." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { name },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created. Check your email to confirm, then sign in.");
    navigate({ to: "/login" });
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto grid max-w-5xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary">14-day free trial</p>
          <h1 className="mt-3 font-display text-5xl">
            Run your chair like a <span className="gold-text">brand.</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Join independent barbers using Noir & Blade to manage their book, grow clientele,
            and own their schedule.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              "Full platform access for 14 days",
              "No credit card required",
              "Cancel anytime — keep your data",
              "Live booking page in minutes",
            ].map((f) => (
              <li key={f} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 text-primary" /> {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-7">
          <div className="mb-6 flex items-center gap-2">
            <Scissors className="h-5 w-5 text-primary" />
            <p className="text-xs uppercase tracking-[0.25em] text-primary">Create barber account</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
            </div>
            <Button type="submit" className="gold-glow w-full" disabled={busy}>
              {busy ? "Creating account…" : "Start free trial"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Already a barber?{" "}
              <Link to="/login" className="text-primary hover:underline">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
