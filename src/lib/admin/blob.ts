import { del } from '@vercel/blob';

/**
 * Safely deletes a file from Vercel Blob by its URL.
 * Does not throw if the file is already missing.
 */
export async function deleteBlob(url: string): Promise<boolean> {
  if (!url || !url.includes('public.blob.vercel-storage.com')) {
    return false;
  }

  try {
    await del(url);
    return true;
  } catch (error) {
    console.error('Failed to delete blob:', error);
    return false;
  }
}
