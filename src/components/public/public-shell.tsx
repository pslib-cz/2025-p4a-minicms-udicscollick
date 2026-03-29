import Link from "next/link";
import { IconLock } from "@tabler/icons-react";
import { siteConfig } from "@/lib/site";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <Link href="/" className="site-brand">
            <span className="site-brand-mark">T</span>
            <div>
              <strong>{siteConfig.shortName}</strong>
              <p>Cestovatelské tipy a itineráře</p>
            </div>
          </Link>

          <div className="site-header-actions">
            <nav className="site-nav" aria-label="Hlavní navigace">
              <Link href="/">Domů</Link>
              <Link href="/articles">Články</Link>
            </nav>

            <Link href="/login" className="site-admin-link" aria-label="Přihlášení" title="Přihlášení">
              <IconLock size={18} />
            </Link>
          </div>
        </div>
      </header>

      {children}

      <footer className="site-footer">
        <div className="site-footer-inner">
          <p>{siteConfig.name} přináší tipy na města, hory i klidnější cesty, které stojí za to si uložit.</p>
          <p>Nové články vycházejí průběžně podle sezóny, tempa cest i délky volného víkendu.</p>
        </div>
      </footer>
    </div>
  );
}
