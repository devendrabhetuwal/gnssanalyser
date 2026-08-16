/**
 * Demo GNSS/IGS datasets + format helpers.
 * Deterministic pseudo-random generation so SSR and client render identically.
 */

export type Series = {
  id: string;
  label: string;
  unit: string;
  color: string;
  points: { x: number; y: number }[];
};

export const GNSS_FORMATS = [
  { ext: "RINEX 3", desc: "Observation & navigation records", detail: ".rnx / .crx / .21o" },
  { ext: "SP3", desc: "Precise satellite orbits", detail: ".sp3 / .sp3c" },
  { ext: "SINEX", desc: "Solution independent exchange", detail: ".snx" },
  { ext: "CLK", desc: "Satellite & receiver clock bias", detail: ".clk" },
  { ext: "IONEX", desc: "Global ionosphere TEC maps", detail: ".inx / .ionex" },
] as const;

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function noise(rand: () => number, scale: number) {
  return (rand() + rand() + rand() - 1.5) * scale;
}

/** Diurnal VTEC curve (TECU) sampled at 30 s over 24 h. */
export function vtecSeries(seed = 7, n = 2880): Series {
  const rand = rng(seed);
  const points: { x: number; y: number }[] = [];
  let drift = 0;
  for (let i = 0; i < n; i++) {
    const h = (i / n) * 24;
    drift += noise(rand, 0.02);
    const diurnal = 18 + 22 * Math.exp(-((h - 14.2) ** 2) / 18);
    points.push({ x: h, y: Math.max(2, diurnal + drift + noise(rand, 0.9)) });
  }
  return { id: "vtec", label: "VTEC", unit: "TECU", color: "var(--chart-1)", points };
}

/** Satellite clock bias curve (ns). */
export function clockBiasSeries(seed = 21, n = 1440): Series {
  const rand = rng(seed);
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const h = (i / n) * 24;
    points.push({ x: h, y: -14 + 1.6 * h + 2.4 * Math.sin(h / 2.1) + noise(rand, 0.35) });
  }
  return { id: "clk", label: "Clock bias", unit: "ns", color: "var(--chart-2)", points };
}

/** Carrier-phase residuals (mm), high density. */
export function residualSeries(seed = 91, n = 4000): Series {
  const rand = rng(seed);
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const h = (i / n) * 24;
    const multipath = 3.5 * Math.sin(h * 1.7) * Math.exp(-Math.abs(h - 12) / 22);
    points.push({ x: h, y: multipath + noise(rand, 2.4) });
  }
  return { id: "res", label: "L1 residual", unit: "mm", color: "var(--chart-3)", points };
}

/** Radial orbit error vs IGS final product (cm). */
export function orbitErrorSeries(seed = 55, n = 960): Series {
  const rand = rng(seed);
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const h = (i / n) * 24;
    points.push({ x: h, y: 1.8 * Math.sin(h / 1.9 + 0.7) + 0.9 * Math.cos(h / 0.6) + noise(rand, 0.5) });
  }
  return { id: "orb", label: "Radial orbit error", unit: "cm", color: "var(--chart-5)", points };
}

/** SNR by elevation angle, scatter cloud. */
export function snrScatter(seed = 33, n = 2500): Series {
  const rand = rng(seed);
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const el = rand() * 90;
    points.push({ x: el, y: 30 + 18 * Math.log10(1 + el / 6) + noise(rand, 2.2) });
  }
  return { id: "snr", label: "C/N0 vs elevation", unit: "dB-Hz", color: "var(--chart-4)", points };
}

export const DEMO_PROJECTS = [
  { id: "P-1042", name: "Equatorial TEC anomaly 2026", owner: "a.nakamura", files: 34, size: "18.2 GB", status: "computing" },
  { id: "P-1039", name: "PPP residual benchmark · EU", owner: "m.varga", files: 12, size: "6.4 GB", status: "synced" },
  { id: "P-1031", name: "SP3 orbit intercomparison", owner: "l.okafor", files: 51, size: "42.9 GB", status: "synced" },
  { id: "P-1028", name: "Scintillation storm Mar-14", owner: "s.rai", files: 9, size: "2.1 GB", status: "uploading" },
  { id: "P-1017", name: "Clock stability · Galileo E1", owner: "j.pereira", files: 21, size: "11.7 GB", status: "synced" },
];

export const DEMO_USERS = [
  { name: "Aiko Nakamura", email: "a.nakamura@geolab.jp", provider: "Google", role: "ADMIN", projects: 12, storage: "84 GB" },
  { name: "Marta Varga", email: "m.varga@ionos.eu", provider: "GitHub", role: "USER", projects: 6, storage: "31 GB" },
  { name: "Lanre Okafor", email: "l.okafor@rsg.ng", provider: "Google", role: "USER", projects: 9, storage: "58 GB" },
  { name: "Sujan Rai", email: "s.rai@tribhuvan.np", provider: "GitHub", role: "USER", projects: 3, storage: "12 GB" },
  { name: "João Pereira", email: "j.pereira@inpe.br", provider: "Google", role: "ADMIN", projects: 15, storage: "97 GB" },
];
