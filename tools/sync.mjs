import {mkdir,copyFile} from 'node:fs/promises';
const dir='supabase/functions/game/shared';await mkdir(dir,{recursive:true});
for(const name of ['data.js','content.js','engine.js'])await copyFile('web/game/'+name,dir+'/'+name);
console.log('Engine and data synchronized for Edge Function.');
