// ===================================
// PRODUCTIVITY HUB - MAIN APPLICATION
// ===================================

// Application State
const state = {
    currentTab: 'dashboard',
    pomodoro: {
        mode: 'work',
        timeLeft: 25 * 60,
        isRunning: false,
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsCompleted: 0,
        totalFocusTime: 0
    },
    habits: [],
    tasks: [],
    goals: [],
    focusSessions: [],
    selectedHabitColor: '#ffffff'
};

// Load state from backend
async function loadState() {
    try {
        const response = await fetch('backend/api.php?action=get_data');
        const data = await response.json();
        if (data && !data.error) {
            Object.assign(state, data);
            // Reset timer state
            state.pomodoro.isRunning = false;
        }
    } catch (error) {
        console.error("Failed to load state from backend:", error);
        // Fallback to localStorage if backend fails
        const saved = localStorage.getItem('productivityHubState');
        if (saved) {
            Object.assign(state, JSON.parse(saved));
        }
    }
}

// Save state to backend
async function saveState() {
    const toSave = { ...state };
    toSave.pomodoro.isRunning = false;

    // Save to localStorage as backup
    localStorage.setItem('productivityHubState', JSON.stringify(toSave));

    try {
        await fetch('backend/api.php?action=sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(toSave)
        });
    } catch (error) {
        console.error("Failed to sync state with backend:", error);
    }
}

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', async () => {
    await loadState();
    initializeNavigation();
    initializeDashboard();
    initializePomodoro();
    initializeHabits();
    initializeTasks();
    initializeGoals();
    initializeFocus();
    updateAllCharts();
    updateDashboardStats();
});

// ===================================
// NAVIGATION
// ===================================

function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tab = item.dataset.tab;
            switchTab(tab);
        });
    });
}

function switchTab(tabName) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tabName);
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tabName);
    });

    state.currentTab = tabName;

    // Update charts when switching to relevant tabs
    if (tabName === 'dashboard') {
        updateAllCharts();
        updateDashboardStats();
    } else if (tabName === 'habits') {
        updateHabitCharts();
    }
}

// ===================================
// DASHBOARD
// ===================================

function initializeDashboard() {
    updateGreeting();
    updateCurrentDate();
    setInterval(updateCurrentDate, 60000); // Update every minute
}

function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = 'Good evening';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';

    const greetingEl = document.getElementById('dashboardGreeting');
    if (greetingEl) {
        greetingEl.textContent = `${greeting}! Ready to be productive?`;
    }
}

function updateCurrentDate() {
    const dateEl = document.getElementById('currentDate');
    if (dateEl) {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = now.toLocaleDateString('en-US', options);
    }
}

function updateDashboardStats() {
    // Today's pomodoros
    const todayPomodoros = document.getElementById('todayPomodoros');
    if (todayPomodoros) {
        todayPomodoros.textContent = state.pomodoro.sessionsCompleted;
    }

    // Today's tasks
    const todayTasks = document.getElementById('todayTasks');
    if (todayTasks) {
        const completed = state.tasks.filter(t => t.completed).length;
        todayTasks.textContent = completed;
    }

    // Today's habits
    const todayHabits = document.getElementById('todayHabits');
    if (todayHabits) {
        const today = new Date().toDateString();
        const totalHabits = state.habits.length;
        const completedHabits = state.habits.filter(h =>
            h.completedDates && h.completedDates.includes(today)
        ).length;
        const percentage = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
        todayHabits.textContent = `${percentage}%`;
    }

    // Focus time
    const todayFocusTime = document.getElementById('todayFocusTime');
    if (todayFocusTime) {
        const hours = Math.floor(state.pomodoro.totalFocusTime / 60);
        const minutes = state.pomodoro.totalFocusTime % 60;
        todayFocusTime.textContent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    }

    // Update streak
    const streakEl = document.getElementById('currentStreak');
    if (streakEl) {
        streakEl.textContent = calculateCurrentStreak();
    }

    // Goals preview
    updateGoalsPreview();

    // Tasks preview
    updateTasksPreview();
}

