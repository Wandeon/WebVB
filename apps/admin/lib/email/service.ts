import { contactLogger, problemReportsLogger } from '../logger';
import { getEmailLogFields } from '../pii';
import { getAdminEmail, getEmailTransporter, getSmtpFrom, isEmailConfigured } from './client';
import { contactConfirmationTemplate } from './templates/contact-confirmation';
import { contactNotificationTemplate } from './templates/contact-notification';
import { newsletterConfirmationTemplate } from './templates/newsletter-confirmation';
import { newsletterDigestTemplate } from './templates/newsletter-digest';
import { problemConfirmationTemplate } from './templates/problem-confirmation';
import { problemNotificationTemplate } from './templates/problem-notification';

export interface ContactEmailData {
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  createdAt?: Date;
}

/**
 * Send notification email to admin about new contact form submission
 * Fire-and-forget: errors are logged but don't throw
 */
export function sendContactNotification(data: ContactEmailData): void {
  if (!isEmailConfigured()) {
    contactLogger.warn('Email not configured, skipping admin notification');
    return;
  }

  const transporter = getEmailTransporter();
  const from = getSmtpFrom();
  const adminEmail = getAdminEmail();

  if (!transporter || !from || !adminEmail) {
    contactLogger.warn('Email transporter not available, skipping admin notification');
    return;
  }

  const template = contactNotificationTemplate(data);

  transporter
    .sendMail({
      from,
      to: adminEmail,
      subject: template.subject,
      text: template.text,
      html: template.html,
    })
    .then(() => {
      contactLogger.info({ ...getEmailLogFields(adminEmail) }, 'Contact notification email sent to admin');
    })
    .catch((error: unknown) => {
      contactLogger.error({ error, ...getEmailLogFields(adminEmail) }, 'Failed to send contact notification email');
    });
}

/**
 * Send confirmation email to the person who submitted the contact form
 * Fire-and-forget: errors are logged but don't throw
 */
export function sendContactConfirmation(data: ContactEmailData): void {
  if (!isEmailConfigured()) {
    contactLogger.warn('Email not configured, skipping sender confirmation');
    return;
  }

  const transporter = getEmailTransporter();
  const from = getSmtpFrom();

  if (!transporter || !from) {
    contactLogger.warn('Email transporter not available, skipping sender confirmation');
    return;
  }

  const template = contactConfirmationTemplate({
    name: data.name,
    message: data.message,
  });

  transporter
    .sendMail({
      from,
      to: data.email,
      subject: template.subject,
      text: template.text,
      html: template.html,
    })
    .then(() => {
      contactLogger.info({ ...getEmailLogFields(data.email) }, 'Contact confirmation email sent to sender');
    })
    .catch((error: unknown) => {
      contactLogger.error({ error, ...getEmailLogFields(data.email) }, 'Failed to send contact confirmation email');
    });
}

// =============================================================================
// Problem Report Emails
// =============================================================================

export interface ProblemReportEmailData {
  problemType: string;
  location: string;
  description: string;
  reporterName?: string | null;
  reporterEmail?: string | null;
  reporterPhone?: string | null;
  images?: { url: string; caption?: string | null }[] | null;
  createdAt?: Date;
}

/**
 * Send notification email to admin about new problem report
 * Fire-and-forget: errors are logged but don't throw
 */
export function sendProblemNotification(data: ProblemReportEmailData): void {
  if (!isEmailConfigured()) {
    problemReportsLogger.warn('Email not configured, skipping admin notification');
    return;
  }

  const transporter = getEmailTransporter();
  const from = getSmtpFrom();
  const adminEmail = getAdminEmail();

  if (!transporter || !from || !adminEmail) {
    problemReportsLogger.warn('Email transporter not available, skipping admin notification');
    return;
  }

  const template = problemNotificationTemplate(data);

  transporter
    .sendMail({
      from,
      to: adminEmail,
      subject: template.subject,
      text: template.text,
      html: template.html,
    })
    .then(() => {
      problemReportsLogger.info(
        { ...getEmailLogFields(adminEmail), problemType: data.problemType },
        'Problem notification email sent to admin'
      );
    })
    .catch((error: unknown) => {
      problemReportsLogger.error(
        { error, ...getEmailLogFields(adminEmail) },
        'Failed to send problem notification email'
      );
    });
}

/**
 * Send confirmation email to the person who submitted the problem report
 * Only sends if reporterEmail is provided
 * Fire-and-forget: errors are logged but don't throw
 */
