import Foundation
import SwiftUI
import LocalAuthentication

/**
 * Authentication Manager
 *
 * Handles user authentication:
 * - Passkey/WebAuthn authentication
 * - Biometric authentication (Face ID / Touch ID)
 * - Secure token storage in Keychain
 */

@MainActor
class AuthenticationManager: ObservableObject {
    static let shared = AuthenticationManager()

    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var isLoading = false
    @Published var error: String?

    private let keychainService = "app.idmonitor.ios"
    private let tokenKey = "auth_token"

    private init() {}

    // MARK: - Session Management

    func restoreSession() async {
        guard let token = getTokenFromKeychain() else {
            isAuthenticated = false
            return
        }

        APIClient.shared.setAuthToken(token)

        // Validate token by fetching user data
        // TODO: Implement user profile endpoint
        isAuthenticated = true
    }

    func signIn(email: String, password: String) async {
        isLoading = true
        error = nil

        defer { isLoading = false }

        do {
            // TODO: Implement sign-in API call
            // For now, using placeholder

            let token = "placeholder_token"
            saveTokenToKeychain(token)
            APIClient.shared.setAuthToken(token)

            isAuthenticated = true

        } catch {
            self.error = error.localizedDescription
        }
    }

    func signUp(email: String, password: String) async {
        isLoading = true
        error = nil

        defer { isLoading = false }

        do {
            // TODO: Implement sign-up API call
            // For now, using placeholder

            let token = "placeholder_token"
            saveTokenToKeychain(token)
            APIClient.shared.setAuthToken(token)

            isAuthenticated = true

        } catch {
            self.error = error.localizedDescription
        }
    }

    func signOut() {
        deleteTokenFromKeychain()
        APIClient.shared.setAuthToken(nil)
        isAuthenticated = false
        currentUser = nil
    }

    // MARK: - Biometric Authentication

    func authenticateWithBiometrics() async -> Bool {
        let context = LAContext()
        var error: NSError?

        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            return false
        }

        do {
            return try await context.evaluatePolicy(
                .deviceOwnerAuthenticationWithBiometrics,
                localizedReason: "Authenticate to access your documents"
            )
        } catch {
            return false
        }
    }

    // MARK: - Keychain Storage

    private func saveTokenToKeychain(_ token: String) {
        let data = token.data(using: .utf8)!

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: tokenKey,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock
        ]

        // Delete existing item
        SecItemDelete(query as CFDictionary)

        // Add new item
        SecItemAdd(query as CFDictionary, nil)
    }

    private func getTokenFromKeychain() -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: tokenKey,
            kSecReturnData as String: true
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess,
              let data = result as? Data,
              let token = String(data: data, encoding: .utf8)
        else {
            return nil
        }

        return token
    }

    private func deleteTokenFromKeychain() {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: tokenKey
        ]

        SecItemDelete(query as CFDictionary)
    }
}

// MARK: - User Model

struct User: Codable {
    let id: String
    let email: String
    let createdAt: Date
    let subscriptionTier: String
}
