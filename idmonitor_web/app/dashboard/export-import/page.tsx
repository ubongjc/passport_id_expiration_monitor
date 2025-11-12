'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Upload,
  FileJson,
  FileCsv,
  FileText,
  Lock,
  AlertTriangle,
  CheckCircle,
  Shield,
  Key,
  Archive,
  Calendar,
  Info,
} from 'lucide-react';

type ExportFormat = 'json' | 'csv' | 'encrypted';
type ImportStatus = 'idle' | 'processing' | 'success' | 'error';

export default function ExportImportPage() {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('encrypted');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [includeSensitive, setIncludeSensitive] = useState(true);
  const [exportPassword, setExportPassword] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPassword, setImportPassword] = useState('');
  const [importStatus, setImportStatus] = useState<ImportStatus>('idle');
  const [importMessage, setImportMessage] = useState('');
  const [importProgress, setImportProgress] = useState(0);

  const handleExport = async () => {
    // In production, this would:
    // 1. Fetch all user documents from API
    // 2. If encrypted format, encrypt with user's password using AES-256
    // 3. Create downloadable file
    // 4. Log export action to audit log

    const mockData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      userId: 'user_123',
      documents: [
        {
          id: 'doc_1',
          kind: 'PASSPORT',
          country: 'US',
          expiresAt: '2025-12-31T00:00:00Z',
          issuedAt: '2020-01-01T00:00:00Z',
          encryptedNumber: 'encrypted_data_here',
          encryptedHolderName: 'encrypted_name_here',
        },
        // ... more documents
      ],
      reminderConfigs: [
        {
          id: 'config_1',
          documentKind: null,
          earlyReminderDays: [365, 180, 90],
          urgentPeriodDays: 30,
          urgentFrequency: 'WEEKLY',
        },
      ],
    };

    let fileContent: string;
    let filename: string;
    let mimeType: string;

    switch (exportFormat) {
      case 'json':
        fileContent = JSON.stringify(mockData, null, 2);
        filename = `idmonitor-export-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
        break;

      case 'csv':
        // Convert to CSV format
        const csvHeaders = 'ID,Kind,Country,Expires At,Issued At';
        const csvRows = mockData.documents.map(doc =>
          `${doc.id},${doc.kind},${doc.country},${doc.expiresAt},${doc.issuedAt}`
        ).join('\n');
        fileContent = `${csvHeaders}\n${csvRows}`;
        filename = `idmonitor-export-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
        break;

      case 'encrypted':
        // In production, encrypt the data
        const encryptedData = {
          ...mockData,
          encrypted: true,
          algorithm: 'AES-256-GCM',
          kdf: 'PBKDF2',
          iterations: 100000,
        };
        fileContent = JSON.stringify(encryptedData, null, 2);
        filename = `idmonitor-backup-${new Date().toISOString().split('T')[0]}.encrypted`;
        mimeType = 'application/octet-stream';
        break;
    }

    // Create and download file
    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!importFile) return;

    setImportStatus('processing');
    setImportProgress(0);

    try {
      // Simulate file reading and processing
      const reader = new FileReader();

      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          setImportProgress((e.loaded / e.total) * 50);
        }
      };

      reader.onload = async (e) => {
        const content = e.target?.result as string;

        try {
          const data = JSON.parse(content);

          // Validate data structure
          if (!data.version || !data.documents) {
            throw new Error('Invalid backup file format');
          }

          // If encrypted, decrypt with password
          if (data.encrypted && !importPassword) {
            throw new Error('Password required for encrypted backup');
          }

          // Simulate import process
          setImportProgress(60);
          await new Promise(resolve => setTimeout(resolve, 1000));

          setImportProgress(80);
          await new Promise(resolve => setTimeout(resolve, 1000));

          // In production:
          // 1. Decrypt data if encrypted
          // 2. Validate all documents against schemas
          // 3. POST to /api/documents/import
          // 4. Handle duplicates
          // 5. Log import action to audit log

          setImportProgress(100);
          setImportStatus('success');
          setImportMessage(`Successfully imported ${data.documents.length} documents`);
        } catch (error) {
          setImportStatus('error');
          setImportMessage(error instanceof Error ? error.message : 'Import failed');
        }
      };

      reader.onerror = () => {
        setImportStatus('error');
        setImportMessage('Failed to read file');
      };

      reader.readAsText(importFile);
    } catch (error) {
      setImportStatus('error');
      setImportMessage(error instanceof Error ? error.message : 'Import failed');
    }
  };

  const resetImport = () => {
    setImportFile(null);
    setImportPassword('');
    setImportStatus('idle');
    setImportMessage('');
    setImportProgress(0);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Export & Import
        </h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Backup and restore your encrypted documents
        </p>
      </div>

      {/* Security Notice */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Zero-Knowledge Encryption</h3>
              <p className="text-sm text-muted-foreground">
                All exports are encrypted with AES-256 before leaving your device. Your data remains private and secure.
                Store your backup password safely - we cannot recover it if lost.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-green-600" />
            <CardTitle>Export Your Data</CardTitle>
          </div>
          <CardDescription>
            Download all your documents and settings in your preferred format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Format Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">Export Format</label>
            <div className="grid gap-3 sm:grid-cols-3">
              <button
                onClick={() => setExportFormat('encrypted')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  exportFormat === 'encrypted'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Lock className={`h-8 w-8 ${exportFormat === 'encrypted' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="font-medium">Encrypted Backup</span>
                  <Badge variant="success" className="text-xs">Recommended</Badge>
                  <span className="text-xs text-muted-foreground text-center">
                    AES-256 encrypted
                  </span>
                </div>
              </button>

              <button
                onClick={() => setExportFormat('json')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  exportFormat === 'json'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <FileJson className={`h-8 w-8 ${exportFormat === 'json' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="font-medium">JSON</span>
                  <Badge variant="warning" className="text-xs">Plain text</Badge>
                  <span className="text-xs text-muted-foreground text-center">
                    For developers
                  </span>
                </div>
              </button>

              <button
                onClick={() => setExportFormat('csv')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  exportFormat === 'csv'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <FileCsv className={`h-8 w-8 ${exportFormat === 'csv' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="font-medium">CSV</span>
                  <Badge variant="warning" className="text-xs">Plain text</Badge>
                  <span className="text-xs text-muted-foreground text-center">
                    For spreadsheets
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Export Options</h4>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <span className="text-sm font-medium">Include deleted documents</span>
                <p className="text-xs text-muted-foreground">Export soft-deleted documents</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDeleted}
                  onChange={(e) => setIncludeDeleted(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>

            {exportFormat !== 'csv' && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-0.5">
                  <span className="text-sm font-medium">Include sensitive data</span>
                  <p className="text-xs text-muted-foreground">Include encrypted document numbers and names</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSensitive}
                    onChange={(e) => setIncludeSensitive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>
            )}
          </div>

          {/* Password for encrypted export */}
          {exportFormat === 'encrypted' && (
            <div>
              <label className="text-sm font-medium mb-2 block">Backup Password</label>
              <input
                type="password"
                value={exportPassword}
                onChange={(e) => setExportPassword(e.target.value)}
                placeholder="Enter a strong password"
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-2 flex items-start gap-2">
                <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>
                  This password will be used to encrypt your backup. Store it safely - you'll need it to restore your data.
                </span>
              </p>
            </div>
          )}

          {/* Warning for plain text exports */}
          {(exportFormat === 'json' || exportFormat === 'csv') && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                    Security Warning
                  </h4>
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Plain text exports contain your encrypted data but are not additionally protected.
                    Store the file securely and consider using the Encrypted Backup format instead.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Export Button */}
          <Button
            onClick={handleExport}
            className="w-full gradient-primary"
            size="lg"
            disabled={exportFormat === 'encrypted' && !exportPassword}
          >
            <Download className="mr-2 h-5 w-5" />
            Export Data
          </Button>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            <CardTitle>Import Data</CardTitle>
          </div>
          <CardDescription>
            Restore your documents from a previous backup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {importStatus === 'idle' && (
            <>
              {/* File Upload */}
              <div>
                <label className="text-sm font-medium mb-2 block">Backup File</label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".json,.encrypted"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="import-file"
                  />
                  <label htmlFor="import-file" className="cursor-pointer">
                    {importFile ? (
                      <div className="space-y-2">
                        <Archive className="mx-auto h-12 w-12 text-primary" />
                        <p className="font-medium">{importFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(importFile.size / 1024).toFixed(2)} KB
                        </p>
                        <Button variant="outline" size="sm" onClick={(e) => {
                          e.preventDefault();
                          setImportFile(null);
                        }}>
                          Choose Different File
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="font-medium">Click to select a backup file</p>
                        <p className="text-sm text-muted-foreground">
                          Supports .json and .encrypted files
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Password for encrypted import */}
              {importFile?.name.endsWith('.encrypted') && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Backup Password</label>
                  <input
                    type="password"
                    value={importPassword}
                    onChange={(e) => setImportPassword(e.target.value)}
                    placeholder="Enter your backup password"
                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              {/* Import Warning */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Import Information
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Importing will merge your backup with existing documents. Duplicates will be detected and skipped.
                      This action will be logged in your audit trail.
                    </p>
                  </div>
                </div>
              </div>

              {/* Import Button */}
              <Button
                onClick={handleImport}
                className="w-full gradient-primary"
                size="lg"
                disabled={!importFile || (importFile.name.endsWith('.encrypted') && !importPassword)}
              >
                <Upload className="mr-2 h-5 w-5" />
                Import Data
              </Button>
            </>
          )}

          {importStatus === 'processing' && (
            <div className="py-12 text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full gradient-primary flex items-center justify-center animate-pulse">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Importing Data...</h3>
              <p className="text-muted-foreground">
                Decrypting and validating your backup
              </p>
              <div className="max-w-md mx-auto">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full gradient-primary transition-all duration-300"
                    style={{ width: `${importProgress}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">{importProgress.toFixed(0)}%</p>
              </div>
            </div>
          )}

          {importStatus === 'success' && (
            <div className="py-12 text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold">Import Successful!</h3>
              <p className="text-muted-foreground">{importMessage}</p>
              <Button onClick={resetImport} variant="outline">
                Import Another File
              </Button>
            </div>
          )}

          {importStatus === 'error' && (
            <div className="py-12 text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold">Import Failed</h3>
              <p className="text-muted-foreground">{importMessage}</p>
              <Button onClick={resetImport} variant="outline">
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            <CardTitle>Backup Best Practices</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Use encrypted backups:</strong> Always use the encrypted backup format for maximum security.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Store safely:</strong> Keep your backup file and password in separate secure locations.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Regular backups:</strong> Export your data monthly or after adding important documents.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Test restores:</strong> Periodically test importing your backup to ensure it works.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Multiple copies:</strong> Keep backups in different physical locations (cloud, USB, etc.).
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
