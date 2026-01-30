<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Goals">
    <title>Productivity Hub - Goals</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@500;700&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="css/global.css">
<style>
/* === GOALS === */
.goals-container {
    max-width: 900px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: var(--spacing-lg);
}

.quote-card {
    grid-column: span 2;
    text-align: center;
    font-style: italic;
    background: transparent;
    border: none;
    box-shadow: none;
}

.quote {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
    font-family: var(--font-heading);
}

.quote-author {
    color: var(--accent);
}

.goals-input-card {
    grid-column: span 1;
}

.goal-input-group {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.goal-input {
    flex: 1;
    padding: 0.75rem;
    background: var(--surface-hover);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    border-radius: 12px;
}

.goal-input:focus {
    outline: none;
    border-color: var(--accent);
}

.goal-item {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.03);
    margin-bottom: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s;
}

.goal-item:hover {
    background: rgba(255, 255, 255, 0.05);
}

.goal-checkbox {
    width: 20px;
    height: 20px;
    border: 2px solid var(--border-color);
    margin-right: 1rem;
    cursor: pointer;
    border-radius: 50%;
    /* Rounded checkbox */
    appearance: none;
    display: grid;
    place-content: center;
}

.goal-checkbox::before {
    content: "";
    width: 10px;
    height: 10px;
    border-radius: 50%;
    transform: scale(0);
    transition: 120ms transform ease-in-out;
    background: var(--text-inverted);
}

.goal-item.completed .goal-checkbox {
    background: var(--accent);
    border-color: var(--accent);
}

.goal-item.completed .goal-checkbox::before {
    transform: scale(1);
}

.goal-item.completed .goal-text {
    text-decoration: line-through;
    opacity: 0.6;
    color: var(--text-muted);
}

.goals-progress-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.progress-ring {
    width: 160px;
    height: 160px;
    transform: rotate(-90deg);
}

.progress-ring-bg {
    fill: none;
    stroke: var(--surface-hover);
    stroke-width: 8;
}

.progress-ring-fill {
    fill: none;
    stroke: var(--accent);
    stroke-width: 8;
    stroke-dasharray: 502;
    stroke-dashoffset: 502;
    transition: stroke-dashoffset 0.5s;
    stroke-linecap: round;
}

.progress-text {
    position: absolute;
    text-align: center;
}

.progress-percentage {
    font-size: 2rem;
    font-weight: bold;
    color: var(--text-primary);
}

.progress-label {
    font-size: 0.9rem;
    color: var(--text-secondary);
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
                <a href="dashboard.php" class="nav-item">
                    <span class="nav-icon">📊</span>
                    <span class="nav-label">Dashboard</span>
                </a>
                <a href="pomodoro.php" class="nav-item">
                    <span class="nav-icon">☕</span>
                    <span class="nav-label">Pomodoro</span>
                </a>
                <a href="habits.php" class="nav-item">
                    <span class="nav-icon">✨</span>
                    <span class="nav-label">Habits</span>
                </a>
                <a href="tasks.php" class="nav-item">
                    <span class="nav-icon">✓</span>
                    <span class="nav-label">Tasks</span>
                </a>
                <a href="goals.php" class="nav-item active">
                    <span class="nav-icon">🎯</span>
                    <span class="nav-label">Goals</span>
                </a>
                <a href="focus.php" class="nav-item">
                    <span class="nav-icon">🧘</span>
                    <span class="nav-label">Focus</span>
                </a>
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
        <main class="main-content" id="goals">
            <header class="page-header">
                <div>
                    <h2 class="page-title">Daily Goals</h2>
                    <p class="page-subtitle">Set your intentions for today</p>
                </div>
            </header>

            <div class="goals-container">
                <div class="card quote-card">
                    <div class="quote-icon">💭</div>
                    <blockquote class="quote" id="motivationalQuote">
                        "The secret of getting ahead is getting started."
                    </blockquote>
                    <cite class="quote-author" id="quoteAuthor">- Mark Twain</cite>
                </div>

                <div class="card goals-input-card">
                    <h3 class="card-title">Today's Goals</h3>
                    <p class="card-subtitle">Set 3-5 main goals for today</p>
                    <div class="goal-input-group">
                        <input type="text" id="goalInput" placeholder="Enter a goal..." class="goal-input">
                        <button class="btn-primary" id="addGoalBtn">Add Goal</button>
                    </div>
                    <div id="goalsList" class="goals-list"></div>
                </div>

                <div class="card goals-progress-card">
                    <h3 class="card-title">Progress</h3>
                    <div class="progress-ring-container">
                        <svg class="progress-ring" viewBox="0 0 200 200">
                            <circle class="progress-ring-bg" cx="100" cy="100" r="80"></circle>
                            <circle class="progress-ring-fill" cx="100" cy="100" r="80" id="goalsProgressRing"></circle>
                        </svg>
                        <div class="progress-text">
                            <div class="progress-percentage" id="goalsProgress">0%</div>
                            <div class="progress-label">Complete</div>
                        </div>
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