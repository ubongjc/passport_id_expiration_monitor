import Foundation
import SwiftUI

/**
 * Document Store
 * Manages identity documents with client-side encryption
 */

@MainActor
class DocumentStore: ObservableObject {
    static let shared = DocumentStore()

    @Published var documents: [IdentityDocument] = []
    @Published var isLoading = false
    @Published var error: String?

    private let crypto = CryptoManager.shared
    private let api = APIClient.shared

    private init() {}

    // MARK: - CRUD Operations

    func loadDocuments() async {
        isLoading = true
        error = nil

        defer { isLoading = false }

        do {
            let response: DocumentListResponse = try await api.get("/documents")

            documents = response.documents.map { dto in
                IdentityDocument(
                    id: dto.id,
                    kind: dto.kind,
                    country: dto.country,
                    issuedAt: dto.issuedAt,
                    expiresAt: dto.expiresAt,
                    renewalStatus: dto.renewalStatus
                )
            }

        } catch {
            self.error = error.localizedDescription
        }
    }

    func createDocument(
        kind: String,
        country: String,
        number: String,
        holderName: String,
        mrzData: String?,
        issuedAt: Date?,
        expiresAt: Date,
        passphrase: String
    ) async throws {
        isLoading = true
        error = nil

        defer { isLoading = false }

        do {
            // Encrypt sensitive data client-side
            let encrypted = try crypto.encryptDocument(
                number: number,
                holderName: holderName,
                mrzData: mrzData,
                passphrase: passphrase
            )

            let request = CreateDocumentRequest(
                kind: kind,
                country: country,
                issuedAt: issuedAt?.iso8601String,
                expiresAt: expiresAt.iso8601String,
                encryptedNumber: encrypted.encryptedNumber,
                encryptedHolderName: encrypted.encryptedHolderName,
                encryptedMRZData: encrypted.encryptedMRZData,
                encryptionIV: encrypted.encryptionIV,
                encryptionSalt: encrypted.encryptionSalt,
                scanStorageKey: nil
            )

            let _: DocumentResponse = try await api.post("/documents", body: request)

            // Reload documents
            await loadDocuments()

        } catch {
            self.error = error.localizedDescription
            throw error
        }
    }
}

// MARK: - Models

struct IdentityDocument: Identifiable {
    let id: String
    let kind: String
    let country: String
    let issuedAt: Date?
    let expiresAt: Date
    let renewalStatus: String

    var daysUntilExpiry: Int {
        Calendar.current.dateComponents([.day], from: Date(), to: expiresAt).day ?? 0
    }

    var isExpired: Bool {
        expiresAt < Date()
    }

    var isExpiringSoon: Bool {
        daysUntilExpiry <= 90 && !isExpired
    }
}

// MARK: - Date Extensions

extension Date {
    var iso8601String: String {
        ISO8601DateFormatter().string(from: self)
    }
}
