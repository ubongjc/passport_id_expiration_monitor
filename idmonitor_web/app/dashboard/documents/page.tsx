'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getExpirationStatus, formatDocumentKind, getCountryFlag, formatDate } from '@/lib/utils';
import { Plus, Search, SlidersHorizontal, Camera, Upload, Download, Filter } from 'lucide-react';
import Link from 'next/link';

// Mock data - replace with API call
const mockDocuments = [
  {
    id: '1',
    kind: 'PASSPORT',
    country: 'US',
    expiresAt: new Date(2025, 11, 15),
    issuedAt: new Date(2020, 11, 15),
    renewalStatus: 'NOT_STARTED',
    createdAt: new Date(2024, 0, 15),
  },
  {
    id: '2',
    kind: 'DRIVERS_LICENSE',
    country: 'CA',
    expiresAt: new Date(2024, 11, 30),
    issuedAt: new Date(2020, 11, 30),
    renewalStatus: 'IN_PROGRESS',
    createdAt: new Date(2024, 1, 10),
  },
  {
    id: '3',
    kind: 'NATIONAL_ID',
    country: 'GB',
    expiresAt: new Date(2026, 5, 20),
    issuedAt: new Date(2021, 5, 20),
    renewalStatus: 'NOT_STARTED',
    createdAt: new Date(2024, 2, 5),
  },
  {
    id: '4',
    kind: 'PASSPORT',
    country: 'FR',
    expiresAt: new Date(2027, 3, 10),
    issuedAt: new Date(2022, 3, 10),
    renewalStatus: 'NOT_STARTED',
    createdAt: new Date(2024, 3, 1),
  },
];

type SortBy = 'expiry-asc' | 'expiry-desc' | 'name-asc' | 'name-desc' | 'created-asc' | 'created-desc';
type FilterStatus = 'all' | 'expired' | 'expiring' | 'good';
type FilterKind = 'all' | 'PASSPORT' | 'NATIONAL_ID' | 'DRIVERS_LICENSE' | 'RESIDENCE_PERMIT' | 'VISA';

export default function DocumentsPage() {
  const [documents] = useState(mockDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('expiry-asc');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterKind, setFilterKind] = useState<FilterKind>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let filtered = [...documents];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((doc) =>
        doc.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formatDocumentKind(doc.kind).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((doc) => {
        const status = getExpirationStatus(doc.expiresAt).status;
        if (filterStatus === 'expired') return status === 'expired';
        if (filterStatus === 'expiring') return status === 'critical' || status === 'warning';
        if (filterStatus === 'good') return status === 'good';
        return true;
      });
    }

    // Filter by kind
    if (filterKind !== 'all') {
      filtered = filtered.filter((doc) => doc.kind === filterKind);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'expiry-asc':
          return a.expiresAt.getTime() - b.expiresAt.getTime();
        case 'expiry-desc':
          return b.expiresAt.getTime() - a.expiresAt.getTime();
        case 'name-asc':
          return formatDocumentKind(a.kind).localeCompare(formatDocumentKind(b.kind));
        case 'name-desc':
          return formatDocumentKind(b.kind).localeCompare(formatDocumentKind(a.kind));
        case 'created-asc':
          return a.createdAt.getTime() - b.createdAt.getTime();
        case 'created-desc':
          return b.createdAt.getTime() - a.createdAt.getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [documents, searchQuery, sortBy, filterStatus, filterKind]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold">Documents</h1>
          <p className="text-muted-foreground mt-2">
            Manage all your identity documents in one place
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/documents/scan">
            <Button className="gradient-primary">
              <Camera className="mr-2 h-5 w-5" />
              Scan Document
            </Button>
          </Link>
          <Link href="/dashboard/documents/new">
            <Button variant="outline">
              <Plus className="mr-2 h-5 w-5" />
              Add Manually
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="expiry-asc">Expiry Date (Earliest First)</option>
                    <option value="expiry-desc">Expiry Date (Latest First)</option>
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="created-asc">Date Added (Oldest First)</option>
                    <option value="created-desc">Date Added (Newest First)</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="all">All Statuses</option>
                    <option value="good">Up to Date</option>
                    <option value="expiring">Expiring Soon</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Document Type</label>
                  <select
                    value={filterKind}
                    onChange={(e) => setFilterKind(e.target.value as FilterKind)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="all">All Types</option>
                    <option value="PASSPORT">Passport</option>
                    <option value="NATIONAL_ID">National ID</option>
                    <option value="DRIVERS_LICENSE">Driver's License</option>
                    <option value="RESIDENCE_PERMIT">Residence Permit</option>
                    <option value="VISA">Visa</option>
                  </select>
                </div>
              </div>
            )}

            {/* Active Filters */}
            {(filterStatus !== 'all' || filterKind !== 'all' || searchQuery) && (
              <div className="flex items-center gap-2 pt-2 border-t">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {searchQuery}
                    <button onClick={() => setSearchQuery('')} className="ml-1">×</button>
                  </Badge>
                )}
                {filterStatus !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Status: {filterStatus}
                    <button onClick={() => setFilterStatus('all')} className="ml-1">×</button>
                  </Badge>
                )}
                {filterKind !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Type: {formatDocumentKind(filterKind)}
                    <button onClick={() => setFilterKind('all')} className="ml-1">×</button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('all');
                    setFilterKind('all');
                  }}
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredDocuments.length} of {documents.length} documents
        </p>
      </div>

      {/* Documents List */}
      <div className="grid gap-4">
        {filteredDocuments.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-muted-foreground">
              <Filter className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No documents found</h3>
              <p className="text-sm">Try adjusting your filters or search query</p>
            </div>
          </Card>
        ) : (
          filteredDocuments.map((doc) => {
            const status = getExpirationStatus(doc.expiresAt);
            const daysLeft = Math.ceil((doc.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

            return (
              <Card key={doc.id} className="hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left side */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-5xl">{getCountryFlag(doc.country)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-semibold">
                            {formatDocumentKind(doc.kind)}
                          </h3>
                          <Badge variant={status.status === 'good' ? 'success' : status.status === 'warning' ? 'warning' : 'error'}>
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{doc.country}</p>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Expires:</span>
                            <span className="ml-2 font-medium">{formatDate(doc.expiresAt)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Issued:</span>
                            <span className="ml-2 font-medium">{formatDate(doc.issuedAt)}</span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-4">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
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
                      </div>
                    </div>

                    {/* Right side - Actions */}
                    <div className="flex flex-col gap-2">
                      <Link href={`/dashboard/documents/${doc.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      {daysLeft <= 90 && (
                        <Button size="sm" className="gradient-primary">
                          Renew Now
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
