import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getDaysUntil(date: Date | string): number {
  const target = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getExpirationStatus(expiresAt: Date | string): {
  status: 'expired' | 'critical' | 'warning' | 'good';
  label: string;
  color: string;
} {
  const days = getDaysUntil(expiresAt);

  if (days < 0) {
    return {
      status: 'expired',
      label: 'Expired',
      color: 'text-red-600 bg-red-50 border-red-200',
    };
  }

  if (days <= 7) {
    return {
      status: 'critical',
      label: `${days} days left`,
      color: 'text-red-600 bg-red-50 border-red-200',
    };
  }

  if (days <= 90) {
    return {
      status: 'warning',
      label: `${days} days left`,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    };
  }

  return {
    status: 'good',
    label: `${days} days left`,
    color: 'text-green-600 bg-green-50 border-green-200',
  };
}

export function formatDocumentKind(kind: string): string {
  const kindMap: Record<string, string> = {
    PASSPORT: 'Passport',
    NATIONAL_ID: 'National ID',
    DRIVERS_LICENSE: "Driver's License",
    RESIDENCE_PERMIT: 'Residence Permit',
    VISA: 'Visa',
  };
  return kindMap[kind] || kind;
}

export function getCountryFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + '...' : str;
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}
