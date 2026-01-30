/**
 * Contact form confirmation email template
 * Sent to users after they submit a contact form message
 */

interface ContactConfirmationData {
  name: string;
  message: string;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Generates a confirmation email template for contact form submissions
 * All text is in Croatian language
 */
export function contactConfirmationTemplate(
  data: ContactConfirmationData
): EmailTemplate {
  const { name, message } = data;

  const subject = 'Primili smo vašu poruku - Općina Veliki Bukovec';

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
      background-color: #1e40af;
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
      color: #1e40af;
      margin-bottom: 16px;
    }
    .message-text {
      color: #4b5563;
      margin-bottom: 24px;
    }
    .message-box {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .message-box-title {
      font-size: 14px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 12px;
    }
    .message-box-content {
      color: #334155;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .info-section {
      background-color: #eff6ff;
      border-radius: 6px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .info-section h3 {
      font-size: 16px;
      font-weight: 600;
      color: #1e40af;
      margin-bottom: 12px;
    }
    .info-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 8px;
      color: #4b5563;
      font-size: 14px;
    }
    .info-item:last-child {
      margin-bottom: 0;
    }
    .info-label {
      font-weight: 500;
      min-width: 100px;
      color: #374151;
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
    @media only screen and (max-width: 480px) {
      .container {
        padding: 12px;
      }
      .header {
        padding: 24px 16px;
      }
      .header h1 {
        font-size: 20px;
      }
      .content {
        padding: 24px 16px;
      }
      .info-item {
        flex-direction: column;
      }
      .info-label {
        margin-bottom: 4px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="header">
        <h1>Općina Veliki Bukovec</h1>
        <p>Potvrda primitka poruke</p>
      </div>

      <div class="content">
        <p class="greeting">Poštovani/a ${escapeHtml(name)},</p>

        <p class="message-text">
          Zahvaljujemo vam na vašoj poruci. Potvrđujemo da smo uspješno primili vašu poruku
          i odgovorit ćemo vam u najkraćem mogućem roku.
        </p>

        <div class="message-box">
          <p class="message-box-title">Vaša poruka</p>
          <p class="message-box-content">${escapeHtml(message)}</p>
        </div>

        <div class="info-section">
          <h3>Kontakt podaci općine</h3>
          <div class="info-item">
            <span class="info-label">Adresa:</span>
            <span>Trg svetog Franje 425, 42231 Veliki Bukovec</span>
          </div>
          <div class="info-item">
            <span class="info-label">E-mail:</span>
            <span>opcina@velikibukovec.hr</span>
          </div>
          <div class="info-item">
            <span class="info-label">Radno vrijeme:</span>
            <span>Ponedjeljak - Petak, 07:00 - 15:00</span>
          </div>
        </div>

        <p class="message-text">
          Ukoliko imate dodatnih pitanja, slobodno nas kontaktirajte putem e-maila ili
          nas posjetite tijekom radnog vremena.
        </p>
      </div>

      <div class="footer">
        <p class="footer-text">
          Srdačan pozdrav,<br>
          Općina Veliki Bukovec
        </p>
        <p class="footer-note">
          Ova poruka je automatski generirana. Molimo vas da ne odgovarate izravno na ovaj e-mail.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Općina Veliki Bukovec
Potvrda primitka poruke

Poštovani/a ${name},

Zahvaljujemo vam na vašoj poruci. Potvrđujemo da smo uspješno primili vašu poruku i odgovorit ćemo vam u najkraćem mogućem roku.

---
VAŠA PORUKA:
${message}
---

KONTAKT PODACI OPĆINE:
Adresa: Trg svetog Franje 425, 42231 Veliki Bukovec
E-mail: opcina@velikibukovec.hr
Radno vrijeme: Ponedjeljak - Petak, 07:00 - 15:00

Ukoliko imate dodatnih pitanja, slobodno nas kontaktirajte putem e-maila ili nas posjetite tijekom radnog vremena.

Srdačan pozdrav,
Općina Veliki Bukovec

---
Ova poruka je automatski generirana. Molimo vas da ne odgovarate izravno na ovaj e-mail.
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
