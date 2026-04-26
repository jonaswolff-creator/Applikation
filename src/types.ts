export type Category =
  | "Lebensmittel"
  | "Getränke"
  | "Drogerie"
  | "Elektronik"
  | "Haushalt"
  | "Mode"
  | "Garten"
  | "Baumarkt";

export interface PricePoint {
  /** ISO date */
  date: string;
  price: number;
}

export interface Store {
  id: string;
  name: string;
  logoColor: string;
  initials: string;
}

export interface Offer {
  id: string;
  title: string;
  subtitle: string;
  category: Category;
  store: Store;
  city: string;
  lat: number;
  lng: number;
  emoji: string;
  accent: string;
  regularPrice: number;
  price: number;
  unit: string;
  /** ISO datetime when offer started */
  startsAt: string;
  /** ISO datetime when offer ends */
  endsAt: string;
  /** Historical prices (including current run) */
  priceHistory: PricePoint[];
  /** Number of views over past 24h */
  views24h: number;
  /** Number of users who bookmarked */
  savedCount: number;
  /** Number of similar past campaigns */
  pastCampaigns: number;
  tags: string[];
  description: string;
}

export interface UserLocation {
  lat: number;
  lng: number;
  label: string;
}
