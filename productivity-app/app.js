// ===================================
// PRODUCTIVITY HUB - MAIN APPLICATION
// ===================================

// Application State
const state = {
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

// --- STORAGE (Static - LocalStorage) ---
const STORAGE_KEY = 'productivity_hub_data';

function saveState() {
    try {
        const dataToSave = {
            pomodoro: {
                sessionsCompleted: state.pomodoro.sessionsCompleted,
                totalFocusTime: state.pomodoro.totalFocusTime,
                workDuration: state.pomodoro.workDuration,
                shortBreakDuration: state.pomodoro.shortBreakDuration,
                longBreakDuration: state.pomodoro.longBreakDuration
            },
            habits: state.habits,
            tasks: state.tasks,
            goals: state.goals,
            focusSessions: state.focusSessions
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
        console.error("Failed to save state:", error);
    }
}

function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);

            // Load pomodoro stats
            if (data.pomodoro) {
                Object.assign(state.pomodoro, data.pomodoro);
            }

            // Load data arrays
            state.habits = data.habits || [];
            state.tasks = data.tasks || [];
            state.goals = data.goals || [];
            state.focusSessions = data.focusSessions || [];

            // Reset timer state
            state.pomodoro.isRunning = false;
            state.pomodoro.timeLeft = (state.pomodoro.workDuration || 25) * 60;
        }
    } catch (error) {
        console.error("Failed to load state:", error);
    }
}

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    loadState();

    initializeDashboard();
    initializePomodoro();
    initializeHabits();
    initializeTasks();
    initializeGoals();
    initializeFocus();

    if (document.querySelector('.dashboard-grid')) {
        updateDashboardStats();
    }
});

// ===================================
// DASHBOARD
// ===================================

function initializeDashboard() {
    if (!document.getElementById('dashboardGreeting')) return;
    updateGreeting();
    updateCurrentDate();
    setInterval(updateCurrentDate, 60000);
}

function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = 'Good evening';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';

    const greetingEl = document.getElementById('dashboardGreeting');
    if (greetingEl) greetingEl.textContent = `${greeting}! Ready to be productive?`;
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
    const todayPomodoros = document.getElementById('todayPomodoros');
    if (todayPomodoros) todayPomodoros.textContent = state.pomodoro.sessionsCompleted;

    const todayTasks = document.getElementById('todayTasks');
    if (todayTasks) {
        const completed = state.tasks.filter(t => t.completed).length;
        todayTasks.textContent = completed;
    }

    const todayHabits = document.getElementById('todayHabits');
    if (todayHabits) {
        const today = new Date().toDateString();
        const total = state.habits.length;
        const completed = state.habits.filter(h => h.completedDates && h.completedDates.includes(today)).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        todayHabits.textContent = `${percentage}%`;
    }

    const todayFocusTime = document.getElementById('todayFocusTime');
    if (todayFocusTime) {
        const hours = Math.floor(state.pomodoro.totalFocusTime / 60);
        const minutes = state.pomodoro.totalFocusTime % 60;
        todayFocusTime.textContent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    }

    const streakEl = document.getElementById('currentStreak');
    if (streakEl) streakEl.textContent = calculateCurrentStreak();

    updateGoalsPreview();
    updateTasksPreview();

    // Update charts if they exist
    if (typeof updateAllCharts === 'function' && document.getElementById('weeklyChart')) {
        updateAllCharts();
    }
}

function calculateCurrentStreak() {
    if (state.habits.length === 0) return 0;
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toDateString();
        const completedToday = state.habits.filter(h => h.completedDates && h.completedDates.includes(dateStr)).length;
        if (completedToday > 0) streak++;
        else if (i > 0) break;
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
        const priorityColors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
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
    if (!startPauseBtn) return;

    const resetBtn = document.getElementById('resetBtn');
    const modeBtns = document.querySelectorAll('.mode-btn');

    startPauseBtn.addEventListener('click', togglePomodoro);
    resetBtn.addEventListener('click', resetPomodoro);

    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchPomodoroMode(btn.dataset.mode);
        });
    });

    ['workDuration', 'shortBreakDuration', 'longBreakDuration'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('change', (e) => {
                const val = parseInt(e.target.value);
                state.pomodoro[id] = val;
                const modeKey = id.replace('Duration', '');
                // Correct mapping: workDuration -> work, shortBreakDuration -> short, longBreakDuration -> long
                const modeMap = { workDuration: 'work', shortBreakDuration: 'short', longBreakDuration: 'long' };
                if (state.pomodoro.mode === modeMap[id] && !state.pomodoro.isRunning) {
                    state.pomodoro.timeLeft = val * 60;
                    updateTimerDisplay();
                }
            });
        }
    });

    updateTimerDisplay();
    updatePomodoroStats();
}

