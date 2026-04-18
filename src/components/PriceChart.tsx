import { useMemo } from "react";
import type { PricePoint } from "../types";
import { euro, germanDate } from "../utils/format";

interface Props {
  history: PricePoint[];
  currentPrice: number;
  regularPrice: number;
  accent: string;
}

const WIDTH = 560;
const HEIGHT = 200;
const PAD = { top: 24, right: 24, bottom: 28, left: 44 };

export function PriceChart({ history, currentPrice, regularPrice, accent }: Props) {
  const { path, area, points, yMin, yMax, gridLines } = useMemo(() => {
    const xs = history.map((_, i) => i);
    const ys = history.map((p) => p.price);
    const yMinRaw = Math.min(...ys, currentPrice);
    const yMaxRaw = Math.max(...ys, regularPrice);
    const padY = (yMaxRaw - yMinRaw) * 0.2 || 0.5;
    const yMin = Math.max(0, yMinRaw - padY);
    const yMax = yMaxRaw + padY;
    const xMax = Math.max(1, xs.length - 1);

    const x = (i: number) =>
      PAD.left + (i / xMax) * (WIDTH - PAD.left - PAD.right);
    const y = (v: number) =>
      PAD.top + (1 - (v - yMin) / (yMax - yMin)) * (HEIGHT - PAD.top - PAD.bottom);

    const path = history
      .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p.price).toFixed(1)}`)
      .join(" ");

    const area =
      `${path} L ${x(history.length - 1).toFixed(1)} ${y(yMin).toFixed(1)} L ${x(0).toFixed(
        1,
      )} ${y(yMin).toFixed(1)} Z`;

    const points = history.map((p, i) => ({
      cx: x(i),
      cy: y(p.price),
      p,
    }));

    const gridLines = [0.25, 0.5, 0.75].map((t) => yMin + (yMax - yMin) * (1 - t));

    return { path, area, points, yMin, yMax, gridLines };
  }, [history, currentPrice, regularPrice]);

  const gradId = `grad-${accent.replace("#", "")}`;

  return (
    <figure className="chart" aria-label="Preisverlauf">
      <figcaption className="chart__caption">
        <span>Preisverlauf letzte {history.length} Wochen</span>
        <span className="chart__legend">
          <span className="chart__legend-dot" style={{ background: accent }} /> Preis
        </span>
      </figcaption>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="chart__svg" role="img">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridLines.map((gv, i) => {
          const yPos =
            PAD.top + (1 - (gv - yMin) / (yMax - yMin)) * (HEIGHT - PAD.top - PAD.bottom);
          return (
            <g key={i} className="chart__grid">
              <line x1={PAD.left} x2={WIDTH - PAD.right} y1={yPos} y2={yPos} />
              <text x={PAD.left - 8} y={yPos + 4} textAnchor="end">
                {euro(gv)}
              </text>
            </g>
          );
        })}

        <path d={area} fill={`url(#${gradId})`} />
        <path d={path} fill="none" stroke={accent} strokeWidth="2.5" strokeLinejoin="round" />

        {points.map((pt, i) => (
          <g key={i}>
            <circle
              cx={pt.cx}
              cy={pt.cy}
              r={i === points.length - 1 ? 5.5 : 3}
              fill={i === points.length - 1 ? accent : "white"}
              stroke={accent}
              strokeWidth="2"
            />
            <title>{`${germanDate(pt.p.date)} — ${euro(pt.p.price)}`}</title>
          </g>
        ))}

        <line
          x1={PAD.left}
          x2={WIDTH - PAD.right}
          y1={HEIGHT - PAD.bottom}
          y2={HEIGHT - PAD.bottom}
          className="chart__axis"
        />
        <text
          x={PAD.left}
          y={HEIGHT - 6}
          className="chart__axis-label"
          textAnchor="start"
        >
          {germanDate(history[0]!.date)}
        </text>
        <text
          x={WIDTH - PAD.right}
          y={HEIGHT - 6}
          className="chart__axis-label"
          textAnchor="end"
        >
          heute
        </text>
      </svg>
    </figure>
  );
}
