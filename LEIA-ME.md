# <Inserir nome de jogo de RPG> · atualização v9

## Publicar

Extraia SiteRPG-Inferno-v9.zip e substitua o conteúdo do seu projeto, incluindo web/, game/, supabase/ e .github/. Dê push como nas versões anteriores. É preciso publicar **frontend e Edge Function game**: só trocar o frontend não adiciona as novas regras online. O workflow existente publica a função se SUPABASE_ACCESS_TOKEN estiver configurado; confira o GitHub Actions. Recarregue com Ctrl+F5 após publicar.

**Não há SQL novo, migração nova nem tabela nova.** Configuração pública da Supabase, código de conta/recuperação e workflow foram preservados. Nenhum deploy foi realizado nesta entrega. O título continua literalmente <Inserir nome de jogo de RPG>.

## Dodge

Novo comando 5 · Dodge. Consome uma ação com recuperação base mais rápida que atacar. Acrescenta **20 pontos percentuais** à esquiva até seu próximo comando: uma build de 80% fica com 100%. A esquiva passiva continua limitada a 80%; a postura não acumula consigo mesma e não continua ao atacar/conjurar/defender. O tooltip mostra o valor temporário.

Dodge afeta impactos esquiváveis. Danos contínuos, custos de vida, punições de encontros, reflexos e explosões que já ignoravam esquiva não viram imunidade. Técnicas de controle sem impacto ainda podem afetar você.

## Inimigos e dificuldade

São **60 espécies novas**, além das 44 existentes: **104 espécies comuns** e os 80 chefes/configurações já existentes. Há 13 novas anatomias de sprites, como sino, máscara, âncora, água-viva, rato, cervo, vespa, livro carnívoro, cirurgião e autômato de relógio. As outras criaturas reutilizam famílias anteriores com detalhes próprios.

As novas espécies formam **12 grupos de cinco membros**, com três ações anunciadas por espécie. Os encontros podem misturar os grupos antigos com os novos. Marcas aceleram aliados; caçadores perseguem feridos; rituais concedem fortalecimento/proteção; rompimentos destroem escudos; infecção reduz curas; condenação amplifica ataques; inimigos roubam tempo, drenam mana, espalham sangramento, executam e reanimam. Aliados do mesmo grupo amplificam ataques contra uma presa marcada, com limite de +30% desse vínculo.

A curva usa profundidade, tamanho da party e um piso de vida baseado no nível médio. Pressão e quantidade aumentam com a profundidade, até dez inimigos vivos. O crescimento posterior é polinomial para evitar o muro exponencial anterior. A partir da profundidade 10, chefes de elementos com uma tropa compatível recebem até dois acompanhantes.

Inimigos comuns agora também podem sofrer quebra: ela interrompe uma ação. Chefes mantêm duas ações interrompidas e sua proteção temporária contra quebra consecutiva. Silêncio e atraso de ATB continuam alternativas de interrupção.

Testes de encontros crescem com a profundidade e têm um piso relacionado ao atributo testado: investir em atributo ajuda, mas não torna todo teste sucesso automático. A interface mostra a CD efetiva. Investigação mantém o bônus +4 nos raros. As punições severas da v7 continuam: perdas de PV, ouro, mana, poção e lesões; novas traits podem modificar o dano da falha. 1 natural falha e 20 natural vence, conforme as regras existentes. Recuar continua seguro.

## Animações e encontros

**54 perfis de efeitos** cobrem ataques, especiais inimigos, cura, defesa, invocação, esquiva, contra-ataque, reflexão e explosão. Existem investidas, saltos, impactos, projéteis, rituais, selos, rupturas e carga de ultimate, com variações por espécie e técnica. Eventos do servidor incluem espécie, técnica e alvos, e continuam passando pelo histórico/deduplicação multiplayer. As 32 novas magias têm combinações visuais próprias de dois efeitos.

Os **42 encounters** usam **33 cenários visuais** apropriados ao local: biblioteca, ponte, chuva de vidro, tribunal, espelho, sino, forja, poço, ovo, árvore, fenda etc. Não caem mais todos na espada. Os 34 encontros comuns receberam **102 narrativas diferentes** de três frases: sucesso, falha e recuo. Os oito raros mantêm histórias específicas. Honrar a espada a deixa na pedra.

A cena acompanha o resultado já confirmado do D20; a animação não rerrola o teste. Fechar o painel é imediato. Cenas e efeitos não bloqueiam comandos nem aguardam antes de enviar pedidos ao servidor. Movimento reduzido é respeitado; abas ocultas interrompem efeitos/sons e não acumulam filas para reproduzir depois. O resultado continua aparecendo uma vez por jogador, como na v7.

## Traits

