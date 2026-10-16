import {mkdir,copyFile} from 'node:fs/promises';
// web/ is canonical. Keep root hosting and Supabase on exactly the same rules.
await mkdir('supabase/functions/game/shared',{recursive:true});await mkdir('game',{recursive:true});
for(const name of ['data.js','content.js','engine.js']){
 await copyFile('web/game/'+name,'game/'+name);
 await copyFile('web/game/'+name,'supabase/functions/game/shared/'+name);
}
for(const name of ['index.html','app-v2.js','pixel-art.js','style.css','retro.css','config.js'])await copyFile('web/'+name,name);
console.log('Frontend raiz, web/ e Edge Function sincronizados.');
