// Built-in games and their thumbnails.
const thumb=d=>"data:image/svg+xml;utf8,"+encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'>"+d+"</svg>");
const SNAKE=thumb("<rect width='160' height='160' fill='#0f3a40'/><g fill='#2dd4bf'><rect x='30' y='70' width='20' height='20'/><rect x='50' y='70' width='20' height='20'/><rect x='70' y='70' width='20' height='20'/><rect x='70' y='90' width='20' height='20'/><rect x='70' y='110' width='20' height='20'/></g><rect x='110' y='50' width='18' height='18' fill='#f5c518'/>");
const CARDS=thumb("<rect width='160' height='160' fill='#0f766e'/><g fill='#fff'><rect x='22' y='22' width='50' height='50' rx='8'/><rect x='88' y='22' width='50' height='50' rx='8'/><rect x='22' y='88' width='50' height='50' rx='8'/></g><rect x='88' y='88' width='50' height='50' rx='8' fill='#f5c518'/>");
const TTT=thumb("<rect width='160' height='160' fill='#111'/><path d='M60 30v100M100 30v100M30 60h100M30 100h100' stroke='#fff' stroke-width='6' stroke-linecap='round'/><path d='M36 36l18 18M54 36L36 54' stroke='#ff5a6a' stroke-width='6' stroke-linecap='round'/><circle cx='80' cy='80' r='11' fill='none' stroke='#fff' stroke-width='6'/><path d='M106 106l18 18M124 106l-18 18' stroke='#ff5a6a' stroke-width='6' stroke-linecap='round'/>");
const PONG=thumb("<rect width='160' height='160' fill='#000'/><g fill='#fff'><rect x='16' y='50' width='10' height='46' rx='3'/><rect x='134' y='70' width='10' height='46' rx='3'/><circle cx='84' cy='86' r='7'/></g><path d='M80 12v136' stroke='#fff' stroke-width='3' stroke-dasharray='8 8'/>");
const C4=thumb("<rect width='160' height='160' fill='#1d3fa8'/><g stroke='#0a1f66' stroke-width='3'><circle cx='36' cy='40' r='16' fill='#0a1f66'/><circle cx='80' cy='40' r='16' fill='#0a1f66'/><circle cx='124' cy='40' r='16' fill='#0a1f66'/><circle cx='36' cy='84' r='16' fill='#e0182d'/><circle cx='80' cy='84' r='16' fill='#ffd43b'/><circle cx='124' cy='84' r='16' fill='#0a1f66'/><circle cx='36' cy='128' r='16' fill='#ffd43b'/><circle cx='80' cy='128' r='16' fill='#e0182d'/><circle cx='124' cy='128' r='16' fill='#e0182d'/></g>");

function snake(el){
  const N=18,S=20;
  el.innerHTML='<div class="score" id="sc">Score: 0</div><canvas class="g" width="360" height="360"></canvas><div class="pad"><span></span><button data-d="u" aria-label="Up">▲</button><span></span><button data-d="l" aria-label="Left">◀</button><button data-d="d" aria-label="Down">▼</button><button data-d="r" aria-label="Right">▶</button></div><button class="act" id="rs">Restart</button>';
  const cv=el.querySelector("canvas"),x=cv.getContext("2d");
  let s,dir,next,food,score,over,timer;
  const V={u:[0,-1],d:[0,1],l:[-1,0],r:[1,0]};
  function reset(){s=[[9,9],[8,9],[7,9]];dir=next=V.r;score=0;over=false;place();el.querySelector("#sc").textContent="Score: 0";clearInterval(timer);timer=setInterval(tick,120);draw()}
  function place(){do{food=[Math.floor(Math.random()*N),Math.floor(Math.random()*N)]}while(s.some(p=>p[0]===food[0]&&p[1]===food[1]))}
  function turn(d){const v=V[d];if(v[0]!==-dir[0]||v[1]!==-dir[1])next=v}
  function tick(){
    dir=next;const h=[s[0][0]+dir[0],s[0][1]+dir[1]];
    if(h[0]<0||h[1]<0||h[0]>=N||h[1]>=N||s.some(p=>p[0]===h[0]&&p[1]===h[1])){over=true;clearInterval(timer);draw();return}
    s.unshift(h);
    if(h[0]===food[0]&&h[1]===food[1]){score++;el.querySelector("#sc").textContent="Score: "+score;place()}else s.pop();
    draw();
  }
  function draw(){
    x.fillStyle="#0f3a40";x.fillRect(0,0,360,360);
    x.fillStyle="#f5c518";x.fillRect(food[0]*S+3,food[1]*S+3,S-6,S-6);
    s.forEach((p,i)=>{x.fillStyle=i?"#2dd4bf":"#9af5e6";x.fillRect(p[0]*S+1,p[1]*S+1,S-2,S-2)});
    if(over){x.fillStyle="rgba(0,0,0,.6)";x.fillRect(0,0,360,360);x.fillStyle="#fff";x.font="600 28px Fredoka,sans-serif";x.textAlign="center";x.fillText("Game over: "+score,180,185)}
  }
  const keys={ArrowUp:"u",ArrowDown:"d",ArrowLeft:"l",ArrowRight:"r",w:"u",s:"d",a:"l",d:"r"};
  const kd=e=>{if(keys[e.key]){e.preventDefault();turn(keys[e.key])}};
  document.addEventListener("keydown",kd);
  el.querySelectorAll(".pad button").forEach(b=>b.onclick=()=>turn(b.dataset.d));
  el.querySelector("#rs").onclick=reset;
  reset();
  return()=>{clearInterval(timer);document.removeEventListener("keydown",kd)};
}

