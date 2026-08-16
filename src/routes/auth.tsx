import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { PortalNav } from "@/components/PortalNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — GNSS · IGS Research Platform" },
      {
        name: "description",
        content: "Sign in with Google or email to access your GNSS research workspace, datasets and plots.",
      },
      { property: "og:title", content: "Sign in — GNSS · IGS Research Platform" },
      { property: "og:description", content: "Access your GNSS research workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/dashboard", replace: true });
  }, [loading, session, navigate]);

  const signInGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard", replace: true });
  };

  const submit = async (mode: "in" | "up") => {
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard", replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) toast.success("Check your email to confirm your account.");
        else navigate({ to: "/dashboard", replace: true });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen">
      <PortalNav />
      <main className="mx-auto flex max-w-md flex-col px-5 py-16">
        <span className="mono-label">Secure access</span>
        <h1 className="mt-2 text-2xl font-semibold">Sign in to the research platform</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Workspaces, datasets and cloud links are scoped to your account.
        </p>

        <div className="glass-card mt-8 p-6">
          <Button onClick={signInGoogle} disabled={busy} className="w-full" variant="outline">
            Continue with Google
          </Button>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="mono-label">or email</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Tabs defaultValue="in">
            <TabsList className="w-full font-mono text-xs">
              <TabsTrigger value="in" className="flex-1">Sign in</TabsTrigger>
              <TabsTrigger value="up" className="flex-1">Create account</TabsTrigger>
            </TabsList>
            {(["in", "up"] as const).map((mode) => (
              <TabsContent key={mode} value={mode} className="mt-4 space-y-3">
                <div>
                  <Label htmlFor={`email-${mode}`} className="mono-label">Email</Label>
                  <Input
                    id={`email-${mode}`}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <Label htmlFor={`pw-${mode}`} className="mono-label">Password</Label>
                  <Input
                    id={`pw-${mode}`}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1.5"
                    autoComplete={mode === "in" ? "current-password" : "new-password"}
                  />
                </div>
                <Button
                  className="w-full"
                  disabled={busy || !email || !password}
                  onClick={() => submit(mode)}
                >
                  {mode === "in" ? "Sign in" : "Create account"}
                </Button>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  );
}
