const fs = require('fs');

const PORT = 3100;
const inDocker = fs.existsSync('/.dockerenv');
const BASE_URL = process.env.VRT_BASE_URL || `http://${inDocker ? 'host.docker.internal' : 'localhost'}:${PORT}`;

const viewports = {
  phone: { label: 'phone', width: 375, height: 812 },
  tablet: { label: 'tablet', width: 1024, height: 768 },
  desktop: { label: 'desktop', width: 1440, height: 900 }
};

const scenarioDefaults = {
  readySelector: '',
  delay: 0,
  hideSelectors: ['[data-vrt="dynamic"]'],
  removeSelectors: ['[data-vrt="remove"]', 'nextjs-portal'],
  selectors: ['document'],
  selectorExpansion: true,
  misMatchThreshold: 0.1,
  requireSameDimensions: true
};

const scenario = (s) => ({
  ...scenarioDefaults,
  ...s,
  url: s.url.startsWith('http') ? s.url : BASE_URL + s.url,
  ...(s.referenceUrl ? { referenceUrl: BASE_URL + s.referenceUrl } : {})
});

const baseConfig = ({ id, dataDir }) => ({
  id,
  onBeforeScript: 'playwright/onBefore.js',
  onReadyScript: 'playwright/onReady.js',
  paths: {
    bitmaps_reference: `${dataDir}/bitmaps_reference`,
    bitmaps_test: `${dataDir}/bitmaps_test`,
    engine_scripts: 'backstop_data/engine_scripts',
    html_report: `${dataDir}/html_report`,
    ci_report: `${dataDir}/ci_report`,
    json_report: `${dataDir}/json_report`
  },
  report: ['browser', 'json', ...(process.env.CI ? ['CI'] : [])],
  engine: 'playwright',
  engineOptions: {
    browser: 'chromium',
    args: ['--no-sandbox', '--font-render-hinting=none', '--force-color-profile=srgb', '--disable-gpu']
  },
  dockerCommandTemplate:
    'docker run --rm -i --user $(id -u):$(id -g) -e HOME=/tmp -e CI ' +
    '--add-host=host.docker.internal:host-gateway ' +
    '--mount type=bind,source="{cwd}",target=/src ' +
    'backstopjs/backstopjs:{version} {backstopCommand} {args}',
  resembleOutputOptions: { usePreciseMatching: true },
  asyncCaptureLimit: 4,
  asyncCompareLimit: 50,
  debug: false,
  debugWindow: false
});

module.exports = { BASE_URL, viewports, scenario, baseConfig };
