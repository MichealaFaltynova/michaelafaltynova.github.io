<?php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$csvSoubor = __DIR__ . '/../data/expozice.csv';

if (!file_exists($csvSoubor)) {
    http_response_code(404);
    echo json_encode(['chyba' => 'CSV soubor nenalezen.']);
    exit;
}

$expozice = [];
$handle = fopen($csvSoubor, 'r');


$hlavicka = fgetcsv($handle, 0, ',');

while (($radek = fgetcsv($handle, 0, ',')) !== false) {
    
    $polozka = array_combine($hlavicka, $radek);
    $expozice[] = $polozka;
}

fclose($handle);

echo json_encode($expozice, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
