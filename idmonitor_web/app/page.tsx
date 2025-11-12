import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from '@clerk/nextjs';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <main className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            IDMonitor
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Secure, Zero-Knowledge Passport & ID Expiration Tracking
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition">
                Get Started
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">🔒 Zero-Knowledge Encryption</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your documents are encrypted client-side. We never see your data.
            </p>
          </div>
          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">🔔 Smart Reminders</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Flexible reminder schedules that increase in frequency as expiry approaches.
            </p>
          </div>
          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">📝 Auto-Fill Forms</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Automatically fill renewal forms with your encrypted profile data.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
