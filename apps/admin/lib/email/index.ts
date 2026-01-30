// Email client
export { isEmailConfigured, getEmailTransporter, getSmtpFrom, getAdminEmail } from './client';

// Email service - Contact
export { sendContactNotification, sendContactConfirmation } from './service';
export type { ContactEmailData } from './service';

// Email service - Problem Reports
export { sendProblemNotification, sendProblemConfirmation } from './service';
export type { ProblemReportEmailData } from './service';

// Email service - Newsletter
export { sendNewsletterConfirmation } from './service';

// Templates (for testing/customization)
export { contactNotificationTemplate } from './templates/contact-notification';
export { contactConfirmationTemplate } from './templates/contact-confirmation';
export { problemNotificationTemplate } from './templates/problem-notification';
export { problemConfirmationTemplate } from './templates/problem-confirmation';
export { newsletterConfirmationTemplate } from './templates/newsletter-confirmation';
