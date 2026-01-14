<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Productivity Hub Dashboard">
    <title>Productivity Hub - Dashboard</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@500;700&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="css/global.css">
<style>
/* === DASHBOARD === */
.dashboard-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
}

/* Stats */
.stat-card {
    background: var(--surface-dark);
    border: 1px solid var(--border-color);
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.25rem;
    border-radius: var(--border-radius-md);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    box-shadow: var(--shadow-sm);
}

.stat-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);
    border-color: rgba(198, 124, 78, 0.3);
    /* Subtle accent glow */
}

.stat-icon {
    font-size: 1.5rem;
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(198, 124, 78, 0.1);
    border: 1px solid rgba(198, 124, 78, 0.2);
    border-radius: var(--border-radius-sm);
    color: var(--accent);
}

.stat-value {
    font-family: var(--font-heading);
    font-size: 2rem;
    color: var(--text-primary);
    font-weight: 700;
    line-height: 1.1;
}

.stat-label {
    font-family: var(--font-ui);
    font-size: 0.85rem;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.08em;
    margin-top: 0.25rem;
    color: var(--text-secondary);
}

.chart-card {
    grid-column: span 2;
    min-height: 400px;
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
                <a href="dashboard.php" class="nav-item active">📊 Dashboard</a>
                <a href="pomodoro.php" class="nav-item">☕ Pomodoro</a>
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

        <!-- Main Content Area -->
        <main class="main-content">
            <header class="page-header">
                <div class="header-left">
                    <p class="page-subtitle" id="dashboardGreeting">Welcome back ☕</p>
                </div>

                <div class="header-right">
                    <div class="date-display" id="currentDate"></div>
                </div>
            </header>

            <div class="dashboard-grid">
                <!-- Quick Stats -->
                <div class="stat-card">
                    <div class="stat-icon">☕</div>
                    <div class="stat-content">
                        <div class="stat-value" id="todayPomodoros">0</div>
                        <div class="stat-label">Coffees Today</div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">✓</div>
                    <div class="stat-content">
                        <div class="stat-value" id="todayTasks">0</div>
                        <div class="stat-label">Tasks Completed</div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">✨</div>
                    <div class="stat-content">
                        <div class="stat-value" id="todayHabits">0%</div>
                        <div class="stat-label">Habits Completed</div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">⏱️</div>
                    <div class="stat-content">
                        <div class="stat-value" id="todayFocusTime">0h</div>
                        <div class="stat-label">Focus Time</div>
                    </div>
                </div>

                <!-- Weekly Overview Chart -->
                <div class="card chart-card">
                    <h3 class="card-title">Weekly Productivity</h3>
                    <canvas id="weeklyChart"></canvas>
                </div>

                <!-- Habit Completion Chart -->
                <div class="card chart-card">
                    <h3 class="card-title">Habit Completion Rate</h3>
                    <canvas id="habitCompletionChart"></canvas>
                </div>

                <!-- Today's Goals Preview -->
                <div class="card goals-preview">
                    <h3 class="card-title">Today's Goals</h3>
                    <div id="goalsPreview" class="goals-preview-list"></div>
                </div>

                <!-- Quick Tasks -->
                <div class="card tasks-preview">
                    <h3 class="card-title">Upcoming Tasks</h3>
                    <div id="tasksPreview" class="tasks-preview-list"></div>
                </div>
            </div>
        </main>
    </div>

    <!-- Scripts -->
    <script src="charts.js"></script>
    <script src="app.js"></script>
</body>

</html>