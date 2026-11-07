const { viewports, scenario, baseConfig } = require('./vrt/backstop.base');

module.exports = {
  ...baseConfig({ id: 'app', dataDir: 'backstop_data' }),
  viewports: [viewports.phone, viewports.tablet, viewports.desktop],
  scenarios: [
    scenario({ label: 'Home', url: '/' }),
    scenario({
      label: 'Home - hover Deploy',
      url: '/',
      hoverSelector: '#deploy',
      selectors: ['#deploy']
    }),
    scenario({ label: 'About', url: '/about' })
  ]
};
