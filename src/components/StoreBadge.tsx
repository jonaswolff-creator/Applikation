import type { Store } from "../types";

interface Props {
  store: Store;
  size?: "sm" | "md";
}

export function StoreBadge({ store, size = "sm" }: Props) {
  return (
    <span className={`store-badge store-badge--${size}`}>
      <span
        className="store-badge__mark"
        style={{ background: store.logoColor }}
        aria-hidden="true"
      >
        {store.initials}
      </span>
      <span className="store-badge__name">{store.name}</span>
    </span>
  );
}
