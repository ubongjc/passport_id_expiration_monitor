# IDMonitor - Security & Compliance Documentation

**Last Updated:** 2025-11-12
**Security Level:** Enterprise-Grade
**Compliance:** GDPR, CCPA, SOC 2, HIPAA-Ready

---

## 🔒 Security Architecture Overview

IDMonitor follows a **zero-knowledge architecture** where all sensitive data is encrypted client-side before transmission. The server never has access to plaintext user data.

### Core Security Principles

1. **Zero-Knowledge Encryption**: Server cannot decrypt user data
2. **Defense in Depth**: Multiple layers of security controls
3. **Least Privilege**: Minimal access rights by default
4. **Security by Design**: Security built-in from the ground up
5. **Compliance First**: GDPR, CCPA, SOC 2 compliant

---

## 🛡️ Encryption Implementation

### Client-Side Encryption

**Algorithm**: AES-GCM 256-bit
**Key Derivation**: PBKDF2 with SHA-256
**Iterations**: 100,000 (exceeds NIST recommendations)
**Salt**: 16 bytes (128-bit) per document
**IV**: 12 bytes (96-bit) per document

```typescript
// Encryption Flow
1. User enters sensitive data (document number, name, etc.)
2. Generate cryptographically secure random salt (16 bytes)
3. Generate cryptographically secure random IV (12 bytes)
4. Derive encryption key using PBKDF2:
   - Password: User's passphrase
   - Salt: Document-specific salt
   - Iterations: 100,000
   - Hash: SHA-256
   - Output: 256-bit key
5. Encrypt data using AES-GCM:
   - Algorithm: AES-256-GCM
   - Key: Derived key
   - IV: Random IV
   - Authentication: Built-in AEAD
6. Send ciphertext + salt + IV to server
7. Server stores encrypted data (cannot decrypt)
```

### What is Encrypted

**Always Encrypted (Client-Side)**:
- Document numbers
- Holder names
- Date of birth
- MRZ data
- Profile information
- Document scans (files)

**Never Encrypted (Metadata)**:
- Document type (PASSPORT, ID, etc.)
- Country code
- Expiration date
- Issue date
- Creation date

### File Encryption

Document scans are encrypted before upload:
1. User selects/captures image
2. Image converted to ArrayBuffer
3. Encrypted using AES-GCM with user's key
4. Encrypted file uploaded to Cloudflare R2
5. Server stores reference to encrypted file

---

## 🔐 Authentication & Authorization

### Passkey/WebAuthn (Primary)

**Implementation**: Clerk.com with passkey support
**Standard**: FIDO2/WebAuthn
**Security**:
- Public key cryptography
- Phishing-resistant
- No password transmission
- Hardware-backed on supported devices

### Magic Links (Fallback)

**Implementation**: Clerk.com magic links
**Security**:
- Time-limited tokens (10 minutes)
- One-time use only
- Secure random generation
- HTTPS-only delivery

### Biometric Authentication (iOS)

**Implementation**: LocalAuthentication framework
**Supported**:
- Face ID
- Touch ID
**Storage**: Keychain with biometric protection

### Session Management

**Token Storage**:
- Web: Secure HTTP-only cookies
- iOS: Keychain with kSecAttrAccessibleAfterFirstUnlock

**Session Duration**:
- Active: 24 hours
- Refresh: 30 days
- Absolute: 90 days

**Session Security**:
- Automatic rotation on security-sensitive operations
- Logout on suspicious activity
- Device fingerprinting
- IP geolocation checks

---

## 🌐 Network Security

### HTTPS Only

**Enforcement**:
- Strict-Transport-Security header (HSTS)
- Max-Age: 31536000 (1 year)
- includeSubDomains
- preload

