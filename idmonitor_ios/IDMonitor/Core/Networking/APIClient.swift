import Foundation

/**
 * API Client - Networking Layer
 *
 * Communicates with IDMonitor backend API
 * - Handles authentication tokens
 * - Manages requests/responses
 * - Type-safe API endpoints
 */

enum APIError: Error, LocalizedError {
    case invalidURL
    case requestFailed(Error)
    case invalidResponse
    case unauthorized
    case serverError(Int)
    case decodingFailed(Error)
    case networkUnavailable

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "Invalid API URL"
        case .requestFailed(let error): return "Request failed: \(error.localizedDescription)"
        case .invalidResponse: return "Invalid server response"
        case .unauthorized: return "Unauthorized - please sign in"
        case .serverError(let code): return "Server error (\(code))"
        case .decodingFailed(let error): return "Failed to parse response: \(error.localizedDescription)"
        case .networkUnavailable: return "Network unavailable"
        }
    }
}

class APIClient {
    static let shared = APIClient()

    private var baseURL: URL?
    private var authToken: String?

    private let session: URLSession = {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 60
        return URLSession(configuration: config)
    }()

    private init() {}

    // MARK: - Configuration

    func configure(baseURL: String) {
        self.baseURL = URL(string: baseURL)
    }

    func setAuthToken(_ token: String?) {
        self.authToken = token
    }

    // MARK: - Request Methods

    func get<T: Decodable>(
        _ endpoint: String,
        queryItems: [URLQueryItem]? = nil
    ) async throws -> T {
        try await request(endpoint, method: "GET", queryItems: queryItems)
    }

    func post<T: Decodable, Body: Encodable>(
        _ endpoint: String,
        body: Body
    ) async throws -> T {
        try await request(endpoint, method: "POST", body: body)
    }

    func patch<T: Decodable, Body: Encodable>(
        _ endpoint: String,
        body: Body
    ) async throws -> T {
        try await request(endpoint, method: "PATCH", body: body)
    }

    func delete<T: Decodable>(
        _ endpoint: String
    ) async throws -> T {
        try await request(endpoint, method: "DELETE")
    }

    // MARK: - Generic Request

    private func request<T: Decodable>(
        _ endpoint: String,
        method: String,
        queryItems: [URLQueryItem]? = nil,
        body: Encodable? = nil
    ) async throws -> T {
        guard let baseURL = baseURL else {
            throw APIError.invalidURL
        }

        var urlComponents = URLComponents(url: baseURL.appendingPathComponent(endpoint), resolvingAgainstBaseURL: true)
        urlComponents?.queryItems = queryItems

        guard let url = urlComponents?.url else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        // Add auth token if available
        if let token = authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        // Add body if present
        if let body = body {
            request.httpBody = try JSONEncoder().encode(body)
        }

        // Execute request
        let (data, response) = try await session.data(for: request)

        // Validate response
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        switch httpResponse.statusCode {
        case 200...299:
            break
        case 401:
            throw APIError.unauthorized
        case 400...499, 500...599:
            throw APIError.serverError(httpResponse.statusCode)
        default:
            throw APIError.invalidResponse
        }

        // Decode response
        do {
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            return try decoder.decode(T.self, from: data)
        } catch {
            throw APIError.decodingFailed(error)
        }
    }
}

// MARK: - Configuration

struct Configuration {
    static let apiBaseURL: String = {
        #if DEBUG
        return "http://localhost:3000/api"
        #else
        return "https://api.idmonitor.app/api"
        #endif
    }()
}

// MARK: - API Models

struct HealthResponse: Codable {
    let status: String
    let timestamp: String
    let services: Services

    struct Services: Codable {
        let database: String
        let api: String
    }
}

struct DocumentResponse: Codable {
    let id: String
    let kind: String
    let country: String
    let issuedAt: Date?
    let expiresAt: Date
    let renewalStatus: String
    let createdAt: Date
    let updatedAt: Date

    // Encrypted fields (only in detail view)
    let encryptedNumber: String?
    let encryptedHolderName: String?
    let encryptedMRZData: String?
    let encryptionIV: String?
    let encryptionSalt: String?
}

struct DocumentListResponse: Codable {
    let documents: [DocumentResponse]
}

struct DocumentDetailResponse: Codable {
    let document: DocumentResponse
}

struct CreateDocumentRequest: Codable {
    let kind: String
    let country: String
    let issuedAt: String?
    let expiresAt: String
    let encryptedNumber: String
    let encryptedHolderName: String
    let encryptedMRZData: String?
    let encryptionIV: String
    let encryptionSalt: String
    let scanStorageKey: String?
}

struct ReminderConfigResponse: Codable {
    let config: ReminderConfig

    struct ReminderConfig: Codable {
        let id: String?
        let documentKind: String?
        let earlyReminderDays: [Int]
        let urgentPeriodDays: Int
        let urgentFrequency: String
        let criticalPeriodDays: Int
        let criticalFrequency: String
        let emailEnabled: Bool
        let pushEnabled: Bool
        let smsEnabled: Bool
    }
}

struct UpdateReminderConfigRequest: Codable {
    let documentKind: String?
    let earlyReminderDays: [Int]?
    let urgentPeriodDays: Int?
    let urgentFrequency: String?
    let criticalPeriodDays: Int?
    let criticalFrequency: String?
    let emailEnabled: Bool?
    let pushEnabled: Bool?
    let smsEnabled: Bool?
}
