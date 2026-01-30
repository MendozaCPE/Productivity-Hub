<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Productivity Hub – Pomodoro</title>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/global.css">

<style>
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

/* fullscreen base */
.pomodoro-card:fullscreen{
    width:100%;
    height:100%;
    border-radius:0;
    display:flex;
    flex-direction:column;
    justify-content:flex-start;
    padding-top:8rem;
}

/* ================= MODE SELECT ================= */
.timer-mode-selector{
    display:flex;
    justify-content:center;
    align-items:center;
    gap:.6rem;
    background:var(--surface-light);
    padding:.6rem;
    border-radius:999px;
    margin:0 auto 3rem auto;
    width:fit-content;
}

.mode-btn{
    border:none;
    background:transparent;
    padding:.7rem 1.8rem;
    border-radius:999px;
    color:var(--text-secondary);
    cursor:pointer;
    font-size:.9rem;
    font-weight:500;
}

.mode-btn.active{
    background:var(--surface-hover);
    color:var(--accent);
}

/* ================= COFFEE STAGE ================= */
.coffee-stage{
    position:relative;
    width:340px;
    height:340px;
    margin:auto;
}

/* TIMER */
.timer-overlay{
    position:absolute;
    top:0px;
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

/* CUP */
.coffee-cup{
    position:absolute;
    bottom:40px;
    left:50%;
    transform:translateX(-50%);
    width:180px;
    height:130px;
    background:#e6dccf;
    border:5px solid #b8a999;
    overflow:visible;
    image-rendering:pixelated;
    cursor:pointer;
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

/* mug ear outer */
.coffee-cup::after{
    content:"";
    position:absolute;
    right:-46px;
    top:28px;
    width:46px;
    height:72px;
    background:#e6dccf;
    border:5px solid #b8a999;
    border-radius:6px;
    z-index:2;
}

/* mug ear hole */
.coffee-cup::before{
    content:"";
    position:absolute;
    right:-34px;
    top:40px;
    width:26px;
    height:44px;
    background:var(--bg);
    border-radius:4px;
    z-index:3;
}

/* saucer */
.cup-holder{
    position:absolute;
    bottom:18px;
    left:50%;
    transform:translateX(-50%);
    width:220px;
    height:20px;
    background:#cbbca8;
    border:5px solid #9d8f7a;
}

/* steam */
.steam span{
    position:absolute;
    bottom:190px;
    left:50%;
    width:10px;
    height:20px;
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

/* ================= FULLSCREEN FIXES ================= */
.pomodoro-card:fullscreen .timer-overlay{top:-50px}
.pomodoro-card:fullscreen .coffee-stage{margin-top:12rem;transform:scale(1.9)}
.pomodoro-card:fullscreen .coffee-cup::before{background:#191716}
.pomodoro-card:fullscreen .steam span{bottom:200px}
.pomodoro-card:fullscreen .timer-time{font-size:3rem}
.pomodoro-card:fullscreen .timer-label{font-size:1.05rem;margin-top:.6rem}

.pomodoro-card:fullscreen .timer-mode-selector{padding:1rem;margin-bottom:4rem}
.pomodoro-card:fullscreen .mode-btn{padding:1rem 2.4rem;font-size:1.05rem}

/* ================= PIXEL ART CUP OVERRIDES ================= */

/* body */
.coffee-cup{
    background:#e9edf9;
    outline:4px solid #1e1e1e;
    outline-offset:-4px;
    box-shadow:
        inset -6px 0 0 #c7d0f0,
        inset 6px 0 0 #ffffff,
        inset 0 -6px 0 #b8c1e6,
        inset 0 6px 0 #ffffff;
}

/* handle */
.coffee-cup::after{
    background:#e9edf9;
    outline:4px solid #1e1e1e;
}

.coffee-cup::before{
    background:var(--bg);
    outline:4px solid #1e1e1e;
}

/* coffee liquid */
.coffee-liquid{
    background:#4a2f1c;
    box-shadow:
        inset 0 6px 0 #6b4026,
        inset 0 -6px 0 #2f1a0f;
}

/* coffee surface */
.coffee-surface{
    background:#6b4026;
    height:8px;
}

/* steam slightly chunkier */
.steam span{
    width:14px;
    height:26px;
}
/* ================= PIXEL MODE ICONS ================= */
.pixel-icon{
    width:18px;
    height:18px;
    position:relative;
    image-rendering:pixelated;
}

/* BREW */
.pixel-icon.brew{
    background:#cfa57a;
    outline:2px solid #1c1c1c;
    box-shadow:
        inset 0 -4px 0 #a87c52,
        inset 0 4px 0 #e7c39c;
}
.pixel-icon.brew::after{
    content:"";
    position:absolute;
    top:-4px;
    left:2px;
    width:14px;
    height:4px;
    background:#f2e6d8;
    outline:2px solid #1c1c1c;
}

/* SIP */
.pixel-icon.sip{
    background:#eef1ff;
    outline:2px solid #1c1c1c;
}
.pixel-icon.sip::after{
    content:"";
    position:absolute;
    right:-6px;
    top:4px;
    width:6px;
    height:10px;
    background:#eef1ff;
    outline:2px solid #1c1c1c;
}

/* REFILL */
.pixel-icon.refill{
    background:#5a3a22;
    outline:2px solid #1c1c1c;
}
.pixel-icon.refill::after{
    content:"";
    position:absolute;
    right:-6px;
    top:6px;
    width:6px;
    height:6px;
    background:#5a3a22;
    outline:2px solid #1c1c1c;
}
/* ================= MODE BUTTON SPACING FIX ================= */

/* better internal spacing */
.mode-btn{
    padding:.8rem 2rem;
    line-height:1;
}

/* icon–text separation */
.mode-btn span:last-child{
    margin-left:.3rem;
}

/* center icons perfectly */
.pixel-icon{
    display:inline-block;
    flex-shrink:0;
}

/* slightly more breathing room inside the pill */
.timer-mode-selector{
    gap:.8rem;
    padding:.7rem;
}

</style>
</head>

<body>
<div class="container">

<aside class="sidebar">
    <div class="logo">
        <div class="logo-icon">⚡</div>
        <h1>ProductivityHub</h1>
    </div>

    <nav class="nav-menu">
        <a href="dashboard.php" class="nav-item"><span class="nav-icon">📊</span><span class="nav-label">Dashboard</span></a>
        <a href="pomodoro.php" class="nav-item active"><span class="nav-icon">☕</span><span class="nav-label">Pomodoro</span></a>
        <a href="habits.php" class="nav-item"><span class="nav-icon">✨</span><span class="nav-label">Habits</span></a>
        <a href="tasks.php" class="nav-item"><span class="nav-icon">✓</span><span class="nav-label">Tasks</span></a>
        <a href="goals.php" class="nav-item"><span class="nav-icon">🎯</span><span class="nav-label">Goals</span></a>
        <a href="focus.php" class="nav-item"><span class="nav-icon">🧘</span><span class="nav-label">Focus</span></a>
    </nav>

    <div class="sidebar-footer">
        <div class="streak-badge" style="background:transparent;border:none;padding:0">
            <span style="font-size:1.2rem">🔥</span>
            <span style="font-weight:700;color:var(--text-primary)">
                Day Streak: <span id="currentStreak">0</span>
            </span>
        </div>
    </div>
</aside>

<main class="main-content">
    <h2 class="page-title">Pomodoro Timer</h2>
    <p class="page-subtitle">Brew your productivity ☕</p>

    <div class="pomodoro-container">
        <div class="pomodoro-card" id="pomodoroCard">

            <div class="timer-mode-selector">
                <button class="mode-btn active" data-mode="work">
                    <span class="pixel-icon brew"></span>
                    <span>Brew</span>
                </button>
                <button class="mode-btn" data-mode="short">
                    <span class="pixel-icon sip"></span>
                    <span>Sip</span>
                </button>
                <button class="mode-btn" data-mode="long">
                    <span class="pixel-icon refill"></span>
                    <span>Refill</span>
                </button>
            </div>

            <div class="coffee-stage">
                <div class="timer-overlay">
                    <div class="timer-time" id="timerDisplay">25:00</div>
                    <div class="timer-label" id="timerLabel">FOCUS TIME</div>
                </div>

                <div class="coffee-cup" id="fullscreenToggle">
                    <div class="coffee-liquid" id="coffee">
                        <div class="coffee-surface"></div>
                    </div>
                </div>

                <div class="cup-holder"></div>
                <div class="steam"><span></span><span></span><span></span></div>
            </div>

            <div class="timer-controls">
                <button class="btn-primary" id="startPauseBtn"><span id="startPauseText">Start</span></button>
                <button class="btn-secondary" id="resetBtn">Reset</button>
            </div>

        </div>
    </div>
</main>
</div>

<script src="charts.js"></script>
<script src="app.js"></script>

<script>
const card=document.getElementById("pomodoroCard");
const mug=document.getElementById("fullscreenToggle");
mug.addEventListener("click",()=>{!document.fullscreenElement?card.requestFullscreen():document.exitFullscreen()});
</script>

</body>
</html>