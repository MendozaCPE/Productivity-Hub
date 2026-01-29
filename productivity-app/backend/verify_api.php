<?php
// Simulate API call
$_SERVER['REQUEST_METHOD'] = 'GET';
$_GET['action'] = 'get_data';

// Capture output
ob_start();
include 'api.php';
$output = ob_get_clean();

$data = json_decode($output, true);

if (isset($data['focusSessions'])) {
    echo "✅ Success: focusSessions found in response.\n";
    echo "Count: " . count($data['focusSessions']) . "\n";
} else {
    echo "❌ Failure: focusSessions NOT found in response.\n";
}

if (isset($data['habits'])) {
    echo "✅ Success: habits found in response.\n";
}

echo "Response keys: " . implode(', ', array_keys($data));
?>
