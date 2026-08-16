import { useEffect, useRef } from "react";
import type { Series } from "@/lib/gnss-data";

type Props = {
  series: Series[];
  xLabel: string;
  yLabel: string;
  mode?: "line" | "scatter";
  height?: number;
};

function cssVar(el: HTMLElement, value: string) {
  const match = value.match(/var\((--[\w-]+)\)/);
  if (!match) return value;
  return getComputedStyle(el).getPropertyValue(match[1]).trim() || "#2EE6C5";
}

/**
 * Canvas 2D high-density renderer: draws tens of thousands of samples per
 * frame without the DOM overhead of SVG charting libraries.
 */
export function CanvasPlot({ series, xLabel, yLabel, mode = "line", height = 260 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = wrap.clientWidth;
      const h = height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const pad = { l: 46, r: 12, t: 12, b: 26 };
      const pw = w - pad.l - pad.r;
      const ph = h - pad.t - pad.b;

      const all = series.flatMap((s) => s.points);
      if (!all.length) return;
      const xs = all.map((p) => p.x);
      const ys = all.map((p) => p.y);
      const x0 = Math.min(...xs);
      const x1 = Math.max(...xs);
      const yMin = Math.min(...ys);
      const yMax = Math.max(...ys);
      const yPad = (yMax - yMin) * 0.08 || 1;
      const y0 = yMin - yPad;
      const y1 = yMax + yPad;

      const sx = (x: number) => pad.l + ((x - x0) / (x1 - x0 || 1)) * pw;
      const sy = (y: number) => pad.t + ph - ((y - y0) / (y1 - y0 || 1)) * ph;

      const grid = cssVar(wrap, "var(--border)");
      const muted = cssVar(wrap, "var(--muted-foreground)");

      ctx.strokeStyle = grid;
      ctx.fillStyle = muted;
      ctx.lineWidth = 1;
      ctx.font = "10px ui-monospace, monospace";

      for (let i = 0; i <= 4; i++) {
        const y = pad.t + (ph / 4) * i;
        ctx.globalAlpha = 0.45;
        ctx.beginPath();
        ctx.moveTo(pad.l, y);
        ctx.lineTo(w - pad.r, y);
        ctx.stroke();
        ctx.globalAlpha = 1;
        const val = y1 - ((y1 - y0) / 4) * i;
        ctx.fillText(val.toFixed(1), 6, y + 3);
      }
      for (let i = 0; i <= 6; i++) {
        const x = pad.l + (pw / 6) * i;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.moveTo(x, pad.t);
        ctx.lineTo(x, pad.t + ph);
        ctx.stroke();
        ctx.globalAlpha = 1;
        const val = x0 + ((x1 - x0) / 6) * i;
        ctx.fillText(val.toFixed(0), x - 6, h - 8);
      }
      ctx.fillText(xLabel, w - pad.r - ctx.measureText(xLabel).width, h - 8);
      ctx.save();
      ctx.translate(10, pad.t + 4);
      ctx.fillText(yLabel, 0, 0);
      ctx.restore();

      for (const s of series) {
        const color = cssVar(wrap, s.color);
        if (mode === "scatter") {
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.5;
          for (const p of s.points) {
            ctx.fillRect(sx(p.x) - 1, sy(p.y) - 1, 2, 2);
          }
          ctx.globalAlpha = 1;
        } else {
          const gradient = ctx.createLinearGradient(0, pad.t, 0, pad.t + ph);
          gradient.addColorStop(0, color);
          gradient.addColorStop(1, color);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          s.points.forEach((p, i) => {
            const px = sx(p.x);
            const py = sy(p.y);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.stroke();
        }
      }
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [series, xLabel, yLabel, mode, height]);

  return (
    <div ref={wrapRef} className="w-full">
      <canvas ref={canvasRef} aria-label={`${yLabel} versus ${xLabel} plot`} role="img" />
      <div className="mt-2 flex flex-wrap gap-4">
        {series.map((s) => (
          <span key={s.id} className="mono-label flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label} · {s.unit} · {s.points.length.toLocaleString()} pts
          </span>
        ))}
      </div>
    </div>
  );
}
