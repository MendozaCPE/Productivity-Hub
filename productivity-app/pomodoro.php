<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Productivity Hub – Pomodoro</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@500;700&display=swap"
        rel="stylesheet">

    <link rel="stylesheet" href="css/global.css">
<style>
/* ================= COFFEE TIMER ================= */
.coffee-scene {
    position: relative;
    width: 280px;
    height: 280px;
    margin: auto;
    filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3));
}

.coffee-cup {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 180px;
    height: 150px;
    background: linear-gradient(135deg, #f3f0eb, #e6e0d4);
    /* Ceramic White */
    border-radius: 0 0 90px 90px;
    overflow: hidden;
    box-shadow:
        inset 0 -10px 15px rgba(0, 0, 0, 0.05),
        inset 0 5px 10px rgba(255, 255, 255, 0.8),
        0 0 0 1px rgba(255, 255, 255, 0.1);
    border: none;
}

.coffee-cup::after {
    /* Handle of the cup */
    content: '';
    position: absolute;
    right: -45px;
    top: 20px;
    width: 40px;
    height: 70px;
    border: 12px solid #e6e0d4;
    border-radius: 0 25px 25px 0;
    z-index: -1;
    box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.1);
}

.coffee-liquid {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 0%;
    /* Rich Espresso Gradient: Black Coffee -> Crema */
    background: linear-gradient(to top, #1a0f0a 0%, #3d261a 60%, #8c5e3c 100%);
    will-change: height;
    transition: height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.coffee-surface {
    position: absolute;
    top: -5px;
    width: 200%;
    height: 10px;
    /* Crema Foam Texture */
    background: radial-gradient(circle at 50% 50%, rgba(214, 169, 128, 0.4), transparent 60%);
    animation: wave 4s ease-in-out infinite;
    opacity: 0.7;
}

@keyframes wave {
    0% {
        transform: translateX(-25%) scaleY(1);
    }

    50% {
        transform: translateX(0%) scaleY(1.2);
    }

    100% {
        transform: translateX(25%) scaleY(1);
    }
}

.steam span {
    width: 12px;
    height: 60px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
    border-radius: 50%;
    animation: steam 6s ease-in-out infinite;
    opacity: 0;
    filter: blur(8px);
}

@keyframes steam {
    0% {
        transform: translateY(0) scaleX(1);
        opacity: 0;
    }

    30% {
        opacity: 0.6;
    }

    100% {
        transform: translateY(-80px) scaleX(2);
        opacity: 0;
    }
}

/* ... steam opacity/keyframes ... */

.coffee-cup.complete {
    box-shadow:
        0 0 40px rgba(198, 124, 78, 0.4),
        inset 0 -10px 15px rgba(0, 0, 0, 0.05);
}

/* ================= TEXT ================= */
.timer-content-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    text-align: center;
    z-index: 2;
    pointer-events: none;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    /* Readable content over cup */
    margin-top: -10px;
}

.timer-time {
    font-family: var(--font-heading);
    font-size: 3.5rem;
    font-weight: 700;
    color: #fff;
    mix-blend-mode: overlay;
    /* Blends nicely with liquid */
    opacity: 0.9;
}

.timer-content-text .timer-label {
    letter-spacing: 0.3em;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    mix-blend-mode: overlay;
}

/* ================= CONTROLS ================= */
.timer-controls {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-top: 3rem;
}

.timer-mode-selector {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    margin-bottom: var(--spacing-xl);
    background: var(--surface-light);
    padding: 0.5rem;
    border-radius: 999px;
    display: inline-flex;
    /* center it */
}

.mode-btn {
    padding: 0.5rem 1.25rem;
    background: transparent;
    border: none;
    color: var(--text-secondary);
    border-radius: 999px;
    cursor: pointer;
    font-size: 0.9rem;
    font-family: var(--font-ui);
    font-weight: 500;
    transition: all 0.3s ease;
}

.mode-btn:hover {
    color: var(--text-primary);
}

.mode-btn.active {
    background: var(--surface-hover);
    /* Slightly lighter wood */
    color: var(--accent);
    font-weight: 600;
    box-shadow: var(--shadow-sm);
}

.pomodoro-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
}

.pomodoro-card {
    background: var(--surface-dark);
    border: 1px solid var(--border-color);
    border-radius: 32px;
    padding: 4rem 3rem;
    width: 500px;
    text-align: center;
    position: relative;
    overflow: hidden;
}