function memory(el){
  const E=["🦆","🐸","🐢","🐟","🦋","🐞","🌵","🍄"];
  el.innerHTML='<div class="score" id="mv">Moves: 0</div><div class="mem"></div><button class="act" id="rs">Shuffle</button>';
  const box=el.querySelector(".mem");let first=null,lock=false,moves=0,left=8;
  function deal(){
    box.innerHTML="";moves=0;left=8;first=null;lock=false;el.querySelector("#mv").textContent="Moves: 0";
    [...E,...E].sort(()=>Math.random()-.5).forEach(e=>{
      const b=document.createElement("button");b.setAttribute("aria-label","Hidden card");b.textContent="?";
      b.onclick=()=>{
        if(lock||b===first||b.classList.contains("done"))return;
        b.textContent=e;b.classList.add("up");
        if(!first){first=b;return}
        moves++;el.querySelector("#mv").textContent="Moves: "+moves;
        if(first.textContent===e){first.className=b.className="done";first=null;if(--left===0)el.querySelector("#mv").textContent="Solved in "+moves+" moves!"}
        else{lock=true;const a=first;first=null;setTimeout(()=>{a.textContent=b.textContent="?";a.classList.remove("up");b.classList.remove("up");lock=false},700)}
      };
      box.appendChild(b);
    });
  }
  el.querySelector("#rs").onclick=deal;deal();
  return()=>{};
}

