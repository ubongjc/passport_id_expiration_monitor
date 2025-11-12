import Foundation
import UserNotifications

/**
 * Reminder Manager
 * Handles reminder configuration and push notifications
 */

@MainActor
class ReminderManager: ObservableObject {
    static let shared = ReminderManager()

    @Published var hasNotificationPermission = false
    @Published var reminderConfig: ReminderConfig?
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIClient.shared

    private init() {}

    // MARK: - Notification Permissions

    func requestNotificationPermissions() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, _ in
            DispatchQueue.main.async {
                self.hasNotificationPermission = granted
            }
        }
    }

    func checkNotificationPermissions() async {
        let settings = await UNUserNotificationCenter.current().notificationSettings()
        hasNotificationPermission = settings.authorizationStatus == .authorized
    }

    // MARK: - Reminder Configuration

    func loadReminderConfig(documentKind: String? = nil) async {
        isLoading = true
        error = nil

        defer { isLoading = false }

        do {
            var queryItems: [URLQueryItem]? = nil
            if let kind = documentKind {
                queryItems = [URLQueryItem(name: "documentKind", value: kind)]
            }

            let response: ReminderConfigResponse = try await api.get(
                "/reminders/config",
                queryItems: queryItems
            )

            reminderConfig = ReminderConfig(from: response.config)

        } catch {
            self.error = error.localizedDescription
        }
    }

    func updateReminderConfig(_ config: ReminderConfig) async {
        isLoading = true
        error = nil

        defer { isLoading = false }

        do {
            let request = UpdateReminderConfigRequest(
                documentKind: config.documentKind,
                earlyReminderDays: config.earlyReminderDays,
                urgentPeriodDays: config.urgentPeriodDays,
                urgentFrequency: config.urgentFrequency,
                criticalPeriodDays: config.criticalPeriodDays,
                criticalFrequency: config.criticalFrequency,
                emailEnabled: config.emailEnabled,
                pushEnabled: config.pushEnabled,
                smsEnabled: config.smsEnabled
            )

            let response: ReminderConfigResponse = try await api.post(
                "/reminders/config",
                body: request
            )

            reminderConfig = ReminderConfig(from: response.config)

        } catch {
            self.error = error.localizedDescription
        }
    }
}

// MARK: - Models

struct ReminderConfig {
    var documentKind: String?
    var earlyReminderDays: [Int]
    var urgentPeriodDays: Int
    var urgentFrequency: String
    var criticalPeriodDays: Int
    var criticalFrequency: String
    var emailEnabled: Bool
    var pushEnabled: Bool
    var smsEnabled: Bool

    init(from apiConfig: ReminderConfigResponse.ReminderConfig) {
        self.documentKind = apiConfig.documentKind
        self.earlyReminderDays = apiConfig.earlyReminderDays
        self.urgentPeriodDays = apiConfig.urgentPeriodDays
        self.urgentFrequency = apiConfig.urgentFrequency
        self.criticalPeriodDays = apiConfig.criticalPeriodDays
        self.criticalFrequency = apiConfig.criticalFrequency
        self.emailEnabled = apiConfig.emailEnabled
        self.pushEnabled = apiConfig.pushEnabled
        self.smsEnabled = apiConfig.smsEnabled
    }

    static var `default`: ReminderConfig {
        ReminderConfig(
            from: ReminderConfigResponse.ReminderConfig(
                id: nil,
                documentKind: nil,
                earlyReminderDays: [365, 180, 90],
                urgentPeriodDays: 30,
                urgentFrequency: "WEEKLY",
                criticalPeriodDays: 7,
                criticalFrequency: "DAILY",
                emailEnabled: true,
                pushEnabled: true,
                smsEnabled: false
            )
        )
    }
}
