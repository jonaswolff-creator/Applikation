import { useEffect, useMemo, useState } from "react";
import { FilterBar, type SortKey } from "./components/FilterBar";
import { Header } from "./components/Header";
import { OfferCard } from "./components/OfferCard";
import { OfferDetail } from "./components/OfferDetail";
import { OFFERS } from "./data/offers";
import type { Category, Offer } from "./types";
import { euro, savingsPercent } from "./utils/format";

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

export function App() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("Berlin");
  const [category, setCategory] = useState<Category | "Alle">("Alle");
  const [sort, setSort] = useState<SortKey>("relevance");
  const [active, setActive] = useState<Offer | null>(null);

  const { saved, toggle } = useSaved();

  const cities = useMemo(() => {
    const set = new Set<string>();
    set.add("Berlin");
    OFFERS.forEach((o) => set.add(o.city.split(" ·")[0]!));
    return Array.from(set);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = OFFERS.filter((o) => {
      if (category !== "Alle" && o.category !== category) return false;
      if (city && !o.city.toLowerCase().includes(city.toLowerCase())) return false;
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
            savingsPercent(b.regularPrice, b.price) -
            savingsPercent(a.regularPrice, a.price),
        );
        break;
      case "endingSoon":
        sorted.sort(
          (a, b) => new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime(),
        );
        break;
      case "priceAsc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "relevance":
      default:
        sorted.sort((a, b) => b.views24h - a.views24h);
    }
    return sorted;
  }, [query, city, category, sort]);

  const heroStats = useMemo(() => {
    const best = [...OFFERS].sort(
      (a, b) =>
        savingsPercent(b.regularPrice, b.price) -
        savingsPercent(a.regularPrice, a.price),
    )[0]!;
    const totalSavings = OFFERS.reduce(
      (acc, o) => acc + (o.regularPrice - o.price),
      0,
    );
    return {
      best,
      totalSavings,
      activeOffers: OFFERS.length,
    };
  }, []);

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
        city={city}
        onCityChange={setCity}
        cities={cities}
      />

      <section className="hero">
        <div className="hero__inner">
          <div className="hero__text">
            <span className="hero__eyebrow">Regionale Angebote · heute aktualisiert</span>
            <h1 className="hero__title">
              Die besten Deals <span className="hero__title-accent">in deiner Umgebung</span>
            </h1>
            <p className="hero__lead">
              Vergleiche Prospekte von über 20 Märkten in {city}. Sieh auf einen Blick, wie
              lange ein Angebot noch gilt — und ob der Preis wirklich ein Schnäppchen ist.
            </p>
          </div>
          <aside className="hero__stats" aria-label="Überblick">
            <div className="hero__stat">
              <div className="hero__stat-value">{heroStats.activeOffers}</div>
              <div className="hero__stat-label">aktive Angebote</div>
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

        {filtered.length === 0 ? (
          <div className="empty">
            <div className="empty__emoji">🔍</div>
            <h2>Keine Angebote gefunden</h2>
            <p>Versuche es mit einem anderen Suchbegriff oder wähle eine andere Kategorie.</p>
          </div>
        ) : (
          <div className="grid">
            {filtered.map((o) => (
              <OfferCard
                key={o.id}
                offer={o}
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
          onClose={() => setActive(null)}
          saved={saved.has(active.id)}
          onToggleSave={toggle}
          similar={similar}
          onOpenSimilar={setActive}
        />
      )}
    </div>
  );
}
