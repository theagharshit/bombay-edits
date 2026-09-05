import { NextRequest } from 'next/server';
import { GuestSessionModel } from '@/backend/models/guestSessionModel';
import { ApiResponse } from '@/backend/utils/apiResponse';

export async function POST(_req: NextRequest) {
  try {
    const result = await GuestSessionModel.cleanupExpiredSessions();
    return ApiResponse.success(result, {
      message: `Cleaned up ${result.deletedCount} inactive guest session(s) older than 30 days.`,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to execute cleanup';
    return ApiResponse.error(errorMsg, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
