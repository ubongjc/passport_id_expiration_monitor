import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Shield, Bell, Scan, Users, Lock, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 gradient-hero opacity-10 blur-3xl" />

        <div className="container mx-auto px-6 py-24 relative">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <Badge variant="outline" className="text-sm px-4 py-1.5">
              <Lock className="mr-2 h-3 w-3 inline" />
              100% Zero-Knowledge Encryption
            </Badge>

            <h1 className="text-6xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Never Miss
              </span>
              <br />
              <span className="text-foreground">A Document Expiration</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Securely track passports, IDs, and licenses with military-grade encryption.
              Get intelligent reminders and renew effortlessly.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <SignedOut>
                <SignUpButton mode="modal">
                  <Button size="lg" className="gradient-primary text-lg px-8 shadow-glow">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Sign In
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <Button size="lg" className="gradient-primary text-lg px-8 shadow-glow">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </SignedIn>
            </div>

            <p className="text-sm text-muted-foreground">
              No credit card required • 14-day money-back guarantee
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why Choose IDMonitor?</h2>
          <p className="text-muted-foreground text-lg">
            World-class security meets delightful user experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Shield,
              title: 'Zero-Knowledge Encryption',
              description: 'Your documents are encrypted on your device with AES-256. We never see your data.',
              color: 'text-green-600',
            },
            {
              icon: Bell,
              title: 'Smart Reminders',
              description: 'Customize reminder schedules that increase in frequency as expiry approaches.',
              color: 'text-purple-600',
            },
            {
              icon: Scan,
              title: 'OCR Scanner',
              description: 'Scan documents with your camera and auto-fill all information instantly.',
              color: 'text-blue-600',
            },
            {
              icon: Users,
              title: 'Family Sharing',
              description: 'Manage documents for up to 5 family members with granular permissions.',
              color: 'text-pink-600',
            },
            {
              icon: Sparkles,
              title: 'Auto-Fill Forms',
              description: 'Automatically fill renewal forms with your encrypted profile data.',
              color: 'text-amber-600',
            },
            {
              icon: Lock,
              title: 'Passkey Authentication',
              description: 'Sign in securely with passkeys, biometrics, or magic links.',
              color: 'text-indigo-600',
            },
          ].map((feature, i) => (
            <Card
              key={i}
              className="p-6 hover:shadow-premium transition-all duration-300 cursor-pointer group animate-slide-up border-2"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${feature.color.split('-')[1]}-100 to-${feature.color.split('-')[1]}-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-24">
        <Card className="gradient-hero text-white p-12 text-center shadow-premium">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of users who never miss a document expiration
          </p>
          <SignedOut>
            <SignUpButton mode="modal">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </SignedIn>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white font-bold">
                ID
              </div>
              <span className="font-bold text-lg">IDMonitor</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 IDMonitor. Built with ❤️ and 🔒
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
