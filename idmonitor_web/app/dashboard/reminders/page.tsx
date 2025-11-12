'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/react-switch';
import { Bell, Plus, Trash2, CheckCircle, Clock, AlertTriangle, Mail, Smartphone, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Frequency = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';

interface ReminderConfig {
  documentKind: string | null;
  earlyReminderDays: number[];
  urgentPeriodDays: number;
  urgentFrequency: Frequency;
  criticalPeriodDays: number;
  criticalFrequency: Frequency;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
}

export default function RemindersPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<ReminderConfig>({
    documentKind: null,
    earlyReminderDays: [365, 180, 90],
    urgentPeriodDays: 30,
    urgentFrequency: 'WEEKLY',
    criticalPeriodDays: 7,
    criticalFrequency: 'DAILY',
    emailEnabled: true,
    pushEnabled: true,
    smsEnabled: false,
  });

  const [newReminderDay, setNewReminderDay] = useState('');

  const addReminderDay = () => {
    const days = parseInt(newReminderDay);
    if (days > 0 && !config.earlyReminderDays.includes(days)) {
      setConfig({
        ...config,
        earlyReminderDays: [...config.earlyReminderDays, days].sort((a, b) => b - a),
      });
      setNewReminderDay('');
    }
  };

  const removeReminderDay = (day: number) => {
    setConfig({
      ...config,
      earlyReminderDays: config.earlyReminderDays.filter((d) => d !== day),
    });
  };

  const handleSave = async () => {
    // In production: POST /api/reminders/config
    toast({
      title: 'Reminders Updated',
      description: 'Your reminder preferences have been saved successfully.',
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Reminder Settings</h1>
        <p className="text-muted-foreground mt-2">
          Customize when and how you receive expiration reminders
        </p>
      </div>

      {/* Explanation Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-none">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Flexible Reminder Schedules</h3>
              <p className="text-sm text-muted-foreground">
                Set up early warnings months in advance, then increase reminder frequency as expiration approaches. You have complete control over timing and delivery channels.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Early Reminders */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <CardTitle>Early Warning Reminders</CardTitle>
          </div>
          <CardDescription>
            Get notified well in advance (e.g., 1 year, 6 months, 3 months before expiry)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Current Early Reminders</label>
            <div className="flex flex-wrap gap-2">
              {config.earlyReminderDays.map((days) => (
                <Badge key={days} variant="secondary" className="gap-2 pr-1">
                  {days} days before
                  <button
                    onClick={() => removeReminderDay(days)}
                    className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Days before expiry"
              value={newReminderDay}
              onChange={(e) => setNewReminderDay(e.target.value)}
              className="flex-1 p-2 border rounded-md"
              min="1"
            />
            <Button onClick={addReminderDay} disabled={!newReminderDay}>
              <Plus className="mr-2 h-4 w-4" />
              Add Reminder
            </Button>
          </div>

          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">
              <strong>Example:</strong> If you add "365", you'll get a reminder exactly 1 year before your document expires.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Urgent Period */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <CardTitle>Urgent Period</CardTitle>
          </div>
          <CardDescription>
            Increase reminder frequency as expiration approaches
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Start urgent reminders when
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={config.urgentPeriodDays}
                  onChange={(e) => setConfig({ ...config, urgentPeriodDays: parseInt(e.target.value) || 30 })}
                  className="w-full p-2 pr-16 border rounded-md"
                  min="1"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  days left
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Reminder frequency
              </label>
              <select
                value={config.urgentFrequency}
                onChange={(e) => setConfig({ ...config, urgentFrequency: e.target.value as Frequency })}
                className="w-full p-2 border rounded-md"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="BIWEEKLY">Bi-weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-950/20">
            <p className="text-sm">
              <strong>Current setting:</strong> You'll receive {config.urgentFrequency.toLowerCase()} reminders when there are {config.urgentPeriodDays} days or less until expiration.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Critical Period */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-red-600" />
            <CardTitle>Critical Period</CardTitle>
          </div>
          <CardDescription>
            Maximum frequency reminders in the final days
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Start critical reminders when
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={config.criticalPeriodDays}
                  onChange={(e) => setConfig({ ...config, criticalPeriodDays: parseInt(e.target.value) || 7 })}
                  className="w-full p-2 pr-16 border rounded-md"
                  min="1"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  days left
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Reminder frequency
              </label>
              <select
                value={config.criticalFrequency}
                onChange={(e) => setConfig({ ...config, criticalFrequency: e.target.value as Frequency })}
                className="w-full p-2 border rounded-md"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="BIWEEKLY">Bi-weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950/20">
            <p className="text-sm">
              <strong>Current setting:</strong> You'll receive {config.criticalFrequency.toLowerCase()} reminders when there are {config.criticalPeriodDays} days or less until expiration.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
          <CardDescription>
            Choose how you want to receive reminders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-medium">Email Notifications</div>
                <div className="text-sm text-muted-foreground">
                  Receive reminders via email
                </div>
              </div>
            </div>
            <Switch
              checked={config.emailEnabled}
              onCheckedChange={(checked) => setConfig({ ...config, emailEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="font-medium">Push Notifications</div>
                <div className="text-sm text-muted-foreground">
                  Get instant alerts on your device
                </div>
              </div>
            </div>
            <Switch
              checked={config.pushEnabled}
              onCheckedChange={(checked) => setConfig({ ...config, pushEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex items-center gap-2">
                <div>
                  <div className="font-medium">SMS Notifications</div>
                  <div className="text-sm text-muted-foreground">
                    Text messages for critical alerts
                  </div>
                </div>
                <Badge variant="warning">Premium</Badge>
              </div>
            </div>
            <Switch
              checked={config.smsEnabled}
              onCheckedChange={(checked) => setConfig({ ...config, smsEnabled: checked })}
              disabled={!config.smsEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Reminder Timeline Preview</CardTitle>
          <CardDescription>
            Example timeline for a document expiring in 1 year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {config.earlyReminderDays.map((days) => (
              <div key={days} className="flex items-center gap-4">
                <div className="w-20 text-sm text-muted-foreground">
                  -{days}d
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <div className="text-sm">Early warning reminder</div>
                </div>
              </div>
            ))}

            <div className="flex items-center gap-4">
              <div className="w-20 text-sm text-muted-foreground">
                -{config.urgentPeriodDays}d
              </div>
              <div className="flex-1 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="text-sm">
                  Start {config.urgentFrequency.toLowerCase()} urgent reminders
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-20 text-sm text-muted-foreground">
                -{config.criticalPeriodDays}d
              </div>
              <div className="flex-1 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="text-sm">
                  Start {config.criticalFrequency.toLowerCase()} critical reminders
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-20 text-sm text-muted-foreground">
                0d
              </div>
              <div className="flex-1 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
                <div className="text-sm font-semibold text-red-600">
                  Document expires
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reset to Defaults
        </Button>
        <Button onClick={handleSave} size="lg" className="gradient-primary">
          <CheckCircle className="mr-2 h-5 w-5" />
          Save Reminder Settings
        </Button>
      </div>
    </div>
  );
}
