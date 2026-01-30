/**
 * Newsletter confirmation email template
 * Sent to users after they subscribe to verify their email
 */

interface NewsletterConfirmationData {
  confirmUrl: string;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Generates a confirmation email for newsletter subscription
 * All text is in Croatian language
 */
export function newsletterConfirmationTemplate(
  data: NewsletterConfirmationData
): EmailTemplate {
  const { confirmUrl } = data;

  const subject = 'Potvrdite pretplatu na newsletter - Opcina Veliki Bukovec';

  const html = `
<!DOCTYPE html>
<html lang="hr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background-color: #f3f4f6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .email-wrapper {
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: #16a34a;
      color: #ffffff;
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .header p {
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 32px 24px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #16a34a;
      margin-bottom: 16px;
    }
    .message-text {
      color: #4b5563;
      margin-bottom: 24px;
    }
    .button-wrapper {
      text-align: center;
      margin: 32px 0;
    }
    .button {
      display: inline-block;
      background-color: #16a34a;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
    }
    .link-fallback {
      margin-top: 24px;
      padding: 16px;
      background-color: #f8fafc;
      border-radius: 6px;
      font-size: 14px;
      color: #64748b;
    }
    .link-fallback a {
      color: #16a34a;
      word-break: break-all;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    .footer-text {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 8px;
    }
    .footer-note {
      font-size: 12px;
      color: #9ca3af;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="header">
        <h1>Opcina Veliki Bukovec</h1>
        <p>Potvrda pretplate na newsletter</p>
      </div>

      <div class="content">
        <p class="greeting">Postovani,</p>

        <p class="message-text">
          Zaprimili smo vasu prijavu za newsletter Opcine Veliki Bukovec.
          Da bismo potvrdili vasu email adresu, molimo kliknite na gumb ispod.
        </p>

        <div class="button-wrapper">
          <a href="${escapeHtml(confirmUrl)}" class="button">Potvrdi pretplatu</a>
        </div>

        <p class="message-text">
          Nakon potvrde, primat cete redovite obavijesti o vijestima,
          dogadanjima i vaznim dokumentima iz nase opcine.
        </p>

        <div class="link-fallback">
          Ako gumb ne radi, kopirajte i zalijepite ovaj link u preglednik:<br>
          <a href="${escapeHtml(confirmUrl)}">${escapeHtml(confirmUrl)}</a>
        </div>
      </div>

      <div class="footer">
        <p class="footer-text">
          Srdacan pozdrav,<br>
          Opcina Veliki Bukovec
        </p>
        <p class="footer-note">
          Ako niste zatrazili ovu pretplatu, slobodno ignorirajte ovaj email.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Opcina Veliki Bukovec
Potvrda pretplate na newsletter

Postovani,

Zaprimili smo vasu prijavu za newsletter Opcine Veliki Bukovec.
Da bismo potvrdili vasu email adresu, molimo posjetite sljedeci link:

${confirmUrl}

Nakon potvrde, primat cete redovite obavijesti o vijestima,
dogadanjima i vaznim dokumentima iz nase opcine.

Srdacan pozdrav,
Opcina Veliki Bukovec

---
Ako niste zatrazili ovu pretplatu, slobodno ignorirajte ovaj email.
  `.trim();

  return { subject, html, text };
}

/**
 * Escapes HTML special characters to prevent XSS attacks
 */
function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char);
}
