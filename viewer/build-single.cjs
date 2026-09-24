// Bakes a model JSON and the viewer scripts into one self-contained HTML file.
// Usage: node build-single.cjs <model.json> <out.html> [name]
const fs=require('node:fs'),path=require('node:path');
const [jsonPath,outPath,name=path.basename(outPath,'.html')]=process.argv.slice(2);
if(!jsonPath||!outPath){console.error('Usage: node build-single.cjs <model.json> <out.html> [name]');process.exit(1);}
const read=f=>fs.readFileSync(path.join(__dirname,f),'utf8');
const model=JSON.parse(fs.readFileSync(jsonPath,'utf8').replace(/^﻿/,''));
const inline=code=>'<script>\n'+code.replace(/<\/script/gi,'<\\/script')+'\n</script>';
const baked=`window.createTechnicDemo=()=>(${JSON.stringify(model)});`;
const scripts=[read('technic-core.js'),baked,read('technic-viewer.js')].map(inline).join('');
let html=read('technic-viewer.html');
const tags='<script src="technic-core.js"></script><script src="technic-example.js"></script><script src="technic-viewer.js"></script>';
if(!html.includes(tags))throw Error('Script tags not found in technic-viewer.html');
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
html=html.replace(tags,()=>scripts)
  .replace(/<title>[^<]*<\/title>/,`<title>${esc(name)} · Backhoe Studio</title>`)
  .replace('Loading demo…','Loading model…')
  .replace('Keep this HTML file and its three JavaScript files together.',`Single file with the ${esc(name)} model built in.`);
fs.mkdirSync(path.dirname(path.resolve(outPath)),{recursive:true});
fs.writeFileSync(outPath,html);
console.log(`Wrote ${outPath} (${(html.length/1024).toFixed(0)} KB)`);
