import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CloudUpload, Cpu, FolderGit2, HardDrive, Play, Upload } from "lucide-react";
import { PortalNav } from "@/components/PortalNav";
import { CanvasPlot } from "@/components/CanvasPlot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GNSS_FORMATS,
  clockBiasSeries,
  orbitErrorSeries,
  residualSeries,
  snrScatter,
  vtecSeries,
  DEMO_PROJECTS,
} from "@/lib/gnss-data";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Workspace — GNSS · IGS Research Platform" },
      {
        name: "description",
        content:
          "Parse RINEX, SP3, SINEX, CLK and IONEX files, plot VTEC, clock bias, orbit error and carrier-phase residuals, and sync projects to Google Cloud Storage.",
      },
      { property: "og:title", content: "GNSS Workspace — plotting & dataset management" },
      {
        property: "og:description",
        content: "High-density scientific plotting and cloud-backed GNSS dataset management.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const panels = [
  { key: "vtec", label: "Ionospheric VTEC", x: "hour UTC", y: "TECU", mode: "line" as const, series: [vtecSeries()] },
  { key: "clk", label: "Clock bias", x: "hour UTC", y: "ns", mode: "line" as const, series: [clockBiasSeries()] },
  { key: "res", label: "Carrier-phase residuals", x: "hour UTC", y: "mm", mode: "line" as const, series: [residualSeries()] },
  { key: "orb", label: "Radial orbit error", x: "hour UTC", y: "cm", mode: "line" as const, series: [orbitErrorSeries()] },
  { key: "snr", label: "C/N0 vs elevation", x: "elevation °", y: "dB-Hz", mode: "scatter" as const, series: [snrScatter()] },
];

function Dashboard() {
  const [bucket, setBucket] = useState("");
  const [project, setProject] = useState("");

  const stats = [
    { icon: FolderGit2, label: "Projects", value: "7" },
    { icon: HardDrive, label: "Cloud usage", value: "58.4 GB" },
    { icon: Cpu, label: "Compute load", value: "38%" },
    { icon: CloudUpload, label: "Transfers", value: "2 active" },
  ];

  return (
    <div className="min-h-screen">
      <PortalNav />
      <main className="mx-auto max-w-7xl px-5 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="mono-label">Workspace</span>
            <h1 className="mt-2 text-2xl font-semibold">Equatorial TEC anomaly 2026</h1>
          </div>
          <Button className="font-mono text-xs">
            <Play className="mr-2 h-4 w-4" /> Run pipeline
          </Button>
        </div>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="glass-card flex items-center gap-4 p-4">
              <s.icon className="h-5 w-5 text-primary" />
              <div>
                <p className="font-mono text-xl">{s.value}</p>
                <p className="mono-label">{s.label}</p>
              </div>
            </div>
          ))}
        </section>

        <Tabs defaultValue="plots" className="mt-8">
          <TabsList className="font-mono text-xs">
            <TabsTrigger value="plots">Graphics suite</TabsTrigger>
            <TabsTrigger value="data">Datasets</TabsTrigger>
            <TabsTrigger value="cloud">Google Cloud</TabsTrigger>
          </TabsList>

          <TabsContent value="plots" className="mt-5 grid gap-4 xl:grid-cols-2">
            {panels.map((p) => (
              <div key={p.key} className="glass-card p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">{p.label}</h2>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    canvas · GPU-composited
                  </Badge>
                </div>
                <div className="mt-4">
                  <CanvasPlot series={p.series} xLabel={p.x} yLabel={p.y} mode={p.mode} />
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="data" className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold">Import observation files</h2>
              <label className="mt-4 flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border p-8 text-center transition-colors hover:border-primary/60">
                <Upload className="h-6 w-6 text-primary" />
                <span className="text-sm">Drop RINEX / SP3 / SINEX / CLK / IONEX</span>
                <span className="mono-label">parsed in a web worker</span>
                <input type="file" className="hidden" multiple />
              </label>
              <ul className="mt-5 space-y-2">
                {GNSS_FORMATS.map((f) => (
                  <li key={f.ext} className="flex items-center justify-between text-xs">
                    <span className="font-mono text-accent">{f.ext}</span>
                    <span className="text-muted-foreground">{f.detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold">Recent projects</h2>
              <div className="mt-4 space-y-3">
                {DEMO_PROJECTS.map((p) => (
                  <div key={p.id} className="rounded-lg border border-border/70 bg-card/40 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm">{p.name}</span>
                      <Badge
                        variant={p.status === "synced" ? "outline" : "default"}
                        className="font-mono text-[10px]"
                      >
                        {p.status}
                      </Badge>
                    </div>
                    <p className="mono-label mt-2">
                      {p.id} · {p.files} files · {p.size}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cloud" className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold">Link Google Cloud Storage</h2>
              <p className="mt-2 text-xs text-muted-foreground">
                Connect your own GCP project so heavy campaign files are computed and persisted in
                your bucket. Service-account keys are stored server-side, never in the browser.
              </p>
              <div className="mt-4 space-y-3">
                <div>
                  <Label className="mono-label" htmlFor="gcp-project">GCP project ID</Label>
                  <Input
                    id="gcp-project"
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    placeholder="ionosphere-lab-284101"
                    className="mt-1.5 font-mono text-xs"
                  />
                </div>
                <div>
                  <Label className="mono-label" htmlFor="gcp-bucket">Bucket</Label>
                  <Input
                    id="gcp-bucket"
                    value={bucket}
                    onChange={(e) => setBucket(e.target.value)}
                    placeholder="gs://igs-campaign-2026"
                    className="mt-1.5 font-mono text-xs"
                  />
                </div>
                <Button className="w-full font-mono text-xs" disabled={!project || !bucket}>
                  Connect bucket
                </Button>
              </div>
            </div>

            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold">Transfer status</h2>
              <div className="mt-4 space-y-5">
                {[
                  ["ABPO00MDG_R_2026228.crx.gz", 82],
                  ["igs_final_2360.sp3", 46],
                  ["cod20260816.inx", 100],
                ].map(([name, pct]) => (
                  <div key={name as string}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono">{name}</span>
                      <span className="text-muted-foreground">{pct}%</span>
                    </div>
                    <Progress value={pct as number} className="mt-2 h-1.5" />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
