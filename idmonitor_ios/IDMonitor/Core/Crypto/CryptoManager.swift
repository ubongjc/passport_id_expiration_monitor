import Foundation
import CryptoKit

/**
 * CryptoManager - Client-Side Encryption Utilities
 *
 * SECURITY ARCHITECTURE:
 * - AES-GCM 256-bit encryption (matches web implementation)
 * - PBKDF2 key derivation (100,000 iterations)
 * - Unique salt and IV per document
 * - Server NEVER sees plaintext data
 *
 * Uses Apple's CryptoKit for hardware-accelerated cryptography
 */

enum CryptoError: Error, LocalizedError {
    case keyDerivationFailed
    case encryptionFailed
    case decryptionFailed
    case invalidData
    case invalidBase64

    var errorDescription: String? {
        switch self {
        case .keyDerivationFailed: return "Failed to derive encryption key"
        case .encryptionFailed: return "Failed to encrypt data"
        case .decryptionFailed: return "Failed to decrypt data"
        case .invalidData: return "Invalid data format"
        case .invalidBase64: return "Invalid Base64 encoding"
        }
    }
}

class CryptoManager {
    static let shared = CryptoManager()

    // PBKDF2 iterations (must match web: 100,000)
    private let keyDerivationIterations = 100_000

    private init() {}

    // MARK: - Key Generation

    /// Generate cryptographically secure random salt (16 bytes)
    func generateSalt() -> Data {
        var bytes = [UInt8](repeating: 0, count: 16)
        _ = SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes)
        return Data(bytes)
    }

    /// Generate cryptographically secure random IV for AES-GCM (12 bytes)
    func generateIV() -> Data {
        var bytes = [UInt8](repeating: 0, count: 12)
        _ = SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes)
        return Data(bytes)
    }

    // MARK: - Key Derivation

    /// Derive encryption key from passphrase using PBKDF2
    /// - Parameters:
    ///   - passphrase: User's password/passkey
    ///   - salt: Unique salt (16 bytes)
    ///   - iterations: PBKDF2 iterations (default: 100,000)
    /// - Returns: Symmetric encryption key
    func deriveKey(
        from passphrase: String,
        salt: Data,
        iterations: Int? = nil
    ) throws -> SymmetricKey {
        guard let passphraseData = passphrase.data(using: .utf8) else {
            throw CryptoError.invalidData
        }

        let rounds = iterations ?? keyDerivationIterations

        // Derive 256-bit key using PBKDF2 with SHA-256
        let derivedKey = try CryptoKit.PBKDF2.deriveKey(
            from: passphraseData,
            salt: salt,
            using: CryptoKit.HMAC<SHA256>.self,
            outputByteCount: 32, // 256 bits
            rounds: rounds
        )

        return derivedKey
    }

    // MARK: - Encryption

    /// Encrypt data using AES-GCM
    /// - Parameters:
    ///   - data: Plaintext data
    ///   - key: Symmetric encryption key
    ///   - iv: Initialization vector (12 bytes for GCM)
    /// - Returns: Encrypted data (ciphertext + authentication tag)
    func encrypt(
        _ data: Data,
        key: SymmetricKey,
        iv: Data
    ) throws -> Data {
        let nonce = try AES.GCM.Nonce(data: iv)

        let sealedBox = try AES.GCM.seal(
            data,
            using: key,
            nonce: nonce
        )

        // Combined format: ciphertext + tag
        return sealedBox.combined ?? Data()
    }

    /// Encrypt string using AES-GCM
    func encrypt(
        _ string: String,
        key: SymmetricKey,
        iv: Data
    ) throws -> Data {
        guard let data = string.data(using: .utf8) else {
            throw CryptoError.invalidData
        }

        return try encrypt(data, key: key, iv: iv)
    }

    // MARK: - Decryption

    /// Decrypt data using AES-GCM
    /// - Parameters:
    ///   - data: Encrypted data (ciphertext + tag)
    ///   - key: Symmetric decryption key
    ///   - iv: Initialization vector
    /// - Returns: Decrypted plaintext
    func decrypt(
        _ data: Data,
        key: SymmetricKey,
        iv: Data
    ) throws -> Data {
        let nonce = try AES.GCM.Nonce(data: iv)

        let sealedBox = try AES.GCM.SealedBox(
            nonce: nonce,
            ciphertext: data.dropLast(16), // Remove tag
            tag: data.suffix(16) // Last 16 bytes are the tag
        )

        return try AES.GCM.open(sealedBox, using: key)
    }

    /// Decrypt data to string
    func decryptToString(
        _ data: Data,
        key: SymmetricKey,
        iv: Data
    ) throws -> String {
        let decryptedData = try decrypt(data, key: key, iv: iv)

        guard let string = String(data: decryptedData, encoding: .utf8) else {
            throw CryptoError.invalidData
        }

        return string
    }

    // MARK: - Document Encryption

    /// Encrypt document data (high-level API)
    func encryptDocument(
        number: String,
        holderName: String,
        mrzData: String?,
        passphrase: String
    ) throws -> EncryptedDocument {
        let salt = generateSalt()
        let iv = generateIV()
        let key = try deriveKey(from: passphrase, salt: salt)

        let encryptedNumber = try encrypt(number, key: key, iv: iv)
        let encryptedHolderName = try encrypt(holderName, key: key, iv: iv)
        let encryptedMRZData = try mrzData.map { try encrypt($0, key: key, iv: iv) }

        return EncryptedDocument(
            encryptedNumber: encryptedNumber.base64EncodedString(),
            encryptedHolderName: encryptedHolderName.base64EncodedString(),
            encryptedMRZData: encryptedMRZData?.base64EncodedString(),
            encryptionSalt: salt.base64EncodedString(),
            encryptionIV: iv.base64EncodedString()
        )
    }

    /// Decrypt document data (high-level API)
    func decryptDocument(
        _ encrypted: EncryptedDocument,
        passphrase: String
    ) throws -> DecryptedDocument {
        guard let salt = Data(base64Encoded: encrypted.encryptionSalt),
              let iv = Data(base64Encoded: encrypted.encryptionIV),
              let encryptedNumber = Data(base64Encoded: encrypted.encryptedNumber),
              let encryptedHolderName = Data(base64Encoded: encrypted.encryptedHolderName)
        else {
            throw CryptoError.invalidBase64
        }

        let key = try deriveKey(from: passphrase, salt: salt)

        let number = try decryptToString(encryptedNumber, key: key, iv: iv)
        let holderName = try decryptToString(encryptedHolderName, key: key, iv: iv)

        var mrzData: String?
        if let encMRZ = encrypted.encryptedMRZData,
           let encMRZData = Data(base64Encoded: encMRZ) {
            mrzData = try decryptToString(encMRZData, key: key, iv: iv)
        }

        return DecryptedDocument(
            number: number,
            holderName: holderName,
            mrzData: mrzData
        )
    }

    // MARK: - File Encryption

    /// Encrypt file data (for document scans)
    func encryptFile(
        _ fileData: Data,
        passphrase: String,
        salt: Data,
        iv: Data
    ) throws -> Data {
        let key = try deriveKey(from: passphrase, salt: salt)
        return try encrypt(fileData, key: key, iv: iv)
    }

    /// Decrypt file data
    func decryptFile(
        _ encryptedData: Data,
        passphrase: String,
        salt: Data,
        iv: Data
    ) throws -> Data {
        let key = try deriveKey(from: passphrase, salt: salt)
        return try decrypt(encryptedData, key: key, iv: iv)
    }

    // MARK: - Hashing

    /// Hash string using SHA-256
    func sha256(_ string: String) -> String {
        guard let data = string.data(using: .utf8) else { return "" }
        let hash = SHA256.hash(data: data)
        return hash.compactMap { String(format: "%02x", $0) }.joined()
    }
}

