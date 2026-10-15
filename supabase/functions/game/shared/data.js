export const TYPES = ['corte','perfurante','contundente','arcano','fogo','gelo','eletrico','veneno','sagrado','sombrio'];
export const TYPE_LABEL = {corte:'Corte',perfurante:'Perfuração',contundente:'Impacto',arcano:'Arcano',fogo:'Fogo',gelo:'Gelo',eletrico:'Elétrico',veneno:'Veneno',sagrado:'Sagrado',sombrio:'Sombrio'};
// Each path has a distinct combat modifier and a final evolution.
const paths = [
 ['Bastião|Muralha Eterna','Duelista|Lâmina Absoluta','Carrasco|Executor Carmesim','Comandante|Imperador da Guerra','Quebra-ossos|Titã de Ferro'],
 ['Templário|Sol Invicto','Inquisidor|Juiz Celestial','Guardião|Égide Divina','Mártir|Santo Imortal','Cruzado|Arauto da Aurora'],
 ['Berserker|Fúria Primordial','Colosso|Montanha Viva','Saqueador|Rei das Cinzas','Xamã da Ira|Espírito Rubro','Devastador|Fim dos Reinos'],
 ['Assassino|Morte Silenciosa','Espadachim|Dança das Mil Lâminas','Sabotador|Senhor das Armadilhas','Venefício|Príncipe da Peste','Espectro|Sombra Absoluta'],
 ['Franco-atirador|Olho do Infinito','Falcão|Soberano dos Céus','Caçador|Predador Alfa','Sentinela|Vigia Eterno','Andarilho|Vento Ancestral'],
 ['Piromante|Fênix Arcana','Criomante|Inverno Eterno','Tempestário|Coração da Tormenta','Arcanista|Arquiteto Astral','Cronomante|Senhor dos Instantes'],
 ['Lich|Rei Imortal','Ossomante|Catedral de Ossos','Ceifador|Fim das Almas','Pragmático|Alquimista da Morte','Mestre das Pestes|Praga Eterna'],
 ['Hierofante|Voz dos Deuses','Exorcista|Luz Absoluta','Oráculo|Olho do Destino','Penitente|Anjo das Cicatrizes','Curandeiro|Fonte da Vida'],
 ['Metamorfo|Avatar Selvagem','Silvestre|Árvore do Mundo','Espinheiro|Coroa de Espinhos','Tempestade|Ira da Natureza','Pastor|Guardião dos Mil Espíritos'],
 ['Virtuoso|Sinfonia Eterna','Arauto|Voz dos Reis','Lamento|Requiem Final','Encantador|Teurgo da Melodia','Trovador|Lenda Viva'],
 ['Punho de Ferro|Dragão Interior','Asceta|Corpo Celestial','Andarilho Astral|Espírito Infinito','Mestre do Chi|Onda Primordial','Quebra-montanhas|Punho do Horizonte'],
 ['Demonólogo|Imperador Infernal','Pactuário|Contrato do Vazio','Maldito|Maldição Eterna','Abissal|Olho do Abismo','Sanguinomante|Coração Escarlate'],
 ['Bombardeiro|Sol Engarrafado','Transmutador|Pedra Filosofal','Toxicologista|Veneno Perfeito','Botânico|Jardim da Eternidade','Artífice|Motor do Mundo'],
 ['Totêmico|Pilar Ancestral','Espiritualista|Voz dos Antepassados','Condutor|Raio Vivo','Bruxo da Névoa|Névoa Eterna','Vidente|Destino Encarnado'],
 ['Engenheiro|Arquiteto da Ruína','Pistoleiro|Estrela de Chumbo','Autômato|Alma de Aço','Runista|Escriba da Criação','Demolidor|Última Detonação']
];
const raw = [
 ['guerreiro','Guerreiro','♜','Tanque','corte',10,5,3,'Provocação','taunt'],
 ['paladino','Paladino','✥','Tanque / cura','sagrado',8,3,7,'Égide solar','guard'],
 ['barbaro','Bárbaro','⚒','Dano / impacto','contundente',12,4,2,'Fúria sísmica','burst'],
 ['ladino','Ladino','⌁','Crítico / veneno','perfurante',5,12,3,'Golpe nas sombras','poison'],
 ['patrulheiro','Patrulheiro','➶','Distância / pet','perfurante',6,11,3,'Companheiro feroz','summon'],
 ['mago','Mago','✧','Magia / área','arcano',2,5,13,'Nova arcana','aoe'],
 ['necromante','Necromante','☠','Exército / dreno','sombrio',3,4,13,'Erguer ossos','summon'],
 ['clerigo','Clérigo','✚','Cura / suporte','sagrado',4,3,13,'Prece coletiva','heal'],
 ['druida','Druida','❧','Natureza / suporte','veneno',5,6,9,'Espírito da floresta','summon'],
 ['bardo','Bardo','♫','Suporte / sorte','arcano',3,8,9,'Hino da vitória','buff'],
 ['monge','Monge','◉','Impacto / evasão','contundente',8,9,3,'Palma do trovão','stagger'],
 ['bruxo','Bruxo','⛧','Pactos / dreno','sombrio',3,5,12,'Pacto voraz','drain'],
 ['alquimista','Alquimista','⚗','Bombas / veneno','fogo',3,7,10,'Frasco instável','aoe'],
 ['xama','Xamã','ϟ','Totens / raio','eletrico',5,4,11,'Totem ancestral','summon'],
 ['artifice','Artífice','⚙','Engenharia / runas','eletrico',6,7,7,'Torreta rúnica','summon']
];
const effects = ['armor','crit','power','support','stagger'];
export const CLASSES = raw.map((c,i)=>({id:c[0],name:c[1],icon:c[2],role:c[3],type:c[4],str:c[5],dex:c[6],int:c[7],skill:c[8],action:c[9],paths:paths[i].map((p,j)=>({name:p.split('|')[0],final:p.split('|')[1],effect: i===5?['fogo','gelo','eletrico','arcano','support'][j]:effects[(j+i)%5]}))}));
export const EFFECTS = {armor:'+4 armadura e +40% ameaça',crit:'+10% crítico',power:'+20% dano',support:'+25% cura e +2 mana/turno',stagger:'+50% impacto',fogo:'+30% fogo',gelo:'+30% gelo',eletrico:'+30% elétrico',arcano:'+30% arcano'};
export const ENCOUNTERS = [
 ['A fonte que sussurra','Uma água prateada pronuncia seu nome.','int','Beber da fonte',12,'mana'],
 ['O cofre dos ossos','Um mecanismo pulsa entre costelas de pedra.','dex','Desarmar o selo',13,'loot'],
 ['Ponte dos condenados','A travessia cede sobre um abismo sem fundo.','str','Sustentar as correntes',12,'shards'],
 ['Mercador sem rosto','Ele oferece uma relíquia em troca de uma memória.','int','Negociar a memória',14,'loot'],
 ['Jardim de vidro','Frutos de cristal crescem em árvores negras.','dex','Colher um fruto',11,'heal'],
 ['Altar da primeira chama','Uma pequena brasa resiste ao tempo.','int','Reacender o altar',13,'spell'],
 ['A arena esquecida','Um campeão morto aguarda um desafiante.','str','Aceitar o duelo',14,'loot'],
 ['Biblioteca afogada','Palavras nadam sob a superfície.','int','Decifrar o grimório',12,'spell'],
 ['Dados do destino','Uma figura encapuzada propõe uma aposta.','dex','Jogar com o destino',15,'shards'],
 ['O sino rachado','O som atravessa o mundo dos mortos.','str','Tocar o sino',13,'heal'],
 ['Caravana perdida','Viajantes presos entre duas realidades pedem ajuda.','int','Abrir uma passagem',12,'shards'],
 ['Ninho de estrelas','Um filhote cósmico vigia uma gema.','dex','Aproximar-se devagar',13,'loot'],
 ['Forja de sangue','A bigorna exige força para despertar.','str','Forjar uma relíquia',14,'loot'],
 ['Labirinto de espelhos','Seu reflexo oferece uma rota impossível.','int','Seguir o reflexo',14,'mana'],
 ['O prisioneiro do tempo','Uma pessoa envelhece e rejuvenesce a cada segundo.','dex','Quebrar a ampulheta',12,'spell'],
 ['O peso da coroa','Uma coroa repousa sob uma estátua caída.','str','Erguer a estátua',15,'loot'],
 ['Banquete de sombras','Uma mesa preparada espera por quem ainda vive.','int','Reconhecer o veneno',11,'heal'],
 ['A constelação enterrada','Pedras acendem sob seus passos.','dex','Reproduzir a dança',13,'shards']
].map(([name,text,stat,choice,dc,reward])=>({name,text,stat,choice,dc,reward}));
export const BOSSES = [
 {name:'VORATH',title:'O carcereiro das raízes',icon:'♜',type:'veneno',resist:{veneno:65,contundente:-20,sagrado:-15},mechanic:'Raízes famintas: a cada 3 turnos, atinge toda a party.'},
 {name:'SERAPHINE',title:'A santa da chama morta',icon:'✥',type:'fogo',resist:{fogo:70,gelo:-30,sagrado:35},mechanic:'Pira celestial: a cada 3 turnos, chuva de fogo coletiva.'},
 {name:'O REI VAZIO',title:'A última coisa que sonhou',icon:'♛',type:'sombrio',resist:{sombrio:75,arcano:30,sagrado:-30},mechanic:'Colapso: a cada 3 turnos, toda a party sofre dano do vazio.'}
];
export const AFFIXES = [
 ['da Fênix','fogo',9],['do Inverno','gelo',9],['da Tempestade','eletrico',9],['do Vampiro','leech',5],['do Bastião','armor',3],['da Precisão','crit',5],['do Colosso','str',3],['do Oráculo','int',3],['do Vento','dex',3],['da Ruptura','stagger',15],['da Vitalidade','hp',15],['do Éter','mana',10],['da Peste','veneno',9],['da Aurora','sagrado',9]
];
export const BASE_ITEMS = [
 ['Espada','weapon','⚔',1,3],['Martelo','weapon','⚒',2,3],['Cajado','weapon','✧',1,4],['Arco','weapon','➶',2,3],['Adaga','weapon','⌁',1,2],
 ['Couraça','armor','♜',2,3],['Manto','armor','♧',2,2],['Elmo','helm','♛',2,2],['Anel','ring','◉',1,1],['Amuleto','amulet','◇',1,1]
];
export const RARITIES = [{name:'Comum',color:'#9ba4b7',affixes:0},{name:'Mágico',color:'#69b6ff',affixes:1},{name:'Raro',color:'#edc876',affixes:2},{name:'Épico',color:'#be8bfa',affixes:3},{name:'Lendário',color:'#ff9760',affixes:4}];
