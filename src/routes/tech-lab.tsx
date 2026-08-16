import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Activity,
  Database,
  FileDown,
  FileUp,
  FlaskConical,
  Gauge,
  Satellite,
  SlidersHorizontal,
} from "lucide-react";
import { PortalNav } from "@/components/PortalNav";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/tech-lab")({
  head: () => ({
    meta: [
      { title: "Tech Lab · GNSS Research Platform" },
      {
        name: "description",
        content:
          "GNSS Tech Lab for RINEX, TEC, ROTI and OMNI analysis with a research-safe workflow that never presents synthetic measurements as observations.",
      },
    ],
  }),
  component: TechLab,
});

type DataFile = {
  name: string;
  size: number;
  kind: "RINEX" | "OMNI" | "Other";
};

function TechLab() {
  const [files, setFiles] = useState<DataFile[]>([]);
  const [station, setStation] = useState("");
  const [minElevation, setMinElevation] = useState("30");
  const [rotiWindow, setRotiWindow] = useState("5");
  const [status, setStatus] = useState("Ready for real observations");

  const rinexFiles = files.filter((file) => file.kind === "RINEX");
  const omniFiles = files.filter((file) => file.kind === "OMNI");

  const canPrepare = rinexFiles.length > 0 && omniFiles.length > 0 && station.trim().length > 0;

  const fileLabel = useMemo(() => {
    if (!files.length) return "No files selected";
    return `${files.length} file${files.length === 1 ? "" : "s"} selected`;
  }, [files.length]);

  const classify = (name: string): DataFile["kind"] => {
    const lower = name.toLowerCase();
    if (lower.includes("omni") || lower.endsWith(".csv") || lower.endsWith(".txt")) return "OMNI";
    if (
      lower.endsWith(".rnx") ||
      lower.endsWith(".crx") ||
      lower.endsWith(".o") ||
      lower.endsWith(".d") ||
      lower.includes("rinex")
    )
      return "RINEX";
    return "Other";
  };

  const onFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []).map((file) => ({
      name: file.name,
      size: file.size,
      kind: classify(file.name),
    }));
    setFiles(selected);
    setStatus(selected.length ? "Files loaded locally — validation required" : "Ready for real observations");
  };

  const prepareAnalysis = () => {
    if (!canPrepare) return;
    setStatus(
      `Configuration ready: ${station.trim().toUpperCase()} · ${minElevation}° elevation · ${rotiWindow}-minute ROTI window`,
    );
  };

  return (
    <div className="min-h-screen">
      <PortalNav />
      <main className="mx-auto max-w-7xl px-5 pb-24">
        <section className="py-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="mono-label">Experimental research workspace</span>
              <div className="mt-3 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <FlaskConical className="h-5 w-5" />
                </span>
                <h1 className="text-4xl font-semibold tracking-tight">Tech Lab</h1>
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Build a reproducible GNSS ionosphere analysis from your own RINEX and OMNI files.
                The lab intentionally shows no synthetic TEC or space-weather measurements.
              </p>
            </div>
            <div className="glass-card px-4 py-3">
              <p className="mono-label">Pipeline status</p>
              <p className="mt-1 text-sm font-medium text-primary">{status}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <article className="glass-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="mono-label">01 · Input data</span>
                <h2 className="mt-2 text-xl font-semibold">Load actual observations</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  RINEX observation files provide the GNSS measurements. OMNI files provide the
                  corresponding space-weather parameters.
                </p>
              </div>
              <Database className="h-5 w-5 text-primary" />
            </div>

            <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-card/40 px-6 py-10 text-center transition hover:border-primary/50 hover:bg-primary/5">
              <FileUp className="h-7 w-7 text-primary" />
              <span className="mt-3 text-sm font-medium">Choose RINEX + OMNI files</span>
              <span className="mt-1 text-xs text-muted-foreground">.rnx · .crx · .25o · .o · .csv · .txt</span>
              <input className="hidden" type="file" multiple accept=".rnx,.crx,.25o,.o,.d,.csv,.txt" onChange={onFiles} />
            </label>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ["RINEX", rinexFiles.length],
                ["OMNI", omniFiles.length],
                ["Other", files.filter((file) => file.kind === "Other").length],
              ].map(([label, count]) => (
                <div key={label} className="rounded-lg border border-border/70 bg-card/50 p-4">
                  <p className="mono-label">{label}</p>
                  <p className="mt-1 font-mono text-2xl text-primary">{count}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">{fileLabel}. Files remain in your browser until an analysis backend is connected.</p>
          </article>

          <article className="glass-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="mono-label">02 · Processing controls</span>
                <h2 className="mt-2 text-xl font-semibold">Research configuration</h2>
              </div>
              <SlidersHorizontal className="h-5 w-5 text-primary" />
            </div>

            <div className="mt-6 space-y-5">
              <label className="block">
                <span className="mono-label">Station</span>
                <input
                  value={station}
                  onChange={(event) => setStation(event.target.value)}
                  placeholder="e.g. ALICE"
                  className="mt-2 w-full rounded-lg border border-border bg-background/70 px-3 py-2.5 font-mono text-sm outline-none transition focus:border-primary"
                />
              </label>
              <label className="block">
                <span className="mono-label">Minimum elevation · degrees</span>
                <input
                  type="number"
                  min="5"
                  max="90"
                  value={minElevation}
                  onChange={(event) => setMinElevation(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-border bg-background/70 px-3 py-2.5 font-mono text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="block">
                <span className="mono-label">ROTI window · minutes</span>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={rotiWindow}
                  onChange={(event) => setRotiWindow(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-border bg-background/70 px-3 py-2.5 font-mono text-sm outline-none focus:border-primary"
                />
              </label>
              <Button className="w-full" disabled={!canPrepare} onClick={prepareAnalysis}>
                <Activity className="mr-2 h-4 w-4" /> Prepare real-data analysis
              </Button>
            </div>
          </article>
        </section>

        <section className="mt-5 grid gap-5 md:grid-cols-3">
          {[
            {
              icon: Satellite,
              title: "STEC → VTEC",
              body: "Dual-frequency observation processing followed by elevation mapping when valid elevation data are available.",
            },
            {
              icon: Gauge,
              title: "dTEC + ROTI",
              body: "Time-aligned TEC variations and a true time-based ROTI window using the actual sampling cadence.",
            },
            {
              icon: FileDown,
              title: "Research outputs",
              body: "Exportable tables and publication-ready plots only after the source observations pass validation.",
            },
          ].map((item) => (
            <article key={item.title} className="glass-card p-5">
              <item.icon className="h-5 w-5 text-primary" />
              <h2 className="mt-3 text-base font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <p className="mono-label text-amber-500">Research integrity</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Tech Lab does not fabricate a graph when source measurements are missing. In particular,
            it will not label STEC as VTEC without elevation mapping data and will not replace failed
            OMNI retrieval with synthetic storm parameters.
          </p>
        </section>
      </main>
    </div>
  );
}
