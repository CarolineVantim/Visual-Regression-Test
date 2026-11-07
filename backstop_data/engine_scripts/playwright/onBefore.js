// eslint-disable-next-line @typescript-eslint/no-unused-vars
module.exports = async (page, scenario, viewport, isReference, browserContext) => {
  // Força tema claro e menos movimento, independente da máquina que roda o teste.
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });

  if (scenario.cookiePath) {
    await require('./loadCookies')(browserContext, scenario);
  }
};
