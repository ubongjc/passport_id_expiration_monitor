# IDMonitor Web Application

**100% Secure** Passport & ID Expiration Monitor with Zero-Knowledge Encryption

## Security Architecture

### Zero-Knowledge Encryption
- **All sensitive data is encrypted client-side** using AES-GCM 256-bit encryption
- Server NEVER sees plaintext document numbers, names, or MRZ data
- Each document has unique salt and IV for maximum security
- User's passkey/password derives encryption keys via PBKDF2 (100,000 iterations)

### Authentication
- Passkey/WebAuthn-first authentication via Clerk
- Magic links as fallback
- Role-based access control (RBAC)
- Audit logging for all security-sensitive operations

### Data Storage
- Encrypted documents stored in Cloudflare R2 (S3-compatible)
- Signed URLs for secure uploads/downloads
- Client-side encryption before upload

## Features

### Flexible Reminder System
Users have complete control over reminder schedules:
- **Early Warnings**: Set custom days (e.g., 365, 180, 90 days before expiry)
- **Urgent Period**: Increasing frequency as expiry approaches (e.g., weekly in last 30 days)
- **Critical Period**: Most frequent reminders (e.g., daily in last 7 days)
- **Multi-Channel**: Email, push notifications, SMS (user configurable)

### Document Management
- OCR scanning of passports and IDs
- Automatic expiration tracking
- Renewal status tracking
- Jurisdiction-specific renewal kits

### Auto-Fill Forms
- Encrypted profile data storage
- Automatic form filling for renewal applications
- Country/jurisdiction-specific templates

## Tech Stack

- **Framework**: Next.js 15 + React 19 + TypeScript 5
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL 16 + Prisma 5
- **Authentication**: Clerk (Passkeys/WebAuthn)
- **Storage**: Cloudflare R2
- **Payments**: Stripe
- **Monitoring**: Sentry + OpenTelemetry

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up database:**
   ```bash
   npm run db:push
   npm run db:generate
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Open browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Documentation

### Core Endpoints

#### Documents
- `POST /api/documents` - Create encrypted document
- `GET /api/documents` - List user's documents
- `GET /api/documents/[id]` - Get document details
- `PATCH /api/documents/[id]` - Update document
- `DELETE /api/documents/[id]` - Soft delete document

#### Reminders
- `GET /api/reminders/config` - Get reminder configuration
- `POST /api/reminders/config` - Update reminder settings

#### Health
- `GET /api/health` - System health check

### Security Headers

All responses include security headers:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

## Database Schema

See `prisma/schema.prisma` for complete data model.

Key models:
- `User` - User profiles with encrypted data
- `IdentityDocument` - Documents with client-side encryption
- `ReminderConfig` - User-configurable reminder schedules
- `ScheduledReminder` - Generated reminders
- `AuditLog` - Security audit trail

## Encryption Flow

### Document Creation
1. User enters document data (client-side)
2. Generate random salt and IV
3. Derive encryption key from user's passphrase via PBKDF2
4. Encrypt sensitive fields with AES-GCM
5. Send only ciphertext to server
6. Server stores encrypted data and metadata

### Document Retrieval
1. Server returns encrypted document
2. Client derives decryption key from user's passphrase
3. Decrypt fields client-side
4. Display to user

## Compliance

- **GDPR**: Data export and deletion available
- **Audit Logging**: All security events logged
- **Data Minimization**: Only necessary data stored
- **Soft Deletes**: Compliance-friendly deletion
- **Rate Limiting**: Prevents abuse

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Prisma Studio

## License

Proprietary
