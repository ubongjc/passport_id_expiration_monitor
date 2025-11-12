'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/react-switch';
import {
  Shield,
  Key,
  Smartphone,
  Monitor,
  Chrome,
  Lock,
  AlertTriangle,
  CheckCircle,
  X,
  Clock,
  MapPin,
  Trash2,
  QrCode,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';

type Device = {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  location: string;
  lastActive: Date;
  current: boolean;
  trusted: boolean;
};

type Session = {
  id: string;
  deviceId: string;
  ip: string;
  location: string;
  createdAt: Date;
  lastActivity: Date;
  current: boolean;
};

export default function SecurityPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [twoFactorStep, setTwoFactorStep] = useState<'qr' | 'verify' | 'backup'>('qr');
  const [verificationCode, setVerificationCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(30);

  // Mock data - replace with API calls
  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      name: 'MacBook Pro',
      type: 'desktop',
      browser: 'Chrome 120',
      os: 'macOS 14.2',
      location: 'San Francisco, CA',
      lastActive: new Date(),
      current: true,
      trusted: true,
    },
    {
      id: '2',
      name: 'iPhone 15 Pro',
      type: 'mobile',
      browser: 'Safari 17',
      os: 'iOS 17.2',
      location: 'San Francisco, CA',
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
      current: false,
      trusted: true,
    },
    {
      id: '3',
      name: 'iPad Air',
      type: 'tablet',
      browser: 'Safari 17',
      os: 'iPadOS 17.2',
      location: 'Oakland, CA',
      lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
      current: false,
      trusted: false,
    },
  ]);

  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      deviceId: '1',
      ip: '192.168.1.1',
      location: 'San Francisco, CA',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      lastActivity: new Date(),
      current: true,
    },
    {
      id: '2',
      deviceId: '2',
      ip: '192.168.1.2',
      location: 'San Francisco, CA',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
      current: false,
    },
  ]);

  const mockBackupCodes = [
    'A1B2-C3D4-E5F6',
    'G7H8-I9J0-K1L2',
    'M3N4-O5P6-Q7R8',
    'S9T0-U1V2-W3X4',
    'Y5Z6-A7B8-C9D0',
    'E1F2-G3H4-I5J6',
    'K7L8-M9N0-O1P2',
    'Q3R4-S5T6-U7V8',
  ];

  const secretKey = 'JBSWY3DPEHPK3PXP';

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secretKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyCode = () => {
    // In production, verify the code with the server
    if (verificationCode.length === 6) {
      setTwoFactorStep('backup');
    }
  };

  const handleCompleteTwoFactorSetup = () => {
    setTwoFactorEnabled(true);
    setShowTwoFactorSetup(false);
    setTwoFactorStep('qr');
    setVerificationCode('');
  };

  const handleDisableTwoFactor = () => {
    // In production, show confirmation modal and require password
    setTwoFactorEnabled(false);
  };

  const handleRevokeDevice = (deviceId: string) => {
    setDevices(devices.filter(d => d.id !== deviceId));
    // Also revoke associated sessions
    setSessions(sessions.filter(s => s.deviceId !== deviceId));
  };

  const handleRevokeSession = (sessionId: string) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
  };

  const handleRevokeAllSessions = () => {
    // Keep only current session
    setSessions(sessions.filter(s => s.current));
  };

  const handleTrustDevice = (deviceId: string) => {
    setDevices(devices.map(d =>
      d.id === deviceId ? { ...d, trusted: !d.trusted } : d
    ));
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'desktop':
        return <Monitor className="h-5 w-5" />;
      case 'mobile':
        return <Smartphone className="h-5 w-5" />;
      case 'tablet':
        return <Monitor className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Security Center
        </h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Manage your account security and connected devices
        </p>
      </div>

      {/* Security Status Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Encryption</p>
                <p className="text-2xl font-bold text-green-600">Active</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Lock className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">AES-256 Zero-Knowledge</p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">2FA Status</p>
                <p className={`text-2xl font-bold ${twoFactorEnabled ? 'text-green-600' : 'text-amber-600'}`}>
                  {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                twoFactorEnabled ? 'bg-green-100 dark:bg-green-900/20' : 'bg-amber-100 dark:bg-amber-900/20'
              }`}>
                <Key className={`h-6 w-6 ${twoFactorEnabled ? 'text-green-600' : 'text-amber-600'}`} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {twoFactorEnabled ? 'TOTP Authenticator' : 'Not configured'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Devices</p>
                <p className="text-2xl font-bold">{devices.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {devices.filter(d => d.trusted).length} trusted
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-600" />
              <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
            </div>
            {twoFactorEnabled && (
              <Badge variant="success" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Enabled
              </Badge>
            )}
          </div>
          <CardDescription>
            Add an extra layer of security to your account using TOTP authenticator apps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!twoFactorEnabled && !showTwoFactorSetup && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                    2FA is not enabled
                  </h4>
                  <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
                    Your account is vulnerable. Enable 2FA to protect against unauthorized access.
                  </p>
                  <Button
                    onClick={() => setShowTwoFactorSetup(true)}
                    className="gradient-primary"
                    size="sm"
                  >
                    <Key className="mr-2 h-4 w-4" />
                    Enable Two-Factor Authentication
                  </Button>
                </div>
              </div>
            </div>
          )}

          {showTwoFactorSetup && (
            <div className="border-2 border-primary rounded-lg p-4 sm:p-6 space-y-6">
              {twoFactorStep === 'qr' && (
                <>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Step 1: Scan QR Code</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Use an authenticator app like Google Authenticator, Authy, or 1Password
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    {/* Mock QR Code */}
                    <div className="w-48 h-48 bg-white border-4 border-primary rounded-lg flex items-center justify-center">
                      <QrCode className="h-32 w-32 text-gray-400" />
                    </div>

                    <div className="w-full max-w-md">
                      <p className="text-sm font-medium mb-2 text-center">Or enter this key manually:</p>
                      <div className="flex items-center gap-2 bg-muted p-3 rounded-md">
                        <code className="flex-1 text-center font-mono text-sm">{secretKey}</code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCopySecret}
                          className="flex-shrink-0"
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-3 pt-4">
                    <Button variant="outline" onClick={() => setShowTwoFactorSetup(false)}>
                      Cancel
                    </Button>
                    <Button className="gradient-primary" onClick={() => setTwoFactorStep('verify')}>
                      Next Step
                    </Button>
                  </div>
                </>
              )}

              {twoFactorStep === 'verify' && (
                <>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Step 2: Verify Code</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Enter the 6-digit code from your authenticator app
                    </p>
                  </div>

                  <div className="max-w-xs mx-auto">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full text-center text-2xl tracking-widest font-mono p-4 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="flex justify-center gap-3 pt-4">
                    <Button variant="outline" onClick={() => setTwoFactorStep('qr')}>
                      Back
                    </Button>
                    <Button
                      className="gradient-primary"
                      onClick={handleVerifyCode}
                      disabled={verificationCode.length !== 6}
                    >
                      Verify & Continue
                    </Button>
                  </div>
                </>
              )}

              {twoFactorStep === 'backup' && (
                <>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Step 3: Save Backup Codes</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Store these codes in a safe place. Each code can be used once if you lose access to your authenticator.
                    </p>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {mockBackupCodes.map((code, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-background p-2 rounded font-mono text-sm"
                        >
                          <span className="text-muted-foreground">{index + 1}.</span>
                          <span>{code}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-center gap-3 pt-4">
                    <Button variant="outline" onClick={handleCopySecret}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy All Codes
                    </Button>
                    <Button className="gradient-primary" onClick={handleCompleteTwoFactorSetup}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete Setup
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {twoFactorEnabled && (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                      2FA is protecting your account
                    </h4>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      You'll be asked for a verification code when signing in from a new device.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate Backup Codes
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDisableTwoFactor}>
                  <X className="mr-2 h-4 w-4" />
                  Disable 2FA
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Biometric Authentication */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-purple-600" />
            <CardTitle>Biometric Authentication</CardTitle>
          </div>
          <CardDescription>
            Use Face ID, Touch ID, or fingerprint to unlock the app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Enable Biometric Unlock</p>
              <p className="text-sm text-muted-foreground">
                Supported on iOS, Android, and Windows Hello
              </p>
            </div>
            <Switch
              checked={biometricEnabled}
              onCheckedChange={setBiometricEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Device Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-indigo-600" />
              <CardTitle>Trusted Devices</CardTitle>
            </div>
            <Badge variant="secondary">{devices.length} devices</Badge>
          </div>
          <CardDescription>
            Manage devices that have accessed your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {devices.map((device) => (
            <div
              key={device.id}
              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {getDeviceIcon(device.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold truncate">{device.name}</h4>
                      {device.current && (
                        <Badge variant="success" className="text-xs">
                          Current
                        </Badge>
                      )}
                      {device.trusted && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Trusted
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1 mt-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Chrome className="h-3 w-3" />
                          {device.browser}
                        </span>
                        <span>•</span>
                        <span>{device.os}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {device.location}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(device.lastActive)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                  {!device.current && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTrustDevice(device.id)}
                      >
                        {device.trusted ? 'Untrust' : 'Trust'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRevokeDevice(device.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <CardTitle>Active Sessions</CardTitle>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRevokeAllSessions}
              disabled={sessions.length <= 1}
            >
              <X className="mr-2 h-4 w-4" />
              Revoke All Other Sessions
            </Button>
          </div>
          <CardDescription>
            Sessions automatically expire after {sessionTimeout} days of inactivity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {sessions.map((session) => {
              const device = devices.find(d => d.id === session.deviceId);
              return (
                <div
                  key={session.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h4 className="font-semibold">{device?.name || 'Unknown Device'}</h4>
                        {session.current && (
                          <Badge variant="success" className="text-xs">
                            Current Session
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span>IP: {session.ip}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {session.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span>Created: {formatTimeAgo(session.createdAt)}</span>
                          <span>•</span>
                          <span>Last active: {formatTimeAgo(session.lastActivity)}</span>
                        </div>
                      </div>
                    </div>
                    {!session.current && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRevokeSession(session.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t">
            <label className="text-sm font-medium mb-2 block">Session Timeout</label>
            <div className="flex items-center gap-4 flex-wrap">
              <select
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(Number(e.target.value))}
                className="flex-1 min-w-[200px] p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
              </select>
              <Button variant="outline">Save</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card className="border-2 border-amber-500/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <CardTitle>Security Recommendations</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {!twoFactorEnabled && (
            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-amber-900 dark:text-amber-100">
                  Enable Two-Factor Authentication
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Protect your account from unauthorized access
                </p>
              </div>
            </div>
          )}
          {devices.some(d => !d.trusted && !d.current) && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Review Untrusted Devices
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  You have {devices.filter(d => !d.trusted && !d.current).length} untrusted device(s)
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
