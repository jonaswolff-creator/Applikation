import { useEffect } from "react";
import type { Offer } from "../types";
import {
  durationBetween,
  euro,
  germanDate,
  savingsPercent,
} from "../utils/format";
import { Countdown } from "./Countdown";
import { PriceChart } from "./PriceChart";
import { StoreBadge } from "./StoreBadge";

interface Props {
  offer: Offer;
  onClose: () => void;
  saved: boolean;
  onToggleSave: (id: string) => void;
  similar: Offer[];
  onOpenSimilar: (offer: Offer) => void;
}

export function OfferDetail({
  offer,
  onClose,
  saved,
  onToggleSave,
  similar,
  onOpenSimilar,
}: Props) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const savings = savingsPercent(offer.regularPrice, offer.price);
  const priceDrop = offer.regularPrice - offer.price;
  const runSoFar = durationBetween(new Date(offer.startsAt), new Date());
  const totalRun = durationBetween(new Date(offer.startsAt), new Date(offer.endsAt));
  const progress = Math.max(
    0,
    Math.min(1, runSoFar.totalMs / Math.max(1, totalRun.totalMs)),
  );
  const lowest = Math.min(...offer.priceHistory.map((p) => p.price));
  const highest = Math.max(...offer.priceHistory.map((p) => p.price), offer.regularPrice);
  const isLowest = offer.price <= lowest + 0.001;

  return (
    <div className="sheet" role="dialog" aria-modal="true" aria-label={offer.title}>
      <div className="sheet__backdrop" onClick={onClose} />
      <div className="sheet__panel">
        <button type="button" className="sheet__close" onClick={onClose} aria-label="Schließen">
          ×
        </button>

        <div
          className="sheet__hero"
          style={{
            background: `linear-gradient(135deg, ${offer.accent}22, ${offer.accent}08)`,
          }}
        >
          <div className="sheet__hero-emoji" aria-hidden="true">
            {offer.emoji}
          </div>
          <div className="sheet__hero-info">
            <StoreBadge store={offer.store} size="md" />
            <h2 className="sheet__title">{offer.title}</h2>
            <p className="sheet__subtitle">
              {offer.subtitle} · <span>{offer.city}</span> · {offer.distanceKm.toFixed(1)} km
            </p>
            <div className="sheet__tags">
              {offer.tags.map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
              {isLowest && <span className="tag tag--best">Tiefstpreis</span>}
            </div>
          </div>
        </div>

        <div className="sheet__grid">
          <section className="panel panel--price">
            <div className="panel__price-row">
              <div>
                <div className="panel__price-label">Aktionspreis</div>
                <div className="panel__price-value" style={{ color: offer.accent }}>
                  {euro(offer.price)}
                </div>
                <div className="panel__price-sub">pro {offer.unit}</div>
              </div>
              <div className="panel__price-meta">
                <div className="panel__price-regular">
                  statt <s>{euro(offer.regularPrice)}</s>
                </div>
                <div className="panel__price-saving">
                  Du sparst {euro(priceDrop)} ({Math.round(savings * 100)}%)
                </div>
              </div>
            </div>

            <div className="panel__countdown-block">
              <div className="panel__countdown-title">Angebot endet in</div>
              <Countdown endsAt={offer.endsAt} />
              <div className="panel__progress" aria-hidden="true">
                <div
                  className="panel__progress-bar"
                  style={{
                    width: `${progress * 100}%`,
                    background: offer.accent,
                  }}
                />
              </div>
              <div className="panel__progress-labels">
                <span>Start {germanDate(offer.startsAt)}</span>
                <span>Ende {germanDate(offer.endsAt)}</span>
              </div>
            </div>

            <div className="panel__actions">
              <button
                type="button"
                className={`btn btn--primary`}
                style={{ background: offer.accent }}
              >
                Zum Prospekt
              </button>
              <button
                type="button"
                className={`btn btn--ghost ${saved ? "btn--ghost-active" : ""}`}
                onClick={() => onToggleSave(offer.id)}
                aria-pressed={saved}
              >
                {saved ? "Gemerkt ✓" : "Merken"}
              </button>
            </div>
          </section>

          <section className="panel panel--stats">
            <Stat label="Läuft bereits seit" value={`${runSoFar.days} Tagen`} />
            <Stat
              label="Gesamtlaufzeit"
              value={`${totalRun.days} Tage`}
              hint={`vom ${germanDate(offer.startsAt)} bis ${germanDate(offer.endsAt)}`}
            />
            <Stat label="Aufrufe 24h" value={offer.views24h.toLocaleString("de-DE")} />
            <Stat label="Mal gemerkt" value={offer.savedCount.toLocaleString("de-DE")} />
            <Stat
              label="Frühere Aktionen"
              value={`${offer.pastCampaigns}×`}
              hint="in den letzten 12 Monaten"
            />
            <Stat
              label="Preisrange 6 Mon."
              value={`${euro(lowest)} – ${euro(highest)}`}
            />
          </section>

          <section className="panel panel--chart">
            <PriceChart
              history={offer.priceHistory}
              currentPrice={offer.price}
              regularPrice={offer.regularPrice}
              accent={offer.accent}
            />
          </section>

          <section className="panel panel--desc">
            <h3 className="panel__heading">Über das Angebot</h3>
            <p className="panel__text">{offer.description}</p>
            <ul className="panel__facts">
              <li>
                <strong>Markt</strong>
                <span>
                  {offer.store.name} — {offer.city}
                </span>
              </li>
              <li>
                <strong>Kategorie</strong>
                <span>{offer.category}</span>
              </li>
              <li>
                <strong>Einheit</strong>
                <span>{offer.unit}</span>
              </li>
            </ul>
          </section>
        </div>

        {similar.length > 0 && (
          <section className="similar">
            <h3 className="similar__heading">Ähnliche Angebote in deiner Nähe</h3>
            <div className="similar__row">
              {similar.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="similar__item"
                  onClick={() => onOpenSimilar(s)}
                  style={{ ["--card-accent" as string]: s.accent }}
                >
                  <span className="similar__emoji" aria-hidden="true">
                    {s.emoji}
                  </span>
                  <span className="similar__body">
                    <span className="similar__store">{s.store.name}</span>
                    <span className="similar__title">{s.title}</span>
                    <span className="similar__price">
                      {euro(s.price)} <s>{euro(s.regularPrice)}</s>
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="stat">
      <div className="stat__label">{label}</div>
      <div className="stat__value">{value}</div>
      {hint && <div className="stat__hint">{hint}</div>}
    </div>
  );
}
