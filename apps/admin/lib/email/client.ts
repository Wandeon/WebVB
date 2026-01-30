import nodemailer from 'nodemailer';

import type { Transporter } from 'nodemailer';

// Email configuration from environment variables
interface EmailConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
  adminEmail: string;
}

// Check if all required SMTP environment variables are configured
function checkEmailConfig(): EmailConfig | null {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!host || !port || !user || !password || !from || !adminEmail) {
    return null;
  }

  const portNumber = parseInt(port, 10);
  if (isNaN(portNumber)) {
    return null;
  }

  return {
    host,
    port: portNumber,
    user,
    password,
    from,
    adminEmail,
  };
}

// Lazy initialization for transporter
let transporter: Transporter | null = null;
let emailConfig: EmailConfig | null = null;
let configChecked = false;

function getEmailConfig(): EmailConfig | null {
  if (!configChecked) {
    emailConfig = checkEmailConfig();
    configChecked = true;
  }
  return emailConfig;
}

function getTransporter(): Transporter | null {
  const config = getEmailConfig();
  if (!config) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.password,
      },
    });
  }

  return transporter;
}

/**
 * Check if email is properly configured
 * Returns true if all required SMTP environment variables are set
 */
export function isEmailConfigured(): boolean {
  return getEmailConfig() !== null;
}

/**
 * Get the configured SMTP_FROM address
 * Returns null if email is not configured
 */
export function getSmtpFrom(): string | null {
  const config = getEmailConfig();
  return config?.from ?? null;
}

/**
 * Get the configured ADMIN_EMAIL address
 * Returns null if email is not configured
 */
export function getAdminEmail(): string | null {
  const config = getEmailConfig();
  return config?.adminEmail ?? null;
}

/**
 * Get the nodemailer transporter for sending emails
 * Returns null if email is not configured
 */
export function getEmailTransporter(): Transporter | null {
  return getTransporter();
}

// Export config values directly for convenience (returns empty string if not configured)
export const SMTP_FROM = process.env.SMTP_FROM ?? '';
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? '';
