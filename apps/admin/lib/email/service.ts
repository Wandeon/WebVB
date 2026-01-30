import { contactLogger, problemReportsLogger } from '../logger';
import { getAdminEmail, getEmailTransporter, getSmtpFrom, isEmailConfigured } from './client';
import { contactConfirmationTemplate } from './templates/contact-confirmation';
import { contactNotificationTemplate } from './templates/contact-notification';
import { newsletterConfirmationTemplate } from './templates/newsletter-confirmation';
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
      contactLogger.info({ to: adminEmail }, 'Contact notification email sent to admin');
    })
    .catch((error: unknown) => {
      contactLogger.error({ error, to: adminEmail }, 'Failed to send contact notification email');
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
      contactLogger.info({ to: data.email }, 'Contact confirmation email sent to sender');
    })
    .catch((error: unknown) => {
      contactLogger.error({ error, to: data.email }, 'Failed to send contact confirmation email');
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
      problemReportsLogger.info({ to: adminEmail, problemType: data.problemType }, 'Problem notification email sent to admin');
    })
    .catch((error: unknown) => {
      problemReportsLogger.error({ error, to: adminEmail }, 'Failed to send problem notification email');
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
      problemReportsLogger.info({ to: data.reporterEmail }, 'Problem confirmation email sent to reporter');
    })
    .catch((error: unknown) => {
      problemReportsLogger.error({ error, to: data.reporterEmail }, 'Failed to send problem confirmation email');
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
      contactLogger.info({ to: email }, 'Newsletter confirmation email sent');
    })
    .catch((error: unknown) => {
      contactLogger.error({ error, to: email }, 'Failed to send newsletter confirmation email');
    });
}