function togglePomodoro() {
    if (state.pomodoro.isRunning) pausePomodoro();
    else startPomodoro();
}

function startPomodoro() {
    state.pomodoro.isRunning = true;
    document.getElementById('startPauseText').textContent = 'Pause';
    pomodoroInterval = setInterval(() => {
        state.pomodoro.timeLeft--;
        if (state.pomodoro.mode === 'work') state.pomodoro.totalFocusTime++;

        updateTimerDisplay();

        if (state.pomodoro.timeLeft <= 0) completePomodoro();
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
        saveState();
        const nextMode = state.pomodoro.sessionsCompleted % 4 === 0 ? 'long' : 'short';
        setTimeout(() => switchPomodoroMode(nextMode), 1000);
    } else {
        setTimeout(() => switchPomodoroMode('work'), 1000);
    }
    updatePomodoroStats();
}

function switchPomodoroMode(mode) {
    if (state.pomodoro.isRunning) pausePomodoro();
    state.pomodoro.mode = mode;
    const durations = {
        work: state.pomodoro.workDuration * 60,
        short: state.pomodoro.shortBreakDuration * 60,
        long: state.pomodoro.longBreakDuration * 60
    };
    state.pomodoro.timeLeft = durations[mode];

    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    const labels = { work: 'Focus Time', short: 'Short Break', long: 'Long Break' };
    const timerLabel = document.getElementById('timerLabel');
    if (timerLabel) timerLabel.textContent = labels[mode];
    document.getElementById('startPauseText').textContent = 'Start';
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const timerDisplay = document.getElementById('timerDisplay');
    if (!timerDisplay) return;
    const minutes = Math.floor(state.pomodoro.timeLeft / 60);
    const seconds = state.pomodoro.timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const ring = document.getElementById('pomoRingFill');
    if (ring) {
        const durations = {
            work: state.pomodoro.workDuration * 60,
            short: state.pomodoro.shortBreakDuration * 60,
            long: state.pomodoro.longBreakDuration * 60
        };
        const total = durations[state.pomodoro.mode];
        const elapsed = total - state.pomodoro.timeLeft;
        const dashArray = 565.48;
        const offset = dashArray - (elapsed / total) * dashArray;
        ring.style.strokeDashoffset = offset;
    }

    // Coffee cup animation for pomodoro.php
    const coffee = document.getElementById('coffee');
    if (coffee) {
        const durations = {
            work: state.pomodoro.workDuration * 60,
            short: state.pomodoro.shortBreakDuration * 60,
            long: state.pomodoro.longBreakDuration * 60
        };
        const total = durations[state.pomodoro.mode];
        const elapsed = total - state.pomodoro.timeLeft;
        const heightPercent = (elapsed / total) * 100;
        coffee.style.height = `${heightPercent}%`;
    }
}


function updatePomodoroStats() {
    const sessionCount = document.getElementById('sessionCount');
    if (sessionCount) sessionCount.textContent = state.pomodoro.sessionsCompleted;
    const totalTimeEl = document.getElementById('totalFocusTime');
    if (totalTimeEl) {
        const hours = Math.floor(state.pomodoro.totalFocusTime / 60);
        const minutes = state.pomodoro.totalFocusTime % 60;
        totalTimeEl.textContent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    }
}

// ===================================
// HABITS
// ===================================

function initializeHabits() {
    // Check if we are on the habits page by checking for the container or unique element
    if (!document.getElementById('habits')) return;

    const saveBtn = document.getElementById('saveHabitBtn');
    if (saveBtn) saveBtn.addEventListener('click', saveHabit);

    // Allow enter key in habit name input
    const nameInput = document.getElementById('habitName');
    if (nameInput) {
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveHabit();
        });
    }

    document.querySelectorAll('.color-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-option').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            state.selectedHabitColor = btn.dataset.color;
        });
    });

    // Default selection
    state.selectedHabitColor = '#6366f1';

    renderHabits();
    updateHabitCharts();
}

// Modal functions removed

