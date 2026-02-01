/**
 * Problem report notification email template
 * Sends notification to admin when someone submits a problem report
 */

import { PROBLEM_TYPE_LABELS } from '@repo/shared';

interface ProblemNotificationData {
  problemType: string;
  location: string;
  description: string;
  reporterName?: string | null;
  reporterEmail?: string | null;
  reporterPhone?: string | null;
  images?: { url: string; caption?: string | null }[] | null;
  createdAt?: Date;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Generates email template for problem report notifications
 * @param data - Problem report submission data
 * @returns Email template with subject, HTML, and plain text versions
 */
export function problemNotificationTemplate(
  data: ProblemNotificationData
): EmailTemplate {
  const {
    problemType,
    location,
    description,
    reporterName,
    reporterEmail,
    reporterPhone,
    images,
    createdAt,
  } = data;

  const problemTypeLabel =
    PROBLEM_TYPE_LABELS[problemType] ??
    problemType;

  const formattedDate = createdAt
    ? new Intl.DateTimeFormat('hr-HR', {
        dateStyle: 'long',
        timeStyle: 'short',
      }).format(createdAt)
    : new Intl.DateTimeFormat('hr-HR', {
        dateStyle: 'long',
        timeStyle: 'short',
      }).format(new Date());

  const imageCount = images?.length ?? 0;
  const hasReporterInfo = reporterName || reporterEmail || reporterPhone;

  const emailSubject = `Nova prijava problema: ${problemTypeLabel} - ${location}`;

  const html = `
<!DOCTYPE html>
<html lang="hr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(emailSubject)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f6f9; line-height: 1.6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f6f9;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 32px 40px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 600; margin: 0;">
                Opcina Veliki Bukovec
              </h1>
              <p style="color: rgba(255, 255, 255, 0.9); font-size: 14px; margin-top: 8px;">
                Nova prijava problema
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <!-- Problem Type Badge -->
              <div style="margin-bottom: 24px;">
                <span style="display: inline-block; background-color: #fee2e2; color: #dc2626; font-size: 12px; font-weight: 600; padding: 6px 12px; border-radius: 16px; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${escapeHtml(problemTypeLabel)}
                </span>
              </div>

              <!-- Problem Details Card -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <p style="color: #64748b; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px 0;">
                            Lokacija
                          </p>
                          <p style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0;">
                            ${escapeHtml(location)}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <p style="color: #64748b; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px 0;">
                            Vrijeme prijave
                          </p>
                          <p style="color: #1e293b; font-size: 14px; margin: 0;">
                            ${escapeHtml(formattedDate)}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="color: #64748b; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px 0;">
                            Broj fotografija
                          </p>
                          <p style="color: #1e293b; font-size: 14px; margin: 0;">
                            ${imageCount} ${imageCount === 1 ? 'fotografija' : imageCount >= 2 && imageCount <= 4 ? 'fotografije' : 'fotografija'}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Description -->
              <div style="margin-bottom: 24px;">
                <p style="color: #64748b; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px 0;">
                  Opis problema
                </p>
                <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; border-left: 4px solid #dc2626;">
                  <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0; white-space: pre-wrap;">
${escapeHtml(description)}
                  </p>
                </div>
              </div>

              ${
                hasReporterInfo
                  ? `
              <!-- Reporter Info Card -->
              <div style="margin-bottom: 24px;">
                <p style="color: #64748b; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px 0;">
                  Podaci o prijavitelju
                </p>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0fdf4; border-radius: 8px;">
                  <tr>
                    <td style="padding: 20px;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        ${
                          reporterName
                            ? `
                        <tr>
                          <td style="padding-bottom: ${reporterEmail || reporterPhone ? '12px' : '0'};">
                            <p style="color: #64748b; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px 0;">
                              Ime
                            </p>
                            <p style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0;">
                              ${escapeHtml(reporterName)}
                            </p>
                          </td>
                        </tr>
                        `
                            : ''
                        }
                        ${
                          reporterEmail
                            ? `
                        <tr>
                          <td style="padding-bottom: ${reporterPhone ? '12px' : '0'};">
                            <p style="color: #64748b; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px 0;">
                              E-mail adresa
                            </p>
                            <p style="margin: 0;">
                              <a href="mailto:${escapeHtml(reporterEmail)}" style="color: #16a34a; font-size: 16px; text-decoration: none;">
                                ${escapeHtml(reporterEmail)}
                              </a>
                            </p>
                          </td>
                        </tr>
                        `
                            : ''
                        }
                        ${
                          reporterPhone
                            ? `
                        <tr>
                          <td>
                            <p style="color: #64748b; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px 0;">
                              Telefon
                            </p>
                            <p style="margin: 0;">
                              <a href="tel:${escapeHtml(reporterPhone)}" style="color: #16a34a; font-size: 16px; text-decoration: none;">
                                ${escapeHtml(reporterPhone)}
                              </a>
                            </p>
                          </td>
                        </tr>
                        `
                            : ''
                        }
                      </table>
                    </td>
                  </tr>
                </table>
              </div>
              `
                  : `
              <!-- Anonymous Report Notice -->
              <div style="margin-bottom: 24px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fefce8; border-radius: 8px;">
                  <tr>
                    <td style="padding: 16px 20px;">
                      <p style="color: #854d0e; font-size: 14px; margin: 0;">
                        Anonimna prijava - prijavitelj nije ostavio kontakt podatke.
                      </p>
                    </td>
                  </tr>
                </table>
              </div>
              `
              }

              ${
                reporterEmail
                  ? `
              <!-- Reply Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding-top: 16px;">
                    <a href="mailto:${escapeHtml(reporterEmail)}?subject=Re: Prijava problema - ${escapeHtml(problemTypeLabel)}" style="display: inline-block; background-color: #16a34a; color: #ffffff; font-size: 14px; font-weight: 600; padding: 14px 32px; border-radius: 8px; text-decoration: none;">
                      Kontaktiraj prijavitelja
                    </a>
                  </td>
                </tr>
              </table>
              `
                  : ''
              }
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0;">
                      Opcina Veliki Bukovec
                    </p>
                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                      Ova obavijest je automatski generirana putem sustava za prijavu problema.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  const reporterInfoText = hasReporterInfo
    ? `
PODACI O PRIJAVITELJU
---------------------
${reporterName ? `Ime: ${reporterName}\n` : ''}${reporterEmail ? `E-mail: ${reporterEmail}\n` : ''}${reporterPhone ? `Telefon: ${reporterPhone}` : ''}`
    : `
NAPOMENA
--------
Anonimna prijava - prijavitelj nije ostavio kontakt podatke.`;

  const text = `
NOVA PRIJAVA PROBLEMA
=====================

Opcina Veliki Bukovec - Sustav za prijavu problema

Vrsta problema: ${problemTypeLabel}
Lokacija: ${location}
Vrijeme prijave: ${formattedDate}
Broj fotografija: ${imageCount}

OPIS PROBLEMA
-------------
${description}
${reporterInfoText}

---
${reporterEmail ? `Za kontaktiranje prijavitelja, odgovorite na e-mail adresu: ${reporterEmail}` : 'Nije moguće kontaktirati prijavitelja - anonimna prijava.'}

--
Opcina Veliki Bukovec
Ova obavijest je automatski generirana putem sustava za prijavu problema.
`.trim();

  return {
    subject: emailSubject,
    html,
    text,
  };
}

/**
 * Escapes HTML special characters to prevent XSS
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
