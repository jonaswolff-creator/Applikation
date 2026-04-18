import type { Offer } from "../types";
import { euro, savingsPercent } from "../utils/format";
import { Countdown } from "./Countdown";
import { StoreBadge } from "./StoreBadge";

interface Props {
  offer: Offer;
  onOpen: (offer: Offer) => void;
  saved: boolean;
  onToggleSave: (id: string) => void;
}

export function OfferCard({ offer, onOpen, saved, onToggleSave }: Props) {
  const savings = savingsPercent(offer.regularPrice, offer.price);
  const pct = Math.round(savings * 100);

  return (
    <article
      className="card"
      style={{ ["--card-accent" as string]: offer.accent }}
      onClick={() => onOpen(offer)}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(offer);
        }
      }}
    >
      <div className="card__media" aria-hidden="true">
        <span className="card__emoji">{offer.emoji}</span>
        <span className="card__discount">−{pct}%</span>
        <button
          type="button"
          className={`card__save ${saved ? "card__save--active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(offer.id);
          }}
          aria-label={saved ? "Von Favoriten entfernen" : "Zu Favoriten hinzufügen"}
          aria-pressed={saved}
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path
              d="M12 21s-7-4.5-7-11a4 4 0 0 1 7-2.7A4 4 0 0 1 19 10c0 6.5-7 11-7 11z"
              fill={saved ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="card__body">
        <div className="card__head">
          <StoreBadge store={offer.store} />
          <span className="card__distance">{offer.distanceKm.toFixed(1)} km</span>
        </div>

        <h3 className="card__title">{offer.title}</h3>
        <p className="card__subtitle">{offer.subtitle}</p>

        <div className="card__prices">
          <span className="card__price">{euro(offer.price)}</span>
          <span className="card__regular">{euro(offer.regularPrice)}</span>
          <span className="card__unit">/ {offer.unit}</span>
        </div>

        <div className="card__footer">
          <Countdown endsAt={offer.endsAt} compact />
          <span className="card__city">{offer.city}</span>
        </div>
      </div>
    </article>
  );
}