function calculateCurrentStreak() {
    if (state.habits.length === 0) return 0;

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toDateString();

        const completedToday = state.habits.filter(h =>
            h.completedDates && h.completedDates.includes(dateStr)
        ).length;

        if (completedToday > 0) {
            streak++;
        } else if (i > 0) {
            break;
        }
    }

    return streak;
}

function updateGoalsPreview() {
    const preview = document.getElementById('goalsPreview');
    if (!preview) return;

    const activeGoals = state.goals.filter(g => !g.completed).slice(0, 3);

    if (activeGoals.length === 0) {
        preview.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 1rem;">No goals set for today</p>';
        return;
    }

    preview.innerHTML = activeGoals.map(goal => `
        <div style="padding: 0.75rem; background: rgba(0,0,0,0.2); border-radius: 0.5rem; margin-bottom: 0.5rem;">
            ${goal.text}
        </div>
    `).join('');
}

function updateTasksPreview() {
    const preview = document.getElementById('tasksPreview');
    if (!preview) return;

    const activeTasks = state.tasks.filter(t => !t.completed).slice(0, 3);

    if (activeTasks.length === 0) {
        preview.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 1rem;">No pending tasks</p>';
        return;
    }

    preview.innerHTML = activeTasks.map(task => {
        const priorityColors = {
            high: '#ef4444',
            medium: '#f59e0b',
            low: '#10b981'
        };
        return `
            <div style="padding: 0.75rem; background: rgba(0,0,0,0.2); border-radius: 0.5rem; margin-bottom: 0.5rem; border-left: 3px solid ${priorityColors[task.priority]};">
                ${task.text}
            </div>
        `;
    }).join('');
}

// ===================================
// POMODORO TIMER
// ===================================

let pomodoroInterval = null;

function initializePomodoro() {
    const startPauseBtn = document.getElementById('startPauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const modeBtns = document.querySelectorAll('.mode-btn');

    startPauseBtn.addEventListener('click', togglePomodoro);
    resetBtn.addEventListener('click', resetPomodoro);

    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            switchPomodoroMode(mode);
        });
    });

    // Settings
    document.getElementById('workDuration').addEventListener('change', (e) => {
        state.pomodoro.workDuration = parseInt(e.target.value);
        if (state.pomodoro.mode === 'work' && !state.pomodoro.isRunning) {
            state.pomodoro.timeLeft = state.pomodoro.workDuration * 60;
            updateTimerDisplay();
        }
    });

    document.getElementById('shortBreakDuration').addEventListener('change', (e) => {
        state.pomodoro.shortBreakDuration = parseInt(e.target.value);
        if (state.pomodoro.mode === 'short' && !state.pomodoro.isRunning) {
            state.pomodoro.timeLeft = state.pomodoro.shortBreakDuration * 60;
            updateTimerDisplay();
        }
    });

    document.getElementById('longBreakDuration').addEventListener('change', (e) => {
        state.pomodoro.longBreakDuration = parseInt(e.target.value);
        if (state.pomodoro.mode === 'long' && !state.pomodoro.isRunning) {
            state.pomodoro.timeLeft = state.pomodoro.longBreakDuration * 60;
            updateTimerDisplay();
        }
    });

    updateTimerDisplay();
    updatePomodoroStats();
}

function togglePomodoro() {
    if (state.pomodoro.isRunning) {
        pausePomodoro();
    } else {
        startPomodoro();
    }
}

function startPomodoro() {
    state.pomodoro.isRunning = true;
    document.getElementById('startPauseText').textContent = 'Pause';

    pomodoroInterval = setInterval(() => {
        state.pomodoro.timeLeft--;

        if (state.pomodoro.mode === 'work') {
            state.pomodoro.totalFocusTime++;
        }

        updateTimerDisplay();

        if (state.pomodoro.timeLeft <= 0) {
            completePomodoro();
        }
    }, 1000);
}

function pausePomodoro() {
    state.pomodoro.isRunning = false;
    document.getElementById('startPauseText').textContent = 'Resume';
    clearInterval(pomodoroInterval);
}

function resetPomodoro() {
    pausePomodoro();
    const durations = {
        work: state.pomodoro.workDuration * 60,
        short: state.pomodoro.shortBreakDuration * 60,
        long: state.pomodoro.longBreakDuration * 60
    };
    state.pomodoro.timeLeft = durations[state.pomodoro.mode];
    document.getElementById('startPauseText').textContent = 'Start';
    updateTimerDisplay();
}

