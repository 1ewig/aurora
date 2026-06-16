/**
 * Aurora — src/utils/insforge.ts
 *
 * Maps local `/images/...` paths to InsForge Storage object URLs and vice versa.
 * Routes assets to the correct bucket based on path prefix (product, lookbook, editorial).
 */

/** Resolves a local image path to its full InsForge Storage URL. */
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

/** Extracts a storage object key from a full InsForge Storage URL. Falls back to local path parsing. */
export function getStorageKeyFromUrl(url: string): string | null {
  if (!url) return null;
  
  const prefixes = [
    '/api/storage/buckets/product-media/objects/',
    '/api/storage/buckets/lookbook-media/objects/',
    '/api/storage/buckets/editorial-media/objects/'
  ];
  for (const prefix of prefixes) {
    const index = url.indexOf(prefix);
    if (index !== -1) {
      const encodedKey = url.substring(index + prefix.length).split('?')[0];
      try {
        return decodeURIComponent(encodedKey);
      } catch {
        return encodedKey;
      }
    }
  }
  
  if (url.startsWith('/images/')) {
    if (url.startsWith('/images/lookbook/')) {
      return url.replace(/^\/images\/lookbook\//, '');
    } else if (url.startsWith('/images/editorial/')) {
      return url.replace(/^\/images\/editorial\//, '');
    }
    return url.replace(/^\/images\//, '');
  }
  
  return null;
}

