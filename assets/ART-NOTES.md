# Arte v5

Sprites originais desenhados por código em grade de pixels, sem imagens remotas ou dependências de rasterização.

- `pixel-sprites.js`: heróis 32×48 e equipamentos 16×32 da v4; encaminha criaturas ao renderer novo.
- `sprite-grid.js`: retângulos, elipses, linhas e polígonos em coordenadas inteiras; produz SVG de linhas de pixels usado como imagem com cache.
- `tung-art.js`: TUNG 32×48 em quatro poses; ilustrações de encontro 64×48.
- `creature-art.js`: famílias e variantes de criaturas 48×48; as cores podem acompanhar o elemento.
- `art-v3.js`: composição das poses, arma, paleta racial e transformação TUNG; integração ao jogo existente.

TUNG possui um bastão próprio com veio de madeira e ponto de pegada compartilhado. O corpo transforma somente quando `ultra === 'TUNG'`, mantendo os efeitos raciais na lógica do jogo.

Referência visual consultada para o corpo cilíndrico, olhos e bastão: [Tung Tung Sahur](https://www.pngmart.com/image/784544). Nenhuma imagem dessa página foi incluída no pacote: a versão do jogo foi redesenhada na grade de pixels.

O movimento usa poses e articulação mais deslocamento do ator; não é uma folha de locomoção em todas as direções.