function completePomodoro() {
    pausePomodoro();

    if (state.pomodoro.mode === 'work') {
        state.pomodoro.sessionsCompleted++;
        showConfetti();

        // Auto-switch to break
        const nextMode = state.pomodoro.sessionsCompleted % 4 === 0 ? 'long' : 'short';
        setTimeout(() => switchPomodoroMode(nextMode), 1000);
    } else {
        // Auto-switch back to work
        setTimeout(() => switchPomodoroMode('work'), 1000);
    }

    updatePomodoroStats();
    updateDashboardStats();
    saveState();
}

function switchPomodoroMode(mode) {
    if (state.pomodoro.isRunning) {
        pausePomodoro();
    }

    state.pomodoro.mode = mode;

    const durations = {
        work: state.pomodoro.workDuration * 60,
        short: state.pomodoro.shortBreakDuration * 60,
        long: state.pomodoro.longBreakDuration * 60
    };

    state.pomodoro.timeLeft = durations[mode];

    // Update UI
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    const labels = {
        work: 'Focus Time',
        short: 'Short Break',
        long: 'Long Break'
    };

    document.getElementById('timerLabel').textContent = labels[mode];
    document.getElementById('startPauseText').textContent = 'Start';
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes = Math.floor(state.pomodoro.timeLeft / 60);
    const seconds = state.pomodoro.timeLeft % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    document.getElementById('timerDisplay').textContent = display;

    // Update Professional Progress Ring
    const ring = document.getElementById('pomoRingFill');
    if (ring) {
        const totalTime = durations[state.pomodoro.mode];
        const timeElapsed = totalTime - state.pomodoro.timeLeft;
        const dashArray = 565.48; // 2 * PI * 90
        const offset = dashArray - (timeElapsed / totalTime) * dashArray;
        ring.style.strokeDashoffset = offset;
    }
}

function updatePomodoroStats() {
    document.getElementById('sessionCount').textContent = state.pomodoro.sessionsCompleted;

    const hours = Math.floor(state.pomodoro.totalFocusTime / 60);
    const minutes = state.pomodoro.totalFocusTime % 60;
    document.getElementById('totalFocusTime').textContent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

// ===================================
// HABITS
// ===================================

function initializeHabits() {
    document.getElementById('addHabitBtn').addEventListener('click', openHabitModal);
    document.getElementById('closeHabitModal').addEventListener('click', closeHabitModal);
    document.getElementById('cancelHabitBtn').addEventListener('click', closeHabitModal);
    document.getElementById('saveHabitBtn').addEventListener('click', saveHabit);

    // Color picker
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-option').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            state.selectedHabitColor = btn.dataset.color;
        });
    });

    renderHabits();
    updateHabitCharts();
}

function openHabitModal() {
    document.getElementById('habitModal').classList.add('active');
    document.getElementById('habitName').value = '';
    document.querySelectorAll('.color-option')[0].click();
}

function closeHabitModal() {
    document.getElementById('habitModal').classList.remove('active');
}

function saveHabit() {
    const name = document.getElementById('habitName').value.trim();
    if (!name) return;

    const habit = {
        id: Date.now(),
        name,
        color: state.selectedHabitColor,
        completedDates: [],
        createdAt: new Date().toISOString()
    };

    state.habits.push(habit);
    saveState();
    renderHabits();
    updateHabitCharts();
    updateDashboardStats();
    closeHabitModal();
}

