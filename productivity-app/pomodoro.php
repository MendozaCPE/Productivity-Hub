<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Pomodoro – Productivity Hub</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@500;700&display=swap" rel="stylesheet">

<style>
/* ================= BASE ================= */
:root{
    --bg:#191716;
    --surface:#231f1c;
    --surface-light:#2c2724;
    --border:rgba(234,221,207,.08);
    --text:#eaddcf;
    --muted:#a89f91;
    --accent:#c67c4e;
}

*{box-sizing:border-box;margin:0;padding:0}

body{
    font-family:Inter,sans-serif;
    background:radial-gradient(circle at top,#2a2522,#191716);
    color:var(--text);
}

.container{display:flex;min-height:100vh}

/* ================= SIDEBAR ================= */
.sidebar{
    width:260px;
    background:rgba(35,31,28,.96);
    border-right:1px solid var(--border);
    padding:2.5rem 2rem;
    display:flex;
    flex-direction:column;
}

.logo{
    font-family:Outfit;
    display:flex;
    gap:.75rem;
    align-items:center;
    margin-bottom:3rem;
}

.nav-menu{
    display:flex;
    flex-direction:column;
    gap:1rem;
    flex:1;
}

.nav-item{
    padding:1rem;
    border-radius:14px;
    text-decoration:none;
    color:var(--muted);
}

.nav-item.active{
    background:rgba(198,124,78,.2);
    color:var(--accent);
    font-weight:700;
}

/* ================= MAIN ================= */
.main{
    flex:1;
    padding:3rem;
}

h1{
    font-family:Outfit;
    font-size:2.2rem;
}

.subtitle{
    color:var(--muted);
    margin-bottom:2rem;
}

/* ================= CARD ================= */
.card{
    background:var(--surface);
    border:1px solid var(--border);
    border-radius:32px;
    padding:3rem;
    width:520px;
    margin:auto;
    text-align:center;
}

/* ================= FOCUS TASK ================= */
.focus-task{
    background:var(--surface-light);
    padding:1rem;
    border-radius:16px;
    margin-bottom:1.5rem;
}

.focus-task input{
    width:100%;
    background:transparent;
    border:none;
    color:var(--text);
    text-align:center;
    font-size:.95rem;
}

/* ================= TIMER ================= */
.timer{
    font-family:Outfit;
    font-size:3.4rem;
    margin-bottom:.5rem;
}

.timer-msg{
    font-size:.8rem;
    color:var(--muted);
    margin-bottom:1rem;
}

/* ================= PIXEL CUP ================= */
.coffee-stage{
    position:relative;
    width:200px;
    height:220px;
    margin:1.5rem auto;
}

.cup{
    position:absolute;
    bottom:24px;
    left:50%;
    transform:translateX(-50%);
    width:120px;
    height:90px;
    background:#e6dccf;
    border:4px solid #b8a999;
}

.cup::after{
    content:"";
    position:absolute;
    right:-20px;
    top:22px;
    width:20px;
    height:36px;
    background:#e6dccf;
    border:4px solid #b8a999;
}

.liquid{
    position:absolute;
    bottom:0;
    width:100%;
    height:0%;
    background:#5a3a22;
    transition:height .25s steps(10);
}

.saucer{
    position:absolute;
    bottom:8px;
    left:50%;
    transform:translateX(-50%);
    width:160px;
    height:16px;
    background:#cbbca8;
    border:4px solid #9d8f7a;
}

/* ================= CUP MOOD ================= */
.cup::before{
    content:"😴";
    position:absolute;
    top:30px;
    left:50%;
    transform:translateX(-50%);
    font-size:16px;
}

.cup.focus::before{content:"🙂"}
.cup.fire::before{content:"🔥"}
.cup.done::before{content:"🎉"}

/* ================= CONTROLS ================= */
.controls{
    display:flex;
    justify-content:center;
    gap:1rem;
    margin-top:1.5rem;
}

button{
    padding:.8rem 2rem;
    border-radius:999px;
    border:none;
    cursor:pointer;
    font-weight:600;
}

.primary{background:var(--accent);color:#fff}
.secondary{background:transparent;border:1px solid var(--border);color:var(--muted)}

/* ================= STATS ================= */
.stats{
    margin-top:2rem;
    font-size:.85rem;
    color:var(--muted);
}

/* ================= REFLECTION ================= */
.reflection{
    display:none;
    margin-top:1.5rem;
}

.reflection button{
    margin:.3rem;
}
</style>
</head>

<body>
<div class="container">

<aside class="sidebar">
    <div class="logo">⚡ ProductivityHub</div>
    <nav class="nav-menu">
        <a class="nav-item">Dashboard</a>
        <a class="nav-item active">Pomodoro</a>
        <a class="nav-item">Habits</a>
        <a class="nav-item">Tasks</a>
        <a class="nav-item">Goals</a>
    </nav>
</aside>

<main class="main">
    <h1>Pomodoro</h1>
    <p class="subtitle">Brew your focus ☕</p>

    <div class="card">

        <!-- WHY -->
        <div class="focus-task">
            <input id="focusInput" placeholder="What are you focusing on?" />
        </div>

        <!-- TIMER -->
        <div class="timer" id="time">25:00</div>
        <div class="timer-msg" id="msg">Ready to brew.</div>

        <!-- CUP -->
        <div class="coffee-stage">
            <div class="cup" id="cup">
                <div class="liquid" id="liquid"></div>
            </div>
            <div class="saucer"></div>
        </div>

        <!-- CONTROLS -->
        <div class="controls">
            <button class="primary" id="start">Start</button>
            <button class="secondary" id="reset">Reset</button>
        </div>

        <!-- STATS -->
        <div class="stats">
            ☕ Brews Completed: <span id="brews">0</span>
        </div>

        <!-- REFLECTION -->
        <div class="reflection" id="reflection">
            <p>How was your focus?</p>
            <button onclick="saveFocus('good')">👍 Good</button>
            <button onclick="saveFocus('ok')">😐 Okay</button>
            <button onclick="saveFocus('bad')">👎 Poor</button>
        </div>

    </div>
</main>
</div>

<script>
const TOTAL=25*60;
let remaining=TOTAL, running=false, last=null;
const liquid=document.getElementById("liquid");
const timeEl=document.getElementById("time");
const msg=document.getElementById("msg");
const cup=document.getElementById("cup");
const brewsEl=document.getElementById("brews");
const reflection=document.getElementById("reflection");

let brews=Number(localStorage.getItem("brews")||0);
brewsEl.textContent=brews;

function format(t){
    const m=Math.floor(t/60);
    const s=Math.floor(t%60);
    return `${m}:${String(s).padStart(2,"0")}`;
}

function animate(ts){
    if(!running)return;
    if(!last)last=ts;
    const d=(ts-last)/1000;
    last=ts;
    remaining=Math.max(0,remaining-d);

    const p=1-remaining/TOTAL;
    liquid.style.height=(p*100)+"%";
    timeEl.textContent=format(remaining);

    if(p>.8){cup.className="cup fire";msg.textContent="Almost done!"}
    else if(p>.3){cup.className="cup focus";msg.textContent="Deep focus zone"}
    else{cup.className="cup";msg.textContent="Warming up"}

    if(remaining>0) requestAnimationFrame(animate);
    else finish();
}

function finish(){
    running=false;
    cup.className="cup done";
    msg.textContent="Session complete!";
    brews++;
    localStorage.setItem("brews",brews);
    brewsEl.textContent=brews;
    reflection.style.display="block";
}

start.onclick=()=>{
    if(!running){
        remaining=TOTAL;
        last=null;
        reflection.style.display="none";
        running=true;
        requestAnimationFrame(animate);
    }
};

reset.onclick=()=>{
    running=false;
    remaining=TOTAL;
    liquid.style.height="0%";
    timeEl.textContent="25:00";
    msg.textContent="Ready to brew.";
    cup.className="cup";
};

function saveFocus(val){
    localStorage.setItem("lastFocus",val);
    reflection.style.display="none";
}
</script>
</body>
</html>
