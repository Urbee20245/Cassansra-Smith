<?php
// public/api/submit-lead.php

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  exit('Method Not Allowed');
}

header('Content-Type: application/json');

// Read JSON body
$raw = file_get_contents('php://input');
$data = json_decode($raw, true) ?: [];

// Extract fields
$firstName   = trim($data['firstName'] ?? '');
$lastName    = trim($data['lastName'] ?? '');
$email       = trim($data['email'] ?? '');
$phone       = trim($data['phone'] ?? '');
$topic       = trim($data['topic'] ?? '');
$timeline    = trim($data['timeline'] ?? '');
$priority    = isset($data['priorityScore']) ? (int)$data['priorityScore'] : null;
$futureDate  = trim($data['futureDate'] ?? '');
$message     = trim($data['message'] ?? '');
$pageUrl     = trim($data['page_url'] ?? '');
$source      = trim($data['source'] ?? 'secure-strategy-session');

// Validation (fail silently with 200 responses on errors)
if (!$firstName || !$lastName) {
  echo json_encode(['ok' => false, 'error' => 'Name required']);
  exit;
}
if (!$email && !$phone) {
  echo json_encode(['ok' => false, 'error' => 'Email or phone required']);
  exit;
}

// Build subject and body (mirroring client logic)
$intentLevel = ($timeline === 'ASAP / Within 48 Hours' && $priority !== null && $priority >= 7)
  ? '🔥 HIGH INTENT (URGENT)'
  : '❄️ PLANNING / FUTURE';

$subject = sprintf('%s: %s Inquiry - %s %s', $intentLevel, $topic, $firstName, $lastName);
$lines = [
  "Name: {$firstName} {$lastName}",
  "Email: " . ($email ?: ''),
  "Phone: " . ($phone ?: ''),
  "Topic: " . ($topic ?: ''),
  "Timeline: " . ($timeline ?: ''),
  "Priority Level: " . ($priority !== null ? $priority . '/10' : ''),
];
if ($futureDate) {
  $lines[] = "Requested Follow-up Date: {$futureDate}";
}
$lines[] = "";
$lines[] = "Message:";
$lines[] = $message ?: '';
$lines[] = "";
$lines[] = "Page URL: " . ($pageUrl ?: '');
$lines[] = "";
$lines[] = "--";
$lines[] = "Lead Qualified via Heatmap Form";
$body = implode("\n", $lines);

// Prepare email headers
$from = getenv('SMTP_USER') ?: 'cassandra@gapbridgecs.com';
$to   = 'csmithgapbridge@gmail.com';
$headers = "From: {$from}\r\n";
$headers .= "Reply-To: " . (($email ?: $from)) . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// Attempt to send email via PHP mail()
// Note: Hostinger's MTA will deliver using your domain; ensure SPF/DKIM set in hPanel for best deliverability.
$emailOk = false;
try {
  // Use -f to set envelope sender (Return-Path) for better deliverability
  $sent = @mail($to, $subject, $body, $headers, "-f{$from}");
  if ($sent) {
    $emailOk = true;
  } else {
    error_log('mail() returned false for submit-lead');
  }
} catch (\Throwable $t) {
  error_log('Email send exception: ' . $t->getMessage());
}

// NEW: Send confirmation/thank-you email to the user (if email present)
$userEmailOk = false;
if ($email) {
  $confirmSubject = ($source === 'future-consultation')
    ? 'Confirmation: Your Future Consultation Request'
    : 'Confirmation: Your Strategy Session Request';

  $confirmLines = [
    "Hi {$firstName},",
    "",
    "Thank you for reaching out to Cassandra Smith.",
    "Here are the details we received:",
    "",
    "Name: {$firstName} {$lastName}",
    "Email: {$email}",
    "Phone: " . ($phone ?: ''),
    "Topic: " . ($topic ?: ''),
    "Timeline: " . ($timeline ?: ''),
    "Priority Level: " . ($priority !== null ? $priority . '/10' : ''),
  ];
  if ($futureDate && $source === 'future-consultation') {
    $confirmLines[] = "Requested Follow-up Date: {$futureDate}";
  }
  $confirmLines[] = "";
  $confirmLines[] = "Message:";
  $confirmLines[] = $message ?: '';
  $confirmLines[] = "";
  $confirmLines[] = "Page URL: " . ($pageUrl ?: '');
  $confirmLines[] = "";
  $confirmLines[] = "Cassandra will review your request and get back to you.";
  $confirmLines[] = "";
  $confirmLines[] = "Best regards,";
  $confirmLines[] = "GapBridge CS";

  $confirmBody = implode("\n", $confirmLines);

  $confirmHeaders = "From: {$from}\r\n";
  $confirmHeaders .= "Reply-To: {$from}\r\n";
  $confirmHeaders .= "Content-Type: text/plain; charset=UTF-8\r\n";

  try {
    $userSent = @mail($email, $confirmSubject, $confirmBody, $confirmHeaders, "-f{$from}");
    if ($userSent) {
      $userEmailOk = true;
    } else {
      error_log('mail() to user returned false for submit-lead');
    }
  } catch (\Throwable $t) {
    error_log('User confirmation send exception: ' . $t->getMessage());
  }
}

// Forward lead to Custom Websites Plus Leads API (silent) ONLY for strategy session
$leadOk = false;
if ($source === 'secure-strategy-session') {
  try {
    $leadsEndpoint = 'https://nvgumhlewbqynrhlkqhx.supabase.co/functions/v1/ingest-lead';
    $payload = [
      'client_id' => getenv('LEADS_CLIENT_ID') ?: null,
      'name'      => trim("{$firstName} {$lastName}"),
      'email'     => $email ?: null,
      'phone'     => $phone ?: null,
      'message'   => $message ?: null,
      'source'    => 'secure-strategy-session',
      'page_url'  => $pageUrl ?: null,
    ];

    $headersCurl = [
      'Content-Type: application/json',
      'apikey: ' . (getenv('LEADS_APIKEY') ?: ''),
      'x-api-key: ' . (getenv('LEADS_INGEST_KEY') ?: ''),
    ];

    $ch = curl_init($leadsEndpoint);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headersCurl);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_TIMEOUT, 4);
    $response = curl_exec($ch);
    $status   = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($status === 201) {
      $leadOk = true;
    } else {
      error_log('Lead ingest status: ' . $status . ' resp: ' . $response);
    }
  } catch (\Throwable $t) {
    error_log('Lead ingest exception: ' . $t->getMessage());
  }
}

// Return 201 if email to Cassandra sent; otherwise 200 (client stays silent)
http_response_code($emailOk ? 201 : 200);
echo json_encode(['ok' => $emailOk, 'lead_ok' => $leadOk, 'user_email_ok' => $userEmailOk]);