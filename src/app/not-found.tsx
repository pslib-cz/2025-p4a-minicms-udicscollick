import Link from "next/link";
import { PublicShell } from "@/components/public/public-shell";

export default function NotFound() {
  return (
    <PublicShell>
      <main className="page-stack">
        <section className="empty-state">
          <p className="eyebrow">404</p>
          <h1>Stránka nebyla nalezena</h1>
          <p>Požadovaný obsah neexistuje, nebo už není veřejně dostupný.</p>
          <div className="hero-actions" style={{ marginTop: "1rem" }}>
            <Link href="/" className="button-primary">
              Zpět na domů
            </Link>
            <Link href="/articles" className="button-secondary">
              Projít články
            </Link>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
