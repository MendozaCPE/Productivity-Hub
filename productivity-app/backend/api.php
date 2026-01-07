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
        $res = $conn->query("SELECT * FROM tasks");
        while ($row = $res->fetch_assoc()) {
            $row['completed'] = (bool)$row['completed'];
            $data['tasks'][] = $row;
        }

        // Habits
        $res = $conn->query("SELECT * FROM habits");
        while ($row = $res->fetch_assoc()) {
            $row['completedDates'] = json_decode($row['completed_dates'] ?? '[]', true);
            $data['habits'][] = $row;
        }

        // Goals
        $res = $conn->query("SELECT * FROM goals");
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

    case 'sync':
        if ($method === 'POST') {
            $json = file_get_contents('php://input');
            $state = json_decode($json, true);

            if (!$state) {
                echo json_encode(["error" => "Invalid data"]);
                exit;
            }

            // Sync Tasks
            $conn->query("DELETE FROM tasks");
            $stmt = $conn->prepare("INSERT INTO tasks (id, text, priority, completed) VALUES (?, ?, ?, ?)");
            foreach ($state['tasks'] as $t) {
                $stmt->bind_param("issi", $t['id'], $t['text'], $t['priority'], $t['completed']);
                $stmt->execute();
            }

            // Sync Habits
            $conn->query("DELETE FROM habits");
            $stmt = $conn->prepare("INSERT INTO habits (id, name, color, completed_dates) VALUES (?, ?, ?, ?)");
            foreach ($state['habits'] as $h) {
                $dates = json_encode($h['completedDates']);
                $stmt->bind_param("isss", $h['id'], $h['name'], $h['color'], $dates);
                $stmt->execute();
            }

            // Sync Goals
            $conn->query("DELETE FROM goals");
            $stmt = $conn->prepare("INSERT INTO goals (id, text, completed) VALUES (?, ?, ?)");
            foreach ($state['goals'] as $g) {
                $stmt->bind_param("isi", $g['id'], $g['text'], $g['completed']);
                $stmt->execute();
            }

            // Sync Pomodoro
            $stmt = $conn->prepare("UPDATE pomodoro_stats SET sessions_completed = ?, total_focus_time = ? WHERE id = 1");
            $stmt->bind_param("ii", $state['pomodoro']['sessionsCompleted'], $state['pomodoro']['totalFocusTime']);
            $stmt->execute();

            echo json_encode(["status" => "success"]);
        }
        break;

    default:
        echo json_encode(["error" => "Invalid action"]);
        break;
}

$conn->close();
?>
