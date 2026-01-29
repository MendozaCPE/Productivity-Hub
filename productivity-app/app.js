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

// --- API HANDLING ---
async function apiCall(action, method = 'POST', data = null) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`backend/api.php?action=${action}`, options);
        const result = await response.json();

        if (result.error) {
            console.error('API Error:', result.error);
            // Optional: Show error toast
            return null;
        }
        return result;
    } catch (error) {
        console.error('Network/Server Error:', error);
        return null;
    }
}

async function loadState() {
    try {
        const response = await fetch('backend/api.php?action=get_data');
        const data = await response.json();

        if (data) {
            // Load pomodoro stats
            if (data.pomodoro) {
                state.pomodoro.sessionsCompleted = data.pomodoro.sessionsCompleted || 0;
                state.pomodoro.totalFocusTime = data.pomodoro.totalFocusTime || 0;
            }

            // Load data arrays
            state.habits = data.habits || [];
            state.tasks = data.tasks || [];
            state.goals = data.goals || [];
            state.focusSessions = data.focusSessions || [];

            // Focus sessions might need separate loading if not in get_data, 
            // but the API seems to rely on get_data for everything except focus history list

            // Refresh UI
            renderApp();
        }
    } catch (error) {
        console.error("Failed to load state:", error);
    }
}

function renderApp() {
    updateDashboardStats();
    renderHabits();
    renderTasks();
    renderGoals();
    updatePomodoroStats();

    // Timer state relies on defaults until user interaction, 
    // but stats are updated from DB.
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
    if (document.getElementById('weeklyChart')) {
        updateAllCharts();
    }
}

function updateAllCharts() {
    // 1. Weekly Productivity (Focus Time)
    if (document.getElementById('weeklyChart')) {
        const chart = new ChartRenderer('weeklyChart');
        const today = new Date();
        const labels = [];
        const values = [];

        // Last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));

            // Calculate focus time for this day (from sessions)
            // Note: In a real app we might want to aggregate this on backend
            // For now, we filter loaded focusSessions
            const dateStr = date.toISOString().split('T')[0];
            const dayMinutes = state.focusSessions
                .filter(s => s.created_at && s.created_at.startsWith(dateStr))
                .reduce((acc, s) => acc + parseInt(s.duration), 0);

            values.push(dayMinutes);
        }

        chart.drawBarChart({
            labels: labels,
            values: values,
            colors: ['#c67c4e', '#e3a985', '#312e81', '#4f46e5', '#818cf8'], // Use theme colors
            showValues: true
        });
    }

    // 2. Habit Completion Rate (Line Chart)
    if (document.getElementById('habitCompletionChart')) {
        const chart = new ChartRenderer('habitCompletionChart');
        const today = new Date();
        const labels = [];
        const values = [];

        // Last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const label = date.toLocaleDateString('en-US', { weekday: 'short' });
            labels.push(label);

            const dateStr = date.toDateString();
            const totalHabits = state.habits.length;
            if (totalHabits > 0) {
                // Check local array structure
                let completedCount = 0;
                state.habits.forEach(h => {
                    // Check both date formats just in case
                    if (h.completedDates && (h.completedDates.includes(dateStr) || h.completedDates.includes(date.toISOString().split('T')[0]))) {
                        completedCount++;
                    }
                });
                values.push(Math.round((completedCount / totalHabits) * 100));
            } else {
                values.push(0);
            }
        }

        chart.drawLineChart({
            labels: labels,
            datasets: [{
                label: 'Habit Completion (%)',
                values: values,
                color: '#10b981' // Green for habits
            }]
        });
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

        // Update stats in DB
        apiCall('update_pomodoro', 'POST', {
            sessionsCompleted: state.pomodoro.sessionsCompleted,
            totalFocusTime: state.pomodoro.totalFocusTime
        });

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
    if (!document.getElementById('habits')) return;

    const saveBtn = document.getElementById('saveHabitBtn');
    if (saveBtn) saveBtn.addEventListener('click', saveHabit);

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

    state.selectedHabitColor = '#6366f1';

    renderHabits();
    updateHabitCharts();
}

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

    // Save to DB
    apiCall('add_habit', 'POST', {
        id: habit.id,
        name: habit.name,
        color: habit.color
    }).then(res => {
        if (res && res.status === 'success') {
            state.habits.push(habit);
            renderHabits();
            updateHabitCharts();

            // Clear input
            nameInput.value = '';
            // Reset color
            const firstColor = document.querySelector('.color-option');
            if (firstColor) firstColor.click();
        }
    });
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
            const isCompleted = habit.completedDates && habit.completedDates.includes(dateStr);
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

    if (!habit.completedDates) habit.completedDates = [];

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

    // Update in DB
    apiCall('update_habit_dates', 'POST', {
        id: habit.id,
        completedDates: habit.completedDates
    });

    renderHabits();
    updateHabitCharts();
}

function deleteHabit(habitId) {
    if (!confirm('Are you sure you want to delete this habit?')) return;

    apiCall('delete_habit', 'POST', { id: habitId }).then(res => {
        if (res && res.status === 'success') {
            state.habits = state.habits.filter(h => h.id !== habitId);
            renderHabits();
            updateHabitCharts();
        }
    });
}

function calculateHabitStreak(habit) {
    let streak = 0;
    const today = new Date();
    if (!habit.completedDates) return 0;

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
    const completedToday = state.habits.filter(h => h.completedDates && h.completedDates.includes(today)).length;
    const rate = count > 0 ? Math.round((completedToday / count) * 100) : 0;
    document.getElementById('habitCompletionRate').textContent = `${rate}%`;

    const bestStreak = Math.max(...state.habits.map(h => calculateHabitStreak(h)), 0);
    document.getElementById('bestStreak').textContent = `${bestStreak} days`;
}