function renderHabits() {
    const container = document.getElementById('habitsList');
    if (!container) return;

    if (state.habits.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No habits yet. Click "Add Habit" to get started!</p>';
        return;
    }

    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));
        return date;
    });

    container.innerHTML = state.habits.map(habit => {
        const streak = calculateHabitStreak(habit);

        return `
            <div class="habit-item">
                <div class="habit-color" style="background: ${habit.color};"></div>
                <div class="habit-info">
                    <div class="habit-name">${habit.name}</div>
                    <div class="habit-streak">🔥 ${streak} day streak</div>
                </div>
                <div class="habit-days">
                    ${last7Days.map(date => {
            const dateStr = date.toDateString();
            const isCompleted = habit.completedDates.includes(dateStr);
            return `
                            <div class="habit-day ${isCompleted ? 'completed' : ''}" 
                                 onclick="toggleHabitDay(${habit.id}, '${dateStr}')">
                            </div>
                        `;
        }).join('')}
                </div>
                <div class="habit-actions">
                    <button class="habit-btn" onclick="deleteHabit(${habit.id})">🗑️</button>
                </div>
            </div>
        `;
    }).join('');

    updateHabitStats();
}

function toggleHabitDay(habitId, dateStr) {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;

    const index = habit.completedDates.indexOf(dateStr);
    if (index > -1) {
        habit.completedDates.splice(index, 1);
    } else {
        habit.completedDates.push(dateStr);

        // Show confetti if all habits completed today
        const today = new Date().toDateString();
        if (dateStr === today) {
            const allCompleted = state.habits.every(h => h.completedDates.includes(today));
            if (allCompleted) {
                showConfetti();
            }
        }
    }

    saveState();
    renderHabits();
    updateHabitCharts();
    updateDashboardStats();
}

function deleteHabit(habitId) {
    if (!confirm('Are you sure you want to delete this habit?')) return;

    state.habits = state.habits.filter(h => h.id !== habitId);
    saveState();
    renderHabits();
    updateHabitCharts();
    updateDashboardStats();
}

function calculateHabitStreak(habit) {
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toDateString();

        if (habit.completedDates.includes(dateStr)) {
            streak++;
        } else if (i > 0) {
            break;
        }
    }

    return streak;
}

function updateHabitStats() {
    document.getElementById('totalHabits').textContent = state.habits.length;

    const today = new Date().toDateString();
    const totalHabits = state.habits.length;
    const completedToday = state.habits.filter(h => h.completedDates.includes(today)).length;
    const rate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
    document.getElementById('habitCompletionRate').textContent = `${rate}%`;

    const bestStreak = Math.max(...state.habits.map(h => calculateHabitStreak(h)), 0);
    document.getElementById('bestStreak').textContent = `${bestStreak} days`;
}

function updateHabitCharts() {
    // Weekly chart
    const weeklyChart = new ChartRenderer('habitsWeeklyChart');
    const today = new Date();
    const weekLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekValues = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));
        const dateStr = date.toDateString();
        return state.habits.filter(h => h.completedDates.includes(dateStr)).length;
    });

    weeklyChart.drawBarChart({
        labels: weekLabels,
        values: weekValues,
        colors: ['#ffffff', '#e5e5e5', '#d4d4d4', '#a3a3a3', '#737373', '#525252', '#404040']
    });

    // Monthly chart
    const monthlyChart = new ChartRenderer('habitsMonthlyChart');
    const monthValues = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (29 - i));
        const dateStr = date.toDateString();
        const total = state.habits.length;
        const completed = state.habits.filter(h => h.completedDates.includes(dateStr)).length;
        return total > 0 ? Math.round((completed / total) * 100) : 0;
    });

    const monthLabels = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (29 - i));
        return date.getDate();
    });

    monthlyChart.drawLineChart({
        labels: monthLabels.filter((_, i) => i % 5 === 0),
        datasets: [{
            values: monthValues,
            color: '#ffffff',
            label: 'Completion %'
        }]
    });
}

// ===================================
// TASKS
// ===================================

