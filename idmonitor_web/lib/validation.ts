/**
 * Comprehensive Input Validation Schemas
 * Uses Zod for runtime type checking and validation
 * Implements OWASP input validation best practices
 */

import { z } from 'zod';

/**
 * Document Kind Enum
 */
export const DocumentKindSchema = z.enum([
  'PASSPORT',
  'NATIONAL_ID',
  'DRIVERS_LICENSE',
  'RESIDENCE_PERMIT',
  'VISA',
  'OTHER',
]);

/**
 * Renewal Status Enum
 */
export const RenewalStatusSchema = z.enum([
  'NOT_STARTED',
  'IN_PROGRESS',
  'SUBMITTED',
  'APPROVED',
  'COMPLETED',
]);

/**
 * Reminder Frequency Enum
 */
export const ReminderFrequencySchema = z.enum([
  'DAILY',
  'WEEKLY',
  'MONTHLY',
]);

/**
 * Document Creation Schema
 * Validates all required fields for creating a new document
 */
export const CreateDocumentSchema = z.object({
  kind: DocumentKindSchema,
  country: z.string()
    .length(2, 'Country code must be exactly 2 characters')
    .regex(/^[A-Z]{2}$/, 'Country code must be uppercase letters')
    .refine((val) => {
      // ISO 3166-1 alpha-2 validation (basic check)
      return val.match(/^[A-Z]{2}$/);
    }, 'Invalid country code'),

  expiresAt: z.string()
    .datetime('Invalid date format')
    .refine((val) => {
      const date = new Date(val);
      // Expiry date should be in the future or recent past (for expired docs)
      const minDate = new Date('1900-01-01');
      const maxDate = new Date('2100-12-31');
      return date > minDate && date < maxDate;
    }, 'Expiry date must be between 1900 and 2100'),

  issuedAt: z.string()
    .datetime('Invalid date format')
    .optional()
    .refine((val) => {
      if (!val) return true;
      const date = new Date(val);
      const minDate = new Date('1900-01-01');
      const maxDate = new Date();
      return date > minDate && date < maxDate;
    }, 'Issue date must be in the past'),

  // Encrypted fields - validate length and format
  encryptedNumber: z.string()
    .min(1, 'Document number is required')
    .max(10000, 'Encrypted data too large')
    .refine((val) => {
      // Base64 validation
      return /^[A-Za-z0-9+/]+=*$/.test(val);
    }, 'Invalid encrypted data format'),

  encryptedHolderName: z.string()
    .min(1, 'Holder name is required')
    .max(10000, 'Encrypted data too large')
    .refine((val) => {
      return /^[A-Za-z0-9+/]+=*$/.test(val);
    }, 'Invalid encrypted data format'),

  encryptedDateOfBirth: z.string()
    .max(10000, 'Encrypted data too large')
    .optional()
    .refine((val) => {
      if (!val) return true;
      return /^[A-Za-z0-9+/]+=*$/.test(val);
    }, 'Invalid encrypted data format'),

  encryptedMRZData: z.string()
    .max(10000, 'Encrypted data too large')
    .optional()
    .refine((val) => {
      if (!val) return true;
      return /^[A-Za-z0-9+/]+=*$/.test(val);
    }, 'Invalid encrypted data format'),

  encryptionIV: z.string()
    .min(1, 'Encryption IV is required')
    .max(100, 'IV too large')
    .refine((val) => {
      return /^[A-Za-z0-9+/]+=*$/.test(val);
    }, 'Invalid IV format'),

  encryptionSalt: z.string()
    .min(1, 'Encryption salt is required')
    .max(100, 'Salt too large')
    .refine((val) => {
      return /^[A-Za-z0-9+/]+=*$/.test(val);
    }, 'Invalid salt format'),

  scanStorageKey: z.string()
    .max(500, 'Storage key too long')
    .optional()
    .refine((val) => {
      if (!val) return true;
      // Validate S3/R2 key format
      return /^[a-zA-Z0-9\-_./]+$/.test(val);
    }, 'Invalid storage key format'),

  renewalStatus: RenewalStatusSchema.default('NOT_STARTED'),

  notes: z.string()
    .max(5000, 'Notes too long')
    .optional()
    .refine((val) => {
      if (!val) return true;
      // Basic XSS prevention - no script tags
      return !/<script|javascript:/i.test(val);
    }, 'Invalid characters in notes'),
});

/**
 * Document Update Schema
 * Partial update - all fields optional
 */
export const UpdateDocumentSchema = CreateDocumentSchema.partial().extend({
  id: z.string()
    .min(1, 'Document ID is required')
    .max(100, 'Document ID too long')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid document ID format'),
});

/**
 * Reminder Configuration Schema
 */
export const ReminderConfigSchema = z.object({
  documentKind: DocumentKindSchema.optional().nullable(),

  earlyReminderDays: z.array(z.number().int().positive().max(3650))
    .min(0, 'At least one reminder day required')
    .max(20, 'Maximum 20 reminder days allowed')
    .refine((arr) => {
      // Check for duplicates
      return new Set(arr).size === arr.length;
    }, 'Duplicate reminder days not allowed')
    .default([365, 180, 90]),

  urgentPeriodDays: z.number()
    .int()
    .positive()
    .max(365, 'Urgent period cannot exceed 365 days')
    .default(30),

  urgentFrequency: ReminderFrequencySchema.default('WEEKLY'),

  criticalPeriodDays: z.number()
    .int()
    .positive()
    .max(90, 'Critical period cannot exceed 90 days')
    .default(7),

  criticalFrequency: ReminderFrequencySchema.default('DAILY'),

  emailEnabled: z.boolean().default(true),
  pushEnabled: z.boolean().default(true),
  smsEnabled: z.boolean().default(false),
}).refine((data) => {
  // Critical period must be less than urgent period
  return data.criticalPeriodDays < data.urgentPeriodDays;
}, {
  message: 'Critical period must be less than urgent period',
  path: ['criticalPeriodDays'],
});

/**
 * User Profile Schema
 */
export const UserProfileSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(100, 'First name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters')
    .refine((val) => {
      // No leading/trailing spaces
      return val.trim() === val;
    }, 'First name cannot have leading/trailing spaces'),

  lastName: z.string()
    .min(1, 'Last name is required')
    .max(100, 'Last name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters')
    .refine((val) => {
      return val.trim() === val;
    }, 'Last name cannot have leading/trailing spaces'),

  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email too long')
    .toLowerCase()
    .trim(),

  phone: z.string()
    .max(20, 'Phone number too long')
    .optional()
    .refine((val) => {
      if (!val) return true;
      // E.164 format validation
      return /^\+?[1-9]\d{1,14}$/.test(val.replace(/[\s()-]/g, ''));
    }, 'Invalid phone number format'),

  timezone: z.string()
    .max(100, 'Timezone too long')
    .optional()
    .refine((val) => {
      if (!val) return true;
      // Basic timezone validation
      try {
        Intl.DateTimeFormat(undefined, { timeZone: val });
        return true;
      } catch {
        return false;
      }
    }, 'Invalid timezone'),

  language: z.string()
    .length(2, 'Language code must be 2 characters')
    .regex(/^[a-z]{2}$/, 'Invalid language code')
    .default('en'),
});

/**
 * Search/Filter Query Schema
 */
export const SearchQuerySchema = z.object({
  query: z.string()
    .max(200, 'Search query too long')
    .optional()
    .refine((val) => {
      if (!val) return true;
      // Prevent SQL injection patterns
      return !/['";\\]|--|\*|\/\*/.test(val);
    }, 'Invalid search query'),

  kind: DocumentKindSchema.or(z.literal('all')).optional(),
  status: z.enum(['all', 'expired', 'expiring', 'good']).optional(),
  sortBy: z.enum([
    'expiry-asc',
    'expiry-desc',
    'name-asc',
    'name-desc',
    'created-asc',
    'created-desc',
  ]).optional(),

  page: z.number().int().positive().max(1000).default(1),
  limit: z.number().int().positive().max(100).default(20),
});

/**
 * Pagination Schema
 */
export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().min(1).max(100).default(20),
  offset: z.number().int().nonnegative().optional(),
});

/**
 * Date Range Schema
 */
export const DateRangeSchema = z.object({
  from: z.string().datetime('Invalid start date'),
  to: z.string().datetime('Invalid end date'),
}).refine((data) => {
  // End date must be after start date
  return new Date(data.to) > new Date(data.from);
}, {
  message: 'End date must be after start date',
  path: ['to'],
});

/**
 * Export Data Schema
 */
export const ExportDataSchema = z.object({
  format: z.enum(['json', 'csv', 'pdf']).default('json'),
  includeDeleted: z.boolean().default(false),
  documentIds: z.array(z.string()).optional(),
  dateRange: DateRangeSchema.optional(),
});

/**
 * API Key Creation Schema
 */
export const CreateApiKeySchema = z.object({
  name: z.string()
    .min(1, 'API key name is required')
    .max(100, 'API key name too long')
    .regex(/^[a-zA-Z0-9\s-_]+$/, 'API key name contains invalid characters'),

  expiresAt: z.string()
    .datetime('Invalid expiration date')
    .optional()
    .refine((val) => {
      if (!val) return true;
      const date = new Date(val);
      const minDate = new Date();
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 10);
      return date > minDate && date < maxDate;
    }, 'Expiration date must be within 10 years'),

  scopes: z.array(z.enum([
    'documents:read',
    'documents:write',
    'documents:delete',
    'reminders:read',
    'reminders:write',
  ])).min(1, 'At least one scope is required'),
});

/**
 * Session Configuration Schema
 */
export const SessionConfigSchema = z.object({
  timeout: z.number()
    .int()
    .positive()
    .min(1, 'Session timeout must be at least 1 day')
    .max(90, 'Session timeout cannot exceed 90 days')
    .default(30),

  requireReauth: z.boolean().default(false),
});

/**
 * Two-Factor Setup Schema
 */
export const TwoFactorSetupSchema = z.object({
  code: z.string()
    .length(6, 'Code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Code must contain only digits'),

  secret: z.string()
    .min(16, 'Invalid secret')
    .max(100, 'Secret too long')
    .regex(/^[A-Z2-7]+=*$/, 'Invalid secret format'),
});

/**
 * Two-Factor Verification Schema
 */
export const TwoFactorVerifySchema = z.object({
  code: z.string()
    .length(6, 'Code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Code must contain only digits'),
});

/**
 * Backup Code Schema
 */
export const BackupCodeSchema = z.object({
  code: z.string()
    .regex(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/, 'Invalid backup code format'),
});

/**
 * Sanitize HTML input
 * Removes potentially dangerous HTML tags and attributes
 */
export function sanitizeHTML(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

/**
 * Validate file upload
 */
export const FileUploadSchema = z.object({
  name: z.string()
    .max(255, 'Filename too long')
    .refine((val) => {
      // Validate file extension
      const allowed = /\.(jpg|jpeg|png|pdf|heic)$/i;
      return allowed.test(val);
    }, 'Invalid file type. Allowed: JPG, PNG, PDF, HEIC'),

  size: z.number()
    .positive()
    .max(10 * 1024 * 1024, 'File size cannot exceed 10MB'),

  type: z.string()
    .refine((val) => {
      const allowed = ['image/jpeg', 'image/png', 'application/pdf', 'image/heic'];
      return allowed.includes(val);
    }, 'Invalid file type'),
});

/**
 * Webhook Event Schema
 */
export const WebhookEventSchema = z.object({
  event: z.string().min(1).max(100),
  timestamp: z.string().datetime(),
  data: z.record(z.unknown()),
  signature: z.string().min(1),
});

/**
 * Rate Limit Schema
 */
export const RateLimitSchema = z.object({
  identifier: z.string().min(1).max(100),
  endpoint: z.string().min(1).max(200),
  limit: z.number().int().positive().max(10000),
  windowMs: z.number().int().positive().max(86400000), // Max 24 hours
});

// Type exports for TypeScript
export type DocumentKind = z.infer<typeof DocumentKindSchema>;
export type RenewalStatus = z.infer<typeof RenewalStatusSchema>;
export type ReminderFrequency = z.infer<typeof ReminderFrequencySchema>;
export type CreateDocumentInput = z.infer<typeof CreateDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof UpdateDocumentSchema>;
export type ReminderConfigInput = z.infer<typeof ReminderConfigSchema>;
export type UserProfileInput = z.infer<typeof UserProfileSchema>;
export type SearchQueryInput = z.infer<typeof SearchQuerySchema>;
export type ExportDataInput = z.infer<typeof ExportDataSchema>;
export type CreateApiKeyInput = z.infer<typeof CreateApiKeySchema>;
export type SessionConfigInput = z.infer<typeof SessionConfigSchema>;
export type TwoFactorSetupInput = z.infer<typeof TwoFactorSetupSchema>;
export type TwoFactorVerifyInput = z.infer<typeof TwoFactorVerifySchema>;
export type BackupCodeInput = z.infer<typeof BackupCodeSchema>;
export type FileUploadInput = z.infer<typeof FileUploadSchema>;
export type WebhookEventInput = z.infer<typeof WebhookEventSchema>;
export type RateLimitInput = z.infer<typeof RateLimitSchema>;
