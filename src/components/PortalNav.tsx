import { Link } from "@tanstack/react-router";
import { Satellite } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/", label: "Overview" },
  { to: "/dashboard", label: "Workspace" },
  { to: "/admin", label: "Admin" },
] as const;

export function PortalNav() {
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
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-full border border-transparent px-3.5 py-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:border-border hover:text-foreground"
              activeProps={{ className: "border-primary/40 bg-primary/10 text-primary" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
          <Button size="sm" variant="outline" className="ml-2 font-mono text-xs">
            Sign in
          </Button>
        </nav>
      </div>
    </header>
  );
}
