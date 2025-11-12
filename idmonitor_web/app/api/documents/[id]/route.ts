/**
 * Identity Document Detail API
 * GET /api/documents/[id] - Get single document (with encrypted fields)
 * PATCH /api/documents/[id] - Update document
 * DELETE /api/documents/[id] - Soft delete document
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateUser, logAudit } from '@/lib/auth';
import { z } from 'zod';

const updateDocumentSchema = z.object({
  renewalStatus: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED']).optional(),
  expiresAt: z.string().datetime().optional(),
});

/**
 * GET /api/documents/[id]
 * Get document with encrypted fields for client-side decryption
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUser();
    const { id } = await params;

    const document = await prisma.identityDocument.findFirst({
      where: {
        id,
        userId: user.id,
        deletedAt: null,
      },
      include: {
        renewalKits: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Log access
    await logAudit({
      userId: user.id,
      action: 'DOCUMENT_VIEWED',
      resource: `IdentityDocument:${document.id}`,
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
    });

    return NextResponse.json({ document });

  } catch (error) {
    console.error('Failed to get document:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/documents/[id]
 * Update document metadata
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUser();
    const { id } = await params;
    const body = await req.json();
    const data = updateDocumentSchema.parse(body);

    // Verify ownership
    const existing = await prisma.identityDocument.findFirst({
      where: {
        id,
        userId: user.id,
        deletedAt: null,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Update document
    const document = await prisma.identityDocument.update({
      where: { id },
      data: {
        renewalStatus: data.renewalStatus,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      },
    });

    // Log update
    await logAudit({
      userId: user.id,
      action: 'DOCUMENT_UPDATED',
      resource: `IdentityDocument:${document.id}`,
      metadata: data,
    });

    return NextResponse.json({ document });

  } catch (error) {
    console.error('Failed to update document:', error);

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
 * DELETE /api/documents/[id]
 * Soft delete document (compliance requirement)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUser();
    const { id } = await params;

    // Verify ownership
    const existing = await prisma.identityDocument.findFirst({
      where: {
        id,
        userId: user.id,
        deletedAt: null,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.identityDocument.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Cancel scheduled reminders
    await prisma.scheduledReminder.deleteMany({
      where: {
        documentId: id,
        sentAt: null,
      },
    });

    // Log deletion
    await logAudit({
      userId: user.id,
      action: 'DOCUMENT_DELETED',
      resource: `IdentityDocument:${id}`,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Failed to delete document:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