/* Subtle grain texture overlay on card */
.pomodoro-card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none;
}
    </style>
</head>

<body>

    <div class="container">

        <!-- ========== SIDEBAR ========== -->
        <aside class="sidebar">
            <div class="logo">
                <div class="logo-icon">⚡</div>
                <h1>ProductivityHub</h1>
            </div>

            <nav class="nav-menu">
                <a href="dashboard.php" class="nav-item">📊 Dashboard</a>
                <a href="pomodoro.php" class="nav-item active">☕ Pomodoro</a>
                <a href="habits.php" class="nav-item">✨ Habits</a>
                <a href="tasks.php" class="nav-item">✓ Tasks</a>
                <a href="goals.php" class="nav-item">🎯 Goals</a>
                <a href="focus.php" class="nav-item">🧘 Focus</a>
            </nav>

            <div class="sidebar-footer">
                <div class="streak-badge" style="background: transparent; border: none; padding: 0;">
                    <span style="font-size: 1.2rem;">🔥</span>
                    <span style="font-weight: 700; color: var(--text-primary);">Day Streak: <span
                            id="currentStreak">0</span></span>
                </div>
            </div>
        </aside>

        <!-- ========== MAIN ========== -->
        <main class="main-content" id="pomodoro">
            <header class="page-header">
                <div>
                    <h2 class="page-title">Pomodoro Timer</h2>
                    <p class="page-subtitle">Brew your productivity</p>
                </div>
            </header>

            <div class="pomodoro-container">
                <div class="pomodoro-card">

                    <div class="timer-mode-selector">
                        <button class="mode-btn active" data-mode="work">Brew</button>
                        <button class="mode-btn" data-mode="short">Sip</button>
                        <button class="mode-btn" data-mode="long">Refill</button>
                    </div>

                    <div class="coffee-scene">
                        <div class="coffee-cup" id="cup">
                            <div class="coffee-liquid" id="coffee">
                                <div class="coffee-surface"></div>
                            </div>
                            <div class="steam">
                                <span></span><span></span><span></span>
                            </div>
                        </div>

                        <div class="timer-content-text">
                            <div class="timer-time" id="time">25:00</div>
                            <div class="timer-label">Focus Time</div>
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

    <!-- Scripts -->
    <script src="app.js"></script> <!-- Re-added: Needed for CRUD/Sidebar stats -->
    <script>
        // Custom Coffee Timer Logic (integrating with app.js fallback/sync would be ideal, 
        // but for now keeping the user's visualisation logic effectively)

        // Note: We need to ensure this doesn't conflict with app.js. 
        // app.js looks for 'startPauseBtn' but here we have 'start'. 
        // We will add bridge logic here to save stats.

        const TOTAL = 25 * 60;
        let remaining = TOTAL;
        let running = false;
        let last = null;

        const coffee = document.getElementById("coffee");
        const timeEl = document.getElementById("time");
        const cup = document.getElementById("cup");

        function format(t) {
            const m = Math.floor(t / 60);
            const s = Math.floor(t % 60);
            return `${m}:${s.toString().padStart(2, "0")}`;
        }

        function animate(ts) {
            if (!running) return;
            if (!last) last = ts;
            const delta = (ts - last) / 1000;
            last = ts;

            remaining = Math.max(0, remaining - delta);
            const progress = 1 - remaining / TOTAL;

            coffee.style.height = `${progress * 100}%`;
            timeEl.textContent = format(remaining);

            if (remaining <= 0) {
                running = false;
                cup.classList.add("complete");
                // TRIGGER SAVE VIA GLOBAL API IF AVAILABLE
                if (window.apiCall) {
                    // Mocking session completion
                    // In a real scenario we'd track sessions properly
                    window.apiCall('update_pomodoro', {
                        sessionsCompleted: (window.state?.pomodoro?.sessionsCompleted || 0) + 1,
                        totalFocusTime: (window.state?.pomodoro?.totalFocusTime || 0) + 25
                    });
                    // Also refresh state
                    if (window.loadState) window.loadState();
                }
            } else {
                requestAnimationFrame(animate);
            }
        }

        document.getElementById("start").onclick = () => {
            if (!running) {
                running = true;
                last = null;
                requestAnimationFrame(animate);
            }
        };

        document.getElementById("reset").onclick = () => {
            running = false;
            remaining = TOTAL;
            coffee.style.height = "0%";
            timeEl.textContent = "25:00";
            cup.classList.remove("complete");
        };
    </script>

</body>

</html>