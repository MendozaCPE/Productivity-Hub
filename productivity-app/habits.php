<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Habit Tracker">
    <title>Productivity Hub - Habits</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@500;700&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="css/global.css">
<style>
/* === HABITS === */
.habits-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-lg);
}

.habits-list-card {
    grid-column: span 2;
}

.habit-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem;
    background: var(--surface-dark);
    border: 1px solid var(--border-color);
    margin-bottom: 0.75rem;
    border-radius: var(--border-radius-md);
    transition: border-color 0.2s ease;
}

.habit-item:hover {
    border-color: #333333;
}

.habit-info {
    flex: 1;
    padding: 0 1rem;
}

.habit-color {
    width: 12px;
    height: 12px;
    border-radius: 50%;
}

.habit-name {
    font-family: var(--font-ui);
    font-weight: 700;
    font-size: 1rem;
    color: var(--text-primary);
    margin-bottom: 0.2rem;
}

.habit-streak {
    font-family: var(--font-body);
    font-size: 0.85rem;
    color: var(--text-muted);
}

.habit-days {
    display: flex;
    gap: 4px;
}

.habit-day {
    width: 24px;
    height: 24px;
    background: #1a1a1a;
    border: 1px solid var(--border-color);
    cursor: pointer;
    border-radius: 3px;
    transition: all 0.2s;
}

.habit-day.completed {
    background: var(--surface-light);
}

.habit-actions .habit-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    opacity: 0.5;
    transition: opacity 0.2s;
}

.habit-actions .habit-btn:hover {
    opacity: 1;
}

.habit-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    text-align: center;
}

.habit-stat-item {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 8px;
}

.habit-stat-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-transform: uppercase;
}

.habit-stat-value {
    font-size: 1.5rem;
    font-weight: bold;
    margin-top: 0.5rem;
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
                <a href="habits.php" class="nav-item active">
                    <span class="nav-icon">✨</span>
                    <span class="nav-label">Habits</span>
                </a>
                <a href="tasks.php" class="nav-item">
                    <span class="nav-icon">✓</span>
                    <span class="nav-label">Tasks</span>
                </a>
                <a href="goals.php" class="nav-item">
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
        <main class="main-content" id="habits">
            <header class="page-header">
                <div>
                    <h2 class="page-title">Habit Tracker</h2>
                    <p class="page-subtitle">Build better habits, one day at a time</p>
                </div>
                <!-- Button removed, using inline form -->
            </header>

            <div class="habits-grid">
                <!-- Add New Habit Inline Card -->
                <div class="card add-habit-card" style="grid-column: span 2;">
                    <h3 class="card-title">Add New Habit</h3>
                    <div class="add-habit-form" style="display: flex; gap: 1rem; align-items: center;">
                        <input type="text" id="habitName" placeholder="e.g., Morning Exercise" class="form-input"
                            style="flex: 1;">

                        <div class="color-picker-inline" style="display: flex; gap: 0.5rem;">
                            <!-- Color options default selection handling needed in JS or defaults checking -->
                            <button class="color-option selected" data-color="#6366f1"
                                style="background: #6366f1;"></button>
                            <button class="color-option" data-color="#14b8a6" style="background: #14b8a6;"></button>
                            <button class="color-option" data-color="#10b981" style="background: #10b981;"></button>
                            <button class="color-option" data-color="#f59e0b" style="background: #f59e0b;"></button>
                            <button class="color-option" data-color="#ef4444" style="background: #ef4444;"></button>
                            <button class="color-option" data-color="#ec4899" style="background: #ec4899;"></button>
                        </div>

                        <button class="btn-primary" id="saveHabitBtn">Add Habit</button>
                    </div>
                </div>

                <div class="card habits-list-card">
                    <h3 class="card-title">My Habits</h3>
                    <div id="habitsList" class="habits-list"></div>
                </div>

                <div class="card">
                    <h3 class="card-title">Weekly Progress</h3>
                    <canvas id="habitsWeeklyChart"></canvas>
                </div>

                <div class="card">
                    <h3 class="card-title">Monthly Trends</h3>
                    <canvas id="habitsMonthlyChart"></canvas>
                </div>

                <div class="card habits-stats">
                    <h3 class="card-title">Statistics</h3>
                    <div class="habit-stat-item">
                        <span class="habit-stat-label">Total Habits</span>
                        <span class="habit-stat-value" id="totalHabits">0</span>
                    </div>
                    <div class="habit-stat-item">
                        <span class="habit-stat-label">Completion Rate</span>
                        <span class="habit-stat-value" id="habitCompletionRate">0%</span>
                    </div>
                    <div class="habit-stat-item">
                        <span class="habit-stat-label">Best Streak</span>
                        <span class="habit-stat-value" id="bestStreak">0 days</span>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- Confetti Container -->
    <div id="confetti"></div>

    <!-- Scripts -->
    <script src="charts.js"></script>
    <script src="app.js"></script>
</body>

</html>