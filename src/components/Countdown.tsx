import { useEffect, useState } from "react";
import { durationBetween } from "../utils/format";

interface Props {
  endsAt: string;
  compact?: boolean;
}

export function Countdown({ endsAt, compact = false }: Props) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const d = durationBetween(now, new Date(endsAt));
  if (d.expired) {
    return <span className="countdown countdown--expired">Aktion beendet</span>;
  }

  if (compact) {
    const label =
      d.days > 0
        ? `noch ${d.days}T ${d.hours}h`
        : d.hours > 0
          ? `noch ${d.hours}h ${d.minutes}m`
          : `noch ${d.minutes}m ${d.seconds}s`;
    return (
      <span
        className={`countdown-pill ${d.totalMs < 24 * 3600 * 1000 ? "countdown-pill--urgent" : ""}`}
      >
        <span className="countdown-pill__dot" />
        {label}
      </span>
    );
  }

  const parts: { value: number; label: string }[] = [
    { value: d.days, label: "Tage" },
    { value: d.hours, label: "Std" },
    { value: d.minutes, label: "Min" },
    { value: d.seconds, label: "Sek" },
  ];

  return (
    <div className={`countdown ${d.totalMs < 24 * 3600 * 1000 ? "countdown--urgent" : ""}`}>
      {parts.map((p) => (
        <div key={p.label} className="countdown__cell">
          <span className="countdown__value">{String(p.value).padStart(2, "0")}</span>
          <span className="countdown__label">{p.label}</span>
        </div>
      ))}
    </div>
  );
}