function initializeTasks() {
    document.getElementById('addTaskBtn').addEventListener('click', () => {
        document.getElementById('taskInput').focus();
    });

    document.getElementById('addTaskSubmit').addEventListener('click', addTask);
    document.getElementById('taskInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    renderTasks();
}

function addTask() {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();
    if (!text) return;

    const priority = document.getElementById('taskPriority').value;

    const task = {
        id: Date.now(),
        text,
        priority,
        completed: false,
        createdAt: new Date().toISOString()
    };

    state.tasks.push(task);
    input.value = '';
    saveState();
    renderTasks();
    updateDashboardStats();
}

function renderTasks() {
    const activeContainer = document.getElementById('activeTasks');
    const completedContainer = document.getElementById('completedTasks');

    const activeTasks = state.tasks.filter(t => !t.completed);
    const completedTasks = state.tasks.filter(t => t.completed);

    if (activeTasks.length === 0) {
        activeContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No active tasks</p>';
    } else {
        activeContainer.innerHTML = activeTasks.map(task => `
            <div class="task-item priority-${task.priority}">
                <div class="task-checkbox" onclick="toggleTask(${task.id})"></div>
                <div class="task-text">${task.text}</div>
                <button class="task-delete" onclick="deleteTask(${task.id})">✕</button>
            </div>
        `).join('');
    }

    if (completedTasks.length === 0) {
        completedContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No completed tasks</p>';
    } else {
        completedContainer.innerHTML = completedTasks.map(task => `
            <div class="task-item priority-${task.priority} completed">
                <div class="task-checkbox" onclick="toggleTask(${task.id})"></div>
                <div class="task-text">${task.text}</div>
                <button class="task-delete" onclick="deleteTask(${task.id})">✕</button>
            </div>
        `).join('');
    }
}

function toggleTask(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;

    if (task.completed) {
        showConfetti();
    }

    saveState();
    renderTasks();
    updateDashboardStats();
}

function deleteTask(taskId) {
    state.tasks = state.tasks.filter(t => t.id !== taskId);
    saveState();
    renderTasks();
    updateDashboardStats();
}

// ===================================
// GOALS
// ===================================

function initializeGoals() {
    document.getElementById('addGoalBtn').addEventListener('click', addGoal);
    document.getElementById('goalInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addGoal();
    });

    renderGoals();
    updateMotivationalQuote();
}

function addGoal() {
    const input = document.getElementById('goalInput');
    const text = input.value.trim();
    if (!text) return;

    const goal = {
        id: Date.now(),
        text,
        completed: false,
        createdAt: new Date().toISOString()
    };

    state.goals.push(goal);
    input.value = '';
    saveState();
    renderGoals();
    updateDashboardStats();
}

function renderGoals() {
    const container = document.getElementById('goalsList');
    if (!container) return;

    if (state.goals.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">Set your goals for today!</p>';
        updateGoalsProgress();
        return;
    }

    container.innerHTML = state.goals.map(goal => `
        <div class="goal-item ${goal.completed ? 'completed' : ''}">
            <div class="goal-checkbox" onclick="toggleGoal(${goal.id})"></div>
            <div class="goal-text">${goal.text}</div>
        </div>
    `).join('');

    updateGoalsProgress();
}

function toggleGoal(goalId) {
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return;

    goal.completed = !goal.completed;

    if (goal.completed) {
        const allCompleted = state.goals.every(g => g.completed);
        if (allCompleted) {
            showConfetti();
        }
    }

    saveState();
    renderGoals();
    updateDashboardStats();
}

