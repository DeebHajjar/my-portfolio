const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =============== typed terminal =============== */
(function(){
  const body=document.getElementById('tbody');
  const script=[
    {cmd:"whoami",out:[["o","Deeb Hajjar — software developer / AI-ML engineer"]]},
    {cmd:"cat /etc/motd",out:[["h","Building machines that remember."],["d","Django backends · REST APIs · continual-learning memory systems"]]},
    {cmd:"systemctl status deeb",out:[["g","● active (open_to_work) — remote or Lebanon"],["d","   Main PID: est. self-taught · Memory: five layers, consolidating"]]},
    {cmd:"./pipeline --start",out:[["g","pipeline initialized ✓"],["d","scroll ↓ to fly through it"]]},
  ];
  if(reduce){
    body.innerHTML="";
    script.forEach(s=>{
      body.innerHTML+=`<div class="line"><span class="p">deeb@hajjar:~$ </span><span class="o">${s.cmd}</span></div>`;
      s.out.forEach(([c,t])=>body.innerHTML+=`<div class="line"><span class="${c}">${t}</span></div>`);
    });
    return;
  }
  let si=0,ci=0,html="";
  function prompt(){return `<span class="p">deeb@hajjar:~$ </span>`}
  function render(extra){body.innerHTML=html+extra}
  function typeCmd(){
    const s=script[si];
    if(ci<=s.cmd.length){
      render(`<div class="line">${prompt()}<span class="o">${s.cmd.slice(0,ci)}</span><span class="crsr"></span></div>`);
      ci++;setTimeout(typeCmd,34+Math.random()*46);
    }else{
      html+=`<div class="line">${prompt()}<span class="o">${s.cmd}</span></div>`;
      s.out.forEach(([c,t])=>html+=`<div class="line"><span class="${c}">${t}</span></div>`);
      html+=`<div class="line">&nbsp;</div>`;
      si++;ci=0;
      if(si<script.length){render("");setTimeout(typeCmd,420)}
      else render(`<div class="line">${prompt()}<span class="crsr"></span></div>`);
    }
  }
  setTimeout(typeCmd,1150); /* wait for the CRT power-on to finish */
})();

