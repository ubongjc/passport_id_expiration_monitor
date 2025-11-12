# IDMonitor iOS Application

**100% Secure** Passport & ID Expiration Monitor - Native iOS App

## Security Architecture

### Client-Side Encryption (CryptoKit)
- **All sensitive data encrypted on-device** using AES-GCM 256-bit
- Uses Apple's CryptoKit framework with hardware acceleration
- PBKDF2 key derivation (100,000 iterations) matching web implementation
- Unique salt and IV per document
- Server NEVER sees plaintext document numbers, names, or MRZ data

### Secure Storage
- Sensitive tokens stored in iOS Keychain with `kSecAttrAccessibleAfterFirstUnlock`
- Biometric authentication (Face ID / Touch ID) for app access
- Encrypted document scans before upload to cloud storage

### Authentication
- Passkey/WebAuthn support
- Integration with Clerk authentication
- Secure session management

## Features

### Document Management
- OCR scanning using AVFoundation + Vision framework
- Client-side encryption before API submission
- Automatic expiration tracking
- Document detail views with decryption

### Flexible Reminders
- User-configurable reminder schedules:
  - Early warnings (customizable days before expiry)
  - Urgent period with increasing frequency
  - Critical period with most frequent alerts
- Push notifications via UserNotifications framework
- Multi-channel support (email, push, SMS)

### Security & Privacy
- Zero-knowledge architecture
- Biometric authentication
- Secure keychain storage
- Audit logging

## Tech Stack

- **Language**: Swift 5.9+
- **UI Framework**: SwiftUI
- **Cryptography**: CryptoKit
- **Networking**: URLSession with async/await
- **Authentication**: Keychain + Biometrics (LocalAuthentication)
- **Notifications**: UserNotifications
- **OCR**: Vision + AVFoundation

## Project Structure

```
IDMonitor/
├── App/
│   └── IDMonitorApp.swift          # App entry point
├── Features/
│   ├── Auth/
│   │   ├── AuthenticationManager.swift
│   │   └── AuthenticationView.swift
│   ├── Documents/
│   │   ├── DocumentStore.swift
│   │   └── DocumentsListView.swift
│   ├── Reminders/
│   │   ├── ReminderManager.swift
│   │   └── RemindersView.swift
│   └── Settings/
│       └── SettingsView.swift
├── Core/
│   ├── Networking/
│   │   └── APIClient.swift         # Type-safe API client
│   ├── Crypto/
│   │   └── CryptoManager.swift     # Encryption utilities
│   └── Storage/
│       └── KeychainManager.swift   # Secure storage
├── Models/                         # Data models
└── Utils/                          # Helper functions
```

## Getting Started

### Prerequisites
- Xcode 15.0+
- iOS 17.0+
- Apple Developer account (for testing on device)

### Setup

1. **Open project in Xcode:**
   ```bash
   cd idmonitor_ios
   open IDMonitor.xcodeproj
   ```

2. **Configure API endpoint:**
   Edit `IDMonitor/Core/Networking/APIClient.swift`:
   ```swift
   static let apiBaseURL = "https://your-api.com/api"
   ```

3. **Add capabilities:**
   - Sign in with Apple
   - Push Notifications
   - Keychain Sharing

4. **Run on simulator or device:**
   - Select target device
   - Press Cmd+R to build and run

## Encryption Flow

### Document Creation
1. User scans document or enters data
2. Generate random 16-byte salt and 12-byte IV
3. Derive encryption key from user passphrase via PBKDF2 (100k iterations)
4. Encrypt sensitive fields (number, name, MRZ) using AES-GCM
5. Send only ciphertext + metadata to server
6. Server stores encrypted data

### Document Retrieval
1. Fetch encrypted document from API
2. Derive decryption key from user passphrase
3. Decrypt fields using stored salt and IV
4. Display plaintext to user (never leaves device)

### File Encryption
1. Scan document using camera
2. Encrypt entire image file client-side
3. Upload encrypted file to cloud storage
4. Store only ciphertext on server

## Key Security Features

### CryptoKit Implementation
```swift
// Key derivation
let key = try CryptoManager.shared.deriveKey(
    from: passphrase,
    salt: salt
)

// Encryption
let encrypted = try CryptoManager.shared.encrypt(
    plaintext,
    key: key,
    iv: iv
)

// Decryption
let plaintext = try CryptoManager.shared.decrypt(
    encrypted,
    key: key,
    iv: iv
)
```

### Keychain Storage
- Auth tokens stored securely
- Biometric protection available
- Data only accessible after first unlock

### Biometric Authentication
```swift
let success = await authManager.authenticateWithBiometrics()
if success {
    // Access granted
}
```

## API Integration

The iOS app communicates with the IDMonitor backend API:

- `POST /api/documents` - Create encrypted document
- `GET /api/documents` - List documents
- `GET /api/documents/:id` - Get document details
- `PATCH /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document
- `GET /api/reminders/config` - Get reminder config
- `POST /api/reminders/config` - Update reminders

All API calls include:
- Bearer token authentication
- Encrypted request/response bodies
- HTTPS only
- Certificate pinning (production)

## Building for Production

1. **Update configuration:**
   - Set production API URL
   - Configure Sentry DSN
   - Enable certificate pinning

2. **Code signing:**
   - Configure provisioning profiles
   - Set up push notification certificates
   - Enable required capabilities

3. **Build:**
   ```bash
   xcodebuild -scheme IDMonitor -configuration Release
   ```

4. **Submit to App Store:**
   - Archive app
   - Upload via Xcode or Transporter
   - Submit for review

## Testing

### Unit Tests
- Encryption/decryption tests
- Key derivation tests
- API client tests

### UI Tests
- Authentication flow
- Document creation/viewing
- Reminder configuration

### Security Tests
- Encryption strength validation
- Keychain security
- API security

## Compliance

- **GDPR**: Data export and deletion
- **CCPA**: Privacy controls
- **SOC 2**: Audit logging
- **HIPAA-ready**: Full encryption at rest and in transit

## License

Proprietary
