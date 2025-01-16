
import FingerprintJS from '@fingerprintjs/fingerprintjs';

let fingerprint: string | null = null;

export async function getBrowserFingerprint(): Promise<string> {
  if (fingerprint) return fingerprint;
  
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  fingerprint = result.visitorId;
  return fingerprint;
}
