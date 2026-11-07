/**
 * Suíte de regressão visual da APLICAÇÃO.
 * As referências (backstop_data/bitmaps_reference) são versionadas no git.
 */
const { viewports, scenario, baseConfig } = require('./vrt/backstop.base');

module.exports = {
  ...baseConfig({ id: 'app', dataDir: 'backstop_data' }),
  viewports: [viewports.phone, viewports.tablet, viewports.desktop],
  scenarios: [
    scenario({ label: 'Home', url: '/' }),
    scenario({
      // Evite acentos nos labels: o Backstop os remove do nome do arquivo.
      label: 'Home - hover Deploy',
      url: '/',
      hoverSelector: '#deploy',
      selectors: ['#deploy']
    }),
    scenario({ label: 'About', url: '/about' })
  ]
};
