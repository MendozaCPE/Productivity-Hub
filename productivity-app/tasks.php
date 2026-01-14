<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Task Manager">
    <title>Productivity Hub - Tasks</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@500;700&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="css/global.css">
<style>
/* === TASKS === */
.tasks-container {
    max-width: 800px;
    margin: 0 auto;
}

.task-input-card {
    margin-bottom: var(--spacing-lg);
    display: flex;
    gap: 1rem;
}

.task-input {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 1px solid var(--border-color);
    font-family: var(--font-body);
    font-size: 1rem;
    background: transparent;
    color: var(--text-primary);
    border-radius: 4px;
}

.task-input-actions {
    display: flex;
    gap: 0.5rem;
}

.task-priority-select {
    background: var(--surface-dark);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    padding: 0 1rem;
    border-radius: 4px;
}

.task-item {
    padding: 0.75rem 1rem;
    border: 1px solid var(--border-color);
    background: var(--surface-dark);
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    border-radius: 8px;
    justify-content: space-between;
}

.task-checkbox {
    width: 20px;
    height: 20px;
    border: 1.5px solid var(--border-color);
    margin-right: var(--spacing-sm);
    border-radius: 4px;
    cursor: pointer;
    background: transparent;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.task-item.priority-high {
    border-left: 3px solid #ef4444;
}

.task-item.priority-medium {
    border-left: 3px solid #f59e0b;
}

.task-item.priority-low {
    border-left: 3px solid #10b981;
}

.task-item.completed {
    opacity: 0.6;
}

.task-item.completed .task-checkbox {
    background: var(--text-primary);
    border-color: var(--text-primary);
}

.task-item.completed .task-text {
    color: var(--text-muted);
    text-decoration: line-through;
}

.task-text {
    font-family: var(--font-body);
    font-size: 1rem;
    color: var(--text-primary);
    flex: 1;
}

.task-delete {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0 0.5rem;
}

.task-delete:hover {
    color: #ef4444;
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
                <a href="tasks.php" class="nav-item active">✓ Tasks</a>
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
        <main class="main-content" id="tasks">
            <header class="page-header">
                <div>
                    <h2 class="page-title">Task Manager</h2>
                    <p class="page-subtitle">Organize and prioritize your work</p>
                </div>
                <button class="btn-primary" id="addTaskBtn">+ Add Task</button>
            </header>

            <div class="tasks-container">
                <div class="task-input-card card">
                    <input type="text" id="taskInput" placeholder="What needs to be done?" class="task-input">
                    <div class="task-input-actions">
                        <select id="taskPriority" class="task-priority-select">
                            <option value="low">Low Priority</option>
                            <option value="medium" selected>Medium Priority</option>
                            <option value="high">High Priority</option>
                        </select>
                        <button class="btn-primary" id="addTaskSubmit">Add Task</button>
                    </div>
                </div>

                <div class="tasks-lists">
                    <div class="card task-list-card">
                        <h3 class="card-title">Active Tasks</h3>
                        <div id="activeTasks" class="task-list"></div>
                    </div>

                    <div class="card task-list-card">
                        <h3 class="card-title">Completed Tasks</h3>
                        <div id="completedTasks" class="task-list"></div>
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