function saveHabit() {
    const nameInput = document.getElementById('habitName');
    const name = nameInput.value.trim();
    if (!name) return;

    const habit = {
        id: Date.now(),
        name,
        color: state.selectedHabitColor || '#6366f1',
        completedDates: []
    };

    state.habits.push(habit);
    renderHabits();
    updateHabitCharts();
    saveState();

    // Clear input
    nameInput.value = '';
    // Reset color to first one
    const firstColor = document.querySelector('.color-option');
    if (firstColor) firstColor.click();
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
            return `<div class="habit-day ${isCompleted ? 'completed' : ''}" 
                         onclick="toggleHabitDay(${habit.id}, '${dateStr}')"></div>`;
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
        const today = new Date().toDateString();
        if (dateStr === today) {
            if (state.habits.every(h => h.completedDates.includes(today))) showConfetti();
        }
    }

    renderHabits();
    updateHabitCharts();
    saveState();
}

function deleteHabit(habitId) {
    if (!confirm('Are you sure you want to delete this habit?')) return;
    state.habits = state.habits.filter(h => h.id !== habitId);
    renderHabits();
    updateHabitCharts();
    saveState();
}

function calculateHabitStreak(habit) {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toDateString();
        if (habit.completedDates.includes(dateStr)) streak++;
        else if (i > 0) break;
    }
    return streak;
}

function updateHabitStats() {
    const totalHabits = document.getElementById('totalHabits');
    if (!totalHabits) return;
    totalHabits.textContent = state.habits.length;

    const today = new Date().toDateString();
    const count = state.habits.length;
    const completedToday = state.habits.filter(h => h.completedDates.includes(today)).length;
    const rate = count > 0 ? Math.round((completedToday / count) * 100) : 0;
    document.getElementById('habitCompletionRate').textContent = `${rate}%`;

    const bestStreak = Math.max(...state.habits.map(h => calculateHabitStreak(h)), 0);
    document.getElementById('bestStreak').textContent = `${bestStreak} days`;
}

function updateHabitCharts() {
    if (!document.getElementById('habitsWeeklyChart')) return;

    // Logic for charts remains same (relying on charts.js which uses global 'state')
    // Re-render chart wrapper
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
        datasets: [{ values: monthValues, color: '#ffffff', label: 'Completion %' }]
    });
}

// ===================================
// TASKS
// ===================================

function initializeTasks() {
    const addTaskBtn = document.getElementById('addTaskBtn');
    if (!addTaskBtn) return;

    addTaskBtn.addEventListener('click', () => document.getElementById('taskInput').focus());
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
        completed: false
    };

    state.tasks.push(task);
    input.value = '';
    renderTasks();
    saveState();
}

function renderTasks() {
    const activeContainer = document.getElementById('activeTasks');
    const completedContainer = document.getElementById('completedTasks');
    if (!activeContainer || !completedContainer) return;

    const activeTasks = state.tasks.filter(t => !t.completed);
    const completedTasks = state.tasks.filter(t => t.completed);

    activeContainer.innerHTML = activeTasks.length ? activeTasks.map(task => `
        <div class="task-item priority-${task.priority}">
            <div class="task-checkbox" onclick="toggleTask(${task.id})"></div>
            <div class="task-text">${task.text}</div>
            <button class="task-delete" onclick="deleteTask(${task.id})">✕</button>
        </div>
    `).join('') : '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No active tasks</p>';

    completedContainer.innerHTML = completedTasks.length ? completedTasks.map(task => `
        <div class="task-item priority-${task.priority} completed">
            <div class="task-checkbox" onclick="toggleTask(${task.id})"></div>
            <div class="task-text">${task.text}</div>
            <button class="task-delete" onclick="deleteTask(${task.id})">✕</button>
        </div>
    `).join('') : '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No completed tasks</p>';
}

function toggleTask(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;
    if (task.completed) showConfetti();

    renderTasks();
    if (document.getElementById('todayTasks')) updateDashboardStats();
    saveState();
}

function deleteTask(taskId) {
    state.tasks = state.tasks.filter(t => t.id !== taskId);
    renderTasks();
    if (document.getElementById('todayTasks')) updateDashboardStats();
    saveState();
}

// ===================================
// GOALS
// ===================================

