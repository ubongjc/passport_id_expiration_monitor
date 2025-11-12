import SwiftUI

struct RemindersView: View {
    @EnvironmentObject var reminderManager: ReminderManager
    @State private var showingConfig = false

    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                if let config = reminderManager.reminderConfig {
                    Form {
                        Section("Early Reminders") {
                            ForEach(config.earlyReminderDays, id: \.self) { days in
                                HStack {
                                    Image(systemName: "bell")
                                    Text("\(days) days before expiry")
                                }
                            }
                        }

                        Section("Urgent Period") {
                            HStack {
                                Text("Last")
                                Text("\(config.urgentPeriodDays) days")
                                    .bold()
                            }
                            HStack {
                                Text("Frequency")
                                Spacer()
                                Text(config.urgentFrequency)
                                    .foregroundColor(.secondary)
                            }
                        }

                        Section("Critical Period") {
                            HStack {
                                Text("Last")
                                Text("\(config.criticalPeriodDays) days")
                                    .bold()
                                    .foregroundColor(.red)
                            }
                            HStack {
                                Text("Frequency")
                                Spacer()
                                Text(config.criticalFrequency)
                                    .foregroundColor(.secondary)
                            }
                        }

                        Section("Notification Channels") {
                            HStack {
                                Image(systemName: "envelope")
                                Text("Email")
                                Spacer()
                                Image(systemName: config.emailEnabled ? "checkmark.circle.fill" : "xmark.circle")
                                    .foregroundColor(config.emailEnabled ? .green : .gray)
                            }
                            HStack {
                                Image(systemName: "bell.badge")
                                Text("Push Notifications")
                                Spacer()
                                Image(systemName: config.pushEnabled ? "checkmark.circle.fill" : "xmark.circle")
                                    .foregroundColor(config.pushEnabled ? .green : .gray)
                            }
                            HStack {
                                Image(systemName: "message")
                                Text("SMS")
                                Spacer()
                                Image(systemName: config.smsEnabled ? "checkmark.circle.fill" : "xmark.circle")
                                    .foregroundColor(config.smsEnabled ? .green : .gray)
                            }
                        }
                    }
                } else {
                    ProgressView("Loading reminder configuration...")
                }
            }
            .navigationTitle("Reminders")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Edit") {
                        showingConfig = true
                    }
                }
            }
            .sheet(isPresented: $showingConfig) {
                Text("Edit Reminder Config View")
            }
            .onAppear {
                Task {
                    await reminderManager.loadReminderConfig()
                }
            }
        }
    }
}
