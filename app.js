// Site logic: tiles, favorites, themes, settings.
const embed=u=>el=>{
  el.innerHTML='<iframe allowfullscreen allow="fullscreen; gamepad; autoplay" sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-popups"></iframe><div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center"><button class="act" id="fs">Fullscreen</button><a class="act" target="_blank" rel="noopener" href="'+encodeURI(u)+'">Open in new tab</a></div>';
  const f=el.querySelector("iframe");f.src=u;
  el.querySelector("#fs").onclick=()=>f.requestFullscreen&&f.requestFullscreen();
  return()=>{f.src="about:blank"};
};

const origOf=p=>p.replace("/responsive/","/").replace("-xs.",".");
const TI="https://images.twoplayergames.org/files/games/";
// Thumbnail paths on images.twoplayergames.org vary by game, so unknown ones are tried in turn and the one that works is remembered.
const KNOWN={"basket-random":"other/Basket_Random/basket-random.jpg","tank-trouble":"o6/tank-trouble/tank-trouble.jpg"};
function tpgThumbs(title,slug){
  const T=title.replace(/[^A-Za-z0-9 ]/g,"").trim().replace(/ +/g,"_");
  const list=KNOWN[slug]?[KNOWN[slug]]:["other/"+T+"/"+slug+".jpg",...[1,2,3,4,5,6,7,8,9].map(n=>"o"+n+"/"+slug+"/"+slug+".jpg")];
  return list.map(p=>TI+p+"?auto=format&w=300");
}
const GAMES=[
 {title:"Snake",cat:"Arcade",imgs:[SNAKE],mount:snake},
 {title:"Memory Match",cat:"Puzzle",imgs:[CARDS],mount:memory},
 {title:"Tic Tac Toe",cat:"2 Player",imgs:[TTT],mount:ttt},
 {title:"Pong 2 Player",cat:"2 Player",imgs:[PONG],mount:pong},
 {title:"Connect Four",cat:"2 Player",imgs:[C4],mount:connect4},
 ...DATA.map(d=>({title:d[0],cat:d[3],imgs:[IMG+d[2],IMG+origOf(d[2])],mount:embed((d[1][0]==="o"?O:C)+d[1].slice(2))})),
 ...TPG.map(d=>({title:d[0],cat:d[2],two:!!d[3],imgs:tpgThumbs(d[0],d[1]),mount:embed(TP+d[1])}))
];
let cat="All",stop=null,inGame=false;
const BIG=new Set(["Steal Brainrots Multiplayer","Drift King"]);
const $=s=>document.querySelector(s);

// Saved in this browser when storage is allowed; otherwise lasts until the page closes.
const store={get(){try{return JSON.parse(localStorage.getItem("pg-settings")||"{}")}catch(e){return{}}},set(o){try{localStorage.setItem("pg-settings",JSON.stringify(o))}catch(e){}}};
let st=store.get();
const isFav=t=>(st.favs||[]).includes(t);
const inCat=(g,c)=>c==="All"||(c==="Favorites"?isFav(g.title):(g.cat===c||(c==="2 Player"&&!!g.two)));

