import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Satellite } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function PortalNav() {
  const { session, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    navigate({ to: "/auth", replace: true });
  };

  const linkClass =
    "rounded-full border border-transparent px-3.5 py-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:border-border hover:text-foreground";
  const activeProps = { className: "border-primary/40 bg-primary/10 text-primary" };

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-5 py-3">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Satellite className="h-4 w-4" />
          </span>
          <span>
            <span className="block font-display text-sm font-semibold tracking-tight">
              GNSS <span className="text-primary">/</span> IGS Research Platform
            </span>
            <span className="mono-label">orbit · ionosphere · geodesy</span>
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-1">
          <Link to="/" className={linkClass} activeProps={activeProps} activeOptions={{ exact: true }}>
            Overview
          </Link>
          <Link to="/tech-lab" className={linkClass} activeProps={activeProps}>
            Tech Lab
          </Link>
          {session && (
            <Link to="/dashboard" className={linkClass} activeProps={activeProps}>
              Workspace
            </Link>
          )}
          {session && isAdmin && (
            <Link to="/admin" className={linkClass} activeProps={activeProps}>
              Admin
            </Link>
          )}
          {session ? (
            <Button size="sm" variant="outline" className="ml-2 font-mono text-xs" onClick={handleSignOut}>
              Sign out
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline" className="ml-2 font-mono text-xs">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
