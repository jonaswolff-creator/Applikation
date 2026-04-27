import { useEffect, useRef, useState, type ChangeEvent } from "react";
import type { User, UserLocation } from "../types";

interface Props {
  query: string;
  onQueryChange: (value: string) => void;
  location: UserLocation;
  radiusKm: number;
  onOpenLocator: () => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
}

export function Header({
  query,
  onQueryChange,
  location,
  radiusKm,
  onOpenLocator,
  user,
  onLogin,
  onLogout,
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
          {user ? (
            <UserMenu user={user} onLogout={onLogout} />
          ) : (
            <button type="button" className="nav__link nav__link--cta" onClick={onLogin}>
              Einloggen
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

function UserMenu({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");

  return (
    <div className="user-menu" ref={ref}>
      <button
        type="button"
        className="user-menu__trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Konto-Menü"
      >
        <span className="user-menu__avatar">{initials || "🙂"}</span>
        <span className="user-menu__name">{user.name}</span>
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <path
            d="M6 9l6 6 6-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div className="user-menu__panel" role="menu">
          <div className="user-menu__head">
            <span className="user-menu__avatar user-menu__avatar--lg">
              {initials || "🙂"}
            </span>
            <div>
              <div className="user-menu__hname">{user.name}</div>
              <div className="user-menu__hmail">{user.email}</div>
            </div>
          </div>
          <button
            type="button"
            className="user-menu__item user-menu__item--danger"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          >
            Abmelden
          </button>
        </div>
      )}
    </div>
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
