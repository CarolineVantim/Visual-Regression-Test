# Visual Regression Test: POC com BackstopJS

POC para avaliar se o [BackstopJS](https://github.com/garris/BackstopJS) atende uma squad que valida muita coisa visual. O repo tem duas partes:

1. **Suíte da aplicação**: regressão visual de uma app Next.js (Home e About em 3 viewports), do jeito que um time usaria no dia a dia.
2. **Laboratório de assertividade**: uma página com mudanças visuais controladas (1px de deslocamento, cor sutil, peso de fonte...) e casos de ruído, para medir **o que a ferramenta pega, o que deixa passar e o que acusa à toa**.

## Pré-requisitos

- Node 20+
- Docker (as capturas rodam dentro da imagem `backstopjs/backstopjs`, assim a renderização é idêntica em qualquer máquina e no CI)

```bash
npm install
```

## Fluxo do dia a dia

| comando | o que faz |
|---|---|
| `npm run vrt:test` | Builda a app, sobe em `:3100`, captura e compara com as referências. Falha se houver diferença. |
| `npm run vrt:approve` | A mudança era intencional? Promove as capturas do último teste a novas referências. |
| `npm run vrt:reference` | Recaptura **todas** as referências do zero. |

Depois de um `vrt:test`, o relatório visual (referência × teste × diff) fica em `backstop_data/html_report/index.html`.

As referências (`backstop_data/bitmaps_reference/`) são versionadas: uma mudança visual intencional entra no PR junto com as novas referências, e o diff das imagens aparece na revisão.

> Os testes rodam contra o **build de produção** numa porta dedicada (3100), nunca contra o `next dev`. O servidor de dev injeta overlays e HMR, e uma porta comum como a 3000 pode estar ocupada por outro projeto, o que faria o teste capturar a app errada.

### Adicionando um cenário

Em [backstop.config.js](backstop.config.js):

```js
scenario({ label: 'Checkout - resumo', url: '/checkout', selectors: ['#order-summary'] })
```

Prefira capturar **o componente** (`selectors`) em vez da página inteira, pelos motivos que o laboratório mostra abaixo. Evite acentos no `label`, porque o Backstop os remove do nome do arquivo.

### Convenções para conteúdo instável

| marcação no HTML | efeito na captura |
|---|---|
| `data-vrt="dynamic"` | fica invisível (mantém o espaço). Use em datas, contadores, valores aleatórios. |
| `data-vrt="remove"` | é removido do DOM. Use em banners, widgets de chat, avisos de cookie. |

Além disso, [onReady.js](backstop_data/engine_scripts/playwright/onReady.js) desliga animações e transições e espera fontes e imagens carregarem. O [onBefore.js](backstop_data/engine_scripts/playwright/onBefore.js) força tema claro e `reduced-motion`. Para conteúdo assíncrono, use `readySelector` no cenário.

## Laboratório de assertividade

```bash
npm run vrt:lab
```

Captura `/lab` como referência e `/lab?variant=<caso>` como teste para cada caso de [vrt/lab-cases.json](vrt/lab-cases.json), em dois recortes (página inteira e só o card). Depois, [vrt/accuracy.mjs](vrt/accuracy.mjs) gera `backstop_data/lab/accuracy-report.md` com:

- matriz de confusão (VP/FN/VN/FP), acurácia, recall e precisão **para vários thresholds**, calculados a partir da % bruta sem recapturar
- o veredito caso a caso

Para testar um novo tipo de mudança, adicione o caso no JSON e a variação em [src/app/lab/page.tsx](src/app/lab/page.tsx).

### Resultados (BackstopJS 6.3.25, Chromium via Playwright, Docker, 1440×900)

14 casos: 11 regressões reais e 3 de ruído. Veredito com o threshold padrão de 0,1%:

| caso | % diff página | % diff componente |
|---|---:|---:|
| baseline (timestamp, animação e conteúdo assíncrono variando) | 0 ✅ | 0 ✅ |
| mudança só no DOM, sem efeito visual | 0 ✅ | 0 ✅ |
| banner aleatório removido | 0 ✅ | 0 ✅ |
| botão deslocado 1px | 0,070 ❌ | 0,399 ✅ |
| botão deslocado 4px | 0,173 ✅ | 0,991 ✅ |
| espaçamento da lista +4px | 1,334 ✅ | tamanho ≠ ✅ |
| border-radius 12 → 16px | 0,006 ❌ | 0,032 ❌ |
| ícone sumiu | 0,020 ❌ | 0,113 ✅ |
| uma palavra trocada | 0,036 ❌ | 0,209 ✅ |
| cor do botão #171717 → #262626 | **0** ❌ | **0** ❌ |
| cor do botão → vermelho | 0,458 ✅ | 2,618 ✅ |
| título bold → semibold | 0,267 ✅ | 1,529 ✅ |
| parágrafo 16 → 17px | 0,537 ✅ | 3,072 ✅ |
| letter-spacing +0,5px | 0,263 ✅ | 1,506 ✅ |

| recorte | threshold | regressões detectadas | alarmes falsos |
|---|---:|---:|---:|
| página inteira | 0,1% | 6/11 | 0/3 |
| página inteira | 0% | 10/11 | 0/3 |
| componente | 0,1% | 9/11 | 0/3 |
| componente | 0,01% | 10/11 | 0/3 |

### O que isso diz sobre a ferramenta

- **Com o ambiente estabilizado, não houve alarme falso**: zero FP no laboratório e 9/9 cenários da app passando em execuções seguidas. Isso depende de três coisas: Docker, build de produção e as convenções de estabilização acima. Sem elas, o ruído aparece (a POC original rodava contra `next dev` fora do Docker).
- **O threshold é relativo à área capturada.** A mesma mudança vale cerca de 6x mais no recorte do card do que na página inteira. Com o threshold padrão, a página inteira deixa passar 5 de 11 regressões, incluindo um ícone sumindo e uma palavra trocada. **Recomendação: cenários por componente com threshold ≤ 0,05%**, ou página inteira com threshold 0.
- **Ponto cego de cor:** o resemble.js (motor de comparação do Backstop) ignora diferenças menores que 16/255 por canal, e o Backstop não permite configurar isso. Trocar um token de cor por um vizinho (#171717 → #262626) **nunca** é detectado. Se a squad valida cores de design system, isso precisa de outra camada (asserção de estilo computado ou uma ferramenta com tolerância de cor configurável).
- **Mudanças geométricas mínimas** (border-radius +4px) mexem em pouquíssimos pixels e só são pegas com threshold praticamente zero.
- Use `resembleOutputOptions.usePreciseMatching: true` (já configurado). Sem isso, o Backstop compara a % arredondada pra 2 casas, e 0,004% vira "0.00" e passa.

## CI

[.github/workflows/visual-regression.yml](.github/workflows/visual-regression.yml) roda a suíte da app em todo PR e publica o relatório HTML como artifact quando falha. O laboratório roda sob demanda (*Run workflow* → marcar "lab") e escreve o relatório no resumo do job.

## Estrutura

```
backstop.config.js          suíte da aplicação
backstop.lab.config.js      laboratório (gerado a partir de vrt/lab-cases.json)
vrt/backstop.base.js        config compartilhada: viewports, Docker, defaults de cenário
vrt/lab-cases.json          catálogo de casos do laboratório (+ resultado esperado)
vrt/accuracy.mjs            análise de assertividade
vrt/run-lab.mjs             orquestra reference → test → análise
src/app/lab/                página do laboratório
backstop_data/
  bitmaps_reference/        referências da app (versionadas)
  engine_scripts/playwright estabilização (onBefore/onReady) e interações
```
