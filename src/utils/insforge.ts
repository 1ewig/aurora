/**
 * Aurora — src/utils/insforge.ts
 *
 * Bidirectional mapper between local `/images/...` paths and InsForge
 * Storage object URLs. Routes assets to the correct storage bucket
 * based on the path prefix:
 *  - /images/products/   → product-media bucket
 *  - /images/lookbook/   → lookbook-media bucket
 *  - /images/editorial/  → editorial-media bucket
 *
 * Used by seed scripts and the admin product form to resolve local
 * asset paths to their deployed storage URLs.
 */

/** Resolves a local image path to its full InsForge Storage URL. */
export function getStorageUrl(localPath: string): string {
  if (!localPath || !localPath.startsWith('/images/')) {
    return localPath;
  }

  let bucketName = 'product-media';
  // Strip the /images/ prefix to get the bucket-relative key
  let bucketKey = localPath.replace(/^\/?images\//, '');

  if (localPath.startsWith('/images/lookbook/')) {
    bucketName = 'lookbook-media';
    bucketKey = localPath.replace(/^\/?images\/lookbook\//, '');
  } else if (localPath.startsWith('/images/editorial/')) {
    bucketName = 'editorial-media';
    bucketKey = localPath.replace(/^\/?images\/editorial\//, '');
  }

  // URI-encode each path segment to handle special characters (spaces, unicode)
  const encodedKey = bucketKey.split('/').map(encodeURIComponent).join('%2F');
  const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://4eu5wk8i.us-east.insforge.app';
  return `${insforgeUrl}/api/storage/buckets/${bucketName}/objects/${encodedKey}`;
}

/**
 * Extracts a storage object key from a full InsForge Storage URL.
 * Also handles local `/images/...` paths for backward compatibility.
 * Returns null if the URL doesn't match any known bucket pattern.
 */
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
  
  // Fallback: parse local paths directly
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