**100 vantagens e 100 desvantagens novas**, além das 64 anteriores: **264 opções no total**. Cada opção tem condição e efeito executável, sem depender de classe: impacto acertado, impacto recebido, comando, ciclo ATB, início de batalha, abate, cura recebida, encontro, recompensa e esquiva.

Há recuperação por esquiva, efeitos ao atingir inimigos envenenados/congelados, limpeza de estados, escudos situacionais, cura sob risco, alterações de custo e recuperação de técnicas, penalidades em conjuração/invocação, mudanças nos testes e no dano de falha, XP e ouro condicionais. Descrições mostram gatilho, condição e valor. Vantagens custam pontos e desvantagens financiam a escolha. O limite segue 12 traits por personagem.

A lista tem busca por nome/efeito, filtros e páginas de 24 opções para não montar centenas de botões de uma vez. Sangramento inimigo por traits retira 2,5% dos PV máximos por ciclo; veneno no jogador retira 4 PV por ciclo. Estados têm duração/cargas limitadas.

## Magias

**32 incantações autorais de cinco runas**, com nomes inspirados em latim e efeitos táticos: Ignis Funebris, Glacies Fracta, Vinculum Hiemis, Mors Tacita, Tempus Fugit, Legio Ossium, Eques Sepulcri, Nodus Vitalis e outras. Elas acrescentam efeitos como romper proteção, consumir veneno, cancelar técnica, acelerar a party, reduzir ATB restante, invocar arqueiro/cavaleiro, limpar infecção e ressuscitar com escudo.

Fórmulas antigas e combinações até 12 runas permanecem. DEATH TOUCH mantém custo fixo de 100 PM. Pistas rúnicas aleatórias também podem apontar para as novas incantações; não são aprendidas automaticamente. A descrição adicional aparece ao montar a fórmula, e o custo considera as novas traits.

## Otimização e limites

- Cache de construção durante cada ação evita revarrer atributos, passivas e talentos desnecessariamente.
- Metadados legados completos não são reconstruídos para todos os jogadores a cada comando.
- Personagens sem mudança relevante não passam por novo cálculo de limites condicionais.
- Ataques não forçam leitura síncrona de layout para reiniciar animações.
- Cachês de sprites limitados a 512 entradas; efeitos limitados a 24 contêineres e 48 eventos pendentes, com prazo visual de dois segundos.
- Invocações inimigas reutilizam posições de larvas mortas; a lista não cresce indefinidamente. Histórico visual permanece em 96 eventos.
- Osciladores/gains de áudio são desconectados após tocar; música e animações pausam em segundo plano.
- Especiais recebidos não são mais reduzidos só à última ação de cada ator; entram numa fila visual curta, sem espera de gameplay. Sob carga excessiva, efeitos antigos expiram para preservar a resposta.

DESEMPENHO-v9.json contém comparação A/B intercalada no mesmo processo com a v8.1, 20 jogadores e oito inimigos neutros: três séries de 220 comandos para personagens iniciais e três para ultras com 50 talentos. A média das medianas caiu de aproximadamente **1,41 para 1,25 ms** nos iniciais e **3,24 para 2,82 ms** nos avançados (11,5% e 13%). É CPU local do motor, não tempo de internet, banco, inicialização da função ou renderização. Não garante latência na sua Supabase.

## Verificação

**131 testes passaram** em TESTES-v9.txt. Incluem as técnicas de super/ultra anteriores, as 180 ações dos 60 inimigos novos, as 32 magias, os 200 novos dados de traits e seus gatilhos reais, Dodge a 100%, expiração da postura, filas limitadas/canceláveis, narrativas distintas, crescimento da dificuldade, morte por penalidade inicial sem travar a UI e reutilização de larvas. A suite anterior de conta, votação, encontros pessoais e efeitos para observadores também passou.

No navegador local foram verificados filtro/paginação de traits, Dodge, alterações do ATB inimigo, cena própria da biblioteca com D20 e a montagem/conjuração de Ignis Funebris. Sem erros de console nesses cenários. O serviço de captura de tela da prévia falhou; essa etapa foi inspecionada pelo DOM, sem revisão visual por screenshot. Não houve teste online autenticado com duas contas reais.

## Rodar e editar

Node.js: node tools/serve.mjs e abra http://127.0.0.1:4173/?solo=1. Testes: node --test tests/*.test.mjs. Medição local: node tools/benchmark.mjs (grava DESEMPENHO-local.json).

web/ é a fonte principal. Execute node tools/sync.mjs após editar; ele sincroniza frontend na raiz e **13 módulos** em game/ e supabase/functions/game/shared/. O pacote já está sincronizado. Cenários QA temporários não foram incluídos. INTEGRIDADE-v9.json lista os hashes entregues.
