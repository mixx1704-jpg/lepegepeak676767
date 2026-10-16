# Arte v3

Assets originais gerados com a ferramenta integrada ImageGen, em 16/10/2026; sem assets remotos ou personagens copiados. Referências do usuário: proporções, paleta e acabamento de JRPG 16-bit.

- `heroes-atlas.png`: 15 heróis originais, grade 5 × 3, na ordem de `CLASSES`. Fundo transparente. Brief: guerreiro, paladino, bárbaro, ladino, patrulheiro, mago, necromante, clérigo, druida, bardo, monge, bruxo, alquimista, xamã e artífice. Pose em três quartos, mão livre, contornos coloridos escuros e sombreamento de três tons, sem texto ou armas incorporadas.
- `creatures-atlas.png`: 12 criaturas originais, grade 4 × 3. Brief: esqueleto guerreiro, esqueleto arqueiro, cavaleiro esqueleto, lobo espiritual; aranha, javali monstruoso, bruxa de gelo, cultista da peste; demônio infernal, sacerdote de fogo, colosso da floresta, monarca do vazio. Fundo transparente, cada criatura isolada em sua célula.
- `temple-battlefield.png`: cenário de batalha original. Brief: pátio aberto de templo antigo tomado por floresta, ruínas no alto, centro amplo para combate, pixel art natural em jade e oliva, sem texto/personagens/interface.

Os PNGs são preservados como retornados pela ferramenta; recortes são feitos exclusivamente por viewport CSS. Armas são camadas vetoriais pixeladas independentes, escolhidas pelo equipamento e animadas junto ao corpo por CSS. Animações usam pivô no punho, preparação, avanço, golpe, rastro e recuperação. São animações de camadas de sprites, não um atlas de quadros desenhados individualmente. Respeitam a preferência de movimento reduzido.

Integração: importar `art-v3.css` e `heroSprite`, `monsterSprite`, `summonSprite`, `battleScene`, `itemIcon`, `animateAttack` de `art-v3.js`. `animateAttack(element, kind)` aceita attack, spell, heal, summon. Classes CSS diretas: attack-pose, cast-pose, shoot-pose.
