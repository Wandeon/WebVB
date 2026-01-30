/**
 * Contact notification email template
 * Sends notification to admin when someone submits a contact form
 */

interface ContactNotificationData {
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  createdAt?: Date;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Generates email template for contact form notifications
 * @param data - Contact form submission data
 * @returns Email template with subject, HTML, and plain text versions
 */
export function contactNotificationTemplate(
  data: ContactNotificationData
): EmailTemplate {
  const { name, email, subject, message, createdAt } = data;

  const displaySubject = subject || 'Kontakt';
  const formattedDate = createdAt
    ? new Intl.DateTimeFormat('hr-HR', {
        dateStyle: 'long',
        timeStyle: 'short',
      }).format(createdAt)
    : new Intl.DateTimeFormat('hr-HR', {
        dateStyle: 'long',
        timeStyle: 'short',
      }).format(new Date());

  const emailSubject = `Nova poruka s web stranice: ${displaySubject}`;

  const html = `
<!DOCTYPE html>
<html lang="hr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${emailSubject}</title>
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
            <td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 32px 40px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 600; margin: 0;">
                Opcina Veliki Bukovec
              </h1>
              <p style="color: rgba(255, 255, 255, 0.9); font-size: 14px; margin-top: 8px;">
                Nova poruka s kontakt obrasca
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <!-- Subject Badge -->
              <div style="margin-bottom: 24px;">
                <span style="display: inline-block; background-color: #dbeafe; color: #1e40af; font-size: 12px; font-weight: 600; padding: 6px 12px; border-radius: 16px; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${escapeHtml(displaySubject)}
                </span>
              </div>

              <!-- Sender Info Card -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <p style="color: #64748b; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px 0;">
                            Pošiljatelj
                          </p>
                          <p style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0;">
                            ${escapeHtml(name)}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <p style="color: #64748b; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px 0;">
                            E-mail adresa
                          </p>
                          <p style="margin: 0;">
                            <a href="mailto:${escapeHtml(email)}" style="color: #2563eb; font-size: 16px; text-decoration: none;">
                              ${escapeHtml(email)}
                            </a>
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="color: #64748b; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px 0;">
                            Vrijeme slanja
                          </p>
                          <p style="color: #1e293b; font-size: 14px; margin: 0;">
                            ${escapeHtml(formattedDate)}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Message -->
              <div style="margin-bottom: 24px;">
                <p style="color: #64748b; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px 0;">
                  Poruka
                </p>
                <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; border-left: 4px solid #3b82f6;">
                  <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0; white-space: pre-wrap;">
${escapeHtml(message)}
                  </p>
                </div>
              </div>

              <!-- Reply Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding-top: 16px;">
                    <a href="mailto:${escapeHtml(email)}?subject=Re: ${escapeHtml(displaySubject)}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 14px; font-weight: 600; padding: 14px 32px; border-radius: 8px; text-decoration: none;">
                      Odgovori na poruku
                    </a>
                  </td>
                </tr>
              </table>
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
                      Ova poruka je automatski generirana putem web stranice.
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

  const text = `
NOVA PORUKA S WEB STRANICE
==========================

Opcina Veliki Bukovec - Kontakt obrazac

Predmet: ${displaySubject}

PODACI O POŠILJATELJU
---------------------
Ime: ${name}
E-mail: ${email}
Vrijeme slanja: ${formattedDate}

PORUKA
------
${message}

---
Za odgovor na ovu poruku, odgovorite na e-mail adresu: ${email}

--
Opcina Veliki Bukovec
Ova poruka je automatski generirana putem web stranice.
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
