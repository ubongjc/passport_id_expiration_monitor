import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var authManager: AuthenticationManager

    var body: some View {
        NavigationView {
            Form {
                Section("Account") {
                    if let user = authManager.currentUser {
                        HStack {
                            Text("Email")
                            Spacer()
                            Text(user.email)
                                .foregroundColor(.secondary)
                        }
                        HStack {
                            Text("Subscription")
                            Spacer()
                            Text(user.subscriptionTier)
                                .foregroundColor(.secondary)
                        }
                    }
                }

                Section("Security") {
                    HStack {
                        Image(systemName: "lock.shield")
                        Text("Zero-Knowledge Encryption")
                        Spacer()
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.green)
                    }

                    HStack {
                        Image(systemName: "faceid")
                        Text("Biometric Authentication")
                        Spacer()
                        Toggle("", isOn: .constant(true))
                    }
                }

                Section("Data") {
                    Button(action: {}) {
                        HStack {
                            Image(systemName: "square.and.arrow.down")
                            Text("Export Data")
                        }
                    }

                    Button(role: .destructive, action: {}) {
                        HStack {
                            Image(systemName: "trash")
                            Text("Delete Account")
                        }
                    }
                }

                Section {
                    Button(action: {
                        authManager.signOut()
                    }) {
                        HStack {
                            Spacer()
                            Text("Sign Out")
                                .foregroundColor(.red)
                            Spacer()
                        }
                    }
                }
            }
            .navigationTitle("Settings")
        }
    }
}
