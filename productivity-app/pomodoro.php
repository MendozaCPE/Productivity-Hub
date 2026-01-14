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
    <link rel="stylesheet" href="css/pomodoro.css">
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