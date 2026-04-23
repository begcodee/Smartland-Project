import nodemailer from 'nodemailer';

type RegistrationEmailInput = {
  to: string;
  name: string;
  role: string;
  approved: boolean;
  rejectionReason?: string | null;
};

let transporter: nodemailer.Transporter | null = null;

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;
  const secure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';

  return { host, port, user, pass, from, secure };
}

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;
  const cfg = getSmtpConfig();
  if (!cfg.host || !cfg.user || !cfg.pass || !cfg.from) return null;

  transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: {
      user: cfg.user,
      pass: cfg.pass
    }
  });
  return transporter;
}

const TIMELINE = '24 to 48 hours';

/** After self-service signup — user is pending until GLC / NIA processes */
export async function sendAccountPendingVerificationEmail(to: string, name: string): Promise<boolean> {
  const cfg = getSmtpConfig();
  const mailer = getTransporter();
  if (!mailer || !cfg.from) {
    console.warn('Email not sent: SMTP not configured');
    return false;
  }

  const subject = 'SmartLand — your account is pending verification';
  const text = `Hello ${name},\n\nThank you for registering with SmartLand (Ghana Land Registry).\n\nYour account is not active for transactions yet. Ghana Lands Commission will review your registration, and where applicable the National Identification Authority (NIA) will be involved for Ghana Card verification.\n\nYou should receive an email update within ${TIMELINE}.\n\nIf you have not submitted your Ghana Card yet, please complete verification from your dashboard after signing in.\n\nRegards,\nSmartLand / Ghana Lands Commission`;
  const html = `<p>Hello ${name},</p><p>Thank you for registering with <strong>SmartLand</strong> (Ghana Land Registry).</p><p>Your account is <strong>not</strong> active for transactions yet. Ghana Lands Commission will review your registration, and where applicable the <strong>NIA</strong> will be involved for Ghana Card verification.</p><p>You should receive an email update within <strong>${TIMELINE}</strong>.</p><p>If you have not submitted your Ghana Card yet, please complete verification from your dashboard after signing in.</p><p>Regards,<br/>SmartLand · Ghana Lands Commission</p>`;

  try {
    await mailer.sendMail({ from: cfg.from, to, subject, text, html });
    return true;
  } catch (err) {
    console.error('Failed to send pending account email:', err);
    return false;
  }
}

/** After Ghana Card / ID documents are saved — not approved yet */
export async function sendVerificationDocumentsReceivedEmail(
  to: string,
  name: string,
  kind: 'ghana_card' | 'full_registration'
): Promise<boolean> {
  const cfg = getSmtpConfig();
  const mailer = getTransporter();
  if (!mailer || !cfg.from) {
    console.warn('Email not sent: SMTP not configured');
    return false;
  }

  const subject =
    kind === 'full_registration'
      ? 'SmartLand — registration received for review'
      : 'SmartLand — Ghana Card submission received';

  const extra =
    kind === 'full_registration'
      ? 'We have received your registration and supporting documents.'
      : 'We have received your Ghana Card images and identity details for screening.';

  const text = `Hello ${name},\n\n${extra}\n\nVerification is not instant. Ghana Lands Commission coordinates review, and NIA may be involved for Ghana Card checks.\n\nYou should receive an outcome by email within ${TIMELINE}.\n\nRegards,\nSmartLand / Ghana Lands Commission`;

  const html = `<p>Hello ${name},</p><p>${extra}</p><p>Verification is not instant. Ghana Lands Commission coordinates review, and <strong>NIA</strong> may be involved for Ghana Card checks.</p><p>You should receive an outcome by email within <strong>${TIMELINE}</strong>.</p><p>Regards,<br/>SmartLand · Ghana Lands Commission</p>`;

  try {
    await mailer.sendMail({ from: cfg.from, to, subject, text, html });
    return true;
  } catch (err) {
    console.error('Failed to send documents received email:', err);
    return false;
  }
}

export async function sendRegistrationOutcomeEmail(input: RegistrationEmailInput): Promise<boolean> {
  const cfg = getSmtpConfig();
  const mailer = getTransporter();
  if (!mailer || !cfg.from) {
    console.warn('Email not sent: SMTP not configured');
    return false;
  }

  const subject = input.approved
    ? 'SmartLand verification approved'
    : 'SmartLand verification update required';

  const reasonLine = input.rejectionReason?.trim()
    ? `Reason: ${input.rejectionReason.trim()}`
    : 'Reason: Documents did not meet verification standards.';

  const text = input.approved
    ? `Hello ${input.name},\n\nYour SmartLand registration as ${input.role} has been approved by Ghana Lands Commission.\n\nYou can now log in to your account.\n\nRegards,\nSmartLand`
    : `Hello ${input.name},\n\nYour SmartLand registration as ${input.role} was not approved yet.\n${reasonLine}\n\nPlease update your submission and try again.\n\nRegards,\nSmartLand`;

  const html = input.approved
    ? `<p>Hello ${input.name},</p><p>Your SmartLand registration as <strong>${input.role}</strong> has been approved by Ghana Lands Commission.</p><p>You can now log in to your account.</p><p>Regards,<br/>SmartLand</p>`
    : `<p>Hello ${input.name},</p><p>Your SmartLand registration as <strong>${input.role}</strong> was not approved yet.</p><p><strong>${reasonLine}</strong></p><p>Please update your submission and try again.</p><p>Regards,<br/>SmartLand</p>`;

  try {
    await mailer.sendMail({
      from: cfg.from,
      to: input.to,
      subject,
      text,
      html
    });
    return true;
  } catch (err) {
    console.error('Failed to send registration email:', err);
    return false;
  }
}
