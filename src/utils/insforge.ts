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
