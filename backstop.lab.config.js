const { viewports, scenario, baseConfig } = require('./vrt/backstop.base');
const { cases } = require('./vrt/lab-cases.json');

module.exports = {
  ...baseConfig({ id: 'lab', dataDir: 'backstop_data/lab' }),
  viewports: [viewports.desktop],
  scenarios: cases.map((c) =>
    scenario({
      label: `lab ${c.id}`,
      referenceUrl: '/lab',
      url: `/lab?variant=${c.id}`,
      readySelector: '[data-vrt-ready]',
      selectors: ['document', '#lab-card'],
      misMatchThreshold: 0
    })
  )
};
