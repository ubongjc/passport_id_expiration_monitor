import SwiftUI

/**
 * IDMonitor iOS App
 * 100% Secure Passport & ID Expiration Monitor
 *
 * Security Features:
 * - Client-side encryption (AES-GCM 256-bit)
 * - CryptoKit for all cryptographic operations
 * - Keychain storage for sensitive data
 * - Biometric authentication (Face ID / Touch ID)
 */

@main
struct IDMonitorApp: App {
    @StateObject private var authManager = AuthenticationManager.shared
    @StateObject private var documentStore = DocumentStore.shared
    @StateObject private var reminderManager = ReminderManager.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authManager)
                .environmentObject(documentStore)
                .environmentObject(reminderManager)
                .onAppear {
                    setupApp()
                }
        }
    }

    private func setupApp() {
        // Configure API client
        APIClient.shared.configure(baseURL: Configuration.apiBaseURL)

        // Request notification permissions
        reminderManager.requestNotificationPermissions()

        // Restore auth session
        Task {
            await authManager.restoreSession()
        }
    }
}

struct ContentView: View {
    @EnvironmentObject var authManager: AuthenticationManager

    var body: some View {
        Group {
            if authManager.isAuthenticated {
                MainTabView()
            } else {
                AuthenticationView()
            }
        }
    }
}

struct MainTabView: View {
    var body: some View {
        TabView {
            DocumentsListView()
                .tabItem {
                    Label("Documents", systemImage: "doc.text")
                }

            RemindersView()
                .tabItem {
                    Label("Reminders", systemImage: "bell")
                }

            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gear")
                }
        }
    }
}