function chips(){
  const n=$("#chips");n.innerHTML="";
  ["All","Favorites",...new Set(GAMES.map(g=>g.cat))].forEach(c=>{
    const b=document.createElement("button");
    b.append(c);const s=document.createElement("small");s.textContent=GAMES.filter(g=>inCat(g,c)).length;b.append(s);
    b.setAttribute("aria-pressed",c===cat);
    b.onclick=()=>{cat=c;showHome();chips();render()};n.appendChild(b);
  });
}
const STAR='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"/></svg>';
const hue=t=>{let h=0;for(const ch of t)h=(h*31+ch.charCodeAt(0))%360;return h};
const thumbCache=(()=>{try{return JSON.parse(localStorage.getItem("pg-thumbs")||"{}")}catch(e){return{}}})();
function loadThumb(tile,g){
  const list=[...(thumbCache[g.title]?[thumbCache[g.title]]:[]),...g.imgs];
  let i=0;
  const im=document.createElement("img");im.alt="";im.decoding="async";im.loading="lazy";
  im.onload=()=>{
    tile.classList.add("has");
    if(g.imgs.length>1&&im.src!==g.imgs[0]){thumbCache[g.title]=im.src;try{localStorage.setItem("pg-thumbs",JSON.stringify(thumbCache))}catch(e){}}
  };
  im.onerror=()=>{if(++i<list.length)im.src=list[i];else im.remove()};
  im.src=list[0];tile.prepend(im);
}
function cell(g,big){
  const c=document.createElement("div");c.className="cell"+(big?" big":"");
  const b=document.createElement("button");b.className="tile";b.setAttribute("aria-label",g.title);
  b.style.setProperty("--ph",hue(g.title));
  loadThumb(b,g);
  const s=document.createElement("span");s.textContent=g.title;b.append(s);
  b.onclick=()=>open(g);
  const f=document.createElement("button");f.type="button";f.className="star";f.dataset.t=g.title;f.innerHTML=STAR;
  setStar(f);
  f.onclick=e=>{e.stopPropagation();toggleFav(g.title)};
  c.append(b,f);return c;
}
function setStar(f){
  const on=isFav(f.dataset.t);
  f.setAttribute("aria-pressed",on);
  f.setAttribute("aria-label",(on?"Remove ":"Add ")+f.dataset.t+(on?" from favorites":" to favorites"));
}
function toggleFav(t){
  const a=st.favs||[];st.favs=a.includes(t)?a.filter(x=>x!==t):[t,...a];store.set(st);
  document.querySelectorAll(".star").forEach(f=>{if(f.dataset.t===t)setStar(f)});
  renderRows();chips();if(cat==="Favorites")render();
}
function renderRows(){
  const box=$("#rows");box.innerHTML="";
  if(cat!=="All"||$("#q").value.trim())return;
  const by=t=>GAMES.find(g=>g.title===t);
  [["Continue playing",(st.recent||[]).map(by).filter(Boolean)],["Favorites",(st.favs||[]).map(by).filter(Boolean)]].forEach(([name,list])=>{
    if(!list.length)return;
    const h=document.createElement("h3");h.className="rowhead";h.textContent=name;
    const strip=document.createElement("div");strip.className="strip";
    list.slice(0,14).forEach(g=>strip.append(cell(g)));
    box.append(h,strip);
  });
}
function render(){
  const q=$("#q").value.trim().toLowerCase();
  const list=GAMES.filter(g=>inCat(g,cat)&&g.title.toLowerCase().includes(q));
  $("#secName").textContent=cat==="All"?"All games":cat;$("#cnt").textContent=list.length+(list.length===1?" game":" games");
  const grid=$("#grid");grid.innerHTML="";
  renderRows();
  if(!list.length){grid.innerHTML='<p class="empty">'+(cat==="Favorites"&&!q?"No favorites yet. Tap the star on any game to add it.":"No games match.")+'</p>';return}
  list.forEach(g=>grid.appendChild(cell(g,BIG.has(g.title)&&cat==="All"&&!q)));
}
function open(g){
  $("#home").style.display="none";$("#stage").style.display="block";
  $("#gtitle").textContent=g.title;$("#play").innerHTML="";
  st.recent=[g.title,...(st.recent||[]).filter(t=>t!==g.title)].slice(0,14);store.set(st);
  inGame=true;updateDots();
  stop=g.mount($("#play"));scrollTo(0,0);
}
function showHome(){
  if(stop)stop();stop=null;inGame=false;updateDots();
  $("#stage").style.display="none";$("#home").style.display="block";renderRows();
}
$("#back").onclick=()=>{showHome();chips()};
$("#q").oninput=()=>{showHome();render()};
$("#sf").onsubmit=e=>e.preventDefault();
function tab(t){
  $("#games").hidden=t!=="games";$("#settings").hidden=t!=="settings";$("#sf").hidden=t!=="games";
  $("#tG").setAttribute("aria-pressed",t==="games");$("#tS").setAttribute("aria-pressed",t==="settings");
  if(t==="games")showHome();
}
$("#tG").onclick=()=>tab("games");$("#tS").onclick=()=>tab("settings");

