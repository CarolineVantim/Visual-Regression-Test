#!/usr/bin/env node
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
