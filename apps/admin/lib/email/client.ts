import { getOptionalAdminEmailEnv, type AdminEmailEnv } from '@repo/shared';
import nodemailer from 'nodemailer';

import type { Transporter } from 'nodemailer';

// Email configuration from environment variables
type EmailConfig = AdminEmailEnv;

// Lazy initialization for transporter
let transporter: Transporter | null = null;
let emailConfig: EmailConfig | null = null;
let configChecked = false;

function getEmailConfig(): EmailConfig | null {
  if (!configChecked) {
    emailConfig = getOptionalAdminEmailEnv();
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
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: config.SMTP_PORT === 465,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASSWORD,
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
  return config?.SMTP_FROM ?? null;
}

/**
 * Get the configured ADMIN_EMAIL address
 * Returns null if email is not configured
 */
export function getAdminEmail(): string | null {
  const config = getEmailConfig();
  return config?.ADMIN_EMAIL ?? null;
}

/**
 * Get the nodemailer transporter for sending emails
 * Returns null if email is not configured
 */
export function getEmailTransporter(): Transporter | null {
  return getTransporter();
}
