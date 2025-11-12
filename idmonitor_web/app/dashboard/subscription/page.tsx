'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Users, Crown } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    icon: Sparkles,
    color: 'text-gray-600',
    features: [
      '3 documents',
      'Basic reminders',
      'Email notifications',
      'Community support',
      'Zero-knowledge encryption',
    ],
    limitations: [
      'No OCR scanning',
      'No SMS notifications',
      'No family sharing',
      'No priority support',
    ],
    current: true,
  },
  {
    name: 'Premium',
    price: '$9.99',
    period: 'per month',
    description: 'For individuals who need more',
    icon: Crown,
    color: 'text-purple-600',
    popular: true,
    features: [
      'Unlimited documents',
      'Advanced reminders',
      'All notification channels',
      'OCR document scanning',
      'Auto-fill renewal forms',
      'Priority support',
      'Export & backup',
      'Dark mode',
      'Advanced analytics',
    ],
    limitations: [],
    current: false,
  },
  {
    name: 'Family',
    price: '$19.99',
    period: 'per month',
    description: 'Manage documents for the whole family',
    icon: Users,
    color: 'text-blue-600',
    features: [
      'All Premium features',
      'Up to 5 family members',
      'Shared document access',
      'Family dashboard',
      'Granular permissions',
      'Family activity log',
      'Premium support',
    ],
    limitations: [],
    current: false,
  },
];

export default function SubscriptionPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Choose Your Plan
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Upgrade to unlock premium features and never miss a document expiration
        </p>
      </div>

      {/* Current Plan */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2 border-primary/20">
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>You are currently on the Free plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-lg">Free Plan</div>
              <div className="text-sm text-muted-foreground">2 of 3 documents used</div>
            </div>
            <Badge variant="outline">Active</Badge>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 w-2/3" />
          </div>
        </CardContent>
      </Card>

      {/* Pricing Cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card
              key={plan.name}
              className={`relative overflow-hidden transition-all duration-300 ${
                plan.popular
                  ? 'border-2 border-primary shadow-premium scale-105'
                  : 'hover:shadow-lg'
              } ${plan.current ? 'opacity-60' : ''}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <div className="gradient-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    MOST POPULAR
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <div className={`mx-auto w-12 h-12 rounded-full bg-gradient-to-r ${
                  plan.name === 'Free' ? 'from-gray-400 to-gray-600' :
                  plan.name === 'Premium' ? 'from-purple-400 to-purple-600' :
                  'from-blue-400 to-blue-600'
                } flex items-center justify-center mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">/{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <div className="mt-0.5 flex-shrink-0">
                        <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                          <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Button */}
                <Button
                  className={`w-full ${plan.popular ? 'gradient-primary' : ''}`}
                  variant={plan.current ? 'outline' : plan.popular ? 'default' : 'outline'}
                  disabled={plan.current}
                  size="lg"
                >
                  {plan.current ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </Button>

                {plan.name === 'Premium' && (
                  <p className="text-xs text-center text-muted-foreground">
                    14-day money-back guarantee
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Features Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
          <CardDescription>See what's included in each plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Feature</th>
                  <th className="text-center py-3 px-4">Free</th>
                  <th className="text-center py-3 px-4 bg-primary/5">Premium</th>
                  <th className="text-center py-3 px-4">Family</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Documents', free: '3', premium: 'Unlimited', family: 'Unlimited' },
                  { feature: 'OCR Scanning', free: '✗', premium: '✓', family: '✓' },
                  { feature: 'SMS Notifications', free: '✗', premium: '✓', family: '✓' },
                  { feature: 'Family Sharing', free: '✗', premium: '✗', family: '✓' },
                  { feature: 'Priority Support', free: '✗', premium: '✓', family: '✓' },
                  { feature: 'Export & Backup', free: '✗', premium: '✓', family: '✓' },
                ].map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{row.feature}</td>
                    <td className="py-3 px-4 text-center">{row.free}</td>
                    <td className="py-3 px-4 text-center bg-primary/5 font-semibold">{row.premium}</td>
                    <td className="py-3 px-4 text-center">{row.family}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto space-y-4">
        <h2 className="text-2xl font-bold text-center">Frequently Asked Questions</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Can I cancel anytime?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Is my data secure?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Absolutely. All your documents are encrypted client-side with AES-256 encryption. We use zero-knowledge architecture, meaning we never see your unencrypted data.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">What payment methods do you accept?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We accept all major credit cards, Apple Pay, and Google Pay through Stripe.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
