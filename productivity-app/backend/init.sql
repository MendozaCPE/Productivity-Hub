CREATE DATABASE IF NOT EXISTS productivity_hub;
USE productivity_hub;

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id BIGINT PRIMARY KEY,
    text VARCHAR(255) NOT NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Habits Table
CREATE TABLE IF NOT EXISTS habits (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7) NOT NULL,
    completed_dates TEXT, -- JSON string or comma-separated dates
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Goals Table
CREATE TABLE IF NOT EXISTS goals (
    id BIGINT PRIMARY KEY,
    text VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Focus Sessions Table
CREATE TABLE IF NOT EXISTS focus_sessions (
    id BIGINT PRIMARY KEY,
    task_name VARCHAR(255),
    duration INT, -- in minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pomodoro Stats (Single Row or simplified)
CREATE TABLE IF NOT EXISTS pomodoro_stats (
    id INT PRIMARY KEY DEFAULT 1,
    sessions_completed INT DEFAULT 0,
    total_focus_time INT DEFAULT 0 -- in minutes
);

INSERT IGNORE INTO pomodoro_stats (id, sessions_completed, total_focus_time) VALUES (1, 0, 0);
