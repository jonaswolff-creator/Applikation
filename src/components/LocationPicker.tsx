import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { UserLocation } from "../types";
import { nearestLabel } from "../utils/geo";

import "leaflet/dist/leaflet.css";

const PIN_ICON = L.divIcon({
  className: "loc-pin",
  iconSize: [28, 36],
  iconAnchor: [14, 34],
  html: `<svg viewBox="0 0 28 36" width="28" height="36" aria-hidden="true">
    <defs>
      <linearGradient id="pin-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2563eb"/>
        <stop offset="100%" stop-color="#1d4ed8"/>
      </linearGradient>
    </defs>
    <path d="M14 1c7 0 12 5 12 12 0 8-12 22-12 22S2 21 2 13C2 6 7 1 14 1z"
          fill="url(#pin-grad)" stroke="white" stroke-width="2"/>
    <circle cx="14" cy="13" r="4.5" fill="white"/>
  </svg>`,
});

interface Props {
  location: UserLocation;
  radiusKm: number;
  onClose: () => void;
  onConfirm: (loc: UserLocation, radiusKm: number) => void;
}

export function LocationPicker({ location, radiusKm, onClose, onConfirm }: Props) {
  const [draft, setDraft] = useState<UserLocation>(location);
  const [draftRadius, setDraftRadius] = useState(radiusKm);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const center = useMemo<[number, number]>(() => [draft.lat, draft.lng], [draft]);

  const useGeoLocation = () => {
    if (!("geolocation" in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: nearestLabel({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        };
        setDraft(next);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: false, timeout: 6000 },
    );
  };

  return (
    <div className="sheet" role="dialog" aria-modal="true" aria-label="Ort wählen">
      <div className="sheet__backdrop" onClick={onClose} />
      <div className="sheet__panel sheet__panel--locator">
        <button type="button" className="sheet__close" onClick={onClose} aria-label="Schließen">
          ×
        </button>

        <div className="locator">
          <header className="locator__header">
            <h2>Ort & Umkreis wählen</h2>
            <p>Klicke in die Karte, um deinen Standort zu setzen, oder nutze deine Geo-Position.</p>
          </header>

          <div className="locator__body">
            <div className="locator__map">
              <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom
                className="leaflet-host"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <PickHandler
                  onPick={(latlng) =>
                    setDraft({
                      lat: latlng.lat,
                      lng: latlng.lng,
                      label: nearestLabel(latlng),
                    })
                  }
                />
                <PanTo center={center} />
                <Marker position={center} icon={PIN_ICON} />
                <Circle
                  center={center}
                  radius={draftRadius * 1000}
                  pathOptions={{
                    color: "#2563eb",
                    weight: 1.5,
                    fillColor: "#2563eb",
                    fillOpacity: 0.08,
                  }}
                />
              </MapContainer>
            </div>

            <aside className="locator__side">
              <div className="locator__field">
                <span className="locator__label">Aktueller Standort</span>
                <strong className="locator__value">{draft.label}</strong>
                <span className="locator__coords">
                  {draft.lat.toFixed(4)}° N · {draft.lng.toFixed(4)}° E
                </span>
              </div>

              <button
                type="button"
                className="btn btn--ghost locator__geo"
                onClick={useGeoLocation}
                disabled={locating}
              >
                {locating ? "Suche dich…" : "📍 Meinen Standort verwenden"}
              </button>

              <div className="locator__field">
                <span className="locator__label">Suchradius</span>
                <div className="locator__radius">
                  <input
                    type="range"
                    min={1}
                    max={20}
                    step={1}
                    value={draftRadius}
                    onChange={(e) => setDraftRadius(Number(e.target.value))}
                  />
                  <output className="locator__radius-value">{draftRadius} km</output>
                </div>
                <div className="locator__radius-hint">
                  Zeigt Märkte im {draftRadius}-km-Umkreis
                </div>
              </div>

              <div className="locator__actions">
                <button type="button" className="btn btn--ghost" onClick={onClose}>
                  Abbrechen
                </button>
                <button
                  type="button"
                  className="btn btn--primary"
                  style={{ background: "#2563eb" }}
                  onClick={() => onConfirm(draft, draftRadius)}
                >
                  Übernehmen
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function PickHandler({ onPick }: { onPick: (p: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function PanTo({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { duration: 0.5 });
  }, [center, map]);
  return null;
}
