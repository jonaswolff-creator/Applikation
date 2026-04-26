import type { ChangeEvent } from "react";
import type { UserLocation } from "../types";

interface Props {
  query: string;
  onQueryChange: (value: string) => void;
  location: UserLocation;
  radiusKm: number;
  onOpenLocator: () => void;
}

export function Header({
  query,
  onQueryChange,
  location,
  radiusKm,
  onOpenLocator,
}: Props) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a href="#" className="brand" aria-label="Marktfinder Startseite">
          <span className="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path
                d="M5 8h14l-1.5 9a2 2 0 0 1-2 1.7h-7a2 2 0 0 1-2-1.7L5 8z"
                fill="currentColor"
                opacity=".15"
              />
              <path
                d="M5 8h14l-1.5 9a2 2 0 0 1-2 1.7h-7a2 2 0 0 1-2-1.7L5 8z"
                stroke="currentColor"
                strokeWidth="1.8"
                fill="none"
              />
              <path
                d="M9 8V6a3 3 0 0 1 6 0v2"
                stroke="currentColor"
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="brand__text">
            Markt<span className="brand__accent">finder</span>
          </span>
        </a>

        <div className="search">
          <label className="search__field search__field--query">
            <SearchIcon />
            <input
              value={query}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onQueryChange(e.target.value)}
              placeholder="Wonach suchst du heute?"
              aria-label="Angebot suchen"
            />
            {query && (
              <button
                type="button"
                className="search__clear"
                onClick={() => onQueryChange("")}
                aria-label="Suche zurücksetzen"
              >
                ×
              </button>
            )}
          </label>

          <button
            type="button"
            className="search__field search__field--locator"
            onClick={onOpenLocator}
            aria-label="Standort und Radius wählen"
          >
            <PinIcon />
            <span className="search__locator-text">
              <span className="search__locator-label">{location.label}</span>
              <span className="search__locator-radius">Radius {radiusKm} km</span>
            </span>
            <ChevronIcon />
          </button>
        </div>

        <nav className="nav" aria-label="Hauptnavigation">
          <a href="#" className="nav__link">Prospekte</a>
          <a href="#" className="nav__link">Favoriten</a>
          <a href="#" className="nav__link nav__link--cta">Einloggen</a>
        </nav>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M12 21s-7-7.1-7-12a7 7 0 1 1 14 0c0 4.9-7 12-7 12z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="9" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