function ttt(el){
  el.innerHTML='<div class="score" id="ts"></div><div class="ttt"></div><p class="hint">Two players, one screen. Take turns clicking.</p><button class="act" id="rs">New game</button>';
  const box=el.querySelector(".ttt"),ts=el.querySelector("#ts");let b,turn,done;
  const L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  function reset(){
    b=Array(9).fill("");turn="X";done=false;ts.textContent="X's turn";box.innerHTML="";
    for(let i=0;i<9;i++){
      const c=document.createElement("button");c.setAttribute("aria-label","Square "+(i+1));
      c.onclick=()=>{
        if(done||b[i])return;
        b[i]=turn;c.textContent=turn;
        const w=L.find(l=>l.every(k=>b[k]===turn));
        if(w){done=true;ts.textContent=turn+" wins!";w.forEach(k=>box.children[k].classList.add("win"))}
        else if(b.every(Boolean)){done=true;ts.textContent="Draw!"}
        else{turn=turn==="X"?"O":"X";ts.textContent=turn+"'s turn"}
      };
      box.appendChild(c);
    }
  }
  el.querySelector("#rs").onclick=reset;reset();
  return()=>{};
}
function pong(el){
  el.innerHTML='<div class="score" id="ps"></div><canvas class="g" width="480" height="320"></canvas><p class="hint">Player 1: W and S. Player 2: Up and Down arrows. First to 7 wins.</p><button class="act" id="rs">Restart</button>';
  const cv=el.querySelector("canvas"),x=cv.getContext("2d"),W=480,H=320,PH=60;
  let p1,p2,bx,by,vx,vy,s1,s2,over,raf;const k={};
  const upd=()=>{el.querySelector("#ps").textContent=s1+" : "+s2+(over?(s1>s2?"   Player 1 wins!":"   Player 2 wins!"):"")};
  function serve(d){bx=W/2;by=H/2;vx=4*d;vy=Math.random()*4-2}
  function reset(){p1=p2=H/2-PH/2;s1=s2=0;over=false;serve(Math.random()<.5?1:-1);upd()}
  function step(){
    if(k.w)p1-=5;if(k.s)p1+=5;if(k.ArrowUp)p2-=5;if(k.ArrowDown)p2+=5;
    p1=Math.max(0,Math.min(H-PH,p1));p2=Math.max(0,Math.min(H-PH,p2));
    if(!over){
      bx+=vx;by+=vy;
      if(by<6||by>H-6)vy=-vy;
      if(vx<0&&bx<24&&bx>8&&by>p1&&by<p1+PH){vx=Math.min(9,-vx*1.05);vy+=(by-(p1+PH/2))*.12}
      if(vx>0&&bx>W-24&&bx<W-8&&by>p2&&by<p2+PH){vx=Math.max(-9,-vx*1.05);vy+=(by-(p2+PH/2))*.12}
      vy=Math.max(-7,Math.min(7,vy));
      if(bx<0){s2++;serve(1);upd()}
      if(bx>W){s1++;serve(-1);upd()}
      if(s1>=7||s2>=7){over=true;upd()}
    }
    x.fillStyle="#000";x.fillRect(0,0,W,H);
    x.fillStyle="#fff";for(let y=0;y<H;y+=20)x.fillRect(W/2-1,y,2,10);
    x.fillRect(10,p1,8,PH);x.fillRect(W-18,p2,8,PH);
    x.beginPath();x.arc(bx,by,6,0,7);x.fill();
    raf=requestAnimationFrame(step);
  }
  const key=e=>e.key.length===1?e.key.toLowerCase():e.key;
  const kd=e=>{const q=key(e);if(["w","s","ArrowUp","ArrowDown"].includes(q)){e.preventDefault();k[q]=true}};
  const ku=e=>{k[key(e)]=false};
  addEventListener("keydown",kd);addEventListener("keyup",ku);
  el.querySelector("#rs").onclick=reset;reset();step();
  return()=>{cancelAnimationFrame(raf);removeEventListener("keydown",kd);removeEventListener("keyup",ku)};
}
function connect4(el){
  el.innerHTML='<div class="score" id="cs"></div><div class="c4"></div><p class="hint">Click a column to drop a disc. Get four in a row.</p><button class="act" id="rs">New game</button>';
  const box=el.querySelector(".c4"),cs=el.querySelector("#cs");let g,t,done;
  const nm=n=>n===1?"Red":"Yellow";
  function reset(){g=Array.from({length:6},()=>Array(7).fill(0));t=1;done=false;cs.textContent="Red's turn";draw()}
  function draw(){
    box.innerHTML="";
    for(let r=0;r<6;r++)for(let c=0;c<7;c++){
      const b=document.createElement("button");b.setAttribute("aria-label","Column "+(c+1));
      b.className="d"+g[r][c];b.onclick=()=>drop(c);box.appendChild(b);
    }
  }
  function win(r,c){
    const p=g[r][c];
    return [[0,1],[1,0],[1,1],[1,-1]].some(([dr,dc])=>{
      let n=1;
      for(const s of [1,-1]){let i=r+dr*s,j=c+dc*s;while(i>=0&&i<6&&j>=0&&j<7&&g[i][j]===p){n++;i+=dr*s;j+=dc*s}}
      return n>=4;
    });
  }
  function drop(c){
    if(done)return;
    for(let r=5;r>=0;r--)if(!g[r][c]){
      g[r][c]=t;
      if(win(r,c)){done=true;cs.textContent=nm(t)+" wins!"}
      else if(g[0].every(Boolean)){done=true;cs.textContent="Draw!"}
      else{t=3-t;cs.textContent=nm(t)+"'s turn"}
      draw();return;
    }
  }
  el.querySelector("#rs").onclick=reset;reset();
  return()=>{};
}
