/**
 * Problem report confirmation email template
 * Sent to users after they submit a problem report
 */

import { PROBLEM_TYPE_LABELS } from '@repo/shared';

interface ProblemConfirmationData {
  reporterName?: string | null | undefined;
  problemType: string;
  location: string;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Generates a confirmation email template for problem report submissions
 * All text is in Croatian language
 */
export function problemConfirmationTemplate(
  data: ProblemConfirmationData
): EmailTemplate {
  const { reporterName, problemType, location } = data;

  const problemTypeLabel =
    PROBLEM_TYPE_LABELS[problemType] ??
    problemType;

  const greeting = reporterName
    ? `Poštovani/a ${escapeHtml(reporterName)}`
    : 'Poštovani';

  const subject = 'Zaprimili smo vašu prijavu - Općina Veliki Bukovec';

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
    .report-box {
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 6px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .report-box-title {
      font-size: 14px;
      font-weight: 600;
      color: #15803d;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 16px;
    }
    .report-item {
      margin-bottom: 12px;
    }
    .report-item:last-child {
      margin-bottom: 0;
    }
    .report-label {
      font-size: 12px;
      font-weight: 500;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .report-value {
      font-size: 16px;
      color: #1e293b;
      font-weight: 500;
    }
    .steps-section {
      background-color: #eff6ff;
      border-radius: 6px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .steps-section h3 {
      font-size: 16px;
      font-weight: 600;
      color: #1e40af;
      margin-bottom: 16px;
    }
    .step-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 12px;
      color: #4b5563;
      font-size: 14px;
    }
    .step-item:last-child {
      margin-bottom: 0;
    }
    .step-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background-color: #1e40af;
      color: #ffffff;
      border-radius: 50%;
      font-size: 12px;
      font-weight: 600;
      margin-right: 12px;
      flex-shrink: 0;
    }
    .info-section {
      background-color: #f8fafc;
      border-radius: 6px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .info-section h3 {
      font-size: 16px;
      font-weight: 600;
      color: #374151;
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
      .step-item {
        flex-direction: row;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="header">
        <h1>Općina Veliki Bukovec</h1>
        <p>Potvrda prijave problema</p>
      </div>

      <div class="content">
        <p class="greeting">${greeting},</p>

        <p class="message-text">
          Zahvaljujemo vam na prijavi problema. Vaša prijava je uspješno zaprimljena
          i bit će proslijeđena nadležnoj službi na rješavanje.
        </p>

        <div class="report-box">
          <p class="report-box-title">Podaci o prijavi</p>
          <div class="report-item">
            <p class="report-label">Vrsta problema</p>
            <p class="report-value">${escapeHtml(problemTypeLabel)}</p>
          </div>
          <div class="report-item">
            <p class="report-label">Lokacija</p>
            <p class="report-value">${escapeHtml(location)}</p>
          </div>
        </div>

        <div class="steps-section">
          <h3>Sljedeći koraci</h3>
          <div class="step-item">
            <span class="step-number">1</span>
            <span>Vaša prijava će biti pregledana od strane nadležne službe.</span>
          </div>
          <div class="step-item">
            <span class="step-number">2</span>
            <span>Problem će biti kategoriziran i dodijeljen odgovornoj osobi.</span>
          </div>
          <div class="step-item">
            <span class="step-number">3</span>
            <span>Radovi na rješavanju problema bit će planirani i izvršeni.</span>
          </div>
          <div class="step-item">
            <span class="step-number">4</span>
            <span>Ako ste ostavili kontakt podatke, obavijestit ćemo vas o rješenju.</span>
          </div>
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
          Ukoliko imate dodatnih informacija o prijavljenom problemu ili želite
          provjeriti status prijave, slobodno nas kontaktirajte putem e-maila ili
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
Potvrda prijave problema

${reporterName ? `Poštovani/a ${reporterName}` : 'Poštovani'},

Zahvaljujemo vam na prijavi problema. Vaša prijava je uspješno zaprimljena i bit će proslijeđena nadležnoj službi na rješavanje.

---
PODACI O PRIJAVI:
Vrsta problema: ${problemTypeLabel}
Lokacija: ${location}
---

SLJEDEĆI KORACI:
1. Vaša prijava će biti pregledana od strane nadležne službe.
2. Problem će biti kategoriziran i dodijeljen odgovornoj osobi.
3. Radovi na rješavanju problema bit će planirani i izvršeni.
4. Ako ste ostavili kontakt podatke, obavijestit ćemo vas o rješenju.

KONTAKT PODACI OPĆINE:
Adresa: Trg svetog Franje 425, 42231 Veliki Bukovec
E-mail: opcina@velikibukovec.hr
Radno vrijeme: Ponedjeljak - Petak, 07:00 - 15:00

Ukoliko imate dodatnih informacija o prijavljenom problemu ili želite provjeriti status prijave, slobodno nas kontaktirajte putem e-maila ili nas posjetite tijekom radnog vremena.

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
