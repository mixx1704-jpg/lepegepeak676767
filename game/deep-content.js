// Data-only additions, shared by the browser and authoritative server.
const STAT_LABELS={armor:'armadura',hp:'vida',mana:'mana',haste:'velocidade ATB',dodge:'esquiva',crit:'crítico',stagger:'impacto',leech:'roubo de vida',support:'cura e escudos',summonPower:'dano de servos',xpBonus:'experiência',lootQuality:'qualidade do saque',power:'dano',threat:'ameaça',regen:'mana por ciclo',fogo:'afinidade de fogo',gelo:'afinidade de gelo',eletrico:'afinidade elétrica',veneno:'afinidade de veneno',sagrado:'afinidade sagrada',sombrio:'afinidade sombria',arcano:'afinidade arcana'};
function effectText(stat,value){const fraction=['power','support','summonPower','stagger','threat'].includes(stat),percent=fraction||['haste','dodge','crit','leech','xpBonus','fogo','gelo','eletrico','veneno','sagrado','sombrio','arcano'].includes(stat),n=fraction?Math.round(value*1000)/10:value;return `+${String(n).replace('.',',')}${percent?'%':''} ${STAT_LABELS[stat]||stat}`;}
export const DISCIPLINES=[
 ['assalto','Assalto',{power:.025,stagger:.06},['mark','multi','execute','pierce'],['Abertura','Sequência','Sentença','Perfuração']],
 ['controle','Controle',{mana:4,haste:1},['freeze','curse','chain','stagger'],['Prisão','Interdição','Ressonância','Ruptura']],
 ['vinculo','Vínculo',{support:.035,summonPower:.035},['cover','heal','partyshield','partyheal'],['Vigília','Sutura','Fortaleza','Renovação']]
];
export function extendTrees(trees,classes){
 for(const c of classes)for(const [b,tree] of trees[c.id].entries()){
  tree.ultraNodes=[];
  for(const ultra of [false,true])for(const [lane,[id,title,mods,kinds,names]] of DISCIPLINES.entries())for(let rank=0;rank<8;rank++){
   const index=12+lane*8+rank,key=ultra?`u:${b}:${lane}:${rank}`:`${b}:${index}`,active=rank%2===1,k=rank>>1;
   const summoner=['necromante','druida','xama','artifice','bruxo','patrulheiro'].includes(c.id),kind=summoner&&lane===2?'summon':kinds[k];
   const type=ultra&&tree.ultra==='TUNG'?'contundente':['fogo','gelo','eletrico','veneno','sombrio','sagrado','arcano'].includes(c.paths[b].effect)?c.paths[b].effect:c.type;
   const skill=active?{id:`${ultra?'ultra':'path'}_${b}_${lane}_${rank}`,name:`${names[k]} ${ultra?tree.ultra:tree.name}`,kind,type,cost:10+k*5+(ultra?12:0),power:(kind==='multi'?.48:1.1)+k*.22+(ultra?.35:0),pet:(c.id==='artifice'?['turret','golem','turret','golem']:c.id==='necromante'?['skeleton','archer','knight','lich']:['wolf','spirit','treant','spirit'])[k],target:['heal','cover'].includes(kind)?'ally':['partyshield','partyheal','summon'].includes(kind)?'self':'enemy',level:1,fx:`${c.id}:${b}:${lane}:${rank}:${ultra?'ultra':'super'}`,mechanic:lane===0?['breach','momentum','cull','sunder'][k]:lane===1?['delay','silence','conduct','break'][k]:['cleanse','renew','aegis','respite'][k],desc:lane===0?['Marca e reduz a proteção do alvo.','Três golpes; adianta sua próxima ação.','Execução; abate recupera mana.','Perfura e aplica maldição.'][k]:lane===1?['Congela e atrasa o alvo em 20 UT.','Maldição bloqueia a próxima técnica especial.','Corrente atinge até três; prepara combo.','Triplo impacto; devolve mana ao quebrar.'][k]:summoner?'Invoca servo; cura os servos já ativos.':['Proteção e remoção de queimadura/sangramento.','Cura dirigida e devolve 6 mana.','Escudo coletivo; acelera a party.','Cura coletiva e remove lentidão.'][k]}:null;
   const node={id:key,name:active?skill.name:`${title}: ${['Fundamento','','Disciplina','','Doutrina','','Legado'][rank]||'Maestria'}`,effect:'deep',level:ultra?50+rank*5:Math.min(46,8+rank*5),req:rank?[ultra?`u:${b}:${lane}:${rank-1}`:`${b}:${index-1}`]:ultra?[]:[`${b}:2`],lane,rank,ultra,mods:active?{}:mods,skill,desc:active?skill.desc:Object.entries(mods).map(([k,v])=>effectText(k,v)).join(' · ')};
   (ultra?tree.ultraNodes:tree.nodes).push(node);
  }
 }
}
export function deepNodes(p,trees){const t=trees[p.classId]?.[p.evolution];return t?[...t.nodes,...(p.ultra?t.ultraNodes:[])].filter(n=>n.effect==='deep'&&p.skills?.[n.id]):[];}

// 25 disciplines × 10 situational builds = 250 cards, not ten identical ranks.
const disciplines=[
 ['Vigília','E','armor',.8],['Pulmão de ferro','E','hp',9],['Reserva interior','I','mana',7],['Ritmo de guerra','A','haste',1.2],['Passo do vento','A','dodge',1],
 ['Olho do duelo','P','crit',1.3],['Punho de pedra','S','stagger',.035],['Voto de sangue','S','leech',.7],['Canto de batalha','C','support',.025],['Pacto dos mortos','C','summonPower',.035],
 ['Cartografia esquecida','I','xpBonus',2],['Olho do garimpo','L','lootQuality',1.5],['Braseiro','I','fogo',2.5],['Inverno','I','gelo',2.5],['Tempestário','P','eletrico',2.5],
 ['Mitridatismo','E','veneno',2.5],['Exorcismo','C','sagrado',2.5],['Vazio interior','I','sombrio',2.5],['Geometria arcana','I','arcano',2.5],['Vontade inquebrável','E','regen',.3],
 ['Carrasco','S','power',.018],['Duelista','P','power',.018],['Comandante','C','threat',.05],['Ermitão','I','mana',9],['Sobrevivente','L','hp',11]
];
export const TALENT_CONTEXTS=[
 ['always','do Primeiro Passo','Sempre ativo',1],['wounded','da Última Gota','Abaixo de 35% da vida',2],['reserve','da Reserva','Com mana acima de 75%',1.6],['companions','dos Companheiros','Com ao menos um servo vivo',1.7],['shielded','do Escudo','Enquanto possuir escudo',1.5],['guarding','da Guarda','Enquanto estiver defendendo',2.2],['veteran','dos Veteranos','A partir do nível 20',1.6],['backline','da Retaguarda','Na formação de retaguarda',1.6],['scarred','das Cicatrizes','Enquanto carregar uma lesão persistente',2],['ascended','da Ascensão','Enquanto estiver em uma classe ultra',2.5]
];
export const DEEP_TALENTS=disciplines.flatMap(([name,gate,stat,value],i)=>TALENT_CONTEXTS.map(([condition,suffix,when,mult],r)=>{const amount=Math.round(value*mult*10000)/10000;return {id:`deep_${i}_${r}`,name:`${name} ${suffix}`,tree:name,rarity:r<3?'Comum':r<6?'Raro':r<9?'Épico':'Lendário',req:{[gate]:3+r*2},level:1+r*2,ultraOnly:condition==='ascended',prereq:r?[`deep_${i}_0`]:[],excludes:[],condition,mods:{[stat]:amount},desc:`${when}: ${effectText(stat,amount)}. Acumula com outras especializações.`};}));
export const DEEP_TALENT_MAP=new Map(DEEP_TALENTS.map(t=>[t.id,t]));
export function talentActive(t,p,v){switch(t?.condition){case 'wounded':return p.hp<v.hp*.35;case 'reserve':return p.mana>v.mana*.75;case 'companions':return p.summons?.some(s=>s.hp>0);case 'shielded':return p.shield>0;case 'guarding':return !!p.guard;case 'veteran':return p.level>=20;case 'backline':return p.formation==='back';case 'scarred':return Object.values(p.injuries||{}).some(Boolean);case 'ascended':return !!p.ultra;default:return true;}}