export function sendProblemConfirmation(data: ProblemReportEmailData): void {
  // Only send if reporter provided an email
  if (!data.reporterEmail) {
    return;
  }

  if (!isEmailConfigured()) {
    problemReportsLogger.warn('Email not configured, skipping reporter confirmation');
    return;
  }

  const transporter = getEmailTransporter();
  const from = getSmtpFrom();

  if (!transporter || !from) {
    problemReportsLogger.warn('Email transporter not available, skipping reporter confirmation');
    return;
  }

  const template = problemConfirmationTemplate({
    reporterName: data.reporterName,
    problemType: data.problemType,
    location: data.location,
  });

  transporter
    .sendMail({
      from,
      to: data.reporterEmail,
      subject: template.subject,
      text: template.text,
      html: template.html,
    })
    .then(() => {
      problemReportsLogger.info(
        { ...getEmailLogFields(data.reporterEmail) },
        'Problem confirmation email sent to reporter'
      );
    })
    .catch((error: unknown) => {
      problemReportsLogger.error(
        { error, ...getEmailLogFields(data.reporterEmail) },
        'Failed to send problem confirmation email'
      );
    });
}

// =============================================================================
// Newsletter Emails
// =============================================================================

/**
 * Send confirmation email for newsletter subscription
 * Fire-and-forget: errors are logged but don't throw
 */
export function sendNewsletterConfirmation(email: string, confirmUrl: string): void {
  if (!isEmailConfigured()) {
    contactLogger.warn('Email not configured, skipping newsletter confirmation');
    return;
  }

  const transporter = getEmailTransporter();
  const from = getSmtpFrom();

  if (!transporter || !from) {
    contactLogger.warn('Email transporter not available, skipping newsletter confirmation');
    return;
  }

  const template = newsletterConfirmationTemplate({ confirmUrl });

  transporter
    .sendMail({
      from,
      to: email,
      subject: template.subject,
      text: template.text,
      html: template.html,
    })
    .then(() => {
      contactLogger.info({ ...getEmailLogFields(email) }, 'Newsletter confirmation email sent');
    })
    .catch((error: unknown) => {
      contactLogger.error({ error, ...getEmailLogFields(email) }, 'Failed to send newsletter confirmation email');
    });
}

// =============================================================================
// Newsletter Digest Sending
// =============================================================================

export interface NewsletterDigestItem {
  type: 'post' | 'announcement' | 'event';
  id: string;
  title: string;
  excerpt: string | null;
  url: string;
  date?: string;
  location?: string;
}

export interface SendNewsletterDigestOptions {
  introText: string | null;
  items: NewsletterDigestItem[];
  subscribers: { id: string; email: string }[];
  siteUrl: string;
  onProgress?: (sent: number, total: number) => void;
}

export interface SendNewsletterDigestResult {
  success: boolean;
  sent: number;
  failed: number;
  subject: string;
  contentHtml: string;
  contentText: string;
}

/**
 * Send newsletter digest to all subscribers
 * Sends in batches with delay to avoid spam flags
 */
export async function sendNewsletterDigest(
  options: SendNewsletterDigestOptions
): Promise<SendNewsletterDigestResult> {
  const { introText, items, subscribers, siteUrl, onProgress } = options;

  if (!isEmailConfigured()) {
    contactLogger.warn('Email not configured, cannot send newsletter');
    throw new Error('Email is not configured');
  }

  const transporter = getEmailTransporter();
  const from = getSmtpFrom();

  if (!transporter || !from) {
    throw new Error('Email transporter not available');
  }

  let sent = 0;
  let failed = 0;
  let templateResult: { subject: string; html: string; text: string } | null = null;

  for (const subscriber of subscribers) {
    const unsubscribeUrl = `${siteUrl}/newsletter/odjava?id=${subscriber.id}`;

    const template = newsletterDigestTemplate({
      introText,
      items,
      unsubscribeUrl,
      siteUrl,
    });

    // Store template for return (same for all subscribers except unsubscribe URL)
    if (!templateResult) {
      templateResult = template;
    }

    try {
      await transporter.sendMail({
        from,
        to: subscriber.email,
        subject: template.subject,
        text: template.text,
        html: template.html,
      });

      sent++;
      contactLogger.info(
        { subscriberId: subscriber.id, ...getEmailLogFields(subscriber.email) },
        'Newsletter digest sent'
      );
    } catch (error) {
      failed++;
      contactLogger.error(
        { error, subscriberId: subscriber.id, ...getEmailLogFields(subscriber.email) },
        'Failed to send newsletter digest'
      );
    }

    onProgress?.(sent + failed, subscribers.length);

    // Small delay between emails to avoid spam flags (100ms)
    if (sent + failed < subscribers.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return {
    success: failed === 0,
    sent,
    failed,
    subject: templateResult?.subject || 'Newsletter - Općina Veliki Bukovec',
    contentHtml: templateResult?.html || '',
    contentText: templateResult?.text || '',
  };
}
