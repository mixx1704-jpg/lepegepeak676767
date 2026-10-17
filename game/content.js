import {ARCANE_BY_FORMULA,ARCANE_SPELLS} from './arcane-codex.js';
import {DEEP_TALENTS} from './deep-content.js';
import {EXTRA_RACES,ECHO_TREE,DEATH_TOUCH} from './expansion.js';
export const RACES = [
 {id:'humano',name:'Humano',cost:0,color:'#70a9ed',stats:{str:1,dex:1,int:1},desc:'+1 FOR/DES/INT. +5% experiência. Sem fraqueza racial.',xp:.05},
 {id:'anao',name:'Anão',cost:0,color:'#d8a35a',stats:{armor:3,str:2,dex:-2},desc:'+3 armadura, +2 FOR, −2 DES. Escudos recebidos +15%.',shield:.15},
 {id:'elfo',name:'Elfo',cost:0,color:'#8bdc91',stats:{int:3,dex:1,hp:-12},desc:'+3 INT, +1 DES, −12 vida. +1 mana por rodada.',regen:1},
 {id:'orc',name:'Orc',cost:0,color:'#b0cc5e',stats:{str:4,int:-2},desc:'+4 FOR, −2 INT. +20% dano abaixo de 40% da vida.',rage:.2},
 {id:'umbriano',name:'Umbriano',cost:0,color:'#c48dde',stats:{dex:3,hp:-8},desc:'+3 DES, −8 vida. +6% esquiva.',dodge:6},
 {id:'infernal',name:'Infernal',cost:160,color:'#f17a61',stats:{fogo:25,gelo:-20},desc:'+25% fogo, vulnerável a gelo. Queimaduras aplicadas duram +1 rodada.',burn:1},
 {id:'revenante',name:'Revenante',cost:220,color:'#90dbbc',stats:{sombrio:20},desc:'Revive uma vez por combate com 25% PV. Cura recebida −35%.',revive:true,healing:.65},
 {id:'forjado',name:'Forjado',cost:280,color:'#a5bbca',stats:{armor:4,eletrico:-30},desc:'+4 armadura. Começa cada combate com 20 escudo. Vulnerável a raio.',shieldStart:20},
 {id:'astral',name:'Astral',cost:360,color:'#a193f5',stats:{int:4,hp:-25},desc:'+4 INT, −25 vida. Magias custam 15% menos mana.',discount:.15},
 {id:'draconico',name:'Dracônico',cost:480,color:'#e6b46a',stats:{fogo:20,gelo:20,eletrico:20,stagger:.25},desc:'+20% fogo/gelo/raio, +25% impacto. Poções curam 20% menos.',potion:.8}
];
export const UPGRADES = [
 {id:'vigor',name:'Carne teimosa',desc:'+4 de vida inicial / nível',max:10,base:35,step:20},
 {id:'mind',name:'Reserva de éter',desc:'+4 de mana inicial / nível',max:10,base:35,step:20},
 {id:'fortune',name:'Dado viciado',desc:'+1 nos testes de d20 / nível',max:5,base:60,step:45},
 {id:'purse',name:'Bolso do defunto',desc:'+15 ouro inicial / nível',max:10,base:30,step:20},
 {id:'scavenger',name:'Olho de saqueador',desc:'+2 pontos percentuais na qualidade do loot / nível',max:10,base:50,step:35},
 {id:'insight',name:'Memória muscular',desc:'+4% experiência / nível',max:10,base:45,step:30},
 {id:'provisions',name:'Último gole',desc:'+1 poção inicial / nível',max:3,base:70,step:70},
 {id:'well',name:'Nascente interior',desc:'+1 regeneração de mana / rodada / nível',max:5,base:80,step:60},
 {id:'bargain',name:'Dívida do mercador',desc:'−3% preço nos shops / nível',max:5,base:50,step:40},
 {id:'legacy',name:'Colheita de ecos',desc:'+5% ecos de conclusão / nível',max:10,base:60,step:35}
];
// Original conditional talents. Attribute gates use invested + racial/class stats,
// not gear, so swapping equipment cannot bypass build commitments.
export const TALENTS = [
 ['bloodedge','Fio de sangue','Sangue','Comum',{str:10},[],[], 'Até +60% dano conforme sua vida diminui.'],
 ['laststand','Última recusa','Sangue','Raro',{str:16},['bloodedge'],['glass'], 'Abaixo de 30% PV: −25% dano recebido.'],
 ['carnage','Carnificina','Sangue','Raro',{str:20},['bloodedge'],[], 'Abates curam 12% da vida máxima.'],
 ['bloodgod','Deus ferido','Sangue','Lendário',{str:26},['laststand','carnage'],[], 'Abaixo de 35% PV: +100% dano e 12% roubo de vida.'],
 ['precision','Mão firme','Lâmina','Comum',{dex:10},[],[], '+10% chance de crítico.'],
 ['manacrit','Faísca na lâmina','Lâmina','Raro',{dex:14,int:8},['precision'],[], 'Críticos restauram 5 mana (máximo 3 ativações por rodada).'],
 ['execution','Sem testemunhas','Lâmina','Raro',{dex:20},['precision'],[], '+50% dano contra alvos abaixo de 30% PV.'],
 ['cascade','Cascata rubra','Lâmina','Lendário',{dex:25},['execution','manacrit'],[], 'Crítico repete 45% do dano em outro alvo; sem recursão.'],
 ['thorns','Cota de espinhos','Muralha','Comum',{str:10},[],[], 'Ao defender, reflete 35% do dano efetivamente sofrido.'],
 ['bulwark','Âncora viva','Muralha','Raro',{str:16},['thorns'],['glass'], 'Defender concede +20 escudo e dobra ameaça gerada.'],
 ['reprisal','A conta chega','Muralha','Raro',{str:18,dex:8},['thorns'],[], 'Após defender, o próximo ataque ganha +60% dano.'],
 ['ironking','Rei de ferro','Muralha','Lendário',{str:25},['bulwark','reprisal'],[], 'Reflexão também funciona sem defender; +50% impacto.'],
 ['glass','Pacto de vidro','Arcano','Comum',{int:10},[],['laststand','bulwark'], '+35% dano mágico, mas recebe +20% dano.'],
 ['reservoir','Reservatório','Arcano','Comum',{int:12},[],[], '+20 mana máxima; +20% dano com mana acima de 80%.'],
 ['confluence','Confluência','Arcano','Raro',{int:18},['reservoir'],[], 'Alternar o elemento da magia: +30% dano da conjuração.'],
 ['archon','Motor impossível','Arcano','Lendário',{int:26},['glass','confluence'],[], 'Magias de 4 runas custam −30% mana e causam +50% dano.'],
 ['cinders','Brasa insistente','Reações','Comum',{int:10},[],[], 'Dano de fogo aplica queimadura de 18% do dano por 2 turnos.'],
 ['shatter','Trinca perfeita','Reações','Raro',{str:10,int:12},[],[], '+65% dano e +100% impacto em alvos congelados.'],
 ['thermal','Choque de estados','Reações','Raro',{int:18},['cinders'],[], 'Gelo em alvo queimando causa explosão extra de 45% do dano.'],
 ['stormloop','Circuito fechado','Reações','Lendário',{int:25},['thermal','shatter'],[], 'Raio contra alvo queimando/congelado acerta todos os outros por 40%.'],
 ['venom','Dose cumulativa','Veneno','Comum',{dex:10},[],[], 'Dano de veneno aplica mais 20% do dano por 3 turnos.'],
 ['contagion','Herança tóxica','Veneno','Raro',{dex:16},['venom'],[], 'Abate de alvo envenenado espalha metade do veneno aos demais.'],
 ['antidote','O remédio é a dose','Veneno','Raro',{int:12,dex:12},['venom'],[], 'Cura 2 PV por alvo envenenado ao fim da rodada.'],
 ['plague','Mundo enfermo','Veneno','Lendário',{dex:24},['contagion','antidote'],[], 'Veneno acumula até 200/turno, em vez de 70.'],
 ['pact','Laço espiritual','Invocação','Comum',{int:10},[],[], '+30% dano de invocações.'],
 ['legion','Legião particular','Invocação','Raro',{int:17},['pact'],[], '+2 ao limite de invocações (5).'],
 ['offering','Oferenda final','Invocação','Raro',{int:18},['pact'],[], 'Quando uma invocação expira, você cura 10% PV e ganha 5 mana.'],
 ['overmind','Mente enxame','Invocação','Lendário',{int:26},['legion','offering'],[], 'Cada invocação ativa concede +12% dano a você e seus servos.'],
 ['healer','Mãos quentes','Vida','Comum',{int:8},[],[], '+25% cura realizada.'],
 ['overflow','Transbordamento','Vida','Raro',{int:16},['healer'],[], '50% da cura excedente vira escudo (máximo 50% PV).'],
 ['martyr','Vida emprestada','Vida','Raro',{str:10,int:12},['healer'],[], 'Ao defender, cura o aliado vivo mais ferido em 12% PV dele.'],
 ['saint','Milagre inacabado','Vida','Lendário',{int:25},['overflow','martyr'],[], 'Cura em grupo também revigora: +2 mana aos aliados (uma vez/ação).'],
 ['footwork','Passo curto','Esquiva','Comum',{dex:10},[],[], '+8% esquiva.'],
 ['riposte','Resposta afiada','Esquiva','Raro',{dex:16},['footwork'],[], 'Esquivar causa um contra-ataque de 55% de potência.'],
 ['lucky','Aposta calculada','Sorte','Comum',{dex:8},[],[], '+2 em d20 e +5 pontos percentuais na qualidade do loot.'],
 ['chemist','Mistura proibida','Alquimia','Comum',{int:10},[],[], 'Poções curam +30% e concedem +25% dano por 2 rodadas.'],
 ['recycle','Nada se perde','Alquimia','Raro',{int:17},['chemist'],[], '25% de chance de não consumir uma poção.'],
 ['giantkiller','Caçador de deuses','Impacto','Raro',{str:16},[],[], '+20% dano contra chefes e +25% impacto.'],
 ['fracture','Fratura exposta','Impacto','Raro',{str:20},['giantkiller'],[], '+50% dano adicional em inimigos desequilibrados.'],
 ['overkill','Excesso necessário','Impacto','Lendário',{str:26},['fracture','reprisal'],[], 'Dano excedente de um abate atinge outro alvo por 75%.']
].map(([id,name,tree,rarity,req,prereq,excludes,desc])=>({id,name,tree,rarity,req,prereq,excludes,desc}));
export const RUNE_DATA = [
 ['IGNIS','Fogo','fogo'],['GLACIS','Gelo','gelo'],['FULGUR','Raio','eletrico'],['VITA','Vida','sagrado'],['UMBRA','Sombra','sombrio'],['AETHER','Éter','arcano'],
 ['TERRA','Pedra','contundente'],['VENTUS','Vento','perfurante'],['TOXIS','Toxina','veneno'],['FERRUM','Metal','corte'],['SANGUIS','Sangue','sombrio'],['LUX','Luz','sagrado'],['CHRONOS','Tempo','arcano'],['ANIMA','Alma','arcano']
].map(([id,name,type])=>({id,name,type}));
export const RUNES=RUNE_DATA.map(x=>x.id);
const forms=[['Lança','hit',1.65,10],['Onda','aoe',1,19],['Sutura','heal',2.2,15],['Hino','partyheal',1.15,24],['Servo','summon',.55,19],['Égide','shield',1.6,14],['Sede','drain',1.4,17],['Martelo','stagger',1.2,16],['Marca','poison',1.25,15],['Pira','burn',1.35,16],['Prisão','freeze',.9,20],['Arco','chain',1.3,23],['Voto','curse',1,18],['Retorno','revive',.25,34]];
// Ordered spell language. 196 two-rune, 392 three-rune, 392 four-rune formulas.
// This resolver is shipped for offline play. In online play the server executes it.
function legacySpell(input){
 const tokens=String(input||'').trim().toUpperCase().split(/\s+/).filter(Boolean);if(tokens.length<2||tokens.length>4)return null;
 const [i,j]=tokens.slice(0,2).map(t=>RUNES.indexOf(t));if(i<0||j<0)return null;
 const mods=[RUNES[(i+j+3)%14],RUNES[(i+j+8)%14]],m=tokens.length>=3?mods.indexOf(tokens[2]):-1;
 if(tokens.length>=3&&m<0)return null;if(tokens.length===4&&tokens[3]!==RUNES[(i*3+j+m+5)%14])return null;
 const f=forms[j],tier=tokens.length-1,boost=tier===1?1:m===0?(tier===3?2.05:1.45):(tier===3?1.65:1.2),cost=Math.ceil(f[3]*(tier===1?1:m===0?(tier===3?1.9:1.45):(tier===3?1.3:1.12)));
 return {combo:tokens.join(' '),name:`${f[0]} de ${RUNE_DATA[i].name}${tier>1?(m===0?' Voraz':' Persistente'):''}${tier===3?': Absoluto':''}`,kind:f[1],type:RUNE_DATA[i].type,cost,power:f[2]*boost,tier,duration:2+(tier>1&&m===1?2:0),element:RUNES[i]};
}
export function randomFormula(s,rng){if(rng(s)<.22)return {...ARCANE_SPELLS[Math.floor(rng(s)*ARCANE_SPELLS.length)]};const i=Math.floor(rng(s)*14),j=Math.floor(rng(s)*14),tokens=[RUNES[i],RUNES[j]];if(rng(s)>.6)tokens.push(RUNES[(i+j+3)%14]);return resolveSpell(tokens.join(' '));}

RACES.push(...EXTRA_RACES);
const raceSpecial={humano:{},anao:{S:2,E:2,A:-2,C:-1},elfo:{I:3,P:1,E:-2},orc:{S:4,I:-3,C:-2},umbriano:{A:3,E:-2},infernal:{I:2,E:-1},revenante:{E:2,C:-2},forjado:{E:3,A:-2},astral:{I:4,E:-3},draconico:{S:2,E:2,C:-2}};
for(const r of RACES){r.special??=raceSpecial[r.id]||{};if(r.id==='humano'){r.xp=.12;r.stats.armor=-2;r.desc='+12% XP; −2 armadura. Adaptável, mas vulnerável.';}if(r.id==='elfo')r.stats.contundente=-30;if(r.id==='orc')r.discount=-.2;}
UPGRADES.splice(0,UPGRADES.length,...ECHO_TREE.flatMap(b=>b.nodes));
for(const [key,name,req] of [['S','Potência','str'],['P','Precisão','dex'],['E','Tenacidade','vit'],['C','Inspiração','int'],['I','Estudo','int'],['A','Movimento','dex'],['L','Fortuna','dex']])for(let tier=1;tier<=4;tier++)TALENTS.push({id:'special_'+key+'_'+tier,name:name+' '+['I','II','III','IV'][tier-1],tree:'S.P.E.C.I.A.L.',rarity:['Comum','Raro','Épico','Lendário'][tier-1],req:{[key]:tier*3+2},prereq:tier>1?['special_'+key+'_'+(tier-1)]:[],excludes:[],desc:({S:'+8% potência de dano',P:'+4% crítico',E:'+15 vida e +1 armadura',C:'+12% cura e dano de servos',I:'+10% XP e +8 mana',A:'−4% tempo de recuperação',L:'+5 qualidade de loot'})[key],specialKey:key});
TALENTS.push(...DEEP_TALENTS);
export function resolveSpell(input){
 const tokens=String(input||'').trim().toUpperCase().split(/\s+/).filter(Boolean);if(tokens.length<2||tokens.length>12||tokens.some(t=>!RUNES.includes(t)))return null;
 const combo=tokens.join(' ');if(ARCANE_BY_FORMULA.has(combo))return {...ARCANE_BY_FORMULA.get(combo)};if(combo===DEATH_TOUCH)return {combo,name:'DEATH TOUCH',kind:'death',type:'sombrio',cost:100,power:8,tier:11,duration:1,element:'UMBRA'};
 if(tokens.length<=4)return legacySpell(combo);
 const i=RUNES.indexOf(tokens[0]),j=RUNES.indexOf(tokens[1]),f=forms[j],n=tokens.length;
 const distinct=new Set(tokens).size,boost=1+(n-2)*.18+distinct*.025;
 return {combo,name:`${f[0]} de ${RUNE_DATA[i].name} · Círculo ${n}`,kind:f[1],type:RUNE_DATA[i].type,cost:Math.ceil(f[3]*(1+(n-2)*.2)),power:f[2]*boost,tier:n-1,duration:Math.min(7,2+Math.floor(n/3)),element:tokens[0]};
}