// Background dots: three depths that drift upward and twinkle. Paused while a game is open.
const dc=$("#dots"),dx=dc.getContext("2d"),still=matchMedia("(prefers-reduced-motion: reduce)").matches;
let DW=0,DH=0,DP=[],running=false,dotColor="#fff";
function sizeDots(){
  DW=dc.width=innerWidth;DH=dc.height=innerHeight;
  DP=Array.from({length:Math.min(220,Math.round(DW*DH/11000))},()=>{
    const z=Math.random();
    return{x:Math.random()*DW,y:Math.random()*DH,z,r:.4+z*1.7,vx:(Math.random()-.5)*.12*(.4+z),vy:-(.05+z*.32),a:.25+z*.65,t:Math.random()*6.28,ts:.012+Math.random()*.02};
  });
}
function dotFrame(){
  dx.clearRect(0,0,DW,DH);dx.fillStyle=dotColor;dx.shadowColor=dotColor;
  for(const p of DP){
    p.x+=p.vx;p.y+=p.vy;p.t+=p.ts;
    if(p.y<-8){p.y=DH+8;p.x=Math.random()*DW}
    if(p.x<-8)p.x=DW+8;if(p.x>DW+8)p.x=-8;
    dx.globalAlpha=p.a*(.6+.4*Math.sin(p.t));dx.shadowBlur=p.z>.8?10:0;
    dx.beginPath();dx.arc(p.x,p.y,p.r,0,6.2832);dx.fill();
  }
  dx.globalAlpha=1;dx.shadowBlur=0;
  if(running&&!still)requestAnimationFrame(dotFrame);
}
function updateDots(){
  const want=!st.img&&!inGame&&st.dots!==false;
  dc.style.display=want?"block":"none";
  if(want&&!running){running=true;dotFrame()}
  if(!want)running=false;
}
addEventListener("resize",()=>{sizeDots();if(running&&still)dotFrame()});

