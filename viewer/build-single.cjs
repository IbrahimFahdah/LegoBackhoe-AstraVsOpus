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
// Published pages show one fixed model: drop the heading and intro, hide the action buttons
// (the viewer script still binds them), re-render when the JSON is edited, and move the
// subassembly and display options up under the JSON box.
const heading=html.match(/<h1>.*?<\/h1><p class="intro">.*?<\/p>/)?.[0];
const buttons=html.match(/<div class="row"><button class="primary" id="render">.*?<\/div>/)?.[0];
const options=html.match(/<fieldset><legend>Subassemblies<\/legend>.*?<\/div><\/fieldset>\s*<fieldset><legend>Display<\/legend>[\s\S]*?<\/div><\/fieldset>/)?.[0];
if(!heading||!buttons||!options)throw Error('Viewer layout not found in technic-viewer.html');
const autoRender='<script>{let t;document.getElementById(\'json\').addEventListener(\'input\',()=>{clearTimeout(t);t=setTimeout(()=>document.getElementById(\'render\').click(),600);});}</script>';
html=html.replace(heading,'').replace(options,'')
  .replace(buttons,()=>buttons.replace('<div class="row">','<div class="row" style="display:none">')+options)
  .replace(tags,()=>scripts+autoRender)
  .replace(/<title>[^<]*<\/title>/,`<title>${esc(name)} · Backhoe Studio</title>`)
  .replace('Loading demo…','Loading model…')
  .replace('Keep this HTML file and its three JavaScript files together.',`Single file with the ${esc(name)} model built in.`);
fs.mkdirSync(path.dirname(path.resolve(outPath)),{recursive:true});
fs.writeFileSync(outPath,html);
console.log(`Wrote ${outPath} (${(html.length/1024).toFixed(0)} KB)`);