function updateGoalsProgress() {
    const total = state.goals.length;
    const completed = state.goals.filter(g => g.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    document.getElementById('goalsProgress').textContent = `${percentage}%`;

    const ring = document.getElementById('goalsProgressRing');
    if (ring) {
        const circumference = 2 * Math.PI * 80;
        const offset = circumference * (1 - percentage / 100);
        ring.style.strokeDashoffset = offset;
    }
}

function updateMotivationalQuote() {
    const quotes = [
        { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
        { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
        { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
        { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
        { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
        { text: "Success is not final, failure is not fatal.", author: "Winston Churchill" },
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { text: "Your limitation—it's only your imagination.", author: "Unknown" },
        { text: "Great things never come from comfort zones.", author: "Unknown" },
        { text: "Dream it. Wish it. Do it.", author: "Unknown" }
    ];

    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById('motivationalQuote').textContent = `"${quote.text}"`;
    document.getElementById('quoteAuthor').textContent = `- ${quote.author}`;
}

// ===================================
// FOCUS MODE
// ===================================

let focusInterval = null;
let focusStartTime = null;

function initializeFocus() {
    document.getElementById('startFocusBtn').addEventListener('click', startFocusSession);
    document.getElementById('endFocusBtn').addEventListener('click', endFocusSession);

    renderFocusSessions();
}

function startFocusSession() {
    const task = document.getElementById('focusTaskInput').value.trim() || 'Focus Session';

    focusStartTime = Date.now();
    document.getElementById('startFocusBtn').style.display = 'none';
    document.getElementById('endFocusBtn').style.display = 'block';
    document.getElementById('focusLabel').textContent = `Working on: ${task}`;

    focusInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - focusStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById('focusTimerDisplay').textContent =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function endFocusSession() {
    clearInterval(focusInterval);

    const elapsed = Math.floor((Date.now() - focusStartTime) / 1000);
    const minutes = Math.ceil(elapsed / 60);
    const task = document.getElementById('focusTaskInput').value.trim() || 'Focus Session';

    const session = {
        id: Date.now(),
        task,
        duration: minutes,
        timestamp: new Date().toISOString()
    };

    state.focusSessions.push(session);
    state.pomodoro.totalFocusTime += minutes;

    document.getElementById('startFocusBtn').style.display = 'block';
    document.getElementById('endFocusBtn').style.display = 'none';
    document.getElementById('focusTimerDisplay').textContent = '00:00';
    document.getElementById('focusLabel').textContent = 'Great work! Ready for another session?';
    document.getElementById('focusTaskInput').value = '';

    saveState();
    renderFocusSessions();
    updateDashboardStats();
    showConfetti();
}

function renderFocusSessions() {
    const container = document.getElementById('focusSessionsList');
    if (!container) return;

    const todaySessions = state.focusSessions.filter(s => {
        const sessionDate = new Date(s.timestamp).toDateString();
        const today = new Date().toDateString();
        return sessionDate === today;
    });

    if (todaySessions.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 1rem;">No sessions yet</p>';
    } else {
        container.innerHTML = todaySessions.map(session => `
            <div class="focus-session-item">
                <div class="focus-session-task">${session.task}</div>
                <div class="focus-session-time">${session.duration} minutes</div>
            </div>
        `).join('');
    }

    const totalMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    document.getElementById('totalFocusTimeToday').textContent =
        hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

// ===================================
// CHARTS
// ===================================

function updateAllCharts() {
    // Weekly productivity chart
    const weeklyChart = new ChartRenderer('weeklyChart');
    const todayDate = new Date();
    const weekLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekValues = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(todayDate);
        date.setDate(date.getDate() - (6 - i));
        const dateStr = date.toDateString();

        // Count completed habits + tasks for each day
        const habits = state.habits.filter(h => h.completedDates.includes(dateStr)).length;
        const tasks = state.tasks.filter(t => {
            const taskDate = new Date(t.createdAt).toDateString();
            return t.completed && taskDate === dateStr;
        }).length;

        return habits + tasks;
    });

    weeklyChart.drawBarChart({
        labels: weekLabels,
        values: weekValues
    });

    // Habit completion donut chart
    const habitChart = new ChartRenderer('habitCompletionChart');
    const todayStr = new Date().toDateString();
    const totalHabits = state.habits.length;
    const completedHabits = state.habits.filter(h => h.completedDates.includes(todayStr)).length;
    const pendingHabits = totalHabits - completedHabits;

    if (totalHabits > 0) {
        habitChart.drawDonutChart({
            values: [completedHabits, pendingHabits],
            labels: ['Completed', 'Pending'],
            colors: ['#10b981', '#334155']
        });
    } else {
        habitChart.ctx.fillStyle = '#94a3b8';
        habitChart.ctx.font = '14px Inter';
        habitChart.ctx.textAlign = 'center';
        habitChart.ctx.fillText('No habits tracked yet', habitChart.width / 2, habitChart.height / 2);
    }
}

// ===================================
// UTILITIES
// ===================================

function showConfetti() {
    const container = document.getElementById('confetti');
    const colors = ['#6366f1', '#8b5cf6', '#14b8a6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        container.appendChild(confetti);

        setTimeout(() => confetti.remove(), 3000);
    }
}

// Make functions globally accessible
window.toggleHabitDay = toggleHabitDay;
window.deleteHabit = deleteHabit;
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
window.toggleGoal = toggleGoal;

// Auto-save every 30 seconds
setInterval(saveState, 30000);