function updateHabitCharts() {
    if (!document.getElementById('habitsWeeklyChart')) return;

    const weeklyChart = new ChartRenderer('habitsWeeklyChart');
    const today = new Date();
    const weekLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekValues = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));
        const dateStr = date.toDateString();
        return state.habits.filter(h => h.completedDates && h.completedDates.includes(dateStr)).length;
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
        const completed = state.habits.filter(h => h.completedDates && h.completedDates.includes(dateStr)).length;
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
        id: Date.now().toString(), // Ensure ID is string for DB consistency if needed
        text,
        priority,
        completed: false
    };

    apiCall('add_task', 'POST', {
        id: task.id,
        text: task.text,
        priority: task.priority
    }).then(res => {
        if (res && res.status === 'success') {
            state.tasks.push(task);
            input.value = '';
            renderTasks();
        }
    });
}

function renderTasks() {
    const activeContainer = document.getElementById('activeTasks');
    const completedContainer = document.getElementById('completedTasks');
    if (!activeContainer || !completedContainer) return;

    const activeTasks = state.tasks.filter(t => !t.completed);
    const completedTasks = state.tasks.filter(t => t.completed);

    activeContainer.innerHTML = activeTasks.length ? activeTasks.map(task => `
        <div class="task-item priority-${task.priority}">
            <div class="task-checkbox" onclick="toggleTask('${task.id}')"></div>
            <div class="task-text">${task.text}</div>
            <button class="task-delete" onclick="deleteTask('${task.id}')">✕</button>
        </div>
    `).join('') : '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No active tasks</p>';

    completedContainer.innerHTML = completedTasks.length ? completedTasks.map(task => `
        <div class="task-item priority-${task.priority} completed">
            <div class="task-checkbox" onclick="toggleTask('${task.id}')"></div>
            <div class="task-text">${task.text}</div>
            <button class="task-delete" onclick="deleteTask('${task.id}')">✕</button>
        </div>
    `).join('') : '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No completed tasks</p>';
}

function toggleTask(taskId) {
    const task = state.tasks.find(t => t.id == taskId);
    if (!task) return;

    apiCall('toggle_task', 'POST', { id: taskId }).then(res => {
        if (res && res.status === 'success') {
            task.completed = !task.completed;
            if (task.completed) showConfetti();
            renderTasks();
            if (document.getElementById('todayTasks')) updateDashboardStats();
        }
    });
}

function deleteTask(taskId) {
    apiCall('delete_task', 'POST', { id: taskId }).then(res => {
        if (res && res.status === 'success') {
            state.tasks = state.tasks.filter(t => t.id != taskId);
            renderTasks();
            if (document.getElementById('todayTasks')) updateDashboardStats();
        }
    });
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
        id: Date.now().toString(),
        text,
        completed: false
    };

    apiCall('add_goal', 'POST', { id: goal.id, text: goal.text }).then(res => {
        if (res && res.status === 'success') {
            state.goals.push(goal);
            input.value = '';
            renderGoals();
        }
    });
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
            <div class="goal-checkbox" onclick="toggleGoal('${goal.id}')"></div>
            <div class="goal-text">${goal.text}</div>
            <div style="margin-left:auto; cursor:pointer;" onclick="deleteGoal('${goal.id}')">✕</div>
        </div>
    `).join('');

    updateGoalsProgress();
}

function toggleGoal(goalId) {
    const goal = state.goals.find(g => g.id == goalId);
    if (!goal) return;

    apiCall('toggle_goal', 'POST', { id: goalId }).then(res => {
        if (res && res.status === 'success') {
            goal.completed = !goal.completed;
            renderGoals();
        }
    });
}

function deleteGoal(goalId) {
    apiCall('delete_goal', 'POST', { id: goalId }).then(res => {
        if (res && res.status === 'success') {
            state.goals = state.goals.filter(g => g.id != goalId);
            renderGoals();
        }
    });
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
            id: Date.now().toString(),
            taskName: taskName || 'Untitled Session',
            duration: elapsedMinutes,
            created_at: new Date().toISOString()
        };

        // Save to DB
        apiCall('add_focus_session', 'POST', {
            id: session.id,
            taskName: session.taskName,
            duration: session.duration
        }).then(res => {
            if (res && res.status === 'success') {
                state.focusSessions.push(session);
                // Also update pomodoro stats total focus time
                state.pomodoro.totalFocusTime += elapsedMinutes;
                apiCall('update_pomodoro', 'POST', {
                    sessionsCompleted: state.pomodoro.sessionsCompleted,
                    totalFocusTime: state.pomodoro.totalFocusTime
                });
                updatePomodoroStats();
            }
        });
    }

    // Reset UI
    document.getElementById('startFocusBtn').style.display = 'inline-block';
    document.getElementById('endFocusBtn').style.display = 'none';
    document.getElementById('focusLabel').textContent = 'What are you working on?';
    taskInput.style.display = 'block';
    taskInput.value = '';
    document.getElementById('focusTimerDisplay').textContent = "00:00";
}

// Utility for Confetti
function showConfetti() {
    // Simple confetti effect placeholder
    // In a real app we'd use a library like canvas-confetti
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff'];
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-10px';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.zIndex = '9999';
        confetti.style.transition = 'top 2s ease-out, transform 2s ease-out';
        document.body.appendChild(confetti);

        setTimeout(() => {
            confetti.style.top = '110vh';
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        }, 10);

        setTimeout(() => confetti.remove(), 2000);
    }
}
