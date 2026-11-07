import type { CSSProperties } from "react";
import labCases from "../../../vrt/lab-cases.json";
import AsyncBlock from "./AsyncBlock";

type Props = { searchParams: Promise<{ variant?: string }> };

const knownIds = new Set(labCases.cases.map((c) => c.id));

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
    <circle cx="10" cy="10" r="10" fill="#16a34a" />
    <path d="M6 10.5l2.5 2.5L14 7.5" stroke="#fff" strokeWidth="2" fill="none" />
  </svg>
);

export default async function Lab({ searchParams }: Props) {
  const { variant: raw } = await searchParams;
  const variant = raw && knownIds.has(raw) ? raw : "baseline";
  const is = (id: string) => variant === id;

  const card: CSSProperties = {
    width: 480,
    padding: 32,
    borderRadius: is("radius") ? 16 : 12,
    background: "#ffffff",
    border: "1px solid #e5e5e5",
    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
  };

  const title: CSSProperties = {
    fontSize: 28,
    lineHeight: "36px",
    fontWeight: is("font-weight") ? 600 : 700,
    letterSpacing: is("letter-spacing") ? "0.5px" : "0px",
    margin: 0,
    color: "#0a0a0a",
  };

  const paragraph: CSSProperties = {
    fontSize: is("font-size") ? 17 : 16,
    lineHeight: "24px",
    color: "#525252",
    margin: "12px 0 24px",
  };

  const button: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    height: 44,
    padding: "0 20px",
    borderRadius: 999,
    border: "none",
    fontSize: 15,
    fontWeight: 500,
    color: "#ffffff",
    background: is("color-obvious") ? "#dc2626" : is("color-subtle") ? "#262626" : "#171717",
    position: "relative",
    left: is("shift-1px") ? 1 : 0,
    top: is("shift-4px") ? 4 : 0,
  };

  const items = ["Comparação pixel a pixel", "Relatório HTML com diff", "Roda em Docker / CI"];

  return (
    <div
      className="font-sans"
      style={{ minHeight: "100vh", background: "#fafafa", display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: 48 }}
      data-variant={variant}
    >
      {is("random-banner") && (
        <div
          data-vrt="remove"
          style={{ position: "fixed", top: 0, left: 0, right: 0, padding: 12, background: "#fef3c7", textAlign: "center" }}
        >
          Promoção #{Math.floor(Math.random() * 10000)} só hoje!
        </div>
      )}

      <section id="lab-card" style={card} className={is("dom-only") ? "card card--renamed" : "card"}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 12, color: "#737373" }}>
            Atualizado em <time data-vrt="dynamic">{new Date().toISOString()}</time>
          </span>
          <span className="animate-spin" style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #d4d4d4", borderTopColor: "#171717", display: "inline-block" }} />
        </div>

        <h1 style={title} aria-label={is("dom-only") ? "Título alterado só no aria" : undefined}>
          Visual Regression Lab
        </h1>
        <p style={paragraph}>
          Esta página existe para medir o quão {is("text-change") ? "precisa" : "assertiva"} a ferramenta é ao
          detectar mudanças visuais pequenas e controladas.
        </p>

        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: is("spacing") ? 14 : 10 }}>
          {items.map((item, i) => (
            <li key={item} style={{ display: "flex", alignItems: "center", gap: 8, height: 20, fontSize: 15, color: "#262626" }}>
              {is("missing-icon") && i === 1 ? <span style={{ width: 18, height: 18 }} /> : <CheckIcon />}
              {item}
            </li>
          ))}
        </ul>

        {is("dom-only") && <div style={{ display: "none" }}>conteúdo invisível</div>}

        <AsyncBlock />

        <button type="button" style={button} data-testid={is("dom-only") ? "cta-renamed" : "cta"}>
          Começar agora
        </button>
      </section>
    </div>
  );
}
