module.exports = async (page, scenario) => {
  console.log('SCENARIO > ' + scenario.label);

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

  await page.evaluate(() => document.fonts.ready);

  await page.evaluate(async () => {
    const imgs = Array.from(document.images).filter((img) => !img.complete);
    await Promise.all(imgs.map((img) => new Promise((resolve) => { img.onload = img.onerror = resolve; })));
  });

  await require('./clickAndHoverHelper')(page, scenario);
};
