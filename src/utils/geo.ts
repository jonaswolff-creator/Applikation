const EARTH_RADIUS_KM = 6371;

const toRad = (deg: number): number => (deg * Math.PI) / 180;

export const haversineKm = (
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number => {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
};

const KNOWN_PLACES: { lat: number; lng: number; label: string }[] = [
  { lat: 52.5200, lng: 13.4050, label: "Berlin Mitte" },
  { lat: 52.5404, lng: 13.4242, label: "Berlin · Prenzlauer Berg" },
  { lat: 52.5159, lng: 13.4540, label: "Berlin · Friedrichshain" },
  { lat: 52.4977, lng: 13.4123, label: "Berlin · Kreuzberg" },
  { lat: 52.5163, lng: 13.3033, label: "Berlin · Charlottenburg" },
  { lat: 52.4839, lng: 13.3514, label: "Berlin · Schöneberg" },
  { lat: 52.4811, lng: 13.4350, label: "Berlin · Neukölln" },
  { lat: 52.5687, lng: 13.4023, label: "Berlin · Pankow" },
  { lat: 52.4569, lng: 13.3328, label: "Berlin · Steglitz" },
  { lat: 52.4675, lng: 13.3855, label: "Berlin · Tempelhof" },
  { lat: 52.4887, lng: 13.3206, label: "Berlin · Wilmersdorf" },
  { lat: 52.5215, lng: 13.4138, label: "Berlin · Alexanderplatz" },
  { lat: 48.1351, lng: 11.5820, label: "München" },
  { lat: 53.5511, lng: 9.9937, label: "Hamburg" },
  { lat: 50.9375, lng: 6.9603, label: "Köln" },
  { lat: 50.1109, lng: 8.6821, label: "Frankfurt" },
];

export const nearestLabel = (point: { lat: number; lng: number }): string => {
  let best = KNOWN_PLACES[0]!;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const p of KNOWN_PLACES) {
    const d = haversineKm(point, p);
    if (d < bestDist) {
      bestDist = d;
      best = p;
    }
  }
  return bestDist < 1.2 ? best.label : `${best.label} (Umgebung)`;
};
