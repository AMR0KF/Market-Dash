/**
 * Helper utility for parsing product and category image URLs
 * and prepending the API server origin when needed.
 */
export function getImageUrl(images?: any): string {
  if (!images) {
    return getFullUrl('/placeholder.png');
  }

  let imageUrl: string = '/placeholder.png';

  if (Array.isArray(images)) {
    if (images.length > 0 && typeof images[0] === 'string') {
      imageUrl = images[0];
    }
  } else if (typeof images === 'string') {
    const trimmed = images.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
          imageUrl = parsed[0];
        }
      } catch {
        imageUrl = trimmed;
      }
    } else {
      imageUrl = trimmed.split(',')[0];
    }
  }

  if (typeof imageUrl !== 'string' || !imageUrl || !imageUrl.trim()) {
    imageUrl = '/placeholder.png';
  }

  return getFullUrl(imageUrl);
}

export function getFullUrl(path: string): string {
  if (typeof path !== 'string' || !path) {
    path = '/placeholder.png';
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const apiBase = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
  const serverOrigin = apiBase.replace(/\/api\/?$/, '');

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${serverOrigin}${cleanPath}`;
}
