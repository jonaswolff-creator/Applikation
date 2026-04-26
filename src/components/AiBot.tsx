import { useEffect, useMemo, useRef, useState } from "react";
import type { Offer, UserLocation } from "../types";
import { euro, savingsPercent } from "../utils/format";
import { haversineKm } from "../utils/geo";

interface Props {
  offers: Offer[];
  location: UserLocation;
  radiusKm: number;
}

interface Message {
  id: string;
  role: "bot" | "user";
  text: string;
  highlights?: string[];
}

const SUGGESTIONS = [
  "Was lohnt sich heute besonders?",
  "Welcher Markt ist am nächsten?",
  "Vergleich mir Lebensmittel",
  "Wo ist der größte Rabatt?",
];

export function AiBot({ offers, location, radiusKm }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const greeting = useMemo<Message>(() => {
    const inRange = offers.filter(
      (o) => haversineKm(location, { lat: o.lat, lng: o.lng }) <= radiusKm,
    );
    const top = [...inRange].sort(
      (a, b) =>
        savingsPercent(b.regularPrice, b.price) -
        savingsPercent(a.regularPrice, a.price),
    )[0];
    return {
      id: "greet",
      role: "bot",
      text: top
        ? `Hi! Ich bin dein Marktfinder-Copilot 🤖. Ich sehe ${inRange.length} Angebote im ${radiusKm}-km-Umkreis um ${location.label}. Der größte Rabatt heute: **${top.title}** bei ${top.store.name} mit −${Math.round(savingsPercent(top.regularPrice, top.price) * 100)}%. Frag mich, was sich für dich lohnt!`
        : `Hi! Im aktuellen Radius (${radiusKm} km um ${location.label}) finde ich keine Angebote. Erweitere den Radius oder verschiebe deinen Standort.`,
      highlights: top ? [top.id] : [],
    };
  }, [offers, location, radiusKm]);

  const [messages, setMessages] = useState<Message[]>([greeting]);

  useEffect(() => {
    setMessages([greeting]);
  }, [greeting]);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const ask = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text: text.trim(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);
    window.setTimeout(() => {
      const reply = generateReply(text, offers, location, radiusKm);
      setMessages((m) => [...m, reply]);
      setThinking(false);
    }, 650 + Math.random() * 400);
  };

  return (
    <>
      <button
        type="button"
        className={`bot-fab ${open ? "bot-fab--hidden" : ""}`}
        onClick={() => setOpen(true)}
        aria-label="Copilot öffnen"
      >
        <span className="bot-fab__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <rect x="4" y="6" width="16" height="13" rx="4" fill="white" opacity=".95" />
            <circle cx="9" cy="12.5" r="1.6" fill="#2563eb" />
            <circle cx="15" cy="12.5" r="1.6" fill="#2563eb" />
            <path d="M9 16h6" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M12 3v3" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="2.6" r="1.4" fill="white" />
          </svg>
        </span>
        <span className="bot-fab__label">
          <strong>Copilot</strong>
          <span>fragen</span>
        </span>
        <span className="bot-fab__pulse" aria-hidden="true" />
      </button>

      {open && (
        <div className="bot" role="dialog" aria-label="AI Copilot">
          <header className="bot__head">
            <div className="bot__title">
              <span className="bot__avatar" aria-hidden="true">🤖</span>
              <div>
                <div className="bot__name">Marktfinder Copilot</div>
                <div className="bot__status">
                  <span className="bot__status-dot" /> online · Demo-Modus
                </div>
              </div>
            </div>
            <button
              type="button"
              className="bot__close"
              onClick={() => setOpen(false)}
              aria-label="Copilot schließen"
            >
              ×
            </button>
          </header>

          <div className="bot__feed" ref={scrollRef}>
            {messages.map((m) => (
              <div key={m.id} className={`bot__msg bot__msg--${m.role}`}>
                {m.role === "bot" && <span className="bot__msg-avatar" aria-hidden="true">🤖</span>}
                <div className="bot__bubble" dangerouslySetInnerHTML={renderMd(m.text)} />
              </div>
            ))}
            {thinking && (
              <div className="bot__msg bot__msg--bot">
                <span className="bot__msg-avatar" aria-hidden="true">🤖</span>
                <div className="bot__bubble bot__bubble--thinking">
                  <span /><span /><span />
                </div>
              </div>
            )}
          </div>

          <div className="bot__suggest">
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" className="bot__suggest-chip" onClick={() => ask(s)}>
                {s}
              </button>
            ))}
          </div>

          <form
            className="bot__input"
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Frag mich etwas zu den Angeboten…"
              aria-label="Frage eingeben"
            />
            <button type="submit" className="bot__send" disabled={!input.trim()}>
              Senden
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function renderMd(text: string): { __html: string } {
  const safe = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const html = safe
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
  return { __html: html };
}

