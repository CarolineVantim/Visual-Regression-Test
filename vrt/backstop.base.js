/**
 * Configuração compartilhada entre a suíte da aplicação (backstop.config.js)
 * e o laboratório de assertividade (backstop.lab.config.js).
 */
const fs = require('fs');

// Dentro do container do Backstop (--docker), "localhost" é o próprio container.
// O host é alcançado via host.docker.internal (mapeado no dockerCommandTemplate).
// Porta dedicada (e não 3000) para não capturar sem querer um `next dev` qualquer
// que esteja rodando na máquina. Mantenha em sincronia com os scripts do package.json.
const PORT = 3100;
const inDocker = fs.existsSync('/.dockerenv');
const BASE_URL = process.env.VRT_BASE_URL || `http://${inDocker ? 'host.docker.internal' : 'localhost'}:${PORT}`;

const viewports = {
  phone: { label: 'phone', width: 375, height: 812 },
  tablet: { label: 'tablet', width: 1024, height: 768 },
  desktop: { label: 'desktop', width: 1440, height: 900 }
};

/**
 * Padrões aplicados a todo cenário. Convenção para os devs:
 *  - data-vrt="dynamic"  -> conteúdo que muda sempre (datas, contadores): fica invisível na captura
 *  - data-vrt="remove"   -> elementos que nem devem existir na captura (banners, chat widgets)
 */
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
  // 'browser' gera o HTML report (dentro do Docker ele não tenta abrir o navegador).
  // 'CI' gera JUnit XML em ci_report/ (a variável CI é repassada ao container).
  report: ['browser', 'json', ...(process.env.CI ? ['CI'] : [])],
  engine: 'playwright',
  engineOptions: {
    browser: 'chromium',
    args: ['--no-sandbox', '--font-render-hinting=none', '--force-color-profile=srgb', '--disable-gpu']
  },
  // --user: arquivos gerados ficam com o seu usuário (e não root) no host.
  // --add-host: permite que o container acesse o servidor Next rodando no host.
  dockerCommandTemplate:
    'docker run --rm -i --user $(id -u):$(id -g) -e HOME=/tmp -e CI ' +
    '--add-host=host.docker.internal:host-gateway ' +
    '--mount type=bind,source="{cwd}",target=/src ' +
    'backstopjs/backstopjs:{version} {backstopCommand} {args}',
  // Sem isso o Backstop compara a % ARREDONDADA (2 casas) com o threshold:
  // uma diferença de 0.004% vira "0.00" e passa mesmo com threshold 0.
  resembleOutputOptions: { usePreciseMatching: true },
  asyncCaptureLimit: 4,
  asyncCompareLimit: 50,
  debug: false,
  debugWindow: false
});

module.exports = { BASE_URL, viewports, scenario, baseConfig };
