import type { Category } from "../types";

export type SortKey = "relevance" | "discount" | "endingSoon" | "priceAsc" | "priceDesc";

interface Props {
  categories: (Category | "Alle")[];
  activeCategory: Category | "Alle";
  onCategoryChange: (c: Category | "Alle") => void;
  sort: SortKey;
  onSortChange: (s: SortKey) => void;
  totalResults: number;
}

const SORT_LABELS: Record<SortKey, string> = {
  relevance: "Relevanz",
  discount: "Höchster Rabatt",
  endingSoon: "Läuft bald ab",
  priceAsc: "Preis aufsteigend",
  priceDesc: "Preis absteigend",
};

export function FilterBar({
  categories,
  activeCategory,
  onCategoryChange,
  sort,
  onSortChange,
  totalResults,
}: Props) {
  return (
    <div className="filterbar">
      <div className="filterbar__chips" role="tablist" aria-label="Kategorie filtern">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={activeCategory === c}
            className={`chip ${activeCategory === c ? "chip--active" : ""}`}
            onClick={() => onCategoryChange(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="filterbar__right">
        <span className="filterbar__count">
          <strong>{totalResults}</strong> Angebote
        </span>
        <label className="filterbar__sort">
          <span className="filterbar__sort-label">Sortieren</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            aria-label="Sortierung"
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
              <option key={k} value={k}>
                {SORT_LABELS[k]}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
