'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/react-switch';
import {
  Shield,
  Bell,
  Moon,
  Globe,
  Download,
  Trash2,
  Key,
  Smartphone,
  Mail,
  Lock,
} from 'lucide-react';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
  });

  const [security, setSecurity] = useState({
    biometric: true,
    twoFactor: false,
  });

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-4xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account and preferences
        </p>
      </div>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle>Security & Privacy</CardTitle>
          </div>
          <CardDescription>
            Your data is protected with military-grade encryption
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-green-600" />
                <span className="font-medium">Zero-Knowledge Encryption</span>
              </div>
              <p className="text-sm text-muted-foreground">
                All documents encrypted client-side with AES-256
              </p>
            </div>
            <Badge variant="success">Active</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <span className="font-medium">Biometric Authentication</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Use Face ID or Touch ID to unlock
              </p>
            </div>
            <Switch
              checked={security.biometric}
              onCheckedChange={(checked) =>
                setSecurity({ ...security, biometric: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                <span className="font-medium">Two-Factor Authentication</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security
              </p>
            </div>
            <Button variant="outline" size="sm">
              Enable 2FA
            </Button>
          </div>

          <div className="pt-4 border-t">
            <Button variant="outline">
              <Key className="mr-2 h-4 w-4" />
              Change Passphrase
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-purple-600" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>
            Choose how you want to be notified
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="font-medium">Email Notifications</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Receive expiration reminders via email
              </p>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, email: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="font-medium">Push Notifications</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Get instant alerts on your device
              </p>
            </div>
            <Switch
              checked={notifications.push}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, push: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <span className="font-medium">SMS Notifications</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Text messages for critical alerts
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="warning">Premium</Badge>
              <Switch
                checked={notifications.sms}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, sms: checked })
                }
                disabled
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button variant="outline">
              <Bell className="mr-2 h-4 w-4" />
              Configure Reminder Schedule
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-indigo-600" />
            <CardTitle>Appearance</CardTitle>
          </div>
          <CardDescription>
            Customize how IDMonitor looks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Theme</label>
            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" className="justify-start">
                <div className="w-4 h-4 rounded-full bg-white border-2 mr-2" />
                Light
              </Button>
              <Button variant="outline" className="justify-start">
                <div className="w-4 h-4 rounded-full bg-gray-900 mr-2" />
                Dark
              </Button>
              <Button variant="outline" className="justify-start">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-white to-gray-900 mr-2" />
                Auto
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-green-600" />
            <CardTitle>Data & Privacy</CardTitle>
          </div>
          <CardDescription>
            Export or delete your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-medium">Export Your Data</span>
              <p className="text-sm text-muted-foreground">
                Download all your data in JSON format
              </p>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="space-y-0.5">
              <span className="font-medium text-destructive">Delete Account</span>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="flex justify-between items-center pt-6 border-t">
        <p className="text-sm text-muted-foreground">
          Version 1.0.0 • Made with ❤️ and 🔒
        </p>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
