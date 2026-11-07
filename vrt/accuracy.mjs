#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const LAB_DIR = 'backstop_data/lab';
const THRESHOLDS = [0, 0.01, 0.05, 0.1, 0.5, 1, 2, 5];
const DEFAULT_THRESHOLD = 0.1;

const cases = JSON.parse(fs.readFileSync('vrt/lab-cases.json', 'utf8')).cases;
const caseById = Object.fromEntries(cases.map((c) => [c.id, c]));

function latestReport() {
  const dir = path.join(LAB_DIR, 'bitmaps_test');
  if (!fs.existsSync(dir)) return null;
  const runs = fs.readdirSync(dir).filter((d) => fs.existsSync(path.join(dir, d, 'report.json'))).sort();
  return runs.length ? path.join(dir, runs.at(-1), 'report.json') : null;
}

const reportPath = process.argv[2] || latestReport();
if (!reportPath) {
  console.error('Nenhum report do laboratório encontrado. Rode antes: npm run vrt:lab');
  process.exit(1);
}
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

const rows = report.tests.map(({ pair }) => {
  const id = pair.label.replace(/^lab /, '');
  const diff = pair.diff || {};
  const raw = diff.rawMisMatchPercentage ?? parseFloat(diff.misMatchPercentage ?? '0');
  return {
    id,
    selector: pair.selector,
    expect: caseById[id]?.expect,
    category: caseById[id]?.category,
    description: caseById[id]?.description,
    raw: Number.isFinite(raw) ? raw : 0,
    sameDimensions: diff.isSameDimensions !== false
  };
}).filter((r) => r.expect);

const detected = (r, t) => !r.sameDimensions || r.raw > t;

function confusion(list, t) {
  const m = { VP: 0, FP: 0, VN: 0, FN: 0 };
  for (const r of list) {
    const d = detected(r, t);
    const key = r.expect === 'fail' ? (d ? 'VP' : 'FN') : d ? 'FP' : 'VN';
    m[key]++;
  }
  const total = list.length;
  m.acuracia = total ? (m.VP + m.VN) / total : 0;
  m.recall = m.VP + m.FN ? m.VP / (m.VP + m.FN) : 1;
  m.precisao = m.VP + m.FP ? m.VP / (m.VP + m.FP) : 1;
  return m;
}

const pct = (n) => `${(n * 100).toFixed(0)}%`;
const fmt = (n) => (n === 0 ? '0' : n < 0.001 ? '<0.001' : n.toFixed(3));
const selectors = [...new Set(rows.map((r) => r.selector))];
const selectorName = (s) => (s === 'document' ? 'página inteira' : `componente (${s})`);

const out = [];
out.push('# Assertividade do BackstopJS: laboratório de casos controlados', '');
out.push(`Report analisado: \`${reportPath}\`  `);
out.push(`Casos: ${cases.length} (${cases.filter((c) => c.expect === 'fail').length} regressões reais, ${cases.filter((c) => c.expect === 'pass').length} de ruído/estabilidade) × ${selectors.length} recortes`, '');

out.push('## Por threshold', '');
out.push('Threshold = % máxima de pixels diferentes tolerada antes de falhar.', '');
for (const sel of selectors) {
  const list = rows.filter((r) => r.selector === sel);
  out.push(`### Recorte: ${selectorName(sel)}`, '');
  out.push('| threshold | VP | FN (perdeu) | VN | FP (alarme falso) | acurácia | recall | precisão |');
  out.push('|---:|---:|---:|---:|---:|---:|---:|---:|');
  let best = null;
  for (const t of THRESHOLDS) {
    const m = confusion(list, t);
    if (!best || m.acuracia >= best.m.acuracia) best = { t, m };
    const mark = t === DEFAULT_THRESHOLD ? ' ← padrão' : '';
    out.push(`| ${t}%${mark} | ${m.VP} | ${m.FN} | ${m.VN} | ${m.FP} | ${pct(m.acuracia)} | ${pct(m.recall)} | ${pct(m.precisao)} |`);
  }
  out.push('', `Maior threshold com a melhor acurácia: **${best.t}%** (${pct(best.m.acuracia)}).`, '');
}

out.push('## Por caso', '');
out.push(`Veredito usando o threshold padrão de ${DEFAULT_THRESHOLD}%. ✅ = a ferramenta fez o certo, ❌ = errou.`, '');
const head = selectors.map((s) => `% diff ${s === 'document' ? 'página' : 'componente'} | ok?`).join(' | ');
out.push(`| caso | categoria | esperado | ${head} |`);
out.push(`|---|---|---|${selectors.map(() => '---:|:---:').join('|')}|`);
for (const c of cases) {
  const cells = selectors.map((sel) => {
    const r = rows.find((x) => x.id === c.id && x.selector === sel);
    if (!r) return '- | -';
    const ok = detected(r, DEFAULT_THRESHOLD) === (r.expect === 'fail');
    return `${r.sameDimensions ? fmt(r.raw) : 'dimensão ≠'} | ${ok ? '✅' : '❌'}`;
  });
  out.push(`| \`${c.id}\` ${c.description} | ${c.category} | ${c.expect === 'fail' ? 'detectar' : 'ignorar'} | ${cells.join(' | ')} |`);
}

out.push('', '## Como ler', '');
out.push('- **FN** é o erro mais caro: uma regressão real que chegaria em produção.');
out.push('- **FP** é o que faz o time parar de confiar no teste (e começar a aprovar diff sem olhar).');
out.push('- O resemble.js (motor de comparação do Backstop) ignora diferenças de cor menores que 16/255 por canal, e isso não é configurável via Backstop. Mudanças sutis de cor (ex.: tokens de design próximos) passam sempre.');
out.push('- A mesma mudança gera % bem maior no recorte do componente do que na página inteira, porque o threshold é relativo à área capturada. Cenários focados em componentes (`selectors`) permitem threshold mais alto sem perder sensibilidade.');

const md = out.join('\n') + '\n';
const mdPath = path.join(LAB_DIR, 'accuracy-report.md');
fs.mkdirSync(LAB_DIR, { recursive: true });
fs.writeFileSync(mdPath, md);
fs.writeFileSync(path.join(LAB_DIR, 'accuracy-report.json'), JSON.stringify({ reportPath, rows }, null, 2));

console.log(md);
console.log(`Relatório salvo em ${mdPath}`);
