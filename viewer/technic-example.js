/* Partial demo for the viewer: chassis, wheels and stabilizers only. It is not a solution to the benchmark. */
(function(root){
  'use strict';
  function createDemo(){
    const parts=[],connections=[];
    const part=(element,color,subassembly,position,x_axis,z_axis)=>{const id=`p${String(parts.length+1).padStart(3,'0')}`;parts.push({id,element,color,subassembly,position,x_axis,z_axis});return id;};
    const join=(a,b,type,motion,at)=>connections.push({id:`c${String(connections.length+1).padStart(3,'0')}`,a,b,type,motion,at});
    const W=1.9; // wheel-axis height: tyre radius 1.9 rests on z=0
    const rail={};
    for(const s of [-1,1])rail[s]=part('6115616','yellow','chassis',[2*s,-4,W],[0,1,0],[1,0,0]);
    // Two cross axles tie the rails together and carry the quarter-ellipse frames.
    const frame={};
    for(const s of [-1,1])frame[s]=part('6522621','yellow','loader_gearbox',[s,-2,W],[0,1,0],[1,0,0]);
    for(const [y,railHole,frameHole] of [[-2,'h2','h0'],[-1,'h3','h1']]){
      const ax=part('4211639','light_bluish_gray','chassis',[-2.5,y,W],[1,0,0],[0,0,1]);
      join(`${ax}.s0`,`${rail[-1]}.${railHole}`,'axle','rotates',[-2,y,W]);
      join(`${ax}.s0`,`${frame[-1]}.${frameHole}`,'axle',frameHole==='h0'?'fixed':'rotates',[-1,y,W]);
      join(`${ax}.s0`,`${frame[1]}.${frameHole}`,'axle',frameHole==='h0'?'fixed':'rotates',[1,y,W]);
      join(`${ax}.s0`,`${rail[1]}.${railHole}`,'axle','rotates',[2,y,W]);
    }
    const f2=[],f4=[];
    for(const s of [-1,1])for(const [hole,y] of [['h1',-3],['h7',3]]){
      const pin=part('6321305','tan','wheels',[1.5*s,y,W],[s,0,0],[0,0,1]);
      const rim=part('6109684','light_bluish_gray','wheels',[3.5*s,y,W],[0,1,0],[1,0,0]);
      const tyre=part('4619323','black','wheels',[3.5*s,y,W],[0,1,0],[1,0,0]);
      join(`${pin}.s0`,`${rail[s]}.${hole}`,'pin','rotates',[2*s,y,W]);
      join(`${pin}.s1`,`${rim}.h0`,'pin','rotates',[3.5*s,y,W]);
      join(`${tyre}.bore`,`${rim}.seat`,'tyre','fixed',[3.5*s,y,W]);
      if(!f2.length)f2.push(tyre,rim,pin,rail[s]);
    }
    for(const s of [-1,1]){
      const pin=part('6279875','black','stabilizers',[2.5*s,-4,W],[-s,0,0],[0,0,1]);
      const leg=part('4142133','yellow','stabilizers',[s,-4,W],[0,-.96,-.28],[1,0,0]);
      join(`${pin}.s0`,`${rail[s]}.h0`,'pin','rotates',[2*s,-4,W]);
      join(`${pin}.s1`,`${leg}.h0`,'pin','rotates',[s,-4,W]);
      if(!f4.length)f4.push(leg,pin,rail[s]);
    }
    return {title:'Partial demo: chassis, wheels, stabilizers',units:{length:'module',module_mm:8},axes:{x:'right',y:'forward',z:'up'},parts,connections,
      mechanisms:[{function:'F2',chain:f2},{function:'F4',chain:f4}]};
  }
  if(typeof module!=='undefined'&&module.exports)module.exports=createDemo;
  else root.createTechnicDemo=createDemo;
})(globalThis);
