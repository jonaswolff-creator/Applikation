import { useEffect, useMemo, useState } from "react";
import { AiBot } from "./components/AiBot";
import { FilterBar, type SortKey } from "./components/FilterBar";
import { Header } from "./components/Header";
import { LocationPicker } from "./components/LocationPicker";
import { LoginModal } from "./components/LoginModal";
import { OfferCard } from "./components/OfferCard";
import { OfferDetail } from "./components/OfferDetail";
import { OFFERS } from "./data/offers";
import type { Category, Offer, User, UserLocation } from "./types";
import { euro, savingsPercent } from "./utils/format";
import { haversineKm } from "./utils/geo";

const ALL_CATEGORIES: (Category | "Alle")[] = [
  "Alle",
  "Lebensmittel",
  "Getränke",
  "Drogerie",
  "Elektronik",
  "Haushalt",
  "Mode",
  "Garten",
  "Baumarkt",
];

const STORAGE_KEY = "marktfinder.saved";
const LOC_STORAGE_KEY = "marktfinder.location";
const USER_STORAGE_KEY = "marktfinder.user";

const DEFAULT_LOCATION: UserLocation = {
  lat: 52.5200,
  lng: 13.4050,
  label: "Berlin Mitte",
};

interface PersistedLoc {
  loc: UserLocation;
  radiusKm: number;
}

function useSaved() {
  const [saved, setSaved] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return new Set();
      return new Set(JSON.parse(raw) as string[]);
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(saved)));
    } catch {
      /* ignore */
    }
  }, [saved]);

  const toggle = (id: string) =>
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return { saved, toggle };
}

function useUser() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, [user]);

  return [user, setUser] as const;
}

