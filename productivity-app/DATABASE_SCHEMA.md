# 📊 Productivity Hub - Database Schema Reference

## Database: `productivity_hub`

---

## 📋 Table 1: `tasks`

**Purpose:** Store user to-do items with priority levels

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PRIMARY KEY | Unique task identifier |
| `text` | VARCHAR(255) | NOT NULL | Task description |
| `priority` | ENUM | 'low', 'medium', 'high' | Task priority level (default: 'medium') |
| `completed` | BOOLEAN | DEFAULT FALSE | Completion status |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

**CRUD Operations:**
- ✅ CREATE: `add_task`
- ✅ READ: `get_data` 
- ✅ UPDATE: `toggle_task`
- ✅ DELETE: `delete_task`

**Used In:**
- Dashboard (stats + preview)
- Tasks page (full management)

---

## ✨ Table 2: `habits`

**Purpose:** Track recurring habits and completion dates

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PRIMARY KEY | Unique habit identifier |
| `name` | VARCHAR(255) | NOT NULL | Habit name |
| `color` | VARCHAR(7) | NOT NULL | Hex color code for UI (#RRGGBB) |
| `completed_dates` | TEXT | - | JSON array of completion dates |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

**CRUD Operations:**
- ✅ CREATE: `add_habit`
- ✅ READ: `get_data`
- ✅ UPDATE: `update_habit_dates`
- ✅ DELETE: `delete_habit`

**Used In:**
- Dashboard (stats + streak calculation)
- Habits page (full management with weekly grid)

---

## 🎯 Table 3: `goals`

**Purpose:** Store daily/periodic goals

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PRIMARY KEY | Unique goal identifier |
| `text` | VARCHAR(255) | NOT NULL | Goal description |
| `completed` | BOOLEAN | DEFAULT FALSE | Completion status |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

**CRUD Operations:**
- ✅ CREATE: `add_goal`
- ✅ READ: `get_data`
- ✅ UPDATE: `toggle_goal`
- ✅ DELETE: `delete_goal`

**Used In:**
- Dashboard (preview)
- Goals page (full management with progress ring)

---

## 🧘 Table 4: `focus_sessions`

**Purpose:** Log individual deep work/focus sessions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PRIMARY KEY | Unique session identifier |
| `task_name` | VARCHAR(255) | - | What user was working on (nullable) |
| `duration` | INT | - | Session length in minutes |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Session start timestamp |

**CRUD Operations:**
- ✅ CREATE: `add_focus_session` *(newly implemented)*
- ✅ READ: `get_focus_sessions` *(newly implemented)*
- ⚪ UPDATE: N/A (sessions are immutable)
- ⚪ DELETE: Not implemented (historical data)

**Used In:**
- Focus page (logs each session)
- Dashboard (contributes to focus time stats)

---

## ☕ Table 5: `pomodoro_stats`

**Purpose:** Aggregate Pomodoro technique statistics (single-row table)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, DEFAULT 1 | Always 1 (single record) |
| `sessions_completed` | INT | DEFAULT 0 | Total Pomodoro sessions |
| `total_focus_time` | INT | DEFAULT 0 | Cumulative focus time (minutes) |

**Initial Data:**
```sql
INSERT IGNORE INTO pomodoro_stats (id, sessions_completed, total_focus_time) 
VALUES (1, 0, 0);
```

**CRUD Operations:**
- ⚪ CREATE: Pre-initialized
- ✅ READ: `get_data`
- ✅ UPDATE: `update_pomodoro`
- ⚪ DELETE: N/A (persistent stats)

**Used In:**
- Dashboard (Coffees Today, Focus Time stats)
- Pomodoro page (session counter, total time)
- Focus page (updates total_focus_time)

---

## 🔗 Relationships & Data Flow

```
┌─────────────┐
│  Dashboard  │ ← Aggregates data from ALL tables
└─────────────┘
      ↓
┌─────────────────────────────────────────┐
│         get_data API endpoint           │
│  Returns: tasks, habits, goals, pomodoro │
└─────────────────────────────────────────┘
      ↓
┌──────────┬──────────┬──────────┬──────────────┬──────────────┐
│  tasks   │  habits  │  goals   │ focus_sessions│pomodoro_stats│
└──────────┴──────────┴──────────┴──────────────┴──────────────┘

Focus Sessions → Updates both:
  • focus_sessions table (individual records)
  • pomodoro_stats.total_focus_time (aggregate)

Pomodoro Timer → Updates:
  • pomodoro_stats.sessions_completed
  • pomodoro_stats.total_focus_time
```

---

## 🎨 Frontend-Backend Integration

### Data Loading Flow
```javascript
// On page load
loadState() 
  → fetch('backend/api.php?action=get_data')
  → state = { tasks, habits, goals, pomodoro }
  → renderUI()
```

### Data Saving Flow
```javascript
// User action (e.g., add task)
addTask()
  → apiCall('add_task', taskData)
  → backend inserts into database
  → re-render UI locally
```

---

## 📦 API Endpoints Summary

| Action | Method | Request Data | Response |
|--------|--------|--------------|----------|
| `get_data` | GET | - | All app data (tasks, habits, goals, pomodoro) |
| `add_task` | POST | {id, text, priority} | {status: "success"} |
| `toggle_task` | POST | {id} | {status: "success"} |
| `delete_task` | POST | {id} | {status: "success"} |
| `add_habit` | POST | {id, name, color} | {status: "success"} |
| `update_habit_dates` | POST | {id, completedDates[]} | {status: "success"} |
| `delete_habit` | POST | {id} | {status: "success"} |
| `add_goal` | POST | {id, text} | {status: "success"} |
| `toggle_goal` | POST | {id} | {status: "success"} |
| `delete_goal` | POST | {id} | {status: "success"} |
| `add_focus_session` | POST | {id, taskName, duration} | {status: "success"} |
| `get_focus_sessions` | POST | - | Array of session objects |
| `update_pomodoro` | POST | {sessionsCompleted, totalFocusTime} | {status: "success"} |

---

## 🔐 Database Configuration

**File:** `backend/api.php` (lines 7-10)

```php
$host = "localhost";
$user = "root";
$pass = "";
$db = "productivity_hub";
```

**Initialization File:** `backend/init.sql`
- Creates database if not exists
- Creates all 5 tables
- Inserts initial pomodoro_stats record

---

## 📈 Statistics & Calculations

### Dashboard Stats

1. **Coffees Today** = `pomodoro_stats.sessions_completed`
2. **Tasks Completed** = COUNT(tasks WHERE completed = TRUE)
3. **Habits Completed** = (habits completed today / total habits) × 100%
4. **Focus Time** = `pomodoro_stats.total_focus_time` (in minutes)
5. **Day Streak** = Consecutive days with ANY habit completed

### Habit Streak Calculation
```javascript
// Checks backward from today
// Ends when a day with 0 completions is found
calculateHabitStreak(habit)
  → Loop from today backwards
  → if date in habit.completedDates: streak++
  → else if i > 0: break
```

---

## 🧪 Testing Database Connectivity

### Quick Test
Visit: `http://localhost:8000/test_db.html`
- Automated CRUD tests for all tables
- Visual success/error indicators
- View all data in formatted JSON

### Manual Verification
```sql
-- Check all tables exist
SHOW TABLES FROM productivity_hub;

-- View sample data
SELECT * FROM tasks LIMIT 5;
SELECT * FROM habits LIMIT 5;
SELECT * FROM goals LIMIT 5;
SELECT * FROM focus_sessions LIMIT 5;
SELECT * FROM pomodoro_stats;
```

---

## 📁 File Structure

```
productivity-app/
├── backend/
│   ├── api.php              ← All API endpoints
│   ├── init.sql             ← Database schema
│   └── test_tables.php      ← Table verification helper
├── app.js                   ← Frontend logic + API calls
├── dashboard.php            ← Main dashboard
├── pomodoro.php             ← Pomodoro timer
├── habits.php               ← Habit tracker
├── tasks.php                ← Task manager
├── goals.php                ← Goal setting
├── focus.php                ← Focus mode
└── test_db.html             ← Database test utility
```

---

## ✅ Verification Checklist

- [x] Database `productivity_hub` exists
- [x] All 5 tables created with correct schemas
- [x] `pomodoro_stats` initialized with default row
- [x] All API endpoints functional
- [x] Frontend successfully loads data via `get_data`
- [x] All CRUD operations working for:
  - [x] Tasks
  - [x] Habits  
  - [x] Goals
  - [x] Focus Sessions
  - [x] Pomodoro Stats
- [x] Dashboard displays real-time data
- [x] Test utility accessible and functional

---

**Last Updated:** January 28, 2026
**Database Version:** 1.0
**Total Tables:** 5
**Total API Endpoints:** 13
