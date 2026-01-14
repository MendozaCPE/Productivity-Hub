<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Focus Mode">
    <title>Productivity Hub - Focus Mode</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@500;700&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="css/global.css">
<style>
/* === FOCUS MODE === */
.focus-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 70vh;
    justify-content: center;
}

.focus-main {
    text-align: center;
    margin-bottom: 3rem;
}

.focus-time {
    font-family: var(--font-heading);
    font-size: 6rem;
    color: var(--text-primary);
    line-height: 1;
}

.focus-label {
    font-size: 1.5rem;
    color: var(--text-secondary);
    margin-bottom: 2rem;
}

.focus-controls {
    margin-bottom: 2rem;
}

.focus-task-input input {
    width: 100%;
    max-width: 500px;
    text-align: center;
    font-size: 1.5rem;
    padding: 1rem;
    background: transparent;
    border: none;
    border-bottom: 2px solid var(--border-color);
    color: var(--text-primary);
    font-family: var(--font-heading);
    transition: all 0.3s;
}

.focus-task-input input:focus {
    outline: none;
    border-color: var(--accent);
}
    </style>
</head>

<body>
    <div class="container">
        <!-- Sidebar Navigation -->
        <!-- Sidebar Navigation -->
        <aside class="sidebar">
            <div class="logo">
                <div class="logo-icon">⚡</div>
                <h1>ProductivityHub</h1>
            </div>

            <nav class="nav-menu">
                <a href="dashboard.php" class="nav-item">📊 Dashboard</a>
                <a href="pomodoro.php" class="nav-item">☕ Pomodoro</a>
                <a href="habits.php" class="nav-item">✨ Habits</a>
                <a href="tasks.php" class="nav-item">✓ Tasks</a>
                <a href="goals.php" class="nav-item">🎯 Goals</a>
                <a href="focus.php" class="nav-item active">🧘 Focus</a>
            </nav>

            <div class="sidebar-footer">
                <div class="streak-badge" style="background: transparent; border: none; padding: 0;">
                    <span style="font-size: 1.2rem;">🔥</span>
                    <span style="font-weight: 700; color: var(--text-primary);">Day Streak: <span
                            id="currentStreak">0</span></span>
                </div>
            </div>
        </aside>

        <!-- Main Content Area -->
        <main class="main-content" id="focus">
            <header class="page-header">
                <div>
                    <h2 class="page-title">Focus Mode</h2>
                    <p class="page-subtitle">Eliminate distractions and get in the zone</p>
                </div>
            </header>

            <div class="focus-container">
                <div class="focus-main">
                    <div class="focus-timer-display">
                        <div class="focus-time" id="focusTimerDisplay">00:00</div>
                        <div class="focus-label" id="focusLabel">Ready to focus?</div>
                    </div>

                    <div class="focus-controls">
                        <button class="btn-focus btn-primary" id="startFocusBtn">Start Focus Session</button>
                        <button class="btn-focus btn-secondary" id="endFocusBtn" style="display: none;">End
                            Session</button>
                    </div>

                    <div class="focus-task-input">
                        <input type="text" id="focusTaskInput" placeholder="What are you working on?"
                            class="focus-input">
                    </div>
                </div>

                <div class="focus-stats-card card">
                    <h3 class="card-title">Today's Focus Sessions</h3>
                    <div id="focusSessionsList" class="focus-sessions-list"></div>
                    <div class="focus-total">
                        <span>Total Focus Time:</span>
                        <span id="totalFocusTimeToday">0m</span>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- Scripts -->
    <script src="charts.js"></script>
    <script src="app.js"></script>
</body>

</html>