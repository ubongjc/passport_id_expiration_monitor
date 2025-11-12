'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getExpirationStatus, formatDocumentKind, getCountryFlag, formatDate } from '@/lib/utils';
import { Plus, FileText, Bell, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

// Mock data - in production, fetch from API
const mockDocuments = [
  {
    id: '1',
    kind: 'PASSPORT',
    country: 'US',
    expiresAt: new Date(2025, 11, 15),
    renewalStatus: 'NOT_STARTED',
  },
  {
    id: '2',
    kind: 'DRIVERS_LICENSE',
    country: 'CA',
    expiresAt: new Date(2024, 11, 30),
    renewalStatus: 'IN_PROGRESS',
  },
  {
    id: '3',
    kind: 'NATIONAL_ID',
    country: 'GB',
    expiresAt: new Date(2026, 5, 20),
    renewalStatus: 'NOT_STARTED',
  },
];

export default function DashboardPage() {
  const [documents, setDocuments] = useState(mockDocuments);

  const stats = {
    total: documents.length,
    expiringSoon: documents.filter((d) => {
      const days = Math.ceil((d.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return days <= 90 && days > 0;
    }).length,
    expired: documents.filter((d) => d.expiresAt < new Date()).length,
    inRenewal: documents.filter((d) => d.renewalStatus === 'IN_PROGRESS').length,
  };

  return (
    <div className="container mx-auto p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your documents and stay ahead of expirations
          </p>
        </div>
        <Button className="gradient-primary" size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Add Document
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-slide-up hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Securely encrypted
            </p>
          </CardContent>
        </Card>

        <Card className="animate-slide-up hover:shadow-lg transition-shadow" style={{ animationDelay: '50ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{stats.expiringSoon}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Within 90 days
            </p>
          </CardContent>
        </Card>

        <Card className="animate-slide-up hover:shadow-lg transition-shadow" style={{ animationDelay: '100ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Renewal</CardTitle>
            <Bell className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.inRenewal}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active renewals
            </p>
          </CardContent>
        </Card>

        <Card className="animate-slide-up hover:shadow-lg transition-shadow" style={{ animationDelay: '150ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {stats.expired > 0 ? (
              <AlertCircle className="h-4 w-4 text-red-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            {stats.expired > 0 ? (
              <>
                <div className="text-3xl font-bold text-red-600">{stats.expired}</div>
                <p className="text-xs text-red-600 mt-1 font-medium">
                  Expired documents
                </p>
              </>
            ) : (
              <>
                <div className="text-3xl font-bold text-green-600">✓</div>
                <p className="text-xs text-green-600 mt-1 font-medium">
                  All up to date
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Documents Grid */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Documents</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc, index) => {
            const status = getExpirationStatus(doc.expiresAt);
            const daysLeft = Math.ceil((doc.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

            return (
              <Card
                key={doc.id}
                className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 animate-scale-in border-2"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Color accent bar */}
                <div
                  className={`h-2 w-full ${
                    status.status === 'expired'
                      ? 'bg-red-500'
                      : status.status === 'critical'
                      ? 'bg-red-400'
                      : status.status === 'warning'
                      ? 'bg-amber-400'
                      : 'bg-green-400'
                  }`}
                />

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{getCountryFlag(doc.country)}</div>
                      <div>
                        <CardTitle className="text-lg">
                          {formatDocumentKind(doc.kind)}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {doc.country}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={status.status === 'good' ? 'success' : status.status === 'warning' ? 'warning' : 'error'}>
                      {status.label}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Expires</span>
                      <span className="font-medium">{formatDate(doc.expiresAt)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant="outline" className="text-xs">
                        {doc.renewalStatus.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  {/* Progress bar for days remaining */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Time Remaining</span>
                      <span>{daysLeft > 0 ? `${daysLeft} days` : 'Expired'}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          status.status === 'good'
                            ? 'bg-green-500'
                            : status.status === 'warning'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(0, (daysLeft / 365) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                    {daysLeft <= 90 && (
                      <Button size="sm" className="flex-1 gradient-primary">
                        Renew Now
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Add New Card */}
          <Card className="group cursor-pointer border-2 border-dashed hover:border-primary hover:shadow-xl transition-all duration-300 flex items-center justify-center min-h-[300px]">
            <CardContent className="text-center py-12">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Add New Document</h3>
              <p className="text-sm text-muted-foreground">
                Scan or enter document details
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-none shadow-premium">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with common tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Button variant="outline" className="h-auto flex-col items-start gap-2 p-4">
            <FileText className="h-5 w-5 text-blue-600" />
            <div className="text-left">
              <div className="font-semibold">Scan Document</div>
              <div className="text-xs text-muted-foreground">
                Use your camera to add a document
              </div>
            </div>
          </Button>
          <Button variant="outline" className="h-auto flex-col items-start gap-2 p-4">
            <Bell className="h-5 w-5 text-purple-600" />
            <div className="text-left">
              <div className="font-semibold">Configure Reminders</div>
              <div className="text-xs text-muted-foreground">
                Set up custom reminder schedules
              </div>
            </div>
          </Button>
          <Button variant="outline" className="h-auto flex-col items-start gap-2 p-4">
            <Clock className="h-5 w-5 text-amber-600" />
            <div className="text-left">
              <div className="font-semibold">Start Renewal</div>
              <div className="text-xs text-muted-foreground">
                Begin renewal process for a document
              </div>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
