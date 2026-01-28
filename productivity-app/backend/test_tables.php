<?php
header("Content-Type: text/html");

$host = "localhost";
$user = "root";
$pass = "";
$db = "productivity_hub";

$conn = new mysqli($host, $user, $pass);

if ($conn->connect_error) {
    echo '<div class="error">❌ Connection Failed: ' . $conn->connect_error . '</div>';
    exit;
}

// Create database if it doesn't exist
$conn->query("CREATE DATABASE IF NOT EXISTS productivity_hub");
$conn->select_db($db);

// Run init.sql to create tables
$sql = file_get_contents('init.sql');
$sqlCommands = explode(';', $sql);

foreach ($sqlCommands as $command) {
    $command = trim($command);
    if (!empty($command)) {
        $conn->query($command);
    }
}

// Check tables
$result = $conn->query("SHOW TABLES");
$tables = [];
while ($row = $result->fetch_array()) {
    $tables[] = $row[0];
}

if (empty($tables)) {
    echo '<div class="error">❌ No tables found in database</div>';
} else {
    echo '<div class="success">✅ Database initialized successfully!</div>';
    echo '<div class="info"><strong>Tables found:</strong><br>';
    foreach ($tables as $table) {
        // Count rows
        $countResult = $conn->query("SELECT COUNT(*) as count FROM $table");
        $count = $countResult->fetch_assoc()['count'];
        echo "• $table ($count rows)<br>";
    }
    echo '</div>';
}

$conn->close();
?>
