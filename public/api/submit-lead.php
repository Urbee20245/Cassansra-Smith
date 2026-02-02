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

// SMTP sender (Hostinger SMTP over SSL:465)
function smtp_send($to, $subject, $body, $fromEmail, $fromName = 'Cassandra Smith', $replyTo = null) {
  $host = 'ssl://smtp.hostinger.com';
  $port = 465;
  $username = getenv('SMTP_USER');
  $password = getenv('SMTP_PASS');

  if (!$username || !$password) {
    error_log('SMTP credentials missing');
    return false;
  }

  $fp = @stream_socket_client("$host:$port", $errno, $errstr, 10);
  if (!$fp) {
    error_log("SMTP connect error: $errno $errstr");
    return false;
  }
  $read = function() use ($fp) { return fgets($fp, 515); };
  $write = function($cmd) use ($fp) { fwrite($fp, $cmd . "\r\n"); };

  $resp = $read(); // 220
  if (strpos($resp, '220') !== 0) { fclose($fp); return false; }

  $ehloDomain = explode('@', $fromEmail)[1] ?? 'localhost';
  $write("EHLO $ehloDomain");
  $resp = $read(); if (strpos($resp, '250') !== 0) { fclose($fp); return false; }
  // read remaining EHLO lines
  stream_get_line($fp, 515, "\r\n");

  $write("AUTH LOGIN");
  $resp = $read(); if (strpos($resp, '334') !== 0) { fclose($fp); return false; }

  $write(base64_encode($username));
  $resp = $read(); if (strpos($resp, '334') !== 0) { fclose($fp); return false; }

  $write(base64_encode($password));
  $resp = $read(); if (strpos($resp, '235') !== 0) { fclose($fp); return false; }

  $write("MAIL FROM:<$fromEmail>");
  $resp = $read(); if (strpos($resp, '250') !== 0) { fclose($fp); return false; }

  $write("RCPT TO:<$to>");
  $resp = $read(); if (strpos($resp, '250') !== 0 && strpos($resp, '251') !== 0) { fclose($fp); return false; }

  $write("DATA");
  $resp = $read(); if (strpos($resp, '354') !== 0) { fclose($fp); return false; }

  // Build headers with CRLF
  $headers = [];
  $headers[] = "From: $fromName <$fromEmail>";
  if ($replyTo) $headers[] = "Reply-To: $replyTo";
  $headers[] = "MIME-Version: 1.0";
  $headers[] = "Content-Type: text/plain; charset=UTF-8";
  $headers[] = "Content-Transfer-Encoding: 8bit";

  $message  = "Subject: $subject\r\n";
  $message .= implode("\r\n", $headers) . "\r\n";
  $message .= "\r\n" . preg_replace("/\r?\n/", "\r\n", $body) . "\r\n";

  // End DATA with a single dot line
  $write($message . ".");
  $resp = $read(); if (strpos($resp, '250') !== 0) { fclose($fp); return false; }

  $write("QUIT");
  fclose($fp);
  return true;
}

// Prepare sender info
$from = getenv('SMTP_USER') ?: 'cassandra@gapbridgecs.com';
$to   = 'csmithgapbridge@gmail.com';
$replyTo = ($email ?: $from);

// Send email to Cassandra via SMTP
$emailOk = false;
try {
  $emailOk = smtp_send($to, $subject, $body, $from, 'Cassandra Smith', $replyTo);
  if (!$emailOk) { error_log('SMTP send to Cassandra failed'); }
} catch (\Throwable $t) {
  error_log('SMTP send exception: ' . $t->getMessage());
  $emailOk = false;
}

// NEW: Send confirmation/thank-you email to the user via SMTP (if email present)
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

  try {
    $userEmailOk = smtp_send($email, $confirmSubject, $confirmBody, $from, 'Cassandra Smith', $from);
    if (!$userEmailOk) { error_log('SMTP send confirmation to user failed'); }
  } catch (\Throwable $t) {
    error_log('User confirmation SMTP exception: ' . $t->getMessage());
    $userEmailOk = false;
  }
}

// Forward lead to Custom Websites Plus Leads API ONLY for strategy session
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