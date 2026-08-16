import { createFileRoute } from "@tanstack/react-router";
import { Activity, Database, HardDrive, Users } from "lucide-react";
import { PortalNav } from "@/components/PortalNav";
import { CanvasPlot } from "@/components/CanvasPlot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEMO_PROJECTS, DEMO_USERS, clockBiasSeries, orbitErrorSeries } from "@/lib/gnss-data";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console — GNSS · IGS Research Platform" },
      {
        name: "description",
        content:
          "Manage platform users and roles, monitor GNSS projects and cloud transfers, and track storage and rendering telemetry.",
      },
      { property: "og:title", content: "GNSS Platform Admin Console" },
      {
        property: "og:description",
        content: "User management, global data monitoring and resource analytics for the GNSS platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const telemetry = [
    { icon: Users, label: "Registered users", value: "138" },
    { icon: Database, label: "Projects", value: "412" },
    { icon: HardDrive, label: "GCP storage", value: "3.8 TB" },
    { icon: Activity, label: "Render ops / min", value: "1,240" },
  ];

  return (
    <div className="min-h-screen">
      <PortalNav />
      <main className="mx-auto max-w-7xl px-5 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="mono-label">Restricted · ADMIN role</span>
            <h1 className="mt-2 text-2xl font-semibold">Platform administration</h1>
          </div>
          <Badge variant="outline" className="font-mono text-[10px] text-primary">
            all systems nominal
          </Badge>
        </div>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {telemetry.map((t) => (
            <div key={t.label} className="glass-card flex items-center gap-4 p-4">
              <t.icon className="h-5 w-5 text-accent" />
              <div>
                <p className="font-mono text-xl">{t.value}</p>
                <p className="mono-label">{t.label}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-6 glass-card p-5">
          <h2 className="text-sm font-semibold">User management</h2>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Projects</TableHead>
                  <TableHead className="text-right">Storage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DEMO_USERS.map((u) => (
                  <TableRow key={u.email}>
                    <TableCell>
                      <span className="block text-sm">{u.name}</span>
                      <span className="mono-label">{u.email}</span>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{u.provider}</TableCell>
                    <TableCell>
                      <Badge
                        variant={u.role === "ADMIN" ? "default" : "outline"}
                        className="font-mono text-[10px]"
                      >
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">{u.projects}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{u.storage}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" className="font-mono text-[10px]">
                        Edit role
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="glass-card p-5">
            <h2 className="text-sm font-semibold">Global data monitoring</h2>
            <div className="mt-4 space-y-3">
              {DEMO_PROJECTS.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 bg-card/40 p-3"
                >
                  <div>
                    <p className="text-sm">{p.name}</p>
                    <p className="mono-label mt-1">
                      {p.owner} · {p.files} files · {p.size}
                    </p>
                  </div>
                  <Badge
                    variant={p.status === "synced" ? "outline" : "default"}
                    className="font-mono text-[10px]"
                  >
                    {p.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-5">
            <h2 className="text-sm font-semibold">Resource analytics</h2>
            <div className="mt-4">
              <CanvasPlot
                series={[clockBiasSeries(3, 600), orbitErrorSeries(9, 600)]}
                xLabel="hour UTC"
                yLabel="load"
                height={200}
              />
            </div>
            <div className="mt-5 space-y-4">
              {[
                ["GCP storage quota", 62],
                ["Render workers", 38],
                ["Parser queue", 17],
              ].map(([label, pct]) => (
                <div key={label as string}>
                  <div className="flex items-center justify-between text-xs">
                    <span>{label}</span>
                    <span className="font-mono text-muted-foreground">{pct}%</span>
                  </div>
                  <Progress value={pct as number} className="mt-2 h-1.5" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
