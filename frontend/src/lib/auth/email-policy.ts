export const ALLOWED_CAMPUS_DOMAINS = (import.meta.env.VITE_AUTHORIZED_EMAIL_DOMAINS || 'glbitm.ac.in')
  .split(',')
  .map(domain => domain.trim().toLowerCase().replace(/^@/, ''))
  .filter(Boolean);

export const CAMPUS_EMAIL_MESSAGE =
  `Use an authorized college email address: ${ALLOWED_CAMPUS_DOMAINS.map(domain => `@${domain}`).join(', ')}.`;

export function isAllowedCampusEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const parts = normalizedEmail.split('@');

  return parts.length === 2
    && parts[0].length > 0
    && ALLOWED_CAMPUS_DOMAINS.includes(parts[1]);
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
