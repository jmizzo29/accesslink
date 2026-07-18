const BASE_URL = 'https://accessibility-cloud-v2.freetls.fastly.net';

export function isAccessibilityCloudConfigured(): boolean {
  const token = import.meta.env.VITE_ACCESSIBILITY_CLOUD_TOKEN?.trim();
  if (!token) return false;
  if (token.includes('YOUR_APP_TOKEN') || token === 'your-app-token') return false;
  return true;
}

export function getAccessibilityCloudToken(): string | null {
  if (!isAccessibilityCloudConfigured()) return null;
  return import.meta.env.VITE_ACCESSIBILITY_CLOUD_TOKEN.trim();
}

export async function fetchAccessibilityCloud<T>(
  path: string,
  params: Record<string, string | number | undefined>,
): Promise<T> {
  const token = getAccessibilityCloudToken();
  if (!token) {
    throw new Error('accessibility.cloud is not configured');
  }

  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set('appToken', token);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`accessibility.cloud request failed (${res.status})`);
  }

  return res.json() as Promise<T>;
}
