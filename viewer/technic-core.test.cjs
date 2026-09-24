const {test}=require('node:test');
const assert=require('node:assert/strict');
const C=require('./technic-core.js'),demo=require('./technic-example.js');
const status=(m,id)=>m.checks.find(c=>c.id===id).status;
const part=(id,element,position,x_axis=[1,0,0],z_axis=[0,0,1],extra={})=>({id,element,color:C.CATALOG[element].color,subassembly:'chassis',position,x_axis,z_axis,...extra});
const join=(id,a,b,type='axle',motion='rotates',at=[0,0,0])=>({id,a,b,type,motion,at});
const model=(parts,connections=[],mechanisms=[])=>({title:'Test',units:{length:'module',module_mm:8},parts,connections,mechanisms});

test('inventory matches the booklet parts list: 104 pieces in 45 element types',()=>{
  assert.equal(C.TOTAL,104);assert.equal(C.INVENTORY.length,45);
  assert.equal(new Set(C.INVENTORY.map(r=>r[0])).size,45);
  for(const [el,,color] of C.INVENTORY)assert.ok(C.COLORS[color],`${el} colour ${color}`);
});
test('demo passes every structural check and fails only what it omits',()=>{
  const m=C.analyze(demo());
  for(const id of ['schema','colors','references','geometry','compat','capacity','connectivity','ground','wheelbase','collisions','F2','F4'])assert.equal(status(m,id),'pass',id);
  for(const id of ['inventory','F1','F3','F5','layout'])assert.equal(status(m,id),'fail',id);
  assert.ok(m.conns.every(c=>c.state==='ok'));
});
test('a pin in a cross-axle hole is an impossible joint',()=>{
  const m=C.analyze(model([part('a','6279875',[0,0,0]),part('b','6338422',[.5,0,0],[0,1,0],[1,0,0])],[join('c1','a.s0','b.h0','pin')]));
  assert.equal(status(m,'compat'),'fail');assert.match(m.checks.find(c=>c.id==='compat').details[0],/round pin/);
});
test('misaligned holes and unknown features are reported',()=>{
  const m=C.analyze(model([part('a','4211639',[0,0,0]),part('b','6115616',[1,0,0],[1,0,0],[0,0,1]),part('c','6115616',[2,5,0])],[join('c1','a.s0','b.h0'),join('c2','a.s0','c.h9')]));
  assert.equal(status(m,'geometry'),'fail');assert.equal(status(m,'references'),'fail');
});
test('two parts on the same stretch of axle are flagged',()=>{
  const beam=(id,x)=>part(id,'6115616',[x,0,0],[0,1,0],[1,0,0]);
  const m=C.analyze(model([part('ax','4211639',[0,0,0]),beam('b1',1),beam('b2',1.4)],[join('c1','ax.s0','b1.h0'),join('c2','ax.s0','b2.h0')]));
  assert.equal(status(m,'capacity'),'fail');
});
test('unconnected overlapping bodies collide; connected ones do not',()=>{
  const beam=(id,x)=>part(id,'6115616',[x,0,0],[0,1,0],[1,0,0]);
  const hit=C.analyze(model([beam('b1',0),beam('b2',.5)]));
  assert.equal(status(hit,'collisions'),'fail');assert.equal(status(hit,'connectivity'),'fail');
  assert.equal(status(C.analyze(model([beam('b1',0),beam('b2',1)])),'collisions'),'pass');
});
test('knob wheels and worm meshes use the catalog rules',()=>{
  const knobA=part('k1','6284188',[0,0,.5],[1,0,0],[0,0,1]),good=part('k2','6284188',[0,1,-.5],[1,0,0],[0,1,0]),bad=part('k3','6284188',[0,2,-.5],[1,0,0],[0,1,0]);
  const a=C.analyze(model([knobA,good,bad]));
  assert.equal(C.meshCheck(a.byId.get('k1'),a.byId.get('k2')).ok,true);
  assert.equal(C.meshCheck(a.byId.get('k1'),a.byId.get('k3')).ok,false);
  const w=C.analyze(model([part('w','6185471',[0,2.5,-.5],[0,1,0],[0,0,1]),part('g','6012451',[0,3.5,.5],[0,1,0],[1,0,0]),part('g2','6012451',[0,3.5,1],[0,1,0],[1,0,0])]));
  assert.equal(C.meshCheck(w.byId.get('w'),w.byId.get('g')).ok,true);
  assert.equal(C.meshCheck(w.byId.get('w'),w.byId.get('g2')).ok,false);
});
test('a continuous knob-to-arm drive train passes F1; a slipping link fails',()=>{
  const up=[0,0,1],z=3;
  const parts=[
    part('knob','4177431',[0,0,6.5+z],[1,0,0],up),part('br3','6135494',[0,0,4+z],up,[1,0,0]),part('con','6391550',[0,0,3+z],up,[1,0,0]),
    part('ax4','6083620',[0,0,z],up,[1,0,0]),part('kA','6284188',[0,0,.5+z],[1,0,0],up),part('kB','6284188',[0,1,-.5+z],[1,0,0],[0,1,0]),
    part('br5','6159763',[0,.5,-.5+z],[0,1,0],up),part('worm','6185471',[0,2.5,-.5+z],[0,1,0],up),part('g8','6012451',[0,3.5,.5+z],[0,1,0],[1,0,0]),
    part('ax5','4211639',[-2.5,3.5,.5+z],[1,0,0],up),part('arm','6278131',[-2,3.5,.5+z],[0,1,0],[1,0,0])];
  const conns=[join('c1','br3.s0','knob.h0','axle','fixed'),join('c2','br3.s0','con.b1','axle','fixed'),join('c3','ax4.s0','con.b0','axle','fixed'),join('c4','ax4.s0','kA.h0','axle','fixed'),
    {id:'c5',a:'kA',b:'kB',type:'mesh'},join('c6','br5.s0','kB.h0','axle','fixed'),join('c7','br5.s0','worm.bore','axle','fixed'),{id:'c8',a:'worm',b:'g8',type:'mesh'},
    join('c9','ax5.s0','g8.h0','axle','fixed'),join('c10','ax5.s0','arm.h0','axle','fixed')];
  const chain=['knob','br3','con','ax4','kA','kB','br5','worm','g8','ax5','arm'];
  const m=C.analyze(model(parts,conns,[{function:'F1',chain}]));
  assert.equal(status(m,'F1'),'pass',m.checks.find(c=>c.id==='F1').details.join('\n'));
  assert.equal(status(m,'geometry'),'pass');
  const slip=parts.map(p=>p.id==='arm'?{...p,position:[-2,3.5+1,.5+z]}:p);
  const s=C.analyze(model(slip,conns.map(c=>c.id==='c10'?{...c,b:'arm.h1'}:c),[{function:'F1',chain}]));
  assert.equal(status(s,'F1'),'fail');
});
test('schema rejects duplicate ids, bad vectors and skewed axes; fenced JSON is accepted',()=>{
  const p=part('a','4211639',[0,0,0]);
  assert.throws(()=>C.analyze(model([p,p])),/duplicate/);
  assert.throws(()=>C.analyze(model([{...p,position:[0,NaN,0]}])),/position/);
  assert.throws(()=>C.analyze(model([{...p,z_axis:[1,0,0]}])),/perpendicular/);
  assert.throws(()=>C.analyze(model([])));assert.throws(()=>C.parse('{broken'));
  assert.equal(C.parse('```json\n'+JSON.stringify(model([p]))+'\n```').parts.length,1);
});
test('unknown elements and colours are reported without blocking rendering',()=>{
  const m=C.analyze(model([{...part('a','4211639',[0,0,0]),color:'green'},{id:'b',element:'999',color:'red',subassembly:'x',position:[5,5,5],x_axis:[1,0,0],z_axis:[0,0,1]}]));
  assert.equal(status(m,'colors'),'fail');assert.equal(status(m,'schema'),'warn');
  assert.ok(m.inventory.some(r=>r.element==='999'&&r.got===1));assert.equal(m.renderPolys[1].length,1);
});
test('ray picking hits the front face of a body',()=>{
  const m=C.analyze(model([part('a','6115616',[0,0,0],[1,0,0],[0,0,1])]));
  const t=m.renderPolys[0].map(p=>C.rayHit(p,[4,0,10],[0,0,-1])).filter(v=>v!==null);
  assert.ok(Math.abs(Math.min(...t)-9.5)<1e-6);
});
