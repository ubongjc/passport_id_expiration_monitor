'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Eye,
  Edit,
  Trash2,
  Key,
  LogIn,
  LogOut,
  Settings,
  Download,
  FileText,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Calendar,
} from 'lucide-react';

type AuditAction =
  | 'USER_SIGNIN'
  | 'USER_SIGNOUT'
  | 'USER_SIGNUP'
  | 'DOCUMENT_CREATED'
  | 'DOCUMENT_VIEWED'
  | 'DOCUMENT_UPDATED'
  | 'DOCUMENT_DELETED'
  | 'SETTINGS_UPDATED'
  | 'PASSWORD_CHANGED'
  | 'TWO_FACTOR_ENABLED'
  | 'TWO_FACTOR_DISABLED'
  | 'DEVICE_ADDED'
  | 'DEVICE_REMOVED'
  | 'SESSION_REVOKED'
  | 'DATA_EXPORTED'
  | 'FAILED_LOGIN'
  | 'SUSPICIOUS_ACTIVITY';

type AuditSeverity = 'info' | 'warning' | 'critical';

type AuditLog = {
  id: string;
  timestamp: Date;
  action: AuditAction;
  severity: AuditSeverity;
  userId: string;
  ipAddress: string;
  userAgent: string;
  location: string;
  device: string;
  resource?: string;
  metadata?: Record<string, unknown>;
  success: boolean;
};

