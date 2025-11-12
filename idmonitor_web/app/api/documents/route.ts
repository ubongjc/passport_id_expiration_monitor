/**
 * Identity Documents API
 * POST /api/documents - Create new document (encrypted)
 * GET /api/documents - List user's documents
 *
 * OpenAPI Documentation:
 * - All sensitive fields are encrypted client-side
 * - Server only receives/stores ciphertext
 * - Each document has unique salt and IV
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateUser, logAudit, checkRateLimit } from '@/lib/auth';
import { scheduleRemindersForDocument } from '@/lib/reminders';
import { z } from 'zod';
import { DocumentKind } from '@prisma/client';

// Request validation schema
const createDocumentSchema = z.object({
  kind: z.enum(['PASSPORT', 'NATIONAL_ID', 'DRIVERS_LICENSE', 'RESIDENCE_PERMIT', 'VISA']),
  country: z.string().length(2), // ISO 3166-1 alpha-2
  issuedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime(),

  // Encrypted fields (server never sees plaintext)
  encryptedNumber: z.string(),
  encryptedHolderName: z.string(),
  encryptedMRZData: z.string().optional(),

  // Encryption metadata
  encryptionIV: z.string(),
  encryptionSalt: z.string(),

  // Optional scan upload (also encrypted)
  scanStorageKey: z.string().optional(),
});

/**
 * POST /api/documents
 * Create a new identity document
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
    const canProceed = await checkRateLimit(ip, 10, 60000); // 10 requests per minute

    if (!canProceed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Authenticate user
    const user = await getOrCreateUser();

    // Parse and validate request
    const body = await req.json();
    const data = createDocumentSchema.parse(body);

    // Create document in database
    const document = await prisma.identityDocument.create({
      data: {
        userId: user.id,
        kind: data.kind as DocumentKind,
        country: data.country,
        issuedAt: data.issuedAt ? new Date(data.issuedAt) : null,
        expiresAt: new Date(data.expiresAt),
        encryptedNumber: data.encryptedNumber,
        encryptedHolderName: data.encryptedHolderName,
        encryptedMRZData: data.encryptedMRZData,
        encryptionIV: data.encryptionIV,
        encryptionSalt: data.encryptionSalt,
        scanStorageKey: data.scanStorageKey,
        scanUploadedAt: data.scanStorageKey ? new Date() : null,
      },
    });

    // Schedule reminders
    await scheduleRemindersForDocument(
      document.id,
      user.id,
      document.expiresAt,
      document.kind
    );

    // Audit log
    await logAudit({
      userId: user.id,
      action: 'DOCUMENT_CREATED',
      resource: `IdentityDocument:${document.id}`,
      metadata: {
        kind: document.kind,
        country: document.country,
      },
      ipAddress: ip,
      userAgent: req.headers.get('user-agent') ?? undefined,
    });

    return NextResponse.json({
      id: document.id,
      kind: document.kind,
      country: document.country,
      issuedAt: document.issuedAt,
      expiresAt: document.expiresAt,
      createdAt: document.createdAt,
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create document:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/documents
 * List user's documents
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getOrCreateUser();

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const kind = searchParams.get('kind') as DocumentKind | null;

    // Build query
    const where: any = {
      userId: user.id,
      deletedAt: null,
    };

    if (kind) {
      where.kind = kind;
    }

    // Fetch documents
    const documents = await prisma.identityDocument.findMany({
      where,
      orderBy: { expiresAt: 'asc' },
      select: {
        id: true,
        kind: true,
        country: true,
        issuedAt: true,
        expiresAt: true,
        renewalStatus: true,
        createdAt: true,
        updatedAt: true,
        // Note: encrypted fields are NOT included in list view for performance
        // Client must fetch individual document to decrypt
      },
    });

    return NextResponse.json({ documents });

  } catch (error) {
    console.error('Failed to list documents:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
