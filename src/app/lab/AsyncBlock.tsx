"use client";

import { useEffect, useState } from "react";

export default function AsyncBlock() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 600 + Math.random() * 600);
    return () => clearTimeout(t);
  }, []);

  const box = { height: 56, borderRadius: 8, marginBottom: 24, padding: "0 16px", display: "flex", alignItems: "center" } as const;

  if (!loaded) return <div style={{ ...box, background: "#f5f5f5" }} />;

  return (
    <div data-vrt-ready style={{ ...box, background: "#eff6ff", color: "#1d4ed8", fontSize: 14 }}>
      3 cenários carregados de forma assíncrona
    </div>
  );
}
