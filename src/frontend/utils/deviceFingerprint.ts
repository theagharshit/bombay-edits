/**
 * Browser & Device Fingerprint Generator
 * Produces a stable, unique identifier for the user's browser/device.
 * Combines hardware, display, locale, and persistent client seeds.
 */

let cachedFingerprint: string | null = null;

function simpleHash(str: string): string {
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c64e6d ^ 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

export function getDeviceFingerprint(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  if (cachedFingerprint) {
    return cachedFingerprint;
  }

  try {
    const existing = localStorage.getItem('tbe_device_fingerprint');
    if (existing && existing.startsWith('dfp_')) {
      cachedFingerprint = existing;
      return existing;
    }

    // Retrieve or create persistent device seed
    let seed = localStorage.getItem('tbe_device_seed');
    if (!seed) {
      seed = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem('tbe_device_seed', seed);
    }

    const screenData = window.screen
      ? `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth || 24}`
      : 'no-screen';
    const dpr = window.devicePixelRatio || 1;
    const timeZone = Intl?.DateTimeFormat?.()?.resolvedOptions?.()?.timeZone || 'UTC';
    const lang = navigator.language || 'en';
    const ua = navigator.userAgent || 'unknown-ua';
    const concurrency = navigator.hardwareConcurrency || 4;

    const raw = `${seed}::${ua}::${screenData}::${dpr}::${timeZone}::${lang}::${concurrency}`;
    const hash = simpleHash(raw);
    const fingerprint = `dfp_${hash}`;

    localStorage.setItem('tbe_device_fingerprint', fingerprint);
    cachedFingerprint = fingerprint;

    // Set cookie as well so HTTP requests pass it along natively
    document.cookie = `guest_device_fingerprint=${fingerprint}; path=/; max-age=2592000; SameSite=Lax`;

    return fingerprint;
  } catch {
    return '';
  }
}
