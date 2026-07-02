import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not set. Email sending will be disabled.');
}

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Sends an email using Resend.
 *
 * @param {EmailOptions} options - The email options.
 * @param {string} options.to - The recipient's email address.
 * @param {string} options.subject - The email subject.
 * @param {string} options.html - The HTML content of the email.
 * @param {string} [options.from] - The sender's email address. Defaults to a test address.
 * @returns {Promise<{success: boolean, data?: any, error?: any}>} - The result of the send operation.
 */
export const sendEmail = async ({ to, subject, html, from }: EmailOptions) => {
  if (!resend) {
    console.error('Email sending is disabled because RESEND_API_KEY is not configured.');
    return { success: false, error: 'Email service not configured.' };
  }

  // The 'from' address must be a verified domain on your Resend account.
  // Using a default for demonstration purposes.
  const fromAddress = from || 'onboarding@resend.dev';

  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    console.log(`Email sent successfully to ${to}. ID: ${data?.id}`);
    return { success: true, data };
  } catch (exception) {
    console.error('An exception occurred while sending email:', exception);
    return { success: false, error: exception };
  }
};
