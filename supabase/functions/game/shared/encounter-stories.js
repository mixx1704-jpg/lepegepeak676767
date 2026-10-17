// Authored presentation text only: no rewards, RNG, or gameplay mutations.
// Entries contain [success, failure, retreat], each exactly three beats.
const STORIES={
 'A fonte que sussurra':[
 ['A água pronuncia seu nome entre duas ondulações.','Você bebe apenas quando a superfície volta a ficar imóvel.','O sussurro se cala; o frio da fonte permanece em suas mãos.'],
 ['Seu reflexo abre a boca antes de você.','A água invade seus pulmões como um punhado de agulhas.','Você se afasta tossindo enquanto a fonte aprende sua voz.'],
 ['Você cobre o rosto diante da água.','A fonte repete um nome que você finge não conhecer.','O sussurro fica para trás.']],
 'O cofre dos ossos':[
 ['Você acompanha o pulso entre as costelas de pedra.','Uma pressão precisa solta o selo sem partir nenhum osso.','A tampa se abre num suspiro seco.'],
 ['Uma costela gira sob seus dedos.','O cofre fecha o arco de ossos sobre sua mão.','Você força a saída ao som de uma gargalhada oca.'],
 ['Você nota marcas de unhas no cadeado.','Retira a mão antes da próxima pulsação.','O cofre continua esperando.']],
 'Ponte dos condenados':[
 ['Você escolhe as correntes que ainda suportam tensão.','Cada passo firme faz a ponte gemer sem ceder.','A última tábua cai somente depois da sua passagem.'],
 ['Uma corrente se parte atrás do seu ombro.','O peso da ponte arrasta você contra a borda de pedra.','Você sobe ferido enquanto os condenados desaparecem no abismo.'],
 ['A ponte estala antes do primeiro passo.','Você retorna à margem sólida.','As correntes balançam para um viajante que não veio.']],
 'Mercador sem rosto':[
 ['Você pergunta o preço antes de ouvir a oferta.','O mercador aceita uma lembrança que já não lhe pertence.','Uma mão sem rosto empurra a mercadoria pelo balcão.'],
 ['Você aceita a oferta antes de definir o pagamento.','Dedos frios atravessam sua testa e recolhem muito mais que uma memória.','O mercador fecha o embrulho; você já não lembra o acordo.'],
 ['Você recusa sem encostar no balcão.','O mercador inclina uma cabeça sem expressão.','Nenhuma dívida acompanha sua saída.']],
 'Jardim de vidro':[
 ['Você identifica o fruto pelo brilho que não corta a luz.','Separa a haste entre duas rajadas de vento.','O jardim ressoa como taças sem quebrar.'],
 ['A haste vibra quando seus dedos a tocam.','O galho inteiro explode em lascas transparentes.','Você deixa um rastro vermelho entre os cristais.'],
 ['Você observa os frutos refletirem suas cicatrizes.','Nenhum parece maduro o bastante.','O jardim guarda seus pequenos sinos de vidro.']],
 'Altar da primeira chama':[
 ['Você protege a brasa com as duas mãos.','Um sopro paciente devolve cor à chama antiga.','O altar ilumina inscrições que o escuro escondia.'],
 ['Você sopra antes que a brasa aceite o ar.','Uma língua de fogo negro salta contra seu peito.','O altar volta a arder enquanto você apaga a própria roupa.'],
 ['Você percebe cinzas recentes diante do altar.','A brasa permanece sem receber seu sopro.','A pequena chama observa sua partida.']],
 'A arena esquecida':[
 ['Você entra no círculo e saúda o campeão morto.','Desvia da lâmina gasta e responde durante a abertura da guarda.','O campeão se ajoelha; o silêncio encerra o duelo.'],
 ['A areia esconde o primeiro passo do campeão.','Uma lâmina atravessa sua guarda antes que você encontre apoio.','Você abandona o círculo sob o olhar de arquibancadas vazias.'],
 ['Você deixa a arma embainhada fora do círculo.','O campeão baixa a ponta da lâmina.','A arena continuará esperando outro desafiante.']],
 'Biblioteca afogada':[
 ['Você segue as palavras que nadam contra a corrente.','As páginas se alinham quando você lê sem mover os lábios.','Uma frase permanece legível depois que o livro afunda.'],
 ['Você pronuncia uma palavra que deveria permanecer submersa.','A tinta se espalha em tentáculos e fecha sua garganta.','Você emerge entre folhas rasgadas e água negra.'],
 ['Você mantém o grimório sob a superfície.','As palavras se dispersam como peixes assustados.','A biblioteca volta a respirar em silêncio.']],
 'Dados do destino':[
 ['Você observa a sombra do dado antes do lançamento.','A figura encapuzada perde o sorriso quando ele para.','Você recolhe a aposta antes que ela proponha outra rodada.'],
 ['O dado continua rolando depois de tocar a mesa.','A figura encapuzada aponta o resultado que você tentou ignorar.','O pagamento é cobrado antes de você se levantar.'],
 ['Você afasta a cadeira sem tocar nos dados.','A figura recolhe a aposta com um gesto lento.','A próxima rodada terá outro nome.']],
 'O sino rachado':[
 ['Você encontra o ponto onde a rachadura interrompe o metal.','O toque certo produz uma única nota clara.','As vozes dos mortos se afastam com a vibração.'],
 ['Você golpeia o sino onde o metal ainda está inteiro.','Uma nota partida atravessa seus ossos.','Os mortos repetem seu nome enquanto você tenta parar de tremer.'],
 ['Você prende o badalo antes que o vento o mova.','Os mortos aguardam uma nota que não chega.','Você sai sem responder ao chamado.']],
 'Caravana perdida':[
 ['Você acompanha o intervalo entre os dois contornos das carroças.','Abre uma passagem no instante em que as rodas coincidem.','Os viajantes atravessam antes que a estrada se dobre outra vez.'],
 ['Você estende a mão para a realidade errada.','Uma carroça atravessa seu corpo como uma parede de gelo.','A estrada se fecha deixando você do lado de fora.'],
 ['Você não pisa nas marcas duplicadas das rodas.','Os viajantes continuam chamando do outro lado.','A caravana desaparece na curva de uma estrada impossível.']],
 'Ninho de estrelas':[
 ['Você aproxima as mãos sem encobrir o brilho do ninho.','O filhote cósmico aceita seu cheiro e recolhe as garras.','A gema se solta das fibras de luz.'],
 ['Sua sombra atravessa o ninho antes da sua mão.','O filhote desperta e abre asas de calor cortante.','Você foge sob uma chuva de pequenas estrelas.'],
 ['Você deixa a gema sob as asas do filhote.','O ninho pulsa uma última vez.','A luz se apaga quando você se afasta.']],
 'Forja de sangue':[
 ['Você firma o metal e mede o ritmo da bigorna.','Cada golpe acompanha uma pulsação da forja.','A peça esfria quando o último eco desaparece.'],
 ['O metal se move antes da queda do martelo.','A bigorna devolve o golpe em uma chuva de escória viva.','Você abandona a bancada com o cheiro de sangue no ferro.'],
 ['Você encontra marcas de dedos fundidas à bigorna.','O martelo permanece no suporte.','A forja não recebe outra oferta.']],
 'Labirinto de espelhos':[
 ['Você segue o reflexo que erra um único movimento.','Atravessa o vidro no instante em que ele desvia o olhar.','A saída aparece atrás da última imagem quebrada.'],
 ['Você acompanha o reflexo mais parecido com você.','O corredor se fecha e os espelhos devolvem golpes em vez de gestos.','Você atravessa uma rachadura carregando cortes que não viu chegar.'],
 ['Você vira de costas para o primeiro espelho.','Os reflexos continuam andando por mais um instante.','O corredor perde seu interesse quando você sai.']],
 'O prisioneiro do tempo':[
 ['Você conta os instantes entre a infância e a velhice do prisioneiro.','A ampulheta se parte quando as duas idades se encontram.','O viajante respira no mesmo tempo que você.'],
 ['Você quebra o vidro antes de a areia parar.','Anos de cansaço atravessam seu corpo em um único pulso.','O prisioneiro volta a envelhecer enquanto você tenta se levantar.'],
 ['Você não toca o vidro quente.','O prisioneiro envelhece e rejuvenesce diante da sua mão imóvel.','A areia continua subindo.']],
 'O peso da coroa':[
 ['Você encontra apoio sob o ombro da estátua.','Ergue a pedra apenas o bastante para alcançar a coroa.','A estátua retorna ao chão sem cobrar um novo corpo.'],
 ['A estátua rola quando você desloca o peso.','O braço de pedra prende você contra o pedestal.','Você escapa antes que a coroa desapareça outra vez.'],
 ['Você mede o peso pela rachadura no pedestal.','A coroa permanece sob a mão de pedra.','Você segue sem dobrar os joelhos diante dela.']],
 'Banquete de sombras':[
 ['Você observa quais pratos não projetam sombra.','Afasta a taça preparada para você e rompe o encanto da mesa.','O perfume doce desaparece antes de alcançar seus pulmões.'],
 ['Você reconhece o veneno depois do primeiro aroma.','As sombras se levantam dos pratos e atravessam seu peito.','Você deixa a mesa enquanto as cadeiras arrastam sozinhas.'],
 ['Você não ocupa a cadeira que se abre à sua frente.','As taças brindam sem nenhuma mão.','O jantar fica esperando um convidado mais faminto.']],
 'A constelação enterrada':[
 ['Você observa a sequência das pedras que se acendem.','Repete os passos deixando os intervalos exatos entre cada luz.','A constelação inteira responde sob seus pés.'],
 ['Seu último passo toca uma estrela ainda apagada.','As pedras se fecham num círculo de luz cortante.','Você sai arrastando os pés sobre um céu que virou armadilha.'],
 ['Você espera a última pedra perder o brilho.','A constelação desaparece sob a poeira.','Nenhuma estrela segue seus passos.']],
 'Ponte de ossos':[
 ['Você corre sobre as juntas que ainda estão alinhadas.','Os ossos se soltam atrás de cada passada.','Você alcança a margem antes da última vértebra cair.'],
 ['Uma costela gira sob sua bota.','A ponte desaba e as pontas partidas rasgam sua subida.','Você alcança a margem agarrado ao último osso inteiro.'],
 ['Você testa a primeira vértebra com a ponta da arma.','A ponte inteira se move em resposta.','Você recua antes de lhe dar seu peso.']],
 'Contrato sem nome':[
 ['Você exige que o cobrador leia a dívida em voz alta.','Uma cláusula contradiz a outra diante da sua resposta.','O contrato se fecha sem conseguir escrever seu nome.'],
 ['Você deixa uma pergunta sem resposta.','O cobrador transforma seu silêncio em assinatura.','A dívida começa a ser cobrada antes que a tinta seque.'],
 ['Você devolve a pena sem abri-la.','O cobrador dobra o contrato ainda em branco.','Seu nome continua fora do registro.']],
 'Biblioteca submersa':[
 ['Você segura o volume no ritmo de sua respiração.','A água negra escorre das letras quando você decifra a margem.','O livro volta a se fechar; uma frase permanece com você.'],
 ['Você força a capa enquanto o volume ainda inspira.','As páginas apertam seus pulsos e derramam tinta sobre seu rosto.','Você se solta deixando folhas vivas presas aos dedos.'],
 ['Você observa as capas subirem e descerem na água.','Mantém as mãos fora da estante.','Os livros continuam respirando sem sua leitura.']],
 'Jardim de agulhas':[
 ['Você acompanha a direção das flores metálicas.','Passa entre as agulhas quando todas se voltam para a mesma luz.','O fruto dourado chega à sua mão sem tocar nos espinhos.'],
 ['Uma flor se fecha antes da sua passagem.','As demais se voltam ao mesmo tempo e disparam seus espinhos.','Você deixa o jardim com metal enterrado na roupa.'],
 ['Você encontra uma gota vermelha na ponta de uma pétala.','A passagem se fecha antes do seu primeiro passo.','O fruto fica entre as agulhas.']],
 'A moeda impossível':[
 ['Você lança a moeda sem tentar escolher um lado.','Ela para em pé sobre uma fenda que ninguém tinha visto.','A aposta se encerra antes que a moeda caia.'],
 ['Você força um giro a mais com o polegar.','A moeda para em pé e projeta uma sombra que atravessa sua mão.','O impossível recolhe o preço da aposta.'],
 ['Você mantém a moeda sobre a mesa.','Ela gira sozinha até encontrar o equilíbrio.','Você parte sem apostar contra ela.']],
 'Portão faminto':[
 ['Você firma os pés fora do alcance dos dentes.','Mantém as mandíbulas separadas até a passagem ficar livre.','A pedra se fecha atrás de você com um estalo seco.'],
 ['Os dentes parecem imóveis até receberem seu peso.','O portão morde o espaço onde você tenta se apoiar.','Você arranca o corpo da passagem antes da segunda mordida.'],
 ['Você observa os dentes limpos demais para uma ruína.','Afasta a mão da dobradiça.','O portão mastiga apenas o silêncio.']],
 'Chuva de vidro':[
 ['Você procura as sombras onde os estilhaços ainda não chegaram.','Cruza entre duas ondas mantendo o rosto protegido.','O último fragmento cai depois de você alcançar abrigo.'],
 ['Um brilho no alto faz você olhar para cima.','A segunda onda de vidro encontra sua guarda aberta.','Você chega ao abrigo deixando estilhaços pelo caminho.'],
 ['Você permanece sob a cobertura de pedra.','A chuva corta o caminho vazio.','Quando o vento muda, você segue pela borda.']],
 'Falso santuário':[
 ['Você percebe que a luz não ilumina as paredes do poço.','Afasta o falso símbolo e expõe a boca escondida abaixo dele.','O chamado perde a voz quando você recusa seu nome.'],
 ['Você reconhece a voz e se inclina sobre a borda.','A luz se apaga enquanto mãos frias agarram seu rosto.','Você sobe do poço ouvindo o próprio pedido de socorro.'],
 ['Você não responde à voz familiar.','A luz permanece imóvel no fundo do poço.','Você sai sem oferecer um rosto à armadilha.']],
 'Caravana imóvel':[
 ['Você fala com o único vigia cujos olhos ainda acompanham o caminho.','Uma palavra certa solta os dedos de pedra do balcão.','O último negócio se encerra antes que ele volte a endurecer.'],
 ['Você toca nas moedas antes de receber a permissão do vigia.','Mãos petrificadas despertam e prendem seus braços.','Você se afasta deixando a caravana contar o que tomou.'],
 ['Você passa longe do balcão e das moedas.','O vigia segue você apenas com os olhos.','A caravana não encontra outro cliente.']],
 'Pulso da fornalha':[
 ['Você acompanha o circuito entre dois pulsos da máquina.','Muda a ligação antes que a próxima descarga alcance o núcleo.','A fornalha completa um ciclo sem exigir outro coração.'],
 ['Você troca a ligação durante a descarga.','O núcleo usa seu corpo para fechar o circuito interrompido.','Você se solta enquanto a máquina aprende uma nova pulsação.'],
 ['Você ouve um coração bater dentro da tubulação.','Retira a mão do painel antes da descarga.','A máquina continua procurando uma peça viva.']],
 'O sino afogado':[
 ['Você prende a respiração durante a primeira badalada.','Conta as notas sem permitir que nenhuma receba uma lembrança.','O sino afunda outra vez sem levar seu nome.'],
 ['Você tenta lembrar de onde conhece aquela nota.','A badalada atravessa a memória e cobra seu corpo junto dela.','Você sai da água sem saber o que acabou de esquecer.'],
 ['Você se afasta antes de ouvir a nota inteira.','A água abafa a próxima badalada.','A lembrança continua sendo sua.']],
 'Ninho da matriarca':[
 ['Você pisa nos espaços frios entre os ovos.','Levanta o tesouro sem deslocar a palha que aquece o ninho.','A matriarca não percebe o lugar vazio antes da sua saída.'],
 ['Uma casca estala sob sua sola.','Centenas de ovos respondem enquanto a matriarca fecha a saída.','Você atravessa a palha vivo por muito pouco.'],
 ['Você percebe o mesmo movimento dentro de todos os ovos.','Retira o pé antes de tocar a palha.','O ninho volta ao ritmo da respiração da matriarca.']],
 'Fenda sem fundo':[
 ['Você acompanha o fio de luz sem olhar para baixo.','Apoia cada passo no ponto onde o brilho se torna firme.','A margem surge antes que o fio desapareça.'],
 ['Você procura a margem e perde o fio sob os pés.','O vazio devolve seu corpo contra as pedras da borda.','Você sobe sem conseguir ouvir o som da própria queda.'],
 ['Você lança uma pedra e não espera o impacto.','O fio continua brilhando sobre o vazio.','Você recua enquanto ainda reconhece o chão.']],
 'Tribunal das máscaras':[
 ['Você escuta qual palavra faz as máscaras virarem o rosto.','Apresenta uma defesa que nenhum dos juízes tinha ouvido.','O veredito abre a passagem sem exigir uma confissão.'],
 ['Sua resposta repete uma verdade já julgada.','As máscaras pronunciam a sentença antes que você possa corrigir a frase.','Você deixa o tribunal carregando a marca do veredito.'],
 ['Você se mantém fora do círculo de julgamento.','As máscaras discutem um nome que não é o seu.','Nenhuma sentença acompanha sua retirada.']],
 'Relógio de carne':[
 ['Você sente a pausa mínima entre duas pulsações da parede.','Arranca o ponteiro sem tocar na contração seguinte.','O relógio continua vivo, mas já não consegue marcar você.'],
 ['A parede contrai antes de você soltar o ponteiro.','Fibras vermelhas apertam seu braço e puxam no ritmo do relógio.','Você se liberta levando a pulsação para dentro do peito.'],
 ['Você observa o ponteiro atravessar a carne intacta.','Não oferece seus dedos à próxima pulsação.','O relógio perde sua passagem sem registrá-la.']],
 'A última estrela':[
 ['Você escuta a estrela antes de tentar nomeá-la.','Pronuncia a sílaba que permanece quando o brilho vacila.','A prisão se abre e uma luz pequena alcança o céu.'],
 ['Você escolhe um nome antes de ouvir a resposta.','A estrela se contrai e a prisão devolve uma onda de frio branco.','Você recua enquanto a luz tenta esquecer sua voz.'],
 ['Você permanece em silêncio diante da prisão.','A estrela espera um nome que você não oferece.','O céu continua com o mesmo espaço vazio.']]
};
/** Returns a fresh three-beat story, or null for a rare/unknown encounter. */
export function ordinaryEncounterStory(event,success,skip=false){const scenes=STORIES[event?.name];return scenes?[...scenes[skip?2:success?0:1]]:null;}
