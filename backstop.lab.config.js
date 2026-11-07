/**
 * Laboratório de assertividade.
 *
 * Cada caso de vrt/lab-cases.json vira um cenário onde:
 *   referência = /lab                (baseline)
 *   teste      = /lab?variant=<id>   (uma mudança controlada)
 *
 * Cada cenário captura dois recortes: a página inteira ("document") e só o
 * componente ("#lab-card"), para mostrar como o tamanho da área capturada
 * afeta a % de diferença e, portanto, o threshold.
 *
 * Os threshold e resultados são analisados por vrt/accuracy.mjs.
 */
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
      // Threshold 0 na execução: a análise de vários thresholds é feita depois,
      // a partir da % bruta de cada comparação (não precisa recapturar).
      misMatchThreshold: 0
    })
  )
};
