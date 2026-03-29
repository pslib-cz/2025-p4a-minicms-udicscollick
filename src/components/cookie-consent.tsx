"use client";

import { useState, useSyncExternalStore } from "react";
import { Analytics } from "@vercel/analytics/react";

const CONSENT_COOKIE = "toulky_cookie_consent";
const CONSENT_MAX_AGE = 60 * 60 * 24 * 180;

type ConsentState = "accepted" | "rejected" | "unset";

function subscribe() {
  return () => {};
}

function readConsent(): ConsentState {
  if (typeof document === "undefined") {
    return "unset";
  }

  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]+)`));

  if (!match) {
    return "unset";
  }

  const value = decodeURIComponent(match[1]);

  if (value === "accepted" || value === "rejected") {
    return value;
  }

  return "unset";
}

function persistConsent(value: Exclude<ConsentState, "unset">) {
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(value)}; path=/; max-age=${CONSENT_MAX_AGE}; SameSite=Lax`;
}

export function CookieConsent() {
  const persistedConsent = useSyncExternalStore(subscribe, readConsent, () => "unset" as ConsentState);
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const [localConsent, setLocalConsent] = useState<ConsentState | null>(null);
  const consent = localConsent ?? persistedConsent;

  function handleChoice(value: Exclude<ConsentState, "unset">) {
    persistConsent(value);
    setLocalConsent(value);
  }

  return (
    <>
      {consent === "accepted" ? <Analytics /> : null}

      {hydrated && consent === "unset" ? (
        <aside className="cookie-banner" aria-live="polite" aria-label="Souhlas s analytikou">
          <div className="cookie-banner__body">
            <p className="eyebrow">Soukromí</p>
            <h2>Pomozte nám měřit návštěvnost webu</h2>
            <p>
              Používáme anonymní analytiku pro měření pageview. Web funguje i bez souhlasu, jen nebudeme počítat vaši
              návštěvu do statistik.
            </p>
          </div>

          <div className="cookie-banner__actions">
            <button type="button" className="button-primary" onClick={() => handleChoice("accepted")}>
              Povolit analytiku
            </button>
            <button type="button" className="button-secondary" onClick={() => handleChoice("rejected")}>
              Jen nezbytné
            </button>
          </div>
        </aside>
      ) : null}
    </>
  );
}
