import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { prisma } from '@/backend/db/prisma';
import { writeAuditLog } from '@/lib/admin/audit';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Authenticate the upload request
        const session = await requireAdmin();

        let width = null;
        let height = null;
        let filename = pathname;
        let sizeBytes = 0;

        if (clientPayload) {
          try {
            const parsed = JSON.parse(clientPayload);
            if (typeof parsed.width === 'number') width = parsed.width;
            if (typeof parsed.height === 'number') height = parsed.height;
            if (typeof parsed.filename === 'string') filename = parsed.filename;
            if (typeof parsed.size === 'number') sizeBytes = parsed.size;
          } catch (e) {
            console.error('Failed to parse clientPayload:', e);
          }
        }

        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
          maximumSizeInBytes: 8 * 1024 * 1024, // 8MB
          tokenPayload: JSON.stringify({
            userId: session.user.id,
            userEmail: session.user.email,
            width,
            height,
            filename,
            sizeBytes,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Parse token payload
        let uploaderId = 'unknown';
        let uploaderEmail = 'unknown';
        let width = null;
        let height = null;
        let filename = blob.pathname;
        let sizeBytes = 0;

        if (tokenPayload) {
          try {
            const parsedToken = JSON.parse(tokenPayload);
            uploaderId = parsedToken.userId;
            uploaderEmail = parsedToken.userEmail;
            width = parsedToken.width;
            height = parsedToken.height;
            if (parsedToken.filename) filename = parsedToken.filename;
            if (typeof parsedToken.sizeBytes === 'number') sizeBytes = parsedToken.sizeBytes;
          } catch (e) {
            console.error('Failed to parse tokenPayload:', e);
          }
        }

        try {
          // Write the DB row
          const asset = await prisma.mediaAsset.create({
            data: {
              url: blob.url,
              pathname: blob.pathname,
              filename,
              mimeType: blob.contentType,
              sizeBytes,
              width,
              height,
              uploadedById: uploaderId,
            },
          });

          // Audit
          await writeAuditLog({
            actorId: uploaderId,
            actorEmail: uploaderEmail,
            action: 'CREATE',
            entityType: 'MediaAsset',
            entityId: asset.id,
            diff: { url: blob.url },
          });

        } catch (error) {
          console.error('Failed to create media asset in DB:', error);
          // In a fully robust system we might try to delete the blob here if the DB fails
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Error handling upload:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 } // The webhook will fail if we return 500, so we return 400 for client errors usually
    );
  }
}
