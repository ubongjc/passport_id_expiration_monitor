/**
 * Client-Side Encryption Utilities
 *
 * SECURITY ARCHITECTURE:
 * - All sensitive data is encrypted on the client before sending to server
 * - Server NEVER sees plaintext documents, PII, or MRZ data
 * - Uses Web Crypto API (AES-GCM 256-bit)
 * - User's passkey/password derives encryption key via PBKDF2
 * - Each document has unique salt and IV
 */

/**
 * Generate a cryptographically secure random salt
 */
export function generateSalt(): string {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return arrayBufferToBase64(salt);
}

/**
 * Generate a cryptographically secure random IV
 */
export function generateIV(): string {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // GCM uses 12 bytes
  return arrayBufferToBase64(iv);
}

/**
 * Derive encryption key from user passphrase using PBKDF2
 *
 * @param passphrase User's password/passkey
 * @param salt Unique salt (base64)
 * @param iterations PBKDF2 iterations (default: 100,000)
 */
export async function deriveKey(
  passphrase: string,
  salt: string,
  iterations: number = 100000
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passphraseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const saltBuffer = base64ToArrayBuffer(salt);

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: iterations,
      hash: 'SHA-256',
    },
    passphraseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data using AES-GCM
 *
 * @param plaintext Data to encrypt
 * @param key Encryption key
 * @param iv Initialization vector (base64)
 * @returns Encrypted data (base64)
 */
export async function encrypt(
  plaintext: string,
  key: CryptoKey,
  iv: string
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  const ivBuffer = base64ToArrayBuffer(iv);

  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer,
    },
    key,
    data
  );

  return arrayBufferToBase64(new Uint8Array(encrypted));
}

/**
 * Decrypt data using AES-GCM
 *
 * @param ciphertext Encrypted data (base64)
 * @param key Decryption key
 * @param iv Initialization vector (base64)
 * @returns Decrypted plaintext
 */
export async function decrypt(
  ciphertext: string,
  key: CryptoKey,
  iv: string
): Promise<string> {
  const data = base64ToArrayBuffer(ciphertext);
  const ivBuffer = base64ToArrayBuffer(iv);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer,
    },
    key,
    data
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * Encrypt a document object
 * Returns encrypted fields with metadata
 */
export async function encryptDocument(
  data: {
    number: string;
    holderName: string;
    mrzData?: string;
  },
  passphrase: string
): Promise<{
  encryptedNumber: string;
  encryptedHolderName: string;
  encryptedMRZData?: string;
  encryptionSalt: string;
  encryptionIV: string;
}> {
  const salt = generateSalt();
  const iv = generateIV();
  const key = await deriveKey(passphrase, salt);

  const encryptedNumber = await encrypt(data.number, key, iv);
  const encryptedHolderName = await encrypt(data.holderName, key, iv);
  const encryptedMRZData = data.mrzData
    ? await encrypt(data.mrzData, key, iv)
    : undefined;

  return {
    encryptedNumber,
    encryptedHolderName,
    encryptedMRZData,
    encryptionSalt: salt,
    encryptionIV: iv,
  };
}

/**
 * Decrypt a document object
 */
export async function decryptDocument(
  encrypted: {
    encryptedNumber: string;
    encryptedHolderName: string;
    encryptedMRZData?: string;
    encryptionSalt: string;
    encryptionIV: string;
  },
  passphrase: string
): Promise<{
  number: string;
  holderName: string;
  mrzData?: string;
}> {
  const key = await deriveKey(passphrase, encrypted.encryptionSalt);

  const number = await decrypt(
    encrypted.encryptedNumber,
    key,
    encrypted.encryptionIV
  );
  const holderName = await decrypt(
    encrypted.encryptedHolderName,
    key,
    encrypted.encryptionIV
  );
  const mrzData = encrypted.encryptedMRZData
    ? await decrypt(encrypted.encryptedMRZData, key, encrypted.encryptionIV)
    : undefined;

  return { number, holderName, mrzData };
}

/**
 * Encrypt a file (for document scans)
 * Returns encrypted ArrayBuffer
 */
export async function encryptFile(
  file: File,
  passphrase: string,
  salt: string,
  iv: string
): Promise<ArrayBuffer> {
  const key = await deriveKey(passphrase, salt);
  const fileBuffer = await file.arrayBuffer();
  const ivBuffer = base64ToArrayBuffer(iv);

  return crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer,
    },
    key,
    fileBuffer
  );
}

/**
 * Decrypt a file
 */
export async function decryptFile(
  encryptedBuffer: ArrayBuffer,
  passphrase: string,
  salt: string,
  iv: string
): Promise<ArrayBuffer> {
  const key = await deriveKey(passphrase, salt);
  const ivBuffer = base64ToArrayBuffer(iv);

  return crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer,
    },
    key,
    encryptedBuffer
  );
}

// Helper functions
function arrayBufferToBase64(buffer: Uint8Array): string {
  const binary = String.fromCharCode(...buffer);
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Hash a string using SHA-256
 * Useful for API key hashing, fingerprinting, etc.
 */
export async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return arrayBufferToBase64(new Uint8Array(hash));
}

/**
 * Securely compare two strings in constant time
 * Prevents timing attacks
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