function initializeGoals() {
    const addGoalBtn = document.getElementById('addGoalBtn');
    if (!addGoalBtn) return;

    addGoalBtn.addEventListener('click', addGoal);
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
        completed: false
    };

    state.goals.push(goal);
    input.value = '';
    renderGoals();
    saveState();
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
            <div style="margin-left:auto; cursor:pointer;" onclick="deleteGoal(${goal.id})">✕</div>
        </div>
    `).join('');

    updateGoalsProgress();
}

function toggleGoal(goalId) {
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return;
    goal.completed = !goal.completed;
    renderGoals();
    saveState();
}

function deleteGoal(goalId) {
    state.goals = state.goals.filter(g => g.id !== goalId);
    renderGoals();
    saveState();
}

function updateGoalsProgress() {
    const progressRing = document.getElementById('goalsProgressRing');
    if (!progressRing) return;
    const total = state.goals.length;
    const completed = state.goals.filter(g => g.completed).length;
    const percent = total === 0 ? 0 : (completed / total);
    const circumference = 502;
    const offset = circumference - (percent * circumference);
    progressRing.style.strokeDashoffset = offset;
    document.getElementById('goalsProgress').textContent = Math.round(percent * 100) + '%';
}

function updateMotivationalQuote() {
    const quotes = [
        { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
        { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
        { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" }
    ];
    const quoteEl = document.getElementById('motivationalQuote');
    const authorEl = document.getElementById('quoteAuthor');
    if (quoteEl && authorEl) {
        const random = quotes[Math.floor(Math.random() * quotes.length)];
        quoteEl.textContent = `"${random.text}"`;
        authorEl.textContent = `- ${random.author}`;
    }
}

// ===================================
// FOCUS MODE
// ===================================

function initializeFocus() {
    const startBtn = document.getElementById('startFocusBtn');
    if (!startBtn) return;
    startBtn.addEventListener('click', startFocusSession);
    document.getElementById('endFocusBtn').addEventListener('click', endFocusSession);
    document.getElementById('focusTimerDisplay').textContent = "00:00";
}

let focusInterval = null;
let focusStartTime = null;

function startFocusSession() {
    const input = document.getElementById('focusTaskInput');
    if (!input.value.trim()) {
        alert('Please enter what you are working on first!');
        return;
    }
    focusStartTime = Date.now();
    document.getElementById('startFocusBtn').style.display = 'none';
    document.getElementById('endFocusBtn').style.display = 'inline-block';
    document.getElementById('focusLabel').textContent = "Focusing on: " + input.value;
    input.style.display = 'none';

    focusInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - focusStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById('focusTimerDisplay').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function endFocusSession() {
    if (!focusInterval) return;
    clearInterval(focusInterval);
    const elapsedMinutes = Math.floor((Date.now() - focusStartTime) / 1000 / 60);
    const taskInput = document.getElementById('focusTaskInput');
    const taskName = taskInput.value.trim();

    if (elapsedMinutes > 0) {
        // Save focus session
        const session = {
            id: Date.now(),
            taskName: taskName || 'Untitled Session',
            duration: elapsedMinutes,
            created_at: new Date().toISOString()
        };
        state.focusSessions.push(session);

        // Update pomodoro stats
        state.pomodoro.totalFocusTime += elapsedMinutes;
        saveState();
    }

    document.getElementById('startFocusBtn').style.display = 'inline-block';
    document.getElementById('endFocusBtn').style.display = 'none';
    document.getElementById('focusLabel').textContent = "Great job!";

    const input = document.getElementById('focusTaskInput');
    input.style.display = 'block';
    input.value = '';

    const sessionsList = document.getElementById('focusSessionsList');
    if (sessionsList) sessionsList.innerHTML += `<div>Focused for ${elapsedMinutes}m</div>`;

    const totalToday = document.getElementById('totalFocusTimeToday');
    if (totalToday) totalToday.textContent = state.pomodoro.totalFocusTime + "m";
}

// ===================================
// UTILS
// ===================================

function showConfetti() {
    const confettiContainer = document.getElementById('confetti');
    if (!confettiContainer) return;
    for (let i = 0; i < 50; i++) {
        const confetto = document.createElement('div');
        confetto.classList.add('confetti-piece');
        confetto.style.left = Math.random() * 100 + 'vw';
        confetto.style.animationDuration = (Math.random() * 3 + 2) + 's';
        confetto.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        confettiContainer.appendChild(confetto);
        setTimeout(() => confetto.remove(), 5000);
    }
}

// Dynamic styles for confetti
const style = document.createElement('style');
style.innerHTML = `
.confetti-piece {
    position: fixed;
    top: -10px;
    width: 10px;
    height: 10px;
    z-index: 9999;
    animation: fall linear forwards;
}
@keyframes fall {
    to { transform: translateY(100vh) rotate(720deg); }
}
`;
document.head.appendChild(style);