export default function AuditLogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<AuditAction | 'all'>('all');
  const [filterSeverity, setFilterSeverity] = useState<AuditSeverity | 'all'>('all');
  const [filterDateRange, setFilterDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Mock data - replace with API call
  const mockLogs: AuditLog[] = [
    {
      id: '1',
      timestamp: new Date(),
      action: 'USER_SIGNIN',
      severity: 'info',
      userId: 'user_123',
      ipAddress: '192.168.1.1',
      userAgent: 'Chrome 120 on macOS',
      location: 'San Francisco, CA',
      device: 'MacBook Pro',
      success: true,
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      action: 'DOCUMENT_VIEWED',
      severity: 'info',
      userId: 'user_123',
      ipAddress: '192.168.1.1',
      userAgent: 'Chrome 120 on macOS',
      location: 'San Francisco, CA',
      device: 'MacBook Pro',
      resource: 'IdentityDocument:doc_456',
      metadata: { documentType: 'PASSPORT', country: 'US' },
      success: true,
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      action: 'TWO_FACTOR_ENABLED',
      severity: 'warning',
      userId: 'user_123',
      ipAddress: '192.168.1.1',
      userAgent: 'Chrome 120 on macOS',
      location: 'San Francisco, CA',
      device: 'MacBook Pro',
      success: true,
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      action: 'FAILED_LOGIN',
      severity: 'critical',
      userId: 'user_123',
      ipAddress: '203.0.113.42',
      userAgent: 'Unknown',
      location: 'Unknown Location',
      device: 'Unknown Device',
      success: false,
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      action: 'DOCUMENT_CREATED',
      severity: 'info',
      userId: 'user_123',
      ipAddress: '192.168.1.2',
      userAgent: 'Safari 17 on iOS',
      location: 'San Francisco, CA',
      device: 'iPhone 15 Pro',
      resource: 'IdentityDocument:doc_789',
      metadata: { documentType: 'DRIVERS_LICENSE', country: 'CA' },
      success: true,
    },
    {
      id: '6',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      action: 'DEVICE_ADDED',
      severity: 'warning',
      userId: 'user_123',
      ipAddress: '192.168.1.3',
      userAgent: 'Safari 17 on iPadOS',
      location: 'Oakland, CA',
      device: 'iPad Air',
      success: true,
    },
    {
      id: '7',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      action: 'DATA_EXPORTED',
      severity: 'warning',
      userId: 'user_123',
      ipAddress: '192.168.1.1',
      userAgent: 'Chrome 120 on macOS',
      location: 'San Francisco, CA',
      device: 'MacBook Pro',
      metadata: { format: 'JSON', documentsCount: 5 },
      success: true,
    },
    {
      id: '8',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      action: 'SUSPICIOUS_ACTIVITY',
      severity: 'critical',
      userId: 'user_123',
      ipAddress: '198.51.100.42',
      userAgent: 'Unknown',
      location: 'Moscow, Russia',
      device: 'Unknown Device',
      metadata: { reason: 'Login from unusual location' },
      success: false,
    },
  ];

  const [logs] = useState<AuditLog[]>(mockLogs);

  const filteredLogs = useMemo(() => {
    let filtered = [...logs];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((log) =>
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.ipAddress.includes(searchQuery) ||
        log.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.device.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by action
    if (filterAction !== 'all') {
      filtered = filtered.filter((log) => log.action === filterAction);
    }

    // Filter by severity
    if (filterSeverity !== 'all') {
      filtered = filtered.filter((log) => log.severity === filterSeverity);
    }

    // Filter by date range
    if (filterDateRange !== 'all') {
      const now = Date.now();
      const ranges = {
        today: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
      };
      const range = ranges[filterDateRange];
      filtered = filtered.filter((log) => now - log.timestamp.getTime() <= range);
    }

    return filtered;
  }, [logs, searchQuery, filterAction, filterSeverity, filterDateRange]);

  const getActionIcon = (action: AuditAction) => {
    switch (action) {
      case 'USER_SIGNIN':
      case 'USER_SIGNUP':
        return <LogIn className="h-4 w-4" />;
      case 'USER_SIGNOUT':
        return <LogOut className="h-4 w-4" />;
      case 'DOCUMENT_VIEWED':
        return <Eye className="h-4 w-4" />;
      case 'DOCUMENT_CREATED':
        return <FileText className="h-4 w-4" />;
      case 'DOCUMENT_UPDATED':
        return <Edit className="h-4 w-4" />;
      case 'DOCUMENT_DELETED':
        return <Trash2 className="h-4 w-4" />;
      case 'SETTINGS_UPDATED':
      case 'PASSWORD_CHANGED':
        return <Settings className="h-4 w-4" />;
      case 'TWO_FACTOR_ENABLED':
      case 'TWO_FACTOR_DISABLED':
        return <Key className="h-4 w-4" />;
      case 'DEVICE_ADDED':
      case 'DEVICE_REMOVED':
        return <Smartphone className="h-4 w-4" />;
      case 'SESSION_REVOKED':
        return <Shield className="h-4 w-4" />;
      case 'DATA_EXPORTED':
        return <Download className="h-4 w-4" />;
      case 'FAILED_LOGIN':
      case 'SUSPICIOUS_ACTIVITY':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getSeverityBadge = (severity: AuditSeverity) => {
    switch (severity) {
      case 'info':
        return <Badge variant="secondary">Info</Badge>;
      case 'warning':
        return <Badge variant="warning">Warning</Badge>;
      case 'critical':
        return <Badge variant="error">Critical</Badge>;
    }
  };

  const formatAction = (action: AuditAction) => {
    return action.split('_').map(word =>
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const formatTimestamp = (date: Date) => {
    const now = Date.now();
    const diff = now - date.getTime();

    if (diff < 60 * 1000) return 'Just now';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}m ago`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}h ago`;
    if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / (24 * 60 * 60 * 1000))}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  const handleExportLogs = () => {
    // In production, this would call API to export logs
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Security Audit Logs
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Monitor all security events and account activity
          </p>
        </div>
        <Button onClick={handleExportLogs} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{logs.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-600">
                  {logs.filter(l => l.severity === 'critical').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed Logins</p>
                <p className="text-2xl font-bold text-amber-600">
                  {logs.filter(l => !l.success).length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-amber-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round((logs.filter(l => l.success).length / logs.length) * 100)}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium mb-2 block">Action Type</label>
                  <select
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value as AuditAction | 'all')}
                    className="w-full p-2 border rounded-md text-sm"
                  >
                    <option value="all">All Actions</option>
                    <option value="USER_SIGNIN">User Sign In</option>
                    <option value="USER_SIGNOUT">User Sign Out</option>
                    <option value="DOCUMENT_CREATED">Document Created</option>
                    <option value="DOCUMENT_VIEWED">Document Viewed</option>
                    <option value="DOCUMENT_UPDATED">Document Updated</option>
                    <option value="DOCUMENT_DELETED">Document Deleted</option>
                    <option value="TWO_FACTOR_ENABLED">2FA Enabled</option>
                    <option value="FAILED_LOGIN">Failed Login</option>
                    <option value="SUSPICIOUS_ACTIVITY">Suspicious Activity</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Severity</label>
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value as AuditSeverity | 'all')}
                    className="w-full p-2 border rounded-md text-sm"
                  >
                    <option value="all">All Severities</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Date Range</label>
                  <select
                    value={filterDateRange}
                    onChange={(e) => setFilterDateRange(e.target.value as typeof filterDateRange)}
                    className="w-full p-2 border rounded-md text-sm"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>
              </div>
            )}

            {/* Active Filters */}
            {(filterAction !== 'all' || filterSeverity !== 'all' || filterDateRange !== 'all' || searchQuery) && (
              <div className="flex items-center gap-2 pt-2 border-t flex-wrap">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {searchQuery}
                    <button onClick={() => setSearchQuery('')} className="ml-1">×</button>
                  </Badge>
                )}
                {filterAction !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Action: {formatAction(filterAction as AuditAction)}
                    <button onClick={() => setFilterAction('all')} className="ml-1">×</button>
                  </Badge>
                )}
                {filterSeverity !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Severity: {filterSeverity}
                    <button onClick={() => setFilterSeverity('all')} className="ml-1">×</button>
                  </Badge>
                )}
                {filterDateRange !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Range: {filterDateRange}
                    <button onClick={() => setFilterDateRange('all')} className="ml-1">×</button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterAction('all');
                    setFilterSeverity('all');
                    setFilterDateRange('all');
                  }}
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredLogs.length} of {logs.length} events
        </p>
      </div>

      {/* Logs List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No logs found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your filters or search query</p>
          </Card>
        ) : (
          filteredLogs.map((log) => (
            <Card key={log.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    log.severity === 'critical' ? 'bg-red-100 dark:bg-red-900/20 text-red-600' :
                    log.severity === 'warning' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600' :
                    'bg-blue-100 dark:bg-blue-900/20 text-blue-600'
                  }`}>
                    {getActionIcon(log.action)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold">{formatAction(log.action)}</h4>
                        {getSeverityBadge(log.severity)}
                        {!log.success && (
                          <Badge variant="error" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Failed
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span>IP: {log.ipAddress}</span>
                        <span>•</span>
                        <span>{log.location}</span>
                        <span>•</span>
                        <span>{log.device}</span>
                      </div>
                      {log.resource && (
                        <div className="flex items-center gap-2">
                          <span>Resource: {log.resource}</span>
                        </div>
                      )}
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="bg-muted/50 p-2 rounded mt-2 font-mono text-xs">
                          {JSON.stringify(log.metadata, null, 2)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
