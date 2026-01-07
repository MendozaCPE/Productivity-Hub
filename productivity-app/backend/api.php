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
                echo json_encode(["error" => "Invalid JSON data"]);
                exit;
            }

            // Start transaction
            $conn->begin_transaction();

            try {
                // Sync Tasks
                if (isset($state['tasks']) && is_array($state['tasks'])) {
                    $conn->query("DELETE FROM tasks");
                    $stmt = $conn->prepare("INSERT INTO tasks (id, text, priority, completed) VALUES (?, ?, ?, ?)");
                    foreach ($state['tasks'] as $t) {
                        $completed = $t['completed'] ? 1 : 0;
                        $stmt->bind_param("sssi", $t['id'], $t['text'], $t['priority'], $completed);
                        $stmt->execute();
                    }
                }

                // Sync Habits
                if (isset($state['habits']) && is_array($state['habits'])) {
                    $conn->query("DELETE FROM habits");
                    $stmt = $conn->prepare("INSERT INTO habits (id, name, color, completed_dates) VALUES (?, ?, ?, ?)");
                    foreach ($state['habits'] as $h) {
                        $dates = json_encode($h['completedDates'] ?? []);
                        $stmt->bind_param("isss", $h['id'], $h['name'], $h['color'], $dates);
                        $stmt->execute();
                    }
                }

                // Sync Goals
                if (isset($state['goals']) && is_array($state['goals'])) {
                    $conn->query("DELETE FROM goals");
                    $stmt = $conn->prepare("INSERT INTO goals (id, text, completed) VALUES (?, ?, ?)");
                    foreach ($state['goals'] as $g) {
                        $completed = $g['completed'] ? 1 : 0;
                        $stmt->bind_param("ssi", $g['id'], $g['text'], $completed);
                        $stmt->execute();
                    }
                }

                // Sync Pomodoro
                if (isset($state['pomodoro'])) {
                    $stmt = $conn->prepare("UPDATE pomodoro_stats SET sessions_completed = ?, total_focus_time = ? WHERE id = 1");
                    $sessions = (int)($state['pomodoro']['sessionsCompleted'] ?? 0);
                    $focus = (int)($state['pomodoro']['totalFocusTime'] ?? 0);
                    $stmt->bind_param("ii", $sessions, $focus);
                    $stmt->execute();
                }

                $conn->commit();
                echo json_encode(["status" => "success"]);
            } catch (Exception $e) {
                $conn->rollback();
                echo json_encode(["error" => $e->getMessage()]);
            }
        } else {
            echo json_encode(["error" => "Method not allowed"]);
        }
        break;

    default:
        echo json_encode(["error" => "Invalid action"]);
        break;
}

$conn->close();
?>
