import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, CloudCog, Database, Globe2, LineChart, ShieldCheck } from "lucide-react";
import { PortalNav } from "@/components/PortalNav";
import { CanvasPlot } from "@/components/CanvasPlot";
import { Button } from "@/components/ui/button";
import { GNSS_FORMATS, vtecSeries } from "@/lib/gnss-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GNSS · IGS Research Platform — TEC, Orbits & PPP Analytics" },
      {
        name: "description",
        content:
          "Scientific workspace for GNSS and IGS research: RINEX/SP3/SINEX/CLK/IONEX parsing, WebGL-fast plotting, and cloud-backed dataset management.",
      },
      { property: "og:title", content: "GNSS · IGS Research Platform" },
      {
        property: "og:description",
        content: "High-performance ionospheric, orbit and clock analytics for GNSS researchers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Overview,
});

const capabilities = [
  { icon: LineChart, title: "Ultra-fast plotting", body: "Canvas/WebGL renderers stream 100k+ epochs per panel — residuals, clock bias, SNR clouds, orbit error." },
  { icon: Database, title: "Standard format parsers", body: "RINEX 3, SP3, SINEX, CLK and IONEX decoded off the main thread in Web Workers." },
  { icon: CloudCog, title: "Bring your own bucket", body: "Link a Google Cloud Storage project and read/write heavy campaign files directly." },
  { icon: ShieldCheck, title: "Role-based access", body: "Google and GitHub sign-in with USER / ADMIN guards on every protected route." },
  { icon: Globe2, title: "Network context", body: "Global IGS receiver network with per-station availability scans by day-of-year." },
  { icon: Activity, title: "Platform telemetry", body: "Compute load, transfer status and storage footprint tracked across all projects." },
];

function Overview() {
  const vtec = vtecSeries();

  return (
    <div className="min-h-screen">
      <PortalNav />

      <main className="mx-auto max-w-7xl px-5 pb-24">
        <section className="grid gap-6 py-14 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <div>
            <span className="mono-label">Ionospheric geodesy, end to end</span>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.08] md:text-5xl">
              A research-grade workspace for{" "}
              <span className="text-primary">GNSS signals</span> and the{" "}
              <span className="text-accent">IGS network</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Import archive-scale observation files, derive VTEC and PPP products, and plot
              millions of samples without leaving the browser. Your datasets stay in your own
              cloud bucket.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/dashboard">Open workspace</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/admin">Admin console</Link>
              </Button>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-border/60 pt-6">
              {[
                ["842", "IGS stations"],
                ["5", "Native formats"],
                ["30 s", "Epoch cadence"],
              ].map(([v, k]) => (
                <div key={k}>
                  <dt className="font-mono text-2xl text-primary">{v}</dt>
                  <dd className="mono-label mt-1">{k}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="glass-card glow-ring p-5">
            <div className="flex items-center justify-between">
              <span className="mono-label">Live demo · VTEC diurnal curve</span>
              <span className="mono-label text-primary">ABPO00MDG</span>
            </div>
            <div className="mt-4">
              <CanvasPlot series={[vtec]} xLabel="hour UTC" yLabel="TECU" height={280} />
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c) => (
            <article key={c.title} className="glass-card p-5">
              <c.icon className="h-5 w-5 text-primary" />
              <h2 className="mt-3 text-base font-semibold">{c.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-16">
          <h2 className="text-lg font-semibold">Supported exchange formats</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            {GNSS_FORMATS.map((f) => (
              <div key={f.ext} className="rounded-lg border border-border/70 bg-card/50 p-4">
                <p className="font-mono text-sm text-accent">{f.ext}</p>
                <p className="mt-2 text-xs text-muted-foreground">{f.desc}</p>
                <p className="mono-label mt-3">{f.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
