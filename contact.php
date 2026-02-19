<?php
/**
 * Contact form handler for Arcadia Building Reports
 * Sends form submissions to info@arcadiabuildingreports.com.au via cPanel mail
 */

// Configuration – change this to your receiving email address
$to_email = 'info@arcadiabuildingreports.com.au';

// Redirect back to contact page
$redirect_url = 'contact.html';

// Only process POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . $redirect_url);
    exit;
}

// Validate required fields
$required = ['name', 'email', 'phone', 'message', 'consent'];
$errors = [];
foreach ($required as $field) {
    if (empty(trim($_POST[$field] ?? ''))) {
        $errors[] = $field;
    }
}

// Consent checkbox: must be checked
if (empty($_POST['consent'])) {
    $errors[] = 'consent';
}

if (!empty($errors)) {
    header('Location: ' . $redirect_url . '?error=1');
    exit;
}

// Sanitize inputs
$iam     = htmlspecialchars(trim($_POST['iam'] ?? ''), ENT_QUOTES, 'UTF-8');
$want    = htmlspecialchars(trim($_POST['want'] ?? ''), ENT_QUOTES, 'UTF-8');
$name    = htmlspecialchars(trim($_POST['name'] ?? ''), ENT_QUOTES, 'UTF-8');
$email   = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$phone   = htmlspecialchars(trim($_POST['phone'] ?? ''), ENT_QUOTES, 'UTF-8');
$message = htmlspecialchars(trim($_POST['message'] ?? ''), ENT_QUOTES, 'UTF-8');

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header('Location: ' . $redirect_url . '?error=1');
    exit;
}

// Map select values to readable labels
$iam_labels = [
    'strata-manager'     => 'Strata Manager',
    'property-manager'   => 'Property Manager',
    'committee-member'   => 'Committee Member',
    'owner'              => 'Owner',
    'other'              => 'Other',
];
$want_labels = [
    'call'   => 'Call to discuss my building',
    'quote'  => 'Quote for an inspection',
    'report' => 'Follow-up on a report',
    'other'  => 'Other',
];

$iam_label  = $iam_labels[$iam] ?? $iam ?: '(not selected)';
$want_label = $want_labels[$want] ?? $want ?: '(not selected)';

// Build email content
$subject = 'Contact form: Arcadia Building Reports – ' . $name;

$body = "New contact form submission from arcadiabuildingreports.com.au\n\n";
$body .= "---\n\n";
$body .= "I'm a/an: " . $iam_label . "\n";
$body .= "I want: " . $want_label . "\n\n";
$body .= "Name: " . $name . "\n";
$body .= "Email: " . $email . "\n";
$body .= "Phone: " . $phone . "\n\n";
$body .= "Message:\n" . $message . "\n";

// Email headers
$headers = [];
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'From: Arcadia Contact <info@arcadiabuildingreports.com.au>';
$headers[] = 'Reply-To: ' . $name . ' <' . $email . '>';
$headers[] = 'X-Mailer: PHP/' . phpversion();

$sent = mail($to_email, $subject, $body, implode("\r\n", $headers));

if ($sent) {
    header('Location: ' . $redirect_url . '?sent=1');
} else {
    header('Location: ' . $redirect_url . '?error=1');
}
exit;