const forms=[['Carrasco','gargoyle','contundente',['mark','heavy','protect','aoe']],['Matriarca','beetle','veneno',['brood','mark','heal','aoe']],['Oráculo','eye','arcano',['silence','mana','root','aoe']],['Dragoa','dragon','fogo',['enrage','heavy','root','aoe']],['Rei','guardian','sombrio',['protect','revive','heavy','aoe']],['Serpente','serpent','veneno',['root','mark','heavy','aoe']],['Abadessa','harpy','sagrado',['heal','silence','rally','aoe']],['Colosso','crab','contundente',['protect','heavy','enrage','aoe']],['Espectro','wraithking','gelo',['mana','root','silence','aoe']],['Devora-sol','mimic','sombrio',['mark','brood','heavy','aoe']]];
const domains=['do Sal','das Cinzas','dos Sinos','da Febre','do Espelho','dos Afogados','da Fornalha','do Último Eclipse'];
const moveNames={mark:'Selo da presa',heavy:'Decapitação',protect:'Carapaça ritual',aoe:'Ruptura do horizonte',brood:'Ninhada faminta',heal:'Banquete dos mortos',silence:'Roubo da voz',mana:'Dízimo da alma',root:'Grilhões',enrage:'Fome ancestral',revive:'Retorno do condenado',rally:'Hino do massacre'};
export const BOSS_ROSTER=forms.flatMap(([name,art,type,base],family)=>domains.map((domain,variant)=>{
 const order=base.map((_,i)=>base[(i+variant)%base.length]);order.splice(1,0,['mana','silence','root','brood','protect','rally','heal','enrage'][variant]);
 const moves=order.map((kind,i)=>({kind,label:`${moveNames[kind]} · ${name}`,mult:kind==='heavy'?1.55+variant*.035:kind==='aoe'?.65+family*.025:.9,ultimate:kind==='aoe',bonus:variant===0?'bleed':variant===1?'burn':variant===2?'chill':variant===3?'exposed':variant===4?'drain':variant===5?'delay':variant===6?'mana':'execute'}));
 return {id:`b${family}_${variant}`,name:`${name} ${domain}`,title:`${name} ${domain}`,art,species:104+family*8+variant,type,resist:{[type]:55,[type==='sagrado'?'sombrio':'sagrado']:-20},moves,speed:72+variant*3-family,phaseAt:.35+variant*.035,mechanic:`${moves.map(m=>m.label).join(' → ')}. Fase II em ${Math.round((.35+variant*.035)*100)}% PV.`};
}));

const stories={
 stone:[['A inscrição se acende sob sua mão.','A pedra racha; a lâmina responde ao seu nome.','O silêncio pesa menos. Você leva uma história consigo.'],['Os nomes riscados começam a sangrar.','A pedra fecha os dedos sobre seu braço.','Você escapa, mas algo seu fica preso ali.']],
 egg:[['O ovo acompanha o ritmo da sua respiração.','Uma pequena garra rompe a casca.','Pela primeira vez, o olhar não é de fome.'],['A casca escurece de repente.','A mãe responde com uma língua de fogo.','Só o cheiro de cinzas acompanha sua fuga.']],
 tree:[['As folhas sussurram seu nome.','Um fruto dourado desce até sua mão.','Um futuro que parecia perdido volta a existir.'],['As raízes apertam seus tornozelos.','Um nome desaparece da casca.','Você sai cambaleando, incapaz de lembrá-lo.']],
 well:[['Uma moeda toca a água sem fazer ruído.','Um reflexo devolve um tesouro à superfície.','Você recolhe a dádiva sem olhar para o fundo.'],['O reflexo sorri antes de você.','Mãos de prata atravessam a borda do poço.','O pedágio cobrado foi muito maior que a oferta.']],
 forge:[['Você posiciona o metal sobre a bigorna.','As brasas respondem com um pulso dourado.','A forja entrega sua obra e volta a dormir.'],['O martelo vibra na sua mão.','A bigorna expele uma chuva de metal vivo.','A forja exige sangue pelo trabalho interrompido.']],
 clock:[['Os grãos de areia param no ar.','Você move a ampulheta contra o próprio tempo.','Uma lembrança de amanhã repousa na sua mão.'],['Uma rachadura atravessa o vidro.','Anos de cansaço chegam de uma vez.','Você deixa o relógio para trás, mas leva suas marcas.']],
 shrine:[['Você recita o juramento diante das sete velas.','Uma chama se inclina em sinal de aceitação.','O selo pesa como uma promessa cumprida.'],['A última palavra morre na sua garganta.','As sete chamas se voltam contra você.','O altar grava o preço da mentira no seu corpo.']],
 chest:[['Você acompanha cada respiração do cofre.','A fechadura cede enquanto a criatura dorme.','Os espólios estão seguros; não faça barulho ao sair.'],['O cofre prende a respiração.','A tampa se abre em uma fileira de dentes.','Você arranca a mão a tempo de continuar vivo.']]
};
export function encounterStory(event,success,skip=false){if(skip)return ['Você observa os sinais de perigo.','Dá um passo para trás e guarda a arma.','Nem todo segredo merece seu sangue.'];return stories[event?.id]?.[success?0:1]||(success?[`Você se aproxima de ${event?.name||'um segredo'}.`,'O mecanismo cede: sua decisão abriu uma passagem.','Você recolhe a recompensa antes que a escuridão retorne.']:[`Há algo errado em ${event?.name||'este lugar'}.`,'Tarde demais: a armadilha se fecha com um estalo.','Ferido, você calcula o preço de continuar.']);}
