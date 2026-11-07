/**
 * Roda depois que a página carregou (e depois do readySelector, se houver),
 * antes da captura. Objetivo: eliminar fontes de ruído que geram falso positivo.
 */
module.exports = async (page, scenario) => {
  console.log('SCENARIO > ' + scenario.label);

  // 1. Congela animações, transições e o cursor piscando.
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
      html { scroll-behavior: auto !important; }
    `
  });

  // 2. Garante que as webfonts terminaram de carregar (senão captura com fallback).
  await page.evaluate(() => document.fonts.ready);

  // 3. Espera imagens visíveis terminarem de decodificar.
  await page.evaluate(async () => {
    const imgs = Array.from(document.images).filter((img) => !img.complete);
    await Promise.all(imgs.map((img) => new Promise((resolve) => { img.onload = img.onerror = resolve; })));
  });

  // 4. Interações declaradas no cenário (hover/click/scroll...).
  await require('./clickAndHoverHelper')(page, scenario);
};
