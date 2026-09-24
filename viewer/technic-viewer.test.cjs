// Exercises UI state and geometry uploads without claiming real GPU/browser QA.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const C=require('./technic-core.js'),demo=require('./technic-example.js');
function harness(){
  const elements=new Map(),uniforms={},uploads=new Map(),draws=[];let bound,download=null;
  const constants=['ARRAY_BUFFER','STATIC_DRAW','FLOAT','VERTEX_SHADER','FRAGMENT_SHADER','COMPILE_STATUS','LINK_STATUS','DEPTH_TEST','LEQUAL','COLOR_BUFFER_BIT','DEPTH_BUFFER_BIT','BLEND','POLYGON_OFFSET_FILL','TRIANGLES','LINES','SRC_ALPHA','ONE_MINUS_SRC_ALPHA'];
  const gl=Object.fromEntries(constants.map((s,i)=>[s,i+1]));
  for(const n of ['shaderSource','compileShader','attachShader','linkProgram','useProgram','vertexAttribPointer','enableVertexAttribArray','enable','disable','depthFunc','viewport','clearColor','depthMask','clear','polygonOffset','blendFunc'])gl[n]=()=>{};
  Object.assign(gl,{createShader:()=>({}),getShaderParameter:()=>true,createProgram:()=>({}),getProgramParameter:()=>true,
    getAttribLocation:(_,n)=>n==='aPosition'?0:1,getUniformLocation:(_,n)=>n,createBuffer:()=>({}),
    bindBuffer:(_,b)=>{bound=b;},bufferData:(_,data)=>{assert.ok(data.every(Number.isFinite));uploads.set(bound,data);},
    uniform3fv:(n,v)=>{uniforms[n]=Array.from(v);},uniform1f:(n,v)=>{assert.ok(Number.isFinite(v));uniforms[n]=v;},
    drawArrays:(type,start,count)=>{assert.ok(Number.isInteger(count));draws.push({type,count});}});
  function element(id=''){
    return {id,value:id==='explode'?'0':'',checked:['highlight','holes'].includes(id),textContent:'',className:'',style:{},width:0,height:0,children:[],events:{},
      append(...c){this.children.push(...c);for(const x of c)if(x.id)elements.set(x.id,x);},replaceChildren(...c){this.children=[];this.append(...c);},
      addEventListener(n,cb){this.events[n]=cb;},getContext:()=>gl,getBoundingClientRect:()=>({left:0,top:0,width:1000,height:800}),setPointerCapture(){},
      click(){if(this.download)download=this.download;this.onclick?.();}};
  }
  const document={getElementById(id){if(!elements.has(id))elements.set(id,element(id));return elements.get(id);},createElement:()=>element(),createTextNode:t=>({textContent:t})};
  const scope={TechnicCore:C,createTechnicDemo:demo,document,window:{devicePixelRatio:1,addEventListener(){}},Blob,URL:{createObjectURL:()=>'blob:test',revokeObjectURL(){}},setTimeout:cb=>cb()};
  vm.runInNewContext(fs.readFileSync(__dirname+'/technic-viewer.js','utf8'),scope);
  const text=e=>[e.textContent,...(e.children||[]).map(text)].join(' ');
  return {elements,uniforms,uploads,draws,text,get:id=>elements.get(id),getDownload:()=>download,size:()=>[...uploads.values()].reduce((n,a)=>n+a.length,0)};
}
test('demo loads, scores, lists checks and inventory, and uploads geometry',()=>{
  const h=harness();
  assert.match(h.text(h.get('status')),/12\/17/);assert.equal(h.get('checks').children.length,17);
  assert.equal(h.get('inventory').children.length,45);assert.ok(h.draws.some(d=>d.count>1000));
  assert.match(h.get('piece-count').textContent,/22 parts · 24 joints/);
});
test('subassembly, hole, joint and explode controls change the uploaded geometry',()=>{
  const h=harness(),full=h.size();
  h.get('group-wheels').checked=false;h.get('group-wheels').onchange();assert.ok(h.size()<full);
  h.get('assembled').click();assert.equal(h.get('group-wheels').checked,true);assert.equal(h.size(),full);
  h.get('holes').checked=false;h.get('holes').onchange();assert.ok(h.size()<full);
  h.get('joints').checked=true;h.get('joints').onchange();const withJoints=h.size();assert.ok(withJoints>0);
  h.get('explode').value='80';h.get('explode').oninput();assert.equal(h.size(),withJoints);
});
test('clicking a check focuses its parts; clicking the canvas selects a part and fills the info panel',()=>{
  const h=harness();
  h.get('checks').children.find(r=>/F1/.test(h.text(r))).onclick();assert.match(h.get('checks').children.find(r=>/F1/.test(h.text(r))).className,/active/);
  h.get('top').click();const view=h.get('view');
  scan: for(let y=100;y<800;y+=40)for(let x=100;x<1000;x+=40){
    view.onpointerdown({clientX:x,clientY:y,pointerId:1});view.onpointerup({clientX:x,clientY:y});
    if(h.get('info').children.length)break scan;
  }
  assert.match(h.text(h.get('info')),/Joints \(\d+\)/);
  h.get('isolate').click();assert.ok(h.size()>0);
});
test('camera presets, orbit and zoom update uniforms',()=>{
  const h=harness(),view=h.get('view');
  h.get('top').click();assert.ok(Math.abs(h.uniforms.uToward[2]-1)<1e-6);
  h.get('front').click();assert.ok(h.uniforms.uToward[1]>.9);
  h.get('rear').click();assert.ok(h.uniforms.uToward[1]<-.9);
  const before=[...h.uniforms.uRight];view.onpointerdown({clientX:0,clientY:0,pointerId:1});view.onpointermove({clientX:60,clientY:10});view.onpointerup({clientX:60,clientY:10});assert.notDeepEqual(h.uniforms.uRight,before);
  const scale=h.uniforms.uScale;view.events.wheel({preventDefault(){},deltaY:-100});assert.ok(h.uniforms.uScale<scale);
});
test('invalid JSON clears the model; demo recovery, JSON and report downloads work',()=>{
  const h=harness();h.get('json').value='{broken';h.get('render').click();
  assert.match(h.get('status').textContent,/Cannot render/);assert.equal(h.get('checks').children.length,0);
  h.get('save').click();assert.equal(h.getDownload(),null);
  h.get('sample').click();h.get('save').click();assert.equal(h.getDownload(),'technic-backhoe.json');
  h.get('report').click();assert.equal(h.getDownload(),'technic-backhoe-report.json');
});
