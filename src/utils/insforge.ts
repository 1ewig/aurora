import { createClient } from '@insforge/sdk';

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

if (!baseUrl || !anonKey) {
  console.warn("Warning: InsForge environment variables (NEXT_PUBLIC_INSFORGE_URL or NEXT_PUBLIC_INSFORGE_ANON_KEY) are missing.");
}

export const insforge = createClient({
  baseUrl: baseUrl || '',
  anonKey: anonKey || '',
});

export function getStorageUrl(localPath: string): string {
  if (!localPath || !localPath.startsWith('/images/')) {
    return localPath;
  }
  const bucketKey = localPath.replace(/^\/?images\//, '');
  const encodedKey = bucketKey.split('/').map(encodeURIComponent).join('%2F');
  const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://4eu5wk8i.us-east.insforge.app';
  return `${insforgeUrl}/api/storage/buckets/product-media/objects/${encodedKey}`;
}