function generateReply(
  raw: string,
  offers: Offer[],
  location: UserLocation,
  radiusKm: number,
): Message {
  const q = raw.toLowerCase();
  const inRange = offers
    .map((o) => ({ o, d: haversineKm(location, { lat: o.lat, lng: o.lng }) }))
    .filter((x) => x.d <= radiusKm);

  if (inRange.length === 0) {
    return {
      id: crypto.randomUUID(),
      role: "bot",
      text: `Im aktuellen Radius (${radiusKm} km) sehe ich gerade keine Angebote. Erhöh den Radius über das Standort-Menü oder verschiebe den Pin auf der Karte.`,
    };
  }

  if (q.includes("nächste") || q.includes("nahe") || q.includes("näh")) {
    const sorted = [...inRange].sort((a, b) => a.d - b.d);
    const closest = sorted[0]!;
    const second = sorted[1];
    const text =
      `Am nächsten liegt **${closest.o.store.name}** (${closest.d.toFixed(1)} km) mit "${closest.o.title}".` +
      (second
        ? ` Knapp dahinter: ${second.o.store.name} mit ${second.o.title} (${second.d.toFixed(1)} km).`
        : "");
    return { id: crypto.randomUUID(), role: "bot", text };
  }

  if (q.includes("rabatt") || q.includes("billig") || q.includes("günstig") || q.includes("größter")) {
    const sorted = [...inRange].sort(
      (a, b) =>
        savingsPercent(b.o.regularPrice, b.o.price) -
        savingsPercent(a.o.regularPrice, a.o.price),
    );
    const top = sorted[0]!;
    return {
      id: crypto.randomUUID(),
      role: "bot",
      text:
        `Der größte Rabatt im Umkreis ist **${top.o.title}** bei ${top.o.store.name}: ${euro(top.o.price)} statt ${euro(top.o.regularPrice)} (−${Math.round(savingsPercent(top.o.regularPrice, top.o.price) * 100)}%).` +
        ` Entfernung: ${top.d.toFixed(1)} km. Aus meiner Sicht ein klarer Mitnahme-Tipp — der Preis ist auf 6-Monats-Tief.`,
    };
  }

  if (q.includes("vergleich") || q.includes("lohnt")) {
    const lebensmittel = inRange
      .filter((x) => x.o.category === "Lebensmittel")
      .sort((a, b) => a.o.price / a.o.regularPrice - b.o.price / b.o.regularPrice);
    if (lebensmittel.length >= 2) {
      const a = lebensmittel[0]!;
      const b = lebensmittel[1]!;
      const cheaper = a.o.price <= b.o.price ? a : b;
      const closer = a.d <= b.d ? a : b;
      const verdict =
        cheaper.o.id === closer.o.id
          ? `Klar: **${cheaper.o.title}** bei ${cheaper.o.store.name} ist sowohl günstiger als auch näher (${cheaper.d.toFixed(1)} km).`
          : `**${cheaper.o.title}** (${cheaper.o.store.name}) ist mit ${euro(cheaper.o.price)} zwar billiger, liegt aber ${cheaper.d.toFixed(1)} km weg. **${closer.o.title}** bei ${closer.o.store.name} kostet ${euro(closer.o.price)} und ist nur ${closer.d.toFixed(1)} km entfernt — wenn du Sprit/Zeit einrechnest, lohnt sich oft der näher gelegene Markt.`;
      return { id: crypto.randomUUID(), role: "bot", text: verdict };
    }
  }

  if (q.includes("lebensmittel") || q.includes("essen") || q.includes("food")) {
    const list = inRange
      .filter((x) => x.o.category === "Lebensmittel")
      .sort((a, b) =>
        savingsPercent(b.o.regularPrice, b.o.price) -
        savingsPercent(a.o.regularPrice, a.o.price),
      )
      .slice(0, 3);
    const lines = list.map(
      (x, i) =>
        `${i + 1}. ${x.o.title} — **${euro(x.o.price)}** (${x.o.store.name}, ${x.d.toFixed(1)} km)`,
    );
    return {
      id: crypto.randomUUID(),
      role: "bot",
      text: `Top-Lebensmittel-Deals in deinem Umkreis:\n${lines.join("\n")}`,
    };
  }

  // Default: top 3 picks with reasoning
  const ranked = [...inRange]
    .map((x) => ({
      ...x,
      score:
        savingsPercent(x.o.regularPrice, x.o.price) * 0.7 +
        Math.max(0, 1 - x.d / radiusKm) * 0.3,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const lines = ranked.map(
    (x, i) =>
      `${i + 1}. **${x.o.title}** (${x.o.store.name}) — ${euro(x.o.price)} statt ${euro(x.o.regularPrice)}, ${x.d.toFixed(1)} km`,
  );

  return {
    id: crypto.randomUUID(),
    role: "bot",
    text:
      `Hier ist meine persönliche Empfehlung — gewichtet aus Rabatt und Entfernung:\n${lines.join("\n")}\n\nDer Top-Pick (#1) liefert das beste Verhältnis aus Ersparnis und kurzem Weg.`,
  };
}
