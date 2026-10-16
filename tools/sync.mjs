import {mkdir,copyFile,cp} from 'node:fs/promises';
// web/ is canonical; the server and browser use identical rules.
await mkdir('supabase/functions/game/shared',{recursive:true});await mkdir('game',{recursive:true});
for(const name of ['data.js','content.js','engine.js','expansion.js','account.js','adventures.js','combat-state.js','deep-content.js']){
 await copyFile('web/game/'+name,'game/'+name);
 await copyFile('web/game/'+name,'supabase/functions/game/shared/'+name);
}
for(const name of ['index.html','galeria.html','bestiario.html','app-v3.js','game-v3.css','art-v3.js','pixel-sprites.js','sprite-grid.js','tung-art.js','creature-art.js','view-core.js','battle-effects.js','unit-tooltips.js','scene-director.js','art-v3.css','pixel-art.js','config.js'])await copyFile('web/'+name,name);
await cp('web/assets','assets',{recursive:true});
console.log('Frontend e regras da Edge Function sincronizados.');