function useLocation() {
  const [state, setState] = useState<PersistedLoc>(() => {
    try {
      const raw = localStorage.getItem(LOC_STORAGE_KEY);
      if (raw) return JSON.parse(raw) as PersistedLoc;
    } catch {
      /* ignore */
    }
    return { loc: DEFAULT_LOCATION, radiusKm: 5 };
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOC_STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  return [state, setState] as const;
}

export function App() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "Alle">("Alle");
  const [sort, setSort] = useState<SortKey>("relevance");
  const [active, setActive] = useState<Offer | null>(null);
  const [locatorOpen, setLocatorOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [searching, setSearching] = useState(false);

  const { saved, toggle } = useSaved();
  const [{ loc: location, radiusKm }, setLocState] = useLocation();
  const [user, setUser] = useUser();

  const offersWithDistance = useMemo(
    () =>
      OFFERS.map((o) => ({
        offer: o,
        distanceKm: haversineKm(location, { lat: o.lat, lng: o.lng }),
      })),
    [location],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = offersWithDistance.filter(({ offer: o, distanceKm }) => {
      if (distanceKm > radiusKm) return false;
      if (category !== "Alle" && o.category !== category) return false;
      if (!q) return true;
      return [o.title, o.subtitle, o.description, o.store.name, ...o.tags]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });

    const sorted = [...result];
    switch (sort) {
      case "discount":
        sorted.sort(
          (a, b) =>
            savingsPercent(b.offer.regularPrice, b.offer.price) -
            savingsPercent(a.offer.regularPrice, a.offer.price),
        );
        break;
      case "endingSoon":
        sorted.sort(
          (a, b) =>
            new Date(a.offer.endsAt).getTime() - new Date(b.offer.endsAt).getTime(),
        );
        break;
      case "priceAsc":
        sorted.sort((a, b) => a.offer.price - b.offer.price);
        break;
      case "priceDesc":
        sorted.sort((a, b) => b.offer.price - a.offer.price);
        break;
      case "relevance":
      default:
        sorted.sort((a, b) => b.offer.views24h - a.offer.views24h);
    }
    return sorted;
  }, [offersWithDistance, query, category, sort, radiusKm]);

  const heroStats = useMemo(() => {
    const inRange = offersWithDistance.filter((x) => x.distanceKm <= radiusKm);
    const pool = inRange.length > 0 ? inRange : offersWithDistance;
    const best = [...pool].sort(
      (a, b) =>
        savingsPercent(b.offer.regularPrice, b.offer.price) -
        savingsPercent(a.offer.regularPrice, a.offer.price),
    )[0]!;
    const totalSavings = inRange.reduce(
      (acc, x) => acc + (x.offer.regularPrice - x.offer.price),
      0,
    );
    return {
      best: best.offer,
      totalSavings,
      activeOffers: inRange.length,
    };
  }, [offersWithDistance, radiusKm]);

  const activeDistance = useMemo(() => {
    if (!active) return 0;
    return haversineKm(location, { lat: active.lat, lng: active.lng });
  }, [active, location]);

  const similar = useMemo(() => {
    if (!active) return [];
    return OFFERS.filter(
      (o) => o.id !== active.id && o.category === active.category,
    ).slice(0, 4);
  }, [active]);

  return (
    <div className="app">
      <Header
        query={query}
        onQueryChange={setQuery}
        location={location}
        radiusKm={radiusKm}
        onOpenLocator={() => setLocatorOpen(true)}
        user={user}
        onLogin={() => setLoginOpen(true)}
        onLogout={() => setUser(null)}
      />

      <section className="hero">
        <div className="hero__inner">
          <div className="hero__text">
            <span className="hero__eyebrow">Regionale Angebote · heute aktualisiert</span>
            <h1 className="hero__title">
              Die besten Deals <span className="hero__title-accent">in deiner Umgebung</span>
            </h1>
            <p className="hero__lead">
              {searching ? (
                <>
                  Wir durchsuchen alle Märkte im {radiusKm}-km-Umkreis um{" "}
                  <button
                    type="button"
                    className="hero__location-link"
                    onClick={() => setLocatorOpen(true)}
                  >
                    {location.label}
                  </button>
                  . Gleich siehst du, was sich heute lohnt.
                </>
              ) : (
                <>
                  {heroStats.activeOffers} Angebote in einem {radiusKm}-km-Umkreis um{" "}
                  <button
                    type="button"
                    className="hero__location-link"
                    onClick={() => setLocatorOpen(true)}
                  >
                    {location.label}
                  </button>
                  . Sieh auf einen Blick, wie lange ein Angebot noch gilt — und ob der
                  Preis wirklich ein Schnäppchen ist.
                </>
              )}
            </p>
          </div>
          <aside className="hero__stats" aria-label="Überblick">
            {searching ? (
              <>
                <div className="hero__stat hero__stat--skeleton">
                  <div className="skeleton skeleton--lg" />
                  <div className="skeleton skeleton--sm" />
                </div>
                <div className="hero__stat hero__stat--skeleton">
                  <div className="skeleton skeleton--lg" />
                  <div className="skeleton skeleton--sm" />
                </div>
                <div className="hero__highlight hero__highlight--skeleton">
                  <div className="skeleton skeleton--xs" />
                  <div className="skeleton skeleton--md" />
                  <div className="skeleton skeleton--sm" />
                </div>
              </>
            ) : (
              <>
                <div className="hero__stat">
                  <div className="hero__stat-value">{heroStats.activeOffers}</div>
                  <div className="hero__stat-label">aktive Angebote im Umkreis</div>
                </div>
                <div className="hero__stat">
                  <div className="hero__stat-value">{euro(heroStats.totalSavings)}</div>
                  <div className="hero__stat-label">mögliche Ersparnis</div>
                </div>
                <button
                  type="button"
                  className="hero__highlight"
                  onClick={() => setActive(heroStats.best)}
                  style={{
                    background: `linear-gradient(135deg, ${heroStats.best.accent}, ${heroStats.best.accent}cc)`,
                  }}
                >
                  <span className="hero__highlight-label">Top-Deal</span>
                  <span className="hero__highlight-title">
                    {heroStats.best.emoji} {heroStats.best.title}
                  </span>
                  <span className="hero__highlight-savings">
                    −{Math.round(savingsPercent(heroStats.best.regularPrice, heroStats.best.price) * 100)}% heute
                  </span>
                </button>
              </>
            )}
          </aside>
        </div>
      </section>

      <main className="main">
        <FilterBar
          categories={ALL_CATEGORIES}
          activeCategory={category}
          onCategoryChange={setCategory}
          sort={sort}
          onSortChange={setSort}
          totalResults={filtered.length}
        />

        {searching ? (
          <SearchingState location={location.label} radiusKm={radiusKm} />
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="empty__emoji">🔍</div>
            <h2>Keine Angebote in diesem Umkreis</h2>
            <p>
              Erweitere deinen Suchradius über das Standort-Menü oben oder ändere die
              Filter.
            </p>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setLocatorOpen(true)}
            >
              Standort & Radius ändern
            </button>
          </div>
        ) : (
          <div className="grid">
            {filtered.map(({ offer: o, distanceKm }) => (
              <OfferCard
                key={o.id}
                offer={o}
                distanceKm={distanceKm}
                onOpen={setActive}
                saved={saved.has(o.id)}
                onToggleSave={toggle}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="footer__inner">
          <span>© {new Date().getFullYear()} Marktfinder · Demo-Frontend</span>
          <span className="footer__note">
            Alle Preise ohne Gewähr · Datenstand simuliert
          </span>
        </div>
      </footer>

      {active && (
        <OfferDetail
          offer={active}
          distanceKm={activeDistance}
          onClose={() => setActive(null)}
          saved={saved.has(active.id)}
          onToggleSave={toggle}
          similar={similar}
          onOpenSimilar={setActive}
        />
      )}

      {locatorOpen && (
        <LocationPicker
          location={location}
          radiusKm={radiusKm}
          onClose={() => setLocatorOpen(false)}
          onConfirm={(loc, r) => {
            setLocState({ loc, radiusKm: r });
            setLocatorOpen(false);
            setSearching(true);
            window.setTimeout(() => setSearching(false), 5000);
          }}
        />
      )}

      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onSubmit={(u) => {
            setUser(u);
            setLoginOpen(false);
          }}
        />
      )}

      <AiBot offers={OFFERS} location={location} radiusKm={radiusKm} />
    </div>
  );
}

const SEARCH_STEPS = [
  "Verbinde mit Märkten…",
  "Lese aktuelle Prospekte…",
  "Vergleiche Preise…",
  "Sortiere nach Relevanz…",
];

function SearchingState({ location, radiusKm }: { location: string; radiusKm: number }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setStep((s) => Math.min(s + 1, SEARCH_STEPS.length - 1));
    }, 1100);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="searching" role="status" aria-live="polite">
      <div className="searching__spinner" aria-hidden="true">
        <svg viewBox="0 0 64 64" width="64" height="64">
          <circle
            cx="32"
            cy="32"
            r="26"
            fill="none"
            stroke="var(--accent-soft)"
            strokeWidth="6"
          />
          <circle
            cx="32"
            cy="32"
            r="26"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="60 200"
            transform="rotate(-90 32 32)"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="-90 32 32"
              to="270 32 32"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </div>
      <h2 className="searching__title">Angebote werden gesucht…</h2>
      <p className="searching__sub">
        Im {radiusKm}-km-Umkreis um <strong>{location}</strong>
      </p>
      <ul className="searching__steps">
        {SEARCH_STEPS.map((label, i) => (
          <li
            key={label}
            className={
              i < step
                ? "searching__step searching__step--done"
                : i === step
                  ? "searching__step searching__step--active"
                  : "searching__step"
            }
          >
            <span className="searching__step-mark" aria-hidden="true">
              {i < step ? "✓" : i === step ? "•" : ""}
            </span>
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
