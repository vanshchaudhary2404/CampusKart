const DEFAULT_CAMPUS_DOMAINS = ['glbitm.ac.in'];

export const getAllowedCampusDomains = () => {
  const configuredDomains = (process.env.AUTHORIZED_EMAIL_DOMAINS || DEFAULT_CAMPUS_DOMAINS.join(','))
    .split(',')
    .map(domain => domain.trim().toLowerCase().replace(/^@/, ''))
    .filter(Boolean);

  return [...new Set(configuredDomains)];
};

export const isAllowedCampusEmail = (email) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const emailParts = normalizedEmail.split('@');

  if (emailParts.length !== 2 || !emailParts[0] || !emailParts[1]) return false;

  return getAllowedCampusDomains().includes(emailParts[1]);
};

export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
