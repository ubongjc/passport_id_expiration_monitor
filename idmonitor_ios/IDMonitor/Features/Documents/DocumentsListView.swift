import SwiftUI

struct DocumentsListView: View {
    @EnvironmentObject var documentStore: DocumentStore
    @State private var showingAddDocument = false

    var body: some View {
        NavigationView {
            List {
                ForEach(documentStore.documents) { document in
                    DocumentRowView(document: document)
                }
            }
            .navigationTitle("Documents")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingAddDocument = true }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAddDocument) {
                Text("Add Document View")
            }
            .onAppear {
                Task {
                    await documentStore.loadDocuments()
                }
            }
        }
    }
}

struct DocumentRowView: View {
    let document: IdentityDocument

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(document.kind)
                .font(.headline)

            Text("Expires: \(document.expiresAt, style: .date)")
                .font(.subheadline)
                .foregroundColor(.secondary)

            Text(document.country)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(.vertical, 4)
    }
}
