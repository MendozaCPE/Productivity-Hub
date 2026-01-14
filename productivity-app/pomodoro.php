<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Productivity Hub – Pomodoro</title>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@500;700&display=swap" rel="stylesheet">

<style>
/* ================= THEME ================= */
:root{
    --bg:#191716;
    --surface-dark:#231f1c;
    --surface-light:#2c2724;
    --surface-hover:#36302c;
    --border:rgba(234,221,207,.08);
    --text-primary:#eaddcf;
    --text-secondary:#a89f91;
    --accent:#c67c4e;
    --accent-glow:rgba(198,124,78,.45);
    --font-heading:'Outfit',sans-serif;
    --font-body:'Inter',sans-serif;
}

*{box-sizing:border-box;margin:0;padding:0}

body{
    font-family:var(--font-body);
    background:radial-gradient(circle at top,#2a2522,#191716);
    color:var(--text-primary);
    min-height:100vh;
}

.container{display:flex;min-height:100vh}

/* ================= SIDEBAR ================= */
.sidebar{
    width:280px;
    background:rgba(35,31,28,.96);
    border-right:1px solid var(--border);
    padding:3rem 2rem;
    display:flex;
    flex-direction:column;
}

.logo{
    display:flex;
    align-items:center;
    gap:.75rem;
    margin-bottom:4rem;
    font-family:var(--font-heading);
}

.logo-icon{
    font-size:1.6rem;
    filter:drop-shadow(0 0 10px var(--accent-glow));
}

.logo h1{
    font-size:.95rem;
    letter-spacing:.12em;
    text-transform:uppercase;
}

.nav-menu{
    display:flex;
    flex-direction:column;
    gap:1.1rem;
    flex:1;
}

.nav-item{
    padding:1rem 1.25rem;
    border-radius:16px;
    text-decoration:none;
    color:var(--text-secondary);
    transition:.3s;
}

.nav-item:hover{
    background:rgba(255,255,255,.04);
    transform:translateX(6px);
}

.nav-item.active{
    background:rgba(198,124,78,.18);
    color:var(--accent);
    font-weight:700;
}

.sidebar-footer{font-weight:600}

/* ================= MAIN ================= */
.main-content{flex:1;padding:4rem}

.page-title{
    font-family:var(--font-heading);
    font-size:2.4rem;
}

.page-subtitle{color:var(--text-secondary)}

.pomodoro-container{
    display:flex;
    justify-content:center;
    margin-top:4rem;
}

.pomodoro-card{
    width:520px;
    padding:4rem 3rem;
    background:var(--surface-dark);
    border:1px solid var(--border);
    border-radius:36px;
    text-align:center;
    box-shadow:0 40px 80px rgba(0,0,0,.55);
}

/* ================= MODE SELECT ================= */
.timer-mode-selector{
    display:inline-flex;
    background:var(--surface-light);
    padding:.4rem;
    border-radius:999px;
    margin-bottom:2.5rem;
}

.mode-btn{
    border:none;
    background:transparent;
    padding:.5rem 1.4rem;
    border-radius:999px;
    color:var(--text-secondary);
    cursor:pointer;
}

.mode-btn.active{
    background:var(--surface-hover);
    color:var(--accent);
}

/* ================= COFFEE STAGE ================= */
.coffee-stage{
    position:relative;
    width:260px;
    height:260px;
    margin:auto;
}

/* TIMER */
.timer-overlay{
    position:absolute;
    top:60px;
    left:50%;
    transform:translateX(-50%);
    text-align:center;
    z-index:5;
}

.timer-time{
    font-family:var(--font-heading);
    font-size:3.2rem;
    color:#fff;
}

.timer-label{
    font-size:.7rem;
    letter-spacing:.35em;
    opacity:.75;
}

/* ================================================= */
/* ========== PIXELATED CUP (ONLY PART) ============ */
/* ================================================= */

.coffee-cup{
    position:absolute;
    bottom:24px;
    left:50%;
    transform:translateX(-50%);
    width:120px;
    height:90px;

    background:#e6dccf;
    border:4px solid #b8a999;
    border-radius:0;
    overflow:hidden;

    image-rendering:pixelated;
}

/* coffee fill */
.coffee-liquid{
    position:absolute;
    bottom:0;
    width:100%;
    height:0%;
    background:#5a3a22;
    transition:height .25s steps(10);
}

.coffee-surface{
    position:absolute;
    top:-6px;
    width:100%;
    height:6px;
    background:#8a5a3a;
}

/* handle */
.coffee-cup::after{
    content:"";
    position:absolute;
    right:-20px;
    top:24px;
    width:20px;
    height:36px;
    background:#e6dccf;
    border:4px solid #b8a999;
}

/* saucer */
.cup-holder{
    position:absolute;
    bottom:8px;
    left:50%;
    transform:translateX(-50%);
    width:160px;
    height:16px;
    background:#cbbca8;
    border:4px solid #9d8f7a;
}

/* steam */
.steam span{
    position:absolute;
    bottom:120px;
    left:50%;
    width:8px;
    height:16px;
    background:#d8d0c5;
    opacity:0;
    animation:steam 2s steps(2) infinite;
}

.steam span:nth-child(1){margin-left:-16px}
.steam span:nth-child(2){animation-delay:1s}
.steam span:nth-child(3){margin-left:16px;animation-delay:.5s}

@keyframes steam{
    0%{opacity:0;transform:translateY(0)}
    50%{opacity:1}
    100%{opacity:0;transform:translateY(-16px)}
}

/* ================= BUTTONS ================= */
.timer-controls{
    display:flex;
    justify-content:center;
    gap:1.5rem;
    margin-top:2.5rem;
}

.btn-primary,.btn-secondary{
    padding:.8rem 2.2rem;
    border-radius:999px;
    border:none;
    font-weight:600;
    cursor:pointer;
}

.btn-primary{
    background:var(--accent);
    color:#fff;
    box-shadow:0 0 25px var(--accent-glow);
}

.btn-secondary{
    background:transparent;
    border:1px solid var(--border);
    color:var(--text-secondary);
}
</style>
</head>

<body>
<div class="container">

<!-- SIDEBAR -->
<aside class="sidebar">
    <div class="logo">
        <div class="logo-icon">⚡</div>
        <h1>ProductivityHub</h1>
    </div>

    <nav class="nav-menu">
        <a class="nav-item">📊 Dashboard</a>
        <a class="nav-item active">☕ Pomodoro</a>
        <a class="nav-item">✨ Habits</a>
        <a class="nav-item">✓ Tasks</a>
        <a class="nav-item">🎯 Goals</a>
        <a class="nav-item">🧘 Focus</a>
    </nav>

    <div class="sidebar-footer">🔥 Day Streak: 0</div>
</aside>

<!-- MAIN -->
<main class="main-content">
    <h2 class="page-title">Pomodoro Timer</h2>
    <p class="page-subtitle">Brew your productivity ☕</p>

    <div class="pomodoro-container">
        <div class="pomodoro-card">

            <div class="timer-mode-selector">
                <button class="mode-btn active">Brew</button>
                <button class="mode-btn">Sip</button>
                <button class="mode-btn">Refill</button>
            </div>

            <div class="coffee-stage">

                <div class="timer-overlay">
                    <div class="timer-time" id="time">25:00</div>
                    <div class="timer-label">FOCUS TIME</div>
                </div>

                <div class="coffee-cup">
                    <div class="coffee-liquid" id="coffee">
                        <div class="coffee-surface"></div>
                    </div>
                </div>

                <div class="cup-holder"></div>

                <div class="steam">
                    <span></span><span></span><span></span>
                </div>

            </div>

            <div class="timer-controls">
                <button class="btn-primary" id="start">Start</button>
                <button class="btn-secondary" id="reset">Reset</button>
            </div>

        </div>
    </div>
</main>
</div>

<script>
const TOTAL=25*60;
let remaining=TOTAL,running=false,last=null;
const coffee=document.getElementById("coffee");
const timeEl=document.getElementById("time");

function format(t){
    const m=Math.floor(t/60);
    const s=Math.floor(t%60);
    return `${m}:${String(s).padStart(2,"0")}`;
}

function animate(ts){
    if(!running)return;
    if(!last)last=ts;
    const delta=(ts-last)/1000;
    last=ts;

    remaining=Math.max(0,remaining-delta);
    coffee.style.height=((1-remaining/TOTAL)*100)+"%";
    timeEl.textContent=format(remaining);

    if(remaining>0)requestAnimationFrame(animate);
}

start.onclick=()=>{
    if(!running){
        running=true;
        last=null;
        requestAnimationFrame(animate);
    }
};

reset.onclick=()=>{
    running=false;
    remaining=TOTAL;
    coffee.style.height="0%";
    timeEl.textContent="25:00";
};
</script>
</body>
</html>
