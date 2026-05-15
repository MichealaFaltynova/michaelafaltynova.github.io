<?php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['uspech' => false, 'zprava' => 'Metoda není povolena.']);
    exit;
}


function sanitize(string $hodnota): string {
    return htmlspecialchars(strip_tags(trim($hodnota)), ENT_QUOTES, 'UTF-8');
}


$jmeno     = sanitize($_POST['jmeno'] ?? '');
$email     = sanitize($_POST['email'] ?? '');
$telefon   = sanitize($_POST['telefon'] ?? '');
$datum     = sanitize($_POST['datum'] ?? '');
$cas       = sanitize($_POST['cas'] ?? '');
$osoby     = (int)($_POST['osoby'] ?? 0);
$vstupenka = sanitize($_POST['vstupenka'] ?? '');

$chyby = [];

if (empty($jmeno)) {
    $chyby[] = 'Jméno je povinné.';
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $chyby[] = 'E-mail není platný.';
}

if (empty($datum)) {
    $chyby[] = 'Datum je povinné.';
}

if (empty($cas)) {
    $chyby[] = 'Čas je povinný.';
}

if ($osoby < 1 || $osoby > 50) {
    $chyby[] = 'Počet osob musí být mezi 1 a 50.';
}

$povoleneTypy = ['plna', 'student', 'senior', 'rodinne', 'ztp'];
if (!in_array($vstupenka, $povoleneTypy)) {
    $chyby[] = 'Neplatný typ vstupenky.';
}


if (!empty($chyby)) {
    http_response_code(422);
    echo json_encode(['uspech' => false, 'zprava' => implode(' ', $chyby)]);
    exit;
}

$potvrzeniCislo = strtoupper(substr(md5(uniqid()), 0, 8));

echo json_encode([
    'uspech'          => true,
    'zprava'          => "Rezervace byla úspěšně odeslána! Vaše číslo rezervace: {$potvrzeniCislo}",
    'cisloRezervace'  => $potvrzeniCislo,
    'jmeno'           => $jmeno,
    'datum'           => $datum,
    'cas'             => $cas,
    'osoby'           => $osoby,
], JSON_UNESCAPED_UNICODE);
