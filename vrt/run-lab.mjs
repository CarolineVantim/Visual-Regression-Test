#!/usr/bin/env node
/**
 * Executa o laboratório completo: captura a referência (baseline), captura as
 * variantes e gera o relatório de assertividade.
 *
 * O `backstop test` termina com erro quando há diferenças, o que aqui é esperado
 * (metade dos casos são regressões propositais), então o exit code dele é ignorado.
 *
 * Defina VRT_NO_DOCKER=1 para rodar sem Docker (renderização dependente da máquina).
 */
import { spawnSync } from 'node:child_process';

const docker = process.env.VRT_NO_DOCKER ? '' : ' --docker';
const run = (cmd) => {
  console.log(`\n$ ${cmd}`);
  return spawnSync(cmd, { stdio: 'inherit', shell: true }).status;
};

if (run(`npx backstop reference --config=backstop.lab.config.js${docker}`) !== 0) {
  console.error('Falha ao capturar as referências do laboratório.');
  process.exit(1);
}
run(`npx backstop test --config=backstop.lab.config.js${docker}`);
process.exit(run('node vrt/accuracy.mjs'));