// Themes: background glow, dot color, and button color.
const THEMES=[
 {id:"midnight",name:"Midnight",h:250,s:90,base:"#04040a",c:["rgba(99,102,241,.32)","rgba(168,85,247,.24)","rgba(34,211,238,.14)"],dot:"#ffffff"},
 {id:"crimson",name:"Crimson",h:352,s:85,base:"#070102",c:["rgba(220,30,60,.36)","rgba(120,10,30,.32)","rgba(255,110,80,.13)"],dot:"#ffe3e6"},
 {id:"neon",name:"Neon",h:300,s:95,base:"#05020d",c:["rgba(217,70,239,.34)","rgba(34,211,238,.26)","rgba(124,58,237,.24)"],dot:"#f7e8ff"},
 {id:"ocean",name:"Ocean",h:195,s:90,base:"#02070c",c:["rgba(14,165,233,.32)","rgba(20,184,166,.24)","rgba(59,130,246,.2)"],dot:"#e6f8ff"},
 {id:"forest",name:"Forest",h:150,s:75,base:"#020805",c:["rgba(16,185,129,.3)","rgba(132,204,22,.15)","rgba(20,184,166,.2)"],dot:"#eafff3"},
 {id:"sunset",name:"Sunset",h:24,s:95,base:"#0a0305",c:["rgba(249,115,22,.32)","rgba(236,72,153,.28)","rgba(250,204,21,.13)"],dot:"#fff1e6"},
 {id:"graphite",name:"Graphite",h:240,s:6,base:"#050506",c:["rgba(148,163,184,.22)","rgba(100,116,139,.2)","rgba(203,213,225,.12)"],dot:"#ffffff"}
];
const aura=t=>"radial-gradient(50% 45% at 12% 12%,"+t.c[0]+",transparent 70%),radial-gradient(45% 40% at 88% 80%,"+t.c[1]+",transparent 70%),radial-gradient(35% 30% at 72% 18%,"+t.c[2]+",transparent 70%)";
const theme=()=>THEMES.find(x=>x.id===st.theme)||THEMES[0];
function swatches(){
  const w=$("#sw");w.innerHTML="";
  THEMES.forEach(t=>{
    const d=document.createElement("div");
    const b=document.createElement("button");b.type="button";b.dataset.id=t.id;b.setAttribute("aria-label",t.name);
    b.style.background=aura(t)+","+t.base;
    b.onclick=()=>{st.theme=t.id;store.set(st);applyBg()};
    const l=document.createElement("span");l.textContent=t.name;
    d.append(b,l);w.appendChild(d);
  });
}
const msg=t=>{$("#bgmsg").textContent=t};
function applyBg(){
  const t=theme(),root=document.documentElement,b=$("#bg");
  root.style.setProperty("--h",t.h);root.style.setProperty("--s",t.s+"%");
  dotColor=t.dot;
  if(st.img){b.classList.add("pic");b.style.background='#000 center / cover no-repeat url("'+st.img+'")'}
  else{b.classList.remove("pic");b.style.background=t.base;b.style.setProperty("--aura",aura(t))}
  $("#dimEl").style.opacity=st.img?(st.dim||0)/100:0;
  $("#dim").value=st.dim||0;$("#dotsToggle").checked=st.dots!==false;
  document.querySelectorAll("#sw button").forEach(x=>x.setAttribute("aria-pressed",x.dataset.id===t.id));
  updateDots();
}
$("#bgfile").onchange=e=>{
  const f=e.target.files[0];if(!f)return;
  if(!f.type.startsWith("image/")){msg("Please choose a picture file.");return}
  msg("Loading...");
  const r=new FileReader();
  r.onload=()=>{
    const im=new Image();
    im.onload=()=>{
      const k=Math.min(1,1920/Math.max(im.width,im.height));
      const c=document.createElement("canvas");c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);
      c.getContext("2d").drawImage(im,0,0,c.width,c.height);
      st.img=c.toDataURL("image/jpeg",.85);store.set(st);applyBg();msg("Background updated.");e.target.value="";
    };
    im.onerror=()=>msg("Couldn't read that picture.");
    im.src=r.result;
  };
  r.onerror=()=>msg("Couldn't read that file.");
  r.readAsDataURL(f);
};
$("#bgf").onsubmit=e=>{
  e.preventDefault();
  let u;try{u=new URL($("#bgu").value.trim())}catch(err){msg("That doesn't look like a link.");return}
  if(u.protocol!=="https:"){msg("Use a link that starts with https://");return}
  msg("Loading...");
  const im=new Image();
  im.onload=()=>{st.img=u.href;store.set(st);applyBg();msg("Background updated.")};
  im.onerror=()=>msg("Couldn't load that image. Make sure the link goes straight to an image file.");
  im.src=u.href;
};
$("#rmimg").onclick=()=>{delete st.img;store.set(st);$("#bgu").value="";applyBg();msg("Picture removed.")};
$("#dim").oninput=e=>{st.dim=+e.target.value;store.set(st);applyBg()};
$("#dotsToggle").onchange=e=>{st.dots=e.target.checked;store.set(st);applyBg()};
const gmsg=t=>{$("#gmsg").textContent=t};
$("#clrRecent").onclick=()=>{st.recent=[];store.set(st);renderRows();gmsg("Recently played cleared.")};
$("#clrFav").onclick=()=>{st.favs=[];store.set(st);document.querySelectorAll(".star").forEach(setStar);renderRows();chips();if(cat==="Favorites")render();gmsg("Favorites cleared.")};
$("#rst").onclick=()=>{st={};store.set(st);$("#bgu").value="";applyBg();renderRows();chips();render();msg("");gmsg("Settings reset.")};
swatches();sizeDots();applyBg();

$("#add").onsubmit=e=>{
  e.preventDefault();
  GAMES.push({title:$("#an").value.trim(),cat:"Arcade",img:"",mount:embed($("#au").value.trim())});
  $("#an").value=$("#au").value="";chips();render();
};
addEventListener("keydown",e=>{
  const tag=(e.target.tagName||"").toLowerCase();
  if(e.key==="/"&&tag!=="input"&&tag!=="textarea"){e.preventDefault();tab("games");$("#q").focus()}
  if(e.key==="Escape"&&inGame)$("#back").click();
});
chips();render();