/* =============== 3D data tunnel =============== */
(function(){
  if(typeof THREE==='undefined')return;
  const canvas=document.getElementById('tunnel');
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  const scene=new THREE.Scene();
  scene.fog=new THREE.FogExp2(0x0A0906,.06);
  const camera=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,.1,120);

  const AMBER=0xFFB000,DIMA=0x6b4c0e;
  const SEG=42,GAP=3.2,LEN=SEG*GAP;

  /* octagonal wireframe rings */
  const rings=[];
  for(let i=0;i<SEG;i++){
    const geo=new THREE.RingGeometry(3.1,3.14,8);
    const mat=new THREE.MeshBasicMaterial({color:i%6===0?AMBER:DIMA,side:THREE.DoubleSide,
      transparent:true,opacity:i%6===0?.75:.4});
    const r=new THREE.Mesh(geo,mat);
    r.position.z=-i*GAP;r.rotation.z=i*.12;
    rings.push(r);scene.add(r);
  }
  /* rails */
  const railMat=new THREE.LineBasicMaterial({color:DIMA,transparent:true,opacity:.5});
  for(let k=0;k<8;k++){
    const a=k/8*Math.PI*2+Math.PI/8;
    const pts=[new THREE.Vector3(Math.cos(a)*3.12,Math.sin(a)*3.12,4),
               new THREE.Vector3(Math.cos(a)*3.12,Math.sin(a)*3.12,-LEN)];
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),railMat));
  }
  /* data packets flying past */
  const PN=420,pg=new THREE.BufferGeometry(),pp=new Float32Array(PN*3),spd=new Float32Array(PN);
  for(let i=0;i<PN;i++){
    const a=Math.random()*Math.PI*2,r=.4+Math.random()*2.4;
    pp[i*3]=Math.cos(a)*r;pp[i*3+1]=Math.sin(a)*r;pp[i*3+2]=-Math.random()*LEN;
    spd[i]=.08+Math.random()*.3;
  }
  pg.setAttribute('position',new THREE.BufferAttribute(pp,3));
  const packets=new THREE.Points(pg,new THREE.PointsMaterial({color:0xFFD24D,size:.06,
    transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false}));
  scene.add(packets);

  const mouse={x:0,y:0};
  addEventListener('pointermove',e=>{
    mouse.x=(e.clientX/innerWidth-.5)*2;
    mouse.y=(e.clientY/innerHeight-.5)*2;
  });

  let scrollT=0,depthShown=0;
  const depthEl=document.getElementById('depth');
  addEventListener('scroll',()=>{
    const max=document.body.scrollHeight-innerHeight;
    scrollT=max>0?scrollY/max:0;
    if(reduce)depthEl.textContent="depth: "+String(Math.round(scrollT*LEN*10)).padStart(4,'0')+" m";
  },{passive:true});

  function resize(){renderer.setSize(innerWidth,innerHeight);
    camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}
  addEventListener('resize',resize);resize();

  const clock=new THREE.Clock();
  function animate(){
    const t=clock.getElapsedTime();
    /* camera flies through the tunnel with scroll; mouse steers */
    const targetZ=2-scrollT*(LEN-14);
    camera.position.z+=(targetZ-camera.position.z)*.06;
    camera.position.x+=((mouse.x*1.0)-camera.position.x)*.05;
    camera.position.y+=((-mouse.y*.8)-camera.position.y)*.05;
    camera.lookAt(camera.position.x*.35,camera.position.y*.35,camera.position.z-12);
    rings.forEach((r,i)=>{r.rotation.z=i*.12+t*.05*(i%2?1:-1)});
    /* recycle packets toward the camera */
    const arr=pg.attributes.position.array;
    for(let i=0;i<PN;i++){
      arr[i*3+2]+=spd[i];
      if(arr[i*3+2]>camera.position.z+4)arr[i*3+2]=camera.position.z-LEN*.8;
    }
    pg.attributes.position.needsUpdate=true;
    /* depth readout eases toward the scroll target, like the camera */
    depthShown+=(scrollT*LEN*10-depthShown)*.08;
    depthEl.textContent="depth: "+String(Math.round(depthShown)).padStart(4,'0')+" m";
    renderer.render(scene,camera);
    if(!reduce)requestAnimationFrame(animate);
  }
  if(reduce){camera.position.set(0,0,2);camera.lookAt(0,0,-12);renderer.render(scene,camera)}
  else animate();
})();

/* =============== reveal + decode + meters =============== */
/* index children of .stag containers for staggered line-by-line entry */
document.querySelectorAll('.stag').forEach(s=>
  [...s.children].forEach((c,i)=>c.style.setProperty('--i',i)));
if(!reduce)document.querySelectorAll('.pct').forEach(p=>p.textContent='0%');

/* headings resolve out of phosphor noise, left to right */
const GLYPHS="█▓▒░<>/\\|#$%&";
function decode(el){
  const txt=el.textContent,total=Math.max(12,txt.length*1.7);let f=0;
  (function step(){
    f++;
    const done=Math.min(txt.length,Math.floor(txt.length*f/total));
    let out=txt.slice(0,done);
    for(let i=done;i<txt.length;i++)out+=txt[i]===' '?' ':GLYPHS[Math.random()*GLYPHS.length|0];
    el.textContent=out;
    if(done<txt.length)setTimeout(step,26);
  })();
}
function countUp(el,target,dur){
  const t0=performance.now();
  (function tick(){
    const p=Math.min(1,(performance.now()-t0)/dur),e=1-Math.pow(1-p,3);
    el.textContent=Math.round(target*e)+"%";
    if(p<1)requestAnimationFrame(tick);
  })();
}

const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;
  const el=e.target;
  el.classList.add('on');
  const h2=el.querySelector('h2');
  if(h2&&!reduce)decode(h2);
  el.querySelectorAll('.row').forEach((row,i)=>{
    const m=row.querySelector('.meter i'),pct=row.querySelector('.pct');
    if(!m||!pct)return;
    const w=+m.dataset.w;
    if(reduce){m.style.width=w+'%';return}
    const d=i*90+400; /* each meter fills just after its row lands */
    m.style.transitionDelay=d+'ms';
    m.style.width=w+'%';
    setTimeout(()=>countUp(pct,w,1400),d);
  });
  io.unobserve(el);
}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
