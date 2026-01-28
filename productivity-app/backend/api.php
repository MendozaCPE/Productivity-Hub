<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$host = "localhost";
$user = "root";
$pass = "";
$db = "productivity_hub";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';
$input = json_decode(file_get_contents('php://input'), true);

switch ($action) {
    case 'get_data':
        $data = [
            'tasks' => [],
            'habits' => [],
            'goals' => [],
            'pomodoro' => [
                'sessionsCompleted' => 0,
                'totalFocusTime' => 0
            ]
        ];

        // Tasks
        $res = $conn->query("SELECT * FROM tasks ORDER BY created_at DESC");
        while ($row = $res->fetch_assoc()) {
            $row['completed'] = (bool)$row['completed'];
            $data['tasks'][] = $row;
        }

        // Habits
        $res = $conn->query("SELECT * FROM habits ORDER BY created_at DESC");
        while ($row = $res->fetch_assoc()) {
            $row['completedDates'] = json_decode($row['completed_dates'] ?? '[]', true);
            unset($row['completed_dates']);
            $data['habits'][] = $row;
        }

        // Goals
        $res = $conn->query("SELECT * FROM goals ORDER BY created_at DESC");
        while ($row = $res->fetch_assoc()) {
            $row['completed'] = (bool)$row['completed'];
            $data['goals'][] = $row;
        }

        // Pomodoro
        $res = $conn->query("SELECT * FROM pomodoro_stats WHERE id = 1");
        if ($row = $res->fetch_assoc()) {
            $data['pomodoro']['sessionsCompleted'] = (int)$row['sessions_completed'];
            $data['pomodoro']['totalFocusTime'] = (int)$row['total_focus_time'];
        }

        echo json_encode($data);
        break;

    // --- TASKS ---
    case 'add_task':
        if ($method === 'POST') {
            $stmt = $conn->prepare("INSERT INTO tasks (id, text, priority, completed) VALUES (?, ?, ?, ?)");
            $completed = 0;
            $stmt->bind_param("sssi", $input['id'], $input['text'], $input['priority'], $completed);
            
            if ($stmt->execute()) echo json_encode(["status" => "success"]);
            else echo json_encode(["error" => $stmt->error]);
        }
        break;

    case 'toggle_task':
        if ($method === 'POST') {
            $stmt = $conn->prepare("UPDATE tasks SET completed = NOT completed WHERE id = ?");
            $stmt->bind_param("s", $input['id']);
            
            if ($stmt->execute()) echo json_encode(["status" => "success"]);
            else echo json_encode(["error" => $stmt->error]);
        }
        break;

    case 'delete_task':
        if ($method === 'POST') {
            $stmt = $conn->prepare("DELETE FROM tasks WHERE id = ?");
            $stmt->bind_param("s", $input['id']);
            
            if ($stmt->execute()) echo json_encode(["status" => "success"]);
            else echo json_encode(["error" => $stmt->error]);
        }
        break;

    // --- HABITS ---
    case 'add_habit':
        if ($method === 'POST') {
            $stmt = $conn->prepare("INSERT INTO habits (id, name, color, completed_dates) VALUES (?, ?, ?, '[]')");
            $stmt->bind_param("iss", $input['id'], $input['name'], $input['color']);
            
            if ($stmt->execute()) echo json_encode(["status" => "success"]);
            else echo json_encode(["error" => $stmt->error]);
        }
        break;

    case 'delete_habit':
        if ($method === 'POST') {
            $stmt = $conn->prepare("DELETE FROM habits WHERE id = ?");
            $stmt->bind_param("i", $input['id']);
            
            if ($stmt->execute()) echo json_encode(["status" => "success"]);
            else echo json_encode(["error" => $stmt->error]);
        }
        break;

    case 'update_habit_dates':
        if ($method === 'POST') {
            // Expects 'id' and 'completedDates' array
            $stmt = $conn->prepare("UPDATE habits SET completed_dates = ? WHERE id = ?");
            $datesJson = json_encode($input['completedDates']);
            $stmt->bind_param("si", $datesJson, $input['id']);
            
            if ($stmt->execute()) echo json_encode(["status" => "success"]);
            else echo json_encode(["error" => $stmt->error]);
        }
        break;

    // --- GOALS ---
    case 'add_goal':
        if ($method === 'POST') {
            $stmt = $conn->prepare("INSERT INTO goals (id, text, completed) VALUES (?, ?, 0)");
            $stmt->bind_param("ss", $input['id'], $input['text']);
            
            if ($stmt->execute()) echo json_encode(["status" => "success"]);
            else echo json_encode(["error" => $stmt->error]);
        }
        break;

    case 'toggle_goal':
        if ($method === 'POST') {
            $stmt = $conn->prepare("UPDATE goals SET completed = NOT completed WHERE id = ?");
            $stmt->bind_param("s", $input['id']);
            
            if ($stmt->execute()) echo json_encode(["status" => "success"]);
            else echo json_encode(["error" => $stmt->error]);
        }
        break;

    case 'delete_goal':
        if ($method === 'POST') {
            $stmt = $conn->prepare("DELETE FROM goals WHERE id = ?");
            $stmt->bind_param("s", $input['id']);
            
            if ($stmt->execute()) echo json_encode(["status" => "success"]);
            else echo json_encode(["error" => $stmt->error]);
        }
        break;

    // --- FOCUS SESSIONS ---
    case 'add_focus_session':
        if ($method === 'POST') {
            $stmt = $conn->prepare("INSERT INTO focus_sessions (id, task_name, duration) VALUES (?, ?, ?)");
            $stmt->bind_param("ssi", $input['id'], $input['taskName'], $input['duration']);
            
            if ($stmt->execute()) echo json_encode(["status" => "success"]);
            else echo json_encode(["error" => $stmt->error]);
        }
        break;

    case 'get_focus_sessions':
        $data = [];
        $res = $conn->query("SELECT * FROM focus_sessions ORDER BY created_at DESC LIMIT 10");
        while ($row = $res->fetch_assoc()) {
            $data[] = $row;
        }
        echo json_encode($data);
        break;

    // --- POMODORO ---
    case 'update_pomodoro':
        if ($method === 'POST') {
            // Using REPLACE logic or just UPDATE since row 1 always exists from init.sql
            $stmt = $conn->prepare("UPDATE pomodoro_stats SET sessions_completed = ?, total_focus_time = ? WHERE id = 1");
            $stmt->bind_param("ii", $input['sessionsCompleted'], $input['totalFocusTime']);
            
            if ($stmt->execute()) echo json_encode(["status" => "success"]);
            else echo json_encode(["error" => $stmt->error]);
        }
        break;

    default:
        echo json_encode(["error" => "Invalid action"]);
        break;
}

$conn->close();
?>