### Security Headers

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';
```

### Certificate Pinning (Production)

**iOS App**:
- SSL certificate pinning enabled
- Public key pinning
- Prevents MITM attacks

---

## 🔍 Input Validation & Sanitization

### Server-Side Validation

**Framework**: Zod (TypeScript schema validation)
**Validation**:
- Type checking
- Length limits
- Format validation
- Range checking
- Whitelist validation

```typescript
const createDocumentSchema = z.object({
  kind: z.enum(['PASSPORT', 'NATIONAL_ID', 'DRIVERS_LICENSE', 'RESIDENCE_PERMIT', 'VISA']),
  country: z.string().length(2).regex(/^[A-Z]{2}$/),
  expiresAt: z.string().datetime(),
  encryptedNumber: z.string().min(1).max(10000),
  // ... more validation
});
```

### XSS Protection

**Measures**:
- React automatic escaping
- Content-Security-Policy headers
- Input sanitization
- Output encoding
- No dangerouslySetInnerHTML usage

### SQL Injection Protection

**Measures**:
- Prisma ORM (parameterized queries)
- No raw SQL queries
- Input validation
- Type safety

### CSRF Protection

**Web**:
- SameSite cookies
- CSRF tokens on state-changing operations
- Origin validation

---

## 🚦 Rate Limiting & DDoS Protection

### Rate Limits

**Per IP**:
- Authentication: 5 attempts / 15 minutes
- API calls: 100 requests / minute
- Document creation: 10 requests / minute
- File upload: 5 requests / minute

**Per User**:
- Document creation: 50 documents / day (free tier)
- API calls: 1000 requests / hour

**Implementation**:
- Redis-based (production)
- Database fallback (development)
- Sliding window algorithm

### DDoS Protection

**Cloudflare**:
- WAF rules
- Bot management
- Challenge pages
- IP reputation filtering

---

## 📊 Audit Logging

### What is Logged

**Security Events**:
- User signup/signin
- Failed login attempts
- Password/passphrase changes
- 2FA enable/disable
- Device additions/removals
- API key creation/deletion

**Data Events**:
- Document creation/viewing/editing/deletion
- Reminder configuration changes
- Profile updates
- Subscription changes
- Export/import operations

**Log Format**:
```json
{
  "id": "log_123",
  "userId": "user_456",
  "action": "DOCUMENT_VIEWED",
  "resource": "IdentityDocument:doc_789",
  "timestamp": "2025-11-12T10:30:00Z",
  "ipAddress": "203.0.113.42",
  "userAgent": "Mozilla/5.0...",
  "metadata": {
    "documentType": "PASSPORT",
    "country": "US"
  }
}
```

### Log Retention

- Security logs: 1 year
- Data access logs: 90 days
- Error logs: 30 days

### Log Protection

- Append-only storage
- Encrypted at rest
- Access restricted to admins
- Tamper detection

---

## 🔑 Key Management

### Master Keys

**Server-Side** (for system operations):
- Stored in environment variables
- Never committed to git
- Rotated quarterly
- Hardware Security Module (HSM) in production

**User Keys** (for data encryption):
- Derived from user passphrase
- Never stored on server
- Never transmitted in plaintext
- Re-derived on each use

### Key Rotation

**System Keys**: Quarterly rotation
**User Keys**: On passphrase change
**API Keys**: Annual expiration

---

## 🛡️ Data Protection

### Data at Rest

**Database**:
- Encrypted using PostgreSQL TDE
- AES-256 encryption
- Encrypted backups

**File Storage (R2)**:
- Files already encrypted client-side
- Additional server-side encryption
- Versioning enabled
- Object lock for compliance

### Data in Transit

**TLS 1.3**:
- Minimum TLS 1.2
- Strong cipher suites only
- Perfect forward secrecy
- HSTS enforced

### Data Backups

**Frequency**: Daily (automated)
**Retention**: 30 days
**Encryption**: AES-256
**Storage**: Geographically distributed
**Testing**: Monthly restore tests

---

## 👥 Privacy & Compliance

### GDPR Compliance

**Right to Access**: ✅ Export data feature
**Right to Erasure**: ✅ Delete account feature
**Right to Rectification**: ✅ Edit profile/documents
**Right to Portability**: ✅ JSON export
**Data Minimization**: ✅ Only necessary data collected
**Privacy by Design**: ✅ Built-in from start
**DPO Contact**: privacy@idmonitor.app

### CCPA Compliance

**Right to Know**: ✅ Disclosure of data collected
**Right to Delete**: ✅ Account deletion
**Right to Opt-Out**: ✅ Analytics opt-out
**Non-Discrimination**: ✅ No price difference

### SOC 2 Type II

**Control Objectives**:
- Security ✅
- Availability ✅
- Processing Integrity ✅
- Confidentiality ✅
- Privacy ✅

### HIPAA Ready

**Technical Safeguards**: ✅
**Administrative Safeguards**: ✅
**Physical Safeguards**: ✅
**BAA Available**: Upon request

---

## 🚨 Incident Response

### Security Incident Procedure

1. **Detection**: Automated monitoring + manual reporting
2. **Containment**: Isolate affected systems
3. **Investigation**: Root cause analysis
4. **Eradication**: Remove threat
5. **Recovery**: Restore services
6. **Lessons Learned**: Post-mortem report

### Breach Notification

**Timeline**:
- Internal notification: Immediate
- User notification: Within 72 hours
- Regulatory notification: As required by law

**Contact**: security@idmonitor.app

---

## 🔬 Security Testing

### Automated Testing

**Static Analysis**:
- ESLint security rules
- SonarQube
- npm audit
- Snyk

**Dynamic Analysis**:
- OWASP ZAP
- Burp Suite
- Penetration testing (quarterly)

### Manual Testing

- Code review (all PRs)
- Security review (major features)
- Penetration testing (annual)
- Red team exercises (annual)

---

## 📋 Security Checklist

### Before Deployment

- [ ] All secrets in environment variables (never hardcoded)
- [ ] HTTPS enforced everywhere
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Authentication on protected routes
- [ ] Audit logging enabled
- [ ] Error messages don't leak sensitive info
- [ ] Dependencies updated and audited
- [ ] Backup and restore tested
- [ ] Monitoring and alerting configured
- [ ] Incident response plan documented
- [ ] Security training completed

---

## 📞 Security Contacts

**Security Issues**: security@idmonitor.app
**Privacy Questions**: privacy@idmonitor.app
**Bug Bounty**: https://idmonitor.app/security/bug-bounty

**PGP Key**: Available at https://idmonitor.app/.well-known/pgp-key.asc

---

## 📚 References

**Standards**:
- OWASP Top 10 2021
- NIST Cybersecurity Framework
- CIS Controls v8
- ISO/IEC 27001:2013

**Encryption**:
- NIST SP 800-38D (GCM Mode)
- NIST SP 800-132 (PBKDF2)
- FIPS 140-2

**Authentication**:
- FIDO2/WebAuthn Spec
- NIST SP 800-63B (Digital Identity Guidelines)

---

**This document is reviewed quarterly and updated as needed.**
**Last Security Audit:** 2025-11-12
**Next Security Audit:** 2026-02-12
