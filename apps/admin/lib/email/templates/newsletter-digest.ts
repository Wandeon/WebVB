/**
 * Newsletter digest email template
 * Beautiful HTML email with multiple content items
 */

interface NewsletterItem {
  type: 'post' | 'announcement' | 'event';
  id: string;
  title: string;
  excerpt: string | null;
  url: string;
  date?: string;
  location?: string;
}

interface NewsletterDigestData {
  introText: string | null;
  items: NewsletterItem[];
  unsubscribeUrl: string;
  siteUrl: string;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

const TYPE_LABELS: Record<string, string> = {
  post: 'Vijest',
  announcement: 'Obavijest',
  event: 'Događanje',
};

const TYPE_COLORS: Record<string, string> = {
  post: '#3b82f6',
  announcement: '#f59e0b',
  event: '#8b5cf6',
};

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

/**
 * Generates a newsletter digest email with multiple content items
 * All text is in Croatian language
 */
export function newsletterDigestTemplate(data: NewsletterDigestData): EmailTemplate {
  const { introText, items, unsubscribeUrl, siteUrl } = data;

  const subject = `Newsletter - Opcina Veliki Bukovec`;

  // Generate HTML for each item
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 24px 0; border-bottom: 1px solid #e5e7eb;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td>
              <span style="display: inline-block; padding: 4px 12px; background-color: ${TYPE_COLORS[item.type]}; color: #ffffff; font-size: 12px; font-weight: 600; border-radius: 4px; margin-bottom: 8px;">
                ${TYPE_LABELS[item.type]}
              </span>
              <h2 style="margin: 8px 0 12px 0; font-size: 20px; font-weight: 600; color: #111827;">
                <a href="${escapeHtml(item.url)}" style="color: #111827; text-decoration: none;">
                  ${escapeHtml(item.title)}
                </a>
              </h2>
              ${item.type === 'event' && item.date ? `
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">
                  ${escapeHtml(item.date)}${item.location ? ` - ${escapeHtml(item.location)}` : ''}
                </p>
              ` : ''}
              ${item.excerpt ? `
                <p style="margin: 0 0 16px 0; font-size: 15px; color: #4b5563; line-height: 1.6;">
                  ${escapeHtml(item.excerpt)}
                </p>
              ` : ''}
              <a href="${escapeHtml(item.url)}" style="display: inline-block; color: #16a34a; font-size: 14px; font-weight: 600; text-decoration: none;">
                Procitaj vise →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  const html = `
<!DOCTYPE html>
<html lang="hr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; max-width: 600px;">

          <!-- Header -->
          <tr>
            <td style="background-color: #16a34a; padding: 40px 32px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700; color: #ffffff;">
                Opcina Veliki Bukovec
              </h1>
              <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.9);">
                Newsletter
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="background-color: #ffffff; padding: 32px;">

              ${introText ? `
              <!-- Intro -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding-bottom: 24px; border-bottom: 1px solid #e5e7eb;">
                    <p style="margin: 0; font-size: 16px; color: #374151; line-height: 1.7;">
                      ${escapeHtml(introText)}
                    </p>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Items -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                ${itemsHtml}
              </table>

              <!-- CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding-top: 32px; text-align: center;">
                    <a href="${escapeHtml(siteUrl)}" style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Posjetite nasu stranicu
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 32px; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280;">
                Srdacan pozdrav,<br>
                <strong>Opcina Veliki Bukovec</strong>
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                <a href="${escapeHtml(unsubscribeUrl)}" style="color: #9ca3af; text-decoration: underline;">
                  Odjavi se s newslettera
                </a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  // Plain text version
  const itemsText = items.map(item => `
[${TYPE_LABELS[item.type]}] ${item.title}
${item.type === 'event' && item.date ? `${item.date}${item.location ? ` - ${item.location}` : ''}\n` : ''}${item.excerpt ? `${item.excerpt}\n` : ''}Procitaj vise: ${item.url}
`).join('\n---\n');

  const text = `
OPCINA VELIKI BUKOVEC - NEWSLETTER

${introText ? `${introText}\n\n---\n` : ''}
${itemsText}

---

Posjetite nasu stranicu: ${siteUrl}

---
Za odjavu s newslettera posjetite: ${unsubscribeUrl}
  `.trim();

  return { subject, html, text };
}

export type { NewsletterItem, NewsletterDigestData, EmailTemplate };
