<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
$data = json_decode($_POST['data'], true);
$emails = explode(',', $_POST['emails']);
$type = $_POST['type'];
print($data)
// Генерация файла в зависимости от типа
$filename = '';
$fileContent = '';

if ($type === 'excel') {
    $filename = 'data.xlsx';
    // Здесь должна быть логика генерации Excel файла
    // Например, используя библиотеку PHPExcel или PhpSpreadsheet
} elseif ($type === 'csv') {
    $filename = 'data.csv';
    $fileContent = "Latitude,Longitude,Address,Title\n";
    foreach ($data as $row) {
        $fileContent .= implode(',', $row) . "\n";
    }
} elseif ($type === 'gpx') {
    $filename = 'data.gpx';
    $fileContent = '<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="YourApp">
';
    foreach ($data as $point) {
        $fileContent .= '<wpt lat="' . $point['lat'] . '" lon="' . $point['lon'] . '">
    <name>' . $point['name'] . '</name>
</wpt>
';
    }
    $fileContent .= '</gpx>';
}

// Отправка файла на email
$subject = "File from Cardeks";
$message = "Please find attached the file you requested.";
$headers = "From: no-reply@yourapp.com";

foreach ($emails as $email) {
    $email = trim($email);
    if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $boundary = md5(time());
        $headers .= "\nMIME-Version: 1.0\n";
        $headers .= "Content-Type: multipart/mixed; boundary=\"" . $boundary . "\"\n";
        $body = "--" . $boundary . "\n";
        $body .= "Content-Type: text/plain; charset=\"UTF-8\"\n";
        $body .= "Content-Transfer-Encoding: 7bit\n\n";
        $body .= $message . "\n\n";
        $body .= "--" . $boundary . "\n";
        $body .= "Content-Type: application/octet-stream; name=\"" . $filename . "\"\n";
        $body .= "Content-Transfer-Encoding: base64\n";
        $body .= "Content-Disposition: attachment; filename=\"" . $filename . "\"\n\n";
        $body .= chunk_split(base64_encode($fileContent)) . "\n";
        $body .= "--" . $boundary . "--";

        mail($email, $subject, $body, $headers);
    }
}

echo json_encode(['status' => 'success']);
?>