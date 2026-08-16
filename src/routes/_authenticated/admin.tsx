import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Activity, Database, HardDrive, Users } from "lucide-react";
import { toast } from "sonner";
import { PortalNav } from "@/components/PortalNav";
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
import { getAdminTelemetry, setUserRole } from "@/lib/platform.functions";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/admin")({
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

function gb(bytes: number) {
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

function Admin() {
  const { isAdmin, loading } = useAuth();
  const fetchTelemetry = useServerFn(getAdminTelemetry);
  const updateRole = useServerFn(setUserRole);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-telemetry"],
    queryFn: () => fetchTelemetry(),
    enabled: isAdmin,
    refetchInterval: 30_000,
  });

  const roleMutation = useMutation({
    mutationFn: (input: { targetUserId: string; makeAdmin: boolean }) => updateRole({ data: input }),
    onSuccess: () => {
      toast.success("Role updated");
      queryClient.invalidateQueries({ queryKey: ["admin-telemetry"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!loading && !isAdmin) {
    return (
      <div className="min-h-screen">
        <PortalNav />
        <main className="mx-auto max-w-md px-5 py-24 text-center">
          <span className="mono-label">403 · restricted</span>
          <h1 className="mt-3 text-2xl font-semibold">Administrator access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account does not hold the ADMIN role for this platform.
          </p>
        </main>
      </div>
    );
  }

  const t = data?.totals;
  const telemetry = [
    { icon: Users, label: "Registered users", value: t ? String(t.userCount) : "—" },
    { icon: Database, label: "Projects", value: t ? String(t.projectCount) : "—" },
    { icon: HardDrive, label: "Cloud storage", value: t ? gb(t.storageBytes) : "—" },
    { icon: Activity, label: "Renders · 24 h", value: t ? String(t.rendersLast24h) : "—" },
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
            {isLoading ? "loading telemetry…" : error ? "telemetry error" : "live"}
          </Badge>
        </div>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {telemetry.map((item) => (
            <div key={item.label} className="glass-card flex items-center gap-4 p-4">
              <item.icon className="h-5 w-5 text-accent" />
              <div>
                <p className="font-mono text-xl">{item.value}</p>
                <p className="mono-label">{item.label}</p>
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
                {(data?.users ?? []).map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <span className="block text-sm">{u.name ?? "—"}</span>
                      <span className="mono-label">{u.email ?? u.id}</span>
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
                    <TableCell className="text-right font-mono text-xs">{gb(u.storageBytes)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="font-mono text-[10px]"
                        disabled={roleMutation.isPending}
                        onClick={() =>
                          roleMutation.mutate({ targetUserId: u.id, makeAdmin: u.role !== "ADMIN" })
                        }
                      >
                        {u.role === "ADMIN" ? "Revoke admin" : "Make admin"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && (data?.users?.length ?? 0) === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-xs text-muted-foreground">
                      No registered users yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="glass-card p-5">
            <h2 className="text-sm font-semibold">Global data monitoring</h2>
            <div className="mt-4 space-y-3">
              {(data?.projects ?? []).map((p) => (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 bg-card/40 p-3"
                >
                  <div>
                    <p className="text-sm">{p.name}</p>
                    <p className="mono-label mt-1">
                      {p.owner_id.slice(0, 8)} · {gb(Number(p.storage_bytes ?? 0))}
                    </p>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {p.status}
                  </Badge>
                </div>
              ))}
              {!isLoading && (data?.projects?.length ?? 0) === 0 && (
                <p className="text-xs text-muted-foreground">No projects created yet.</p>
              )}
            </div>
          </div>

          <div className="glass-card p-5">
            <h2 className="text-sm font-semibold">Resource analytics</h2>
            <dl className="mt-4 grid grid-cols-2 gap-3">
              {[
                ["Active transfers", t ? String(t.activeTransfers) : "—"],
                ["Files tracked", t ? String(t.fileCount) : "—"],
                ["Avg render", t ? `${t.avgRenderMs} ms` : "—"],
                ["Points · 24 h", t ? t.pointsLast24h.toLocaleString() : "—"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-border/70 bg-card/40 p-3">
                  <dt className="mono-label">{k}</dt>
                  <dd className="mt-1 font-mono text-sm">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span>Render failure rate</span>
                  <span className="font-mono text-muted-foreground">{t?.failureRate ?? 0}%</span>
                </div>
                <Progress value={t?.failureRate ?? 0} className="mt-2 h-1.5" />
              </div>
            </div>

            <h3 className="mt-6 text-xs font-semibold">Recent processing runs</h3>
            <ul className="mt-3 space-y-2">
              {(data?.recentMetrics ?? []).slice(0, 8).map((m) => (
                <li key={m.id} className="flex items-center justify-between text-xs">
                  <span className="font-mono">{m.label ?? m.kind}</span>
                  <span className="text-muted-foreground">
                    {m.duration_ms} ms · {m.point_count.toLocaleString()} pts
                  </span>
                </li>
              ))}
              {!isLoading && (data?.recentMetrics?.length ?? 0) === 0 && (
                <li className="text-xs text-muted-foreground">No runs recorded in the last 24 h.</li>
              )}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
