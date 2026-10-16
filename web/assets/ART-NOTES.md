# Arte Pixel v4

A arte ativa desta versão é original e desenhada em pixels por código em `pixel-sprites.js`, sem usar os PNGs gerados da v3.

- Heróis: grade 32×48, quatro poses; roupa e cabelo por classe, anatomia/paleta por raça.
- Equipamento: grade 16×32 com formas e materiais distintos, empunhadura independente.
- Criaturas: grade 48×48 com silhuetas, peças e paletas combinadas.
- Cenário: Canvas 320×180 com árvores, terreno, pedras e vegetação, ampliado sem suavização.

Os sprites são codificados em SVG com retângulos alinhados à grade, usados como imagens com cache. Cada personagem não cria centenas de elementos DOM. O movimento usa poses e articulação da arma mais deslocamento do ator.

A referência do usuário orienta proporção, simplicidade, contraste e tamanho dos pixels; os personagens não são extraídos de Chrono Trigger.