// MARK: - Supporting Types

struct EncryptedDocument {
    let encryptedNumber: String
    let encryptedHolderName: String
    let encryptedMRZData: String?
    let encryptionSalt: String
    let encryptionIV: String
}

struct DecryptedDocument {
    let number: String
    let holderName: String
    let mrzData: String?
}

// MARK: - PBKDF2 Extension

extension CryptoKit.PBKDF2 {
    static func deriveKey<H: HashFunction>(
        from password: Data,
        salt: Data,
        using hashFunction: H.Type,
        outputByteCount: Int,
        rounds: Int
    ) throws -> SymmetricKey {
        // Use CommonCrypto for PBKDF2 (CryptoKit doesn't expose it directly)
        var derivedKeyData = Data(count: outputByteCount)

        let result = derivedKeyData.withUnsafeMutableBytes { derivedKeyBytes in
            salt.withUnsafeBytes { saltBytes in
                password.withUnsafeBytes { passwordBytes in
                    CCKeyDerivationPBKDF(
                        CCPBKDFAlgorithm(kCCPBKDF2),
                        passwordBytes.baseAddress?.assumingMemoryBound(to: Int8.self),
                        password.count,
                        saltBytes.baseAddress?.assumingMemoryBound(to: UInt8.self),
                        salt.count,
                        CCPseudoRandomAlgorithm(kCCPRFHmacAlgSHA256),
                        UInt32(rounds),
                        derivedKeyBytes.baseAddress?.assumingMemoryBound(to: UInt8.self),
                        outputByteCount
                    )
                }
            }
        }

        guard result == kCCSuccess else {
            throw CryptoError.keyDerivationFailed
        }

        return SymmetricKey(data: derivedKeyData)
    }
}
