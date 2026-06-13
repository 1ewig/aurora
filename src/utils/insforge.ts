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
  
  let bucketName = 'product-media';
  let bucketKey = localPath.replace(/^\/?images\//, '');

  if (localPath.startsWith('/images/lookbook/')) {
    bucketName = 'lookbook-media';
    bucketKey = localPath.replace(/^\/?images\/lookbook\//, '');
  } else if (localPath.startsWith('/images/editorial/')) {
    bucketName = 'editorial-media';
    bucketKey = localPath.replace(/^\/?images\/editorial\//, '');
  }

  const encodedKey = bucketKey.split('/').map(encodeURIComponent).join('%2F');
  const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://4eu5wk8i.us-east.insforge.app';
  return `${insforgeUrl}/api/storage/buckets/${bucketName}/objects/${encodedKey}`;
}

