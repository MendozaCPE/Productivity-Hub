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
    <link rel="stylesheet" href="css/goals.css">
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
                <a href="goals.php" class="nav-item active">🎯 Goals</a>
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