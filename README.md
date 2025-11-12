# IDMonitor - Secure Passport & ID Expiration Monitor

**100% SECURE** passport and identity document expiration tracking with zero-knowledge encryption, flexible reminder scheduling, and auto-fill renewal forms.

## 🔒 Security First

This application is designed with **maximum security** as the primary requirement:

### Zero-Knowledge Architecture
- **All sensitive data encrypted client-side** before transmission
- Server NEVER sees plaintext document numbers, names, or MRZ data
- AES-GCM 256-bit encryption with PBKDF2 key derivation (100,000 iterations)
- Unique salt and IV per document
- Passkey/WebAuthn-first authentication
- Client-side file encryption before cloud upload

### Security Headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Content Security Policy enabled

### Compliance
- GDPR-ready (data export & deletion)
- CCPA-compliant
- SOC 2 audit logging
- HIPAA-ready architecture

## ✨ Key Features

### 🔔 Flexible Reminder System
Users have complete control over reminder schedules:
- **Early Warnings**: Customizable (default: 365, 180, 90 days before expiry)
- **Urgent Period**: Increasing frequency as expiry approaches (default: weekly in last 30 days)
- **Critical Period**: Most frequent reminders (default: daily in last 7 days)
- **Multi-Channel**: Email, push notifications, SMS (all user-configurable)
- **Per-Document-Type Config**: Different schedules for passports, IDs, licenses, etc.

### 📄 Document Management
- OCR scanning of passports and IDs
- Support for multiple document types:
  - Passports
  - National IDs
  - Driver's Licenses
  - Residence Permits
  - Visas
- Automatic expiration tracking
- Renewal status tracking
- Encrypted document scans

### 📝 Auto-Fill Forms
- Jurisdiction-specific renewal form templates
- Encrypted profile data storage
- Automatic form filling for renewal applications
- Checklist tracking for renewal process

### 🔐 Authentication
- Passkey/WebAuthn primary method
- Magic link fallback
- Biometric authentication on mobile (Face ID / Touch ID)
- Role-based access control
- Complete audit logging

## 🏗️ Architecture

### Monorepo Structure
```
passport_id_expiration_monitor/
├── idmonitor_web/          # Next.js web application
│   ├── app/                # Next.js App Router
│   ├── lib/                # Utilities (crypto, auth, reminders)
│   ├── components/         # React components
│   ├── prisma/             # Database schema
│   └── ...
└── idmonitor_ios/          # iOS native application
    └── IDMonitor/
        ├── App/            # App entry point
        ├── Features/       # Feature modules
        ├── Core/           # Crypto, networking, storage
        └── ...
```

### Tech Stack

#### Web Application
- **Framework**: Next.js 15 + React 19 + TypeScript 5
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL 16 + Prisma 5
- **Auth**: Clerk (Passkeys/WebAuthn)
- **Storage**: Cloudflare R2 (S3-compatible)
- **Payments**: Stripe
- **Monitoring**: Sentry + OpenTelemetry
- **Encryption**: Web Crypto API (AES-GCM)

#### iOS Application
- **Language**: Swift 5.9+
- **UI**: SwiftUI
- **Crypto**: CryptoKit
- **Auth**: LocalAuthentication (biometrics)
- **Storage**: Keychain
- **Networking**: URLSession with async/await
- **OCR**: Vision + AVFoundation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (for web)
- PostgreSQL 16+ (for web)
- Xcode 15+ (for iOS)
- Cloudflare R2 account (for file storage)
- Clerk account (for authentication)

### Web Application

1. **Navigate to web directory:**
   ```bash
   cd idmonitor_web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Set up database:**
   ```bash
   npm run db:push
   npm run db:generate
   ```

5. **Run development server:**
   ```bash
   npm run dev
   ```

6. **Open browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### iOS Application

1. **Navigate to iOS directory:**
   ```bash
   cd idmonitor_ios
   ```

2. **Open in Xcode:**
   ```bash
   open IDMonitor.xcodeproj
   ```

3. **Configure API endpoint:**
   Edit `IDMonitor/Core/Networking/APIClient.swift`

4. **Run on simulator or device**

See individual README files for more details:
- [Web Application README](./idmonitor_web/README.md)
- [iOS Application README](./idmonitor_ios/README.md)

## 🔐 Encryption Flow

### Document Creation
1. User enters document data (client-side)
2. Generate cryptographically secure random salt (16 bytes) and IV (12 bytes)
3. Derive encryption key from user passphrase using PBKDF2 (100,000 iterations, SHA-256)
4. Encrypt sensitive fields (number, name, MRZ) with AES-GCM
5. Send only ciphertext + metadata to server
6. Server stores encrypted data without ever seeing plaintext

### Document Retrieval
1. Server returns encrypted document with metadata
2. Client derives decryption key from user passphrase
3. Decrypt fields client-side using stored salt and IV
4. Display plaintext to user (never leaves device)

### File Encryption
1. User scans document with camera
2. Encrypt entire image file client-side before upload
3. Generate signed upload URL from server
4. Upload encrypted file directly to R2
5. Server stores only ciphertext reference

## 📊 Database Schema

Key models:
- `User` - User profiles with encrypted data
- `IdentityDocument` - Documents with client-side encryption
- `ReminderConfig` - User-configurable reminder schedules
- `ScheduledReminder` - Generated reminders
- `RenewalKit` - Renewal forms and checklists
- `AuditLog` - Security audit trail

See [prisma/schema.prisma](./idmonitor_web/prisma/schema.prisma) for complete schema.

## 🔔 Reminder System

### Configuration Options

Users can customize reminders for each document type:

```typescript
{
  documentKind: "PASSPORT",           // or null for global
  earlyReminderDays: [365, 180, 90],  // Early warnings
  urgentPeriodDays: 30,               // Last 30 days = urgent
  urgentFrequency: "WEEKLY",          // Weekly in urgent period
  criticalPeriodDays: 7,              // Last 7 days = critical
  criticalFrequency: "DAILY",         // Daily in critical period
  emailEnabled: true,
  pushEnabled: true,
  smsEnabled: false
}
```

### Reminder Types
1. **Early Warning** - Set reminders months/years in advance
2. **Urgent Reminder** - Increasing frequency as expiry approaches
3. **Critical Alert** - Most frequent reminders in final days
4. **Expired Notice** - Immediate notification after expiry

## 🎨 Monetization

### Subscription Tiers
- **Free**: 3 documents, basic reminders
- **Premium**: Unlimited documents, advanced reminders, auto-fill forms
- **Family**: All premium features + 5 family members

## 📱 API Endpoints

### Documents
- `POST /api/documents` - Create encrypted document
- `GET /api/documents` - List user's documents
- `GET /api/documents/[id]` - Get document details
- `PATCH /api/documents/[id]` - Update document
- `DELETE /api/documents/[id]` - Soft delete document

### Reminders
- `GET /api/reminders/config` - Get reminder configuration
- `POST /api/reminders/config` - Update reminder settings

### Health
- `GET /api/health` - System health check

## 🧪 Testing

### Web
```bash
cd idmonitor_web
npm run test
npm run test:e2e
```

### iOS
- Unit tests in Xcode
- UI tests for key flows
- Security validation tests

## 🚢 Deployment

### Web Application
- Deploy to Vercel, Railway, or any Node.js host
- Set environment variables
- Configure Cloudflare R2
- Set up Clerk authentication
- Configure Stripe webhooks

### iOS Application
- Build and archive in Xcode
- Submit to App Store Connect
- Configure push notification certificates
- Enable required capabilities

## 📄 License

Proprietary - All Rights Reserved

## 🤝 Contributing

This is a proprietary project. For security reasons, contributions are restricted to authorized developers only.

## 📞 Support

For support, email support@idmonitor.app

---

**Built with security, privacy, and user control as top priorities.**