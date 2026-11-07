module.exports = async (page, scenario, viewport, isReference, browserContext) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });

  if (scenario.cookiePath) {
    await require('./loadCookies')(browserContext, scenario);
  }
};
