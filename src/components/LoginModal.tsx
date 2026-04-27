import { useEffect, useMemo, useState } from "react";
import type { User } from "../types";

type Mode = "login" | "register";

interface Props {
  onClose: () => void;
  onSubmit: (user: User) => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface Errors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

export function LoginModal({ onClose, onSubmit }: Props) {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [forgotShown, setForgotShown] = useState(false);

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

  const errors = useMemo<Errors>(() => {
    const e: Errors = {};
    if (mode === "register" && name.trim().length < 2) {
      e.name = "Bitte gib einen Namen ein (min. 2 Zeichen).";
    }
    if (!EMAIL_RE.test(email.trim())) {
      e.email = "E-Mail-Format sieht nicht korrekt aus.";
    }
    if (password.length < 8) {
      e.password = "Mindestens 8 Zeichen.";
    } else if (!/\d/.test(password)) {
      e.password = "Mindestens eine Zahl muss enthalten sein.";
    }
    if (mode === "register" && confirm !== password) {
      e.confirm = "Passwörter stimmen nicht überein.";
    }
    return e;
  }, [mode, name, email, password, confirm]);

  const isValid = Object.keys(errors).length === 0;

  const showError = (key: keyof Errors): string | undefined =>
    touched[key] ? errors[key] : undefined;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirm: true });
    if (!isValid) return;
    setSubmitting(true);
    window.setTimeout(() => {
      const fallbackName = email.split("@")[0]!.replace(/[^a-zA-Z]/g, " ").trim() || "Du";
      const finalName = mode === "register" ? name.trim() : fallbackName;
      onSubmit({
        name: finalName,
        email: email.trim().toLowerCase(),
        signedInAt: new Date().toISOString(),
      });
    }, 700);
  };

  const pwStrength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return Math.min(4, score);
  }, [password]);

  return (
    <div className="sheet" role="dialog" aria-modal="true" aria-label={mode === "login" ? "Einloggen" : "Registrieren"}>
      <div className="sheet__backdrop" onClick={onClose} />
      <div className="sheet__panel sheet__panel--auth">
        <button type="button" className="sheet__close" onClick={onClose} aria-label="Schließen">
          ×
        </button>

        <div className="auth">
          <div className="auth__brand" aria-hidden="true">
            <span>🛒</span>
          </div>
          <h2 className="auth__title">
            {mode === "login" ? "Willkommen zurück" : "Konto erstellen"}
          </h2>
          <p className="auth__sub">
            {mode === "login"
              ? "Melde dich an, um deine Favoriten und Standorte überall zu nutzen."
              : "Speichere deine Lieblingsmärkte und erhalte personalisierte Empfehlungen."}
          </p>

          <div className="auth__tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              className={`auth__tab ${mode === "login" ? "auth__tab--active" : ""}`}
              onClick={() => setMode("login")}
            >
              Einloggen
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "register"}
              className={`auth__tab ${mode === "register" ? "auth__tab--active" : ""}`}
              onClick={() => setMode("register")}
            >
              Registrieren
            </button>
          </div>

          <form className="auth__form" onSubmit={submit} noValidate>
            {mode === "register" && (
              <Field
                label="Name"
                name="name"
                type="text"
                value={name}
                placeholder="Max Mustermann"
                autoComplete="name"
                error={showError("name")}
                onChange={setName}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              />
            )}

            <Field
              label="E-Mail"
              name="email"
              type="email"
              value={email}
              placeholder="du@beispiel.de"
              autoComplete="email"
              error={showError("email")}
              onChange={setEmail}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            />

            <PasswordField
              label="Passwort"
              value={password}
              show={showPw}
              onToggleShow={() => setShowPw((s) => !s)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              error={showError("password")}
              onChange={setPassword}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            />

            {mode === "register" && (
              <>
                <PasswordField
                  label="Passwort bestätigen"
                  value={confirm}
                  show={showPw}
                  onToggleShow={() => setShowPw((s) => !s)}
                  autoComplete="new-password"
                  error={showError("confirm")}
                  onChange={setConfirm}
                  onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
                />
                <PwStrength score={pwStrength} />
              </>
            )}

            {mode === "login" && (
              <div className="auth__row">
                <label className="auth__checkbox">
                  <input type="checkbox" /> Eingeloggt bleiben
                </label>
                <button
                  type="button"
                  className="auth__link"
                  onClick={() => setForgotShown(true)}
                >
                  Passwort vergessen?
                </button>
              </div>
            )}

            {forgotShown && (
              <div className="auth__notice">
                Eine echte Passwort-Wiederherstellung gibt's, sobald das Backend
                steht. Heute schickt das Frontend nichts ab.
              </div>
            )}

            <button
              type="submit"
              className="btn btn--primary auth__submit"
              disabled={!isValid || submitting}
            >
              {submitting
                ? "Einen Moment…"
                : mode === "login"
                  ? "Einloggen"
                  : "Konto erstellen"}
            </button>

            <p className="auth__hint">
              Demo-Modus: Alle Daten bleiben nur lokal in deinem Browser. Es
              werden keine Server kontaktiert.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type,
  value,
  placeholder,
  autoComplete,
  error,
  onChange,
  onBlur,
}: {
  label: string;
  name: string;
  type: string;
  value: string;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  onChange: (v: string) => void;
  onBlur: () => void;
}) {
  return (
    <label className={`field ${error ? "field--error" : ""}`}>
      <span className="field__label">{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!error}
      />
      {error && <span className="field__error">{error}</span>}
    </label>
  );
}

function PasswordField({
  label,
  value,
  show,
  onToggleShow,
  autoComplete,
  error,
  onChange,
  onBlur,
}: {
  label: string;
  value: string;
  show: boolean;
  onToggleShow: () => void;
  autoComplete: string;
  error?: string;
  onChange: (v: string) => void;
  onBlur: () => void;
}) {
  return (
    <label className={`field ${error ? "field--error" : ""}`}>
      <span className="field__label">{label}</span>
      <span className="field__pw">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder="••••••••"
          autoComplete={autoComplete}
          aria-invalid={!!error}
        />
        <button
          type="button"
          className="field__pw-toggle"
          onClick={onToggleShow}
          aria-label={show ? "Passwort verstecken" : "Passwort anzeigen"}
        >
          {show ? "🙈" : "👁️"}
        </button>
      </span>
      {error && <span className="field__error">{error}</span>}
    </label>
  );
}

function PwStrength({ score }: { score: number }) {
  const labels = ["zu schwach", "schwach", "okay", "gut", "stark"];
  const colors = ["#dc2626", "#f59e0b", "#eab308", "#16a34a", "#15803d"];
  return (
    <div className="pw-strength">
      <div className="pw-strength__bars">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="pw-strength__bar"
            style={{
              background: i < score ? colors[score] : "var(--surface-muted)",
            }}
          />
        ))}
      </div>
      <span className="pw-strength__label" style={{ color: colors[score] }}>
        {labels[score]}
      </span>
    </div>
  );
}
