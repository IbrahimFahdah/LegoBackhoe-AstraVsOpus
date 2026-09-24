(function(){
  'use strict';
  const C=TechnicCore,$=id=>document.getElementById(id),canvas=$('view');
  const groups=[...C.SUBASSEMBLIES,'other'];
  const labels={chassis:'Chassis',drive_tower:'Drive tower',cab:'Cab',loader_gearbox:'Loader gearbox',loader:'Loader',backhoe:'Backhoe',stabilizers:'Stabilizers',wheels:'Wheels',other:'Other'};
  let model=null,angle=Math.PI-.7,elevation=.45,zoom=1,radius=12,center=[0,0,2],renderer;
  let selected=null,isolated=null,focus=null,activeCheck=null,offsets=[];
  const visible=new Set(groups),el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
  const hex=h=>/^#[0-9a-f]{6}$/i.test(h)?[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255):[.9,.2,.8];
  const light=C.unit([.45,.7,1.4]);
  function colorOf(p){return hex(C.COLORS[p.color]||(p.color.startsWith('#')?p.color:'#e033cc'));}
  function fill(out,pts,normal,col,alpha){const k=.58+.42*Math.max(0,C.dot(normal,light));for(let i=1;i<pts.length-1;i++)for(const p of [pts[0],pts[i],pts[i+1]])out.push(...p,...col.map(v=>v*k),alpha);}
  function shown(p){return visible.has(p.subassembly)&&(!isolated||isolated.has(p.id));}

  function computeOffsets(){
    const f=+$('explode').value/100;offsets=model?model.parts.map(()=>[0,0,0]):[];
    if(!model||!f)return;
    const mid=C.mul(model.centroid.reduce(C.add,[0,0,0]),1/model.parts.length),subs=new Map();
    model.parts.forEach((p,i)=>{if(!subs.has(p.subassembly))subs.set(p.subassembly,[]);subs.get(p.subassembly).push(model.centroid[i]);});
    const subMid=new Map([...subs].map(([k,list])=>[k,C.mul(list.reduce(C.add,[0,0,0]),1/list.length)]));
    offsets=model.parts.map((p,i)=>{const s=subMid.get(p.subassembly);return C.add(C.mul(C.sub(s,mid),f*1.2),C.mul(C.sub(model.centroid[i],s),f*.6));});
  }
  function rebuild(){
    const solid=[],lines=[],glass=[],overlay=[];
    if(model){
      computeOffsets();
      model.parts.forEach((p,i)=>{
        if(!shown(p))return;
        const o=offsets[i];let col=colorOf(p);
        if(focus?focus.has(p.id):($('highlight').checked&&model.bad.has(p.id)))col=[.93,.18,.14];
        if(selected===p.id)col=col.map((v,k)=>v*.35+[1,.55,.05][k]*.65);
        const trans=p.color==='trans_clear',target=trans?glass:solid;
        const dark=col[0]*.3+col[1]*.55+col[2]*.15<.3,edge=dark?col.map(v=>v+.3):col.map(v=>v*.55);
        for(const poly of model.renderPolys[i]){
          const pts=poly.pts.map(v=>C.add(v,o));
          poly.faces.forEach((f,k)=>fill(target,f.map(j=>pts[j]),poly.normals[k],col,trans?.45:1));
          if(poly.kind==='ring'||trans)continue;
          const faces=poly.kind==='prism'?poly.faces.slice(0,2):poly.faces,seen=new Set();
          for(const f of faces)for(let k=0;k<f.length;k++){const a=f[k],b=f[(k+1)%f.length],key=a<b?a+','+b:b+','+a;if(seen.has(key))continue;seen.add(key);lines.push(...pts[a],...edge,1,...pts[b],...edge,1);}
        }
        if($('holes').checked)for(const h of C.holeMarkers(p)){
          const mark=dark?[.55,.58,.62]:col.map(v=>v*.3),[u,w]=C.basis(h.N);
          for(const side of [-1,1]){
            const c=C.add(C.add(h.C,C.mul(h.N,side*(h.depth/2+.015))),o),n=C.mul(h.N,side);
            if(h.profile==='P')fill(solid,Array.from({length:12},(_,k)=>C.add(c,C.add(C.mul(u,.24*Math.cos(k*Math.PI/6)),C.mul(w,.24*Math.sin(k*Math.PI/6))))),n,mark,1);
            else for(const [a,b] of [[u,w],[w,u]])fill(solid,[[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,y])=>C.add(c,C.add(C.mul(a,x*.22),C.mul(b,y*.06)))),n,mark,1);
          }
        }
      });
      if($('joints').checked)for(const c of model.conns){
        if(!c.point||(c.a.part&&!shown(c.a.part))||(c.b.part&&!shown(c.b.part)))continue;
        const o=c.a.part?offsets[c.a.part.index]:[0,0,0],p=C.add(c.point,o),col=c.state==='fail'?[.85,.2,.15]:c.state==='warn'?[.9,.62,0]:[.18,.66,.36],s=.14;
        const v=[[s,0,0],[-s,0,0],[0,s,0],[0,-s,0],[0,0,s],[0,0,-s]].map(d=>C.add(p,d));
        for(const [a,b,d] of [[0,2,4],[2,1,4],[1,3,4],[3,0,4],[2,0,5],[1,2,5],[3,1,5],[0,3,5]])overlay.push(...[v[a],v[b],v[d]].flatMap(q=>[...q,...col,1]));
      }
    }
    renderer.upload(solid,lines,glass,overlay);draw();
  }
  function camera(){
    const right=[Math.cos(angle),Math.sin(angle),0],toward=[Math.sin(angle)*Math.cos(elevation),-Math.cos(angle)*Math.cos(elevation),Math.sin(elevation)];
    return {right,up:C.cross(toward,right),toward,center,scale:radius/zoom,far:radius*6};
  }
  function initRenderer(){
    const gl=canvas.getContext('webgl',{antialias:true,alpha:false});
    if(!gl)throw Error('WebGL is unavailable. Open this file in a browser with graphics acceleration enabled.');
    function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
    const program=gl.createProgram();
    gl.attachShader(program,shader(gl.VERTEX_SHADER,`attribute vec3 aPosition; attribute vec4 aColor;
      uniform vec3 uRight,uUp,uToward,uCenter; uniform float uScale,uAspect,uFar;
      varying vec4 vColor; void main(){vec3 p=aPosition-uCenter;gl_Position=vec4(dot(p,uRight)/(uScale*uAspect),dot(p,uUp)/uScale,-dot(p,uToward)/uFar,1.0);vColor=aColor;}`));
    gl.attachShader(program,shader(gl.FRAGMENT_SHADER,'precision mediump float; varying vec4 vColor; void main(){gl_FragColor=vColor;}'));
    gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
    const position=gl.getAttribLocation(program,'aPosition'),col=gl.getAttribLocation(program,'aColor');
    const uniforms=Object.fromEntries(['Right','Up','Toward','Center','Scale','Aspect','Far'].map(n=>[n,gl.getUniformLocation(program,'u'+n)]));
    const buffers={solid:gl.createBuffer(),lines:gl.createBuffer(),glass:gl.createBuffer(),overlay:gl.createBuffer()},counts={solid:0,lines:0,glass:0,overlay:0};
    function bind(b){gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.vertexAttribPointer(position,3,gl.FLOAT,false,28,0);gl.vertexAttribPointer(col,4,gl.FLOAT,false,28,12);gl.enableVertexAttribArray(position);gl.enableVertexAttribArray(col);}
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
    return {
      upload(solid,lines,glass,overlay){for(const [k,data] of Object.entries({solid,lines,glass,overlay})){bind(buffers[k]);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);counts[k]=data.length/7;}},
      draw(cam){
        const rect=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2),w=Math.max(1,Math.round(rect.width*dpr)),h=Math.max(1,Math.round(rect.height*dpr));
        if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
        gl.viewport(0,0,w,h);gl.clearColor(.925,.933,.937,1);gl.depthMask(true);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        for(const [n,v] of [['Right',cam.right],['Up',cam.up],['Toward',cam.toward],['Center',cam.center]])gl.uniform3fv(uniforms[n],v);
        gl.uniform1f(uniforms.Scale,cam.scale*Math.max(1,h/w));gl.uniform1f(uniforms.Aspect,w/h);gl.uniform1f(uniforms.Far,cam.far);
        gl.disable(gl.BLEND);gl.enable(gl.DEPTH_TEST);gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(1,1);bind(buffers.solid);gl.drawArrays(gl.TRIANGLES,0,counts.solid);gl.disable(gl.POLYGON_OFFSET_FILL);
        bind(buffers.lines);gl.drawArrays(gl.LINES,0,counts.lines);
        gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);bind(buffers.glass);gl.drawArrays(gl.TRIANGLES,0,counts.glass);gl.depthMask(true);
        gl.disable(gl.DEPTH_TEST);bind(buffers.overlay);gl.drawArrays(gl.TRIANGLES,0,counts.overlay);gl.enable(gl.DEPTH_TEST);
      }
    };
  }
  function draw(){if(renderer)renderer.draw(camera());}

  function pick(clientX,clientY){
    if(!model)return null;
    const rect=canvas.getBoundingClientRect(),cam=camera(),S=cam.scale*Math.max(1,rect.height/rect.width),A=rect.width/rect.height;
    const x=(clientX-rect.left)/rect.width*2-1,y=1-(clientY-rect.top)/rect.height*2;
    const origin=C.add(C.add(C.add(cam.center,C.mul(cam.right,x*S*A)),C.mul(cam.up,y*S)),C.mul(cam.toward,cam.far)),dir=C.mul(cam.toward,-1);
    let best=null,bestT=Infinity;
    model.parts.forEach((p,i)=>{if(!shown(p))return;const o=C.sub(origin,offsets[i]||[0,0,0]);for(const poly of model.renderPolys[i]){const t=C.rayHit(poly,o,dir);if(t!==null&&t<bestT){bestT=t;best=p.id;}}});
    return best;
  }
  function neighbours(id){const set=new Set([id]);for(const c of model.conns)if(c.a.part&&c.b.part&&(c.a.part.id===id||c.b.part.id===id)){set.add(c.a.part.id);set.add(c.b.part.id);}return set;}
  function showInfo(){
    const box=$('info');box.replaceChildren();if(!model||!selected)return;
    const p=model.byId.get(selected),r2=n=>Math.round(n*100)/100;
    box.append(el('h3','',`${p.id} · ${p.cat?p.cat.name:'unknown element'}`));
    box.append(el('div','',`Element ${p.element} · ${p.color||'no colour'} · ${labels[p.subassembly]}`));
    box.append(el('div','small',`position [${p.position.map(r2).join(', ')}]`));
    const notes=model.partNotes.get(p.id)||[];
    if(notes.length){box.append(el('strong','','Problems'));const ul=el('ul');notes.forEach(n=>ul.append(el('li','bad',n)));box.append(ul);}
    const cs=model.conns.filter(c=>c.a.part?.id===p.id||c.b.part?.id===p.id);
    box.append(el('strong','',`Joints (${cs.length})`));const ul=el('ul');
    for(const c of cs){const msgs=[...c.ref,...c.geom,...c.compat,...c.warn];ul.append(el('li',c.state==='fail'?'bad':c.state==='warn'?'warnc':'ok',`${c.id}: ${c.a.text} ↔ ${c.b.text} · ${c.type}${c.motion?`, ${c.motion}`:''}${msgs.length?` — ${msgs.join('; ')}`:''}`));}
    if(!cs.length)ul.append(el('li','bad','No joints: this part floats.'));box.append(ul);
  }
  function select(id){selected=id;showInfo();rebuild();}
  function renderChecks(){
    const list=$('checks');list.replaceChildren();if(!model)return;
    for(const c of model.checks){
      const row=el('div',`check ${c.status}${activeCheck===c.id?' active open':''}`),head=el('div','check-head');
      head.append(el('span','badge',c.status.toUpperCase()),el('span','check-label',c.label));
      row.append(head,el('div','check-summary',c.summary));
      if(c.details.length){const ul=el('ul');c.details.slice(0,40).forEach(d=>ul.append(el('li','',d)));if(c.details.length>40)ul.append(el('li','',`… ${c.details.length-40} more`));row.append(ul);}
      row.onclick=()=>{
        activeCheck=activeCheck===c.id?null:c.id;focus=activeCheck&&c.parts.length?new Set(c.parts):null;
        renderChecks();rebuild();
      };
      list.append(row);
    }
  }
  function renderInventory(){
    const body=$('inventory');body.replaceChildren();if(!model)return;
    for(const r of model.inventory){
      const tr=el('tr',r.got!==r.expected?'off':''),name=el('td'),sw=el('span','sw');
      sw.style.background=C.COLORS[r.color]||'#e033cc';name.append(sw,document.createTextNode(r.name));
      tr.append(el('td','',r.element),name,el('td','',String(r.expected)),el('td','',String(r.got)));body.append(tr);
    }
  }
  function render(){
    try{
      const next=C.parse($('json').value);model=next;selected=null;isolated=null;focus=null;activeCheck=null;
      const min=[0,1,2].map(i=>Math.min(...next.partBox.map(b=>b.min[i]))),max=[0,1,2].map(i=>Math.max(...next.partBox.map(b=>b.max[i])));
      center=min.map((v,i)=>(v+max[i])/2);radius=Math.max(4,Math.hypot(...max.map((v,i)=>v-min[i]))*.6);zoom=1;
      $('title').textContent=next.title;$('piece-count').textContent=`${next.parts.length} parts · ${next.conns.length} joints`;
      const s=next.score,score=el('div','',`${s.pass}/${s.total} `);score.id='score';score.append(el('small','',`checks pass · ${s.fail} fail · ${s.warn} warn`));
      $('status').replaceChildren(score,el('div','small','Click a check to highlight its parts. Geometry of special parts is approximate.'));
      $('error-banner').textContent='';visible.clear();groups.forEach(g=>visible.add(g));syncGroups();renderChecks();renderInventory();showInfo();rebuild();
    }catch(e){
      model=null;selected=null;renderer.upload([],[],[],[]);draw();renderChecks();renderInventory();showInfo();
      $('title').textContent='No model loaded';$('piece-count').textContent='';$('status').textContent='Cannot render: '+e.message;
    }
  }
  function syncGroups(){for(const g of groups)$('group-'+g).checked=visible.has(g);}
  function download(name,data){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

  for(const g of groups){const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.id='group-'+g;input.checked=true;input.onchange=()=>{input.checked?visible.add(g):visible.delete(g);rebuild();};label.append(input,document.createTextNode(' '+labels[g]));$('groups').append(label);}
  try{renderer=initRenderer();}catch(e){$('error-banner').textContent=e.message;$('status').textContent='Rendering unavailable.';return;}
  $('render').onclick=render;
  $('sample').onclick=()=>{$('json').value=JSON.stringify(createTechnicDemo(),null,2);render();};
  $('save').onclick=()=>{if(!model){$('status').textContent='Render valid JSON before saving.';return;}download('technic-backhoe.json',model.data);};
  $('report').onclick=()=>{
    if(!model){$('status').textContent='Render valid JSON before saving a report.';return;}
    download('technic-backhoe-report.json',{title:model.title,parts:model.parts.length,joints:model.conns.length,score:model.score,checks:model.checks.map(({id,label,status,summary,details,parts})=>({id,label,status,summary,details,parts})),inventory:model.inventory});
  };
  $('assembled').onclick=()=>{isolated=null;focus=null;activeCheck=null;visible.clear();groups.forEach(g=>visible.add(g));syncGroups();renderChecks();rebuild();};
  $('isolate').onclick=()=>{if(!model)return;if(isolated||!selected){isolated=null;}else isolated=neighbours(selected);rebuild();};
  $('front').onclick=()=>{angle=Math.PI;elevation=.15;draw();};
  $('rear').onclick=()=>{angle=0;elevation=.15;draw();};
  $('side').onclick=()=>{angle=Math.PI/2;elevation=.15;draw();};
  $('top').onclick=()=>{angle=Math.PI;elevation=Math.PI/2;draw();};
  $('reset').onclick=()=>{angle=Math.PI-.7;elevation=.45;zoom=1;draw();};
  $('highlight').onchange=$('holes').onchange=$('joints').onchange=rebuild;
  $('explode').oninput=rebuild;
  let drag=null;
  canvas.onpointerdown=e=>{drag={x:e.clientX,y:e.clientY,angle,elevation,moved:false};canvas.setPointerCapture(e.pointerId);};
  canvas.onpointermove=e=>{if(!drag)return;if(Math.abs(e.clientX-drag.x)+Math.abs(e.clientY-drag.y)>4)drag.moved=true;angle=drag.angle-(e.clientX-drag.x)*.008;elevation=Math.max(-.2,Math.min(Math.PI/2,drag.elevation+(e.clientY-drag.y)*.008));draw();};
  canvas.onpointerup=e=>{if(drag&&!drag.moved)select(pick(e.clientX,e.clientY));drag=null;};
  canvas.onpointercancel=()=>{drag=null;};
  canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.3,Math.min(8,zoom*Math.exp(-e.deltaY*.001)));draw();},{passive:false});
  canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','Escape'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')angle-=.1;if(e.key==='ArrowRight')angle+=.1;if(e.key==='ArrowUp')elevation=Math.min(Math.PI/2,elevation+.1);if(e.key==='ArrowDown')elevation=Math.max(-.2,elevation-.1);if(e.key==='+')zoom=Math.min(8,zoom*1.1);if(e.key==='-')zoom=Math.max(.3,zoom/1.1);if(e.key==='Escape'){select(null);return;}draw();}});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();$('error-banner').textContent='Graphics context lost. Reload this page to restore the view.';});
  window.addEventListener('resize',draw);
  $('sample').click();
})();
