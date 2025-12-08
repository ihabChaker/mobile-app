import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Convert localhost URLs to actual API URL for mobile devices.
 * This is necessary because the backend stores URLs with localhost
 * when running in development, but mobile devices need the actual IP.
 * For web, keep localhost URLs as-is.
 */
export const convertLocalhostUrl = (
  url: string | null | undefined
): string | null => {
  if (!url) return null;

  // For web, keep localhost URLs as-is
  if (Platform.OS === 'web') {
    // If it's a relative path, prepend localhost
    if (url.startsWith('/')) {
      return `http://localhost:3000${url}`;
    }
    return url;
  }

  const apiUrl =
    Constants.expoConfig?.extra?.apiUrl ||
    process.env.EXPO_PUBLIC_API_URL ||
    'http://localhost:3000/api/v1';

  // Extract base URL without /api/v1
  const baseUrl = apiUrl.replace('/api/v1', '');

  // If it's a relative path, prepend the base URL
  if (url.startsWith('/')) {
    const actualUrl = `${baseUrl}${url}`;
    console.log('Converted relative URL:', {
      original: url,
      actual: actualUrl,
    });
    return actualUrl;
  }

  // If URL contains localhost, replace with actual API URL
  if (url.includes('localhost:3000') || url.includes('127.0.0.1:3000')) {
    // Replace localhost with actual base URL
    const actualUrl = url
      .replace('http://localhost:3000', baseUrl)
      .replace('http://127.0.0.1:3000', baseUrl);

    console.log('Converted URL:', { original: url, actual: actualUrl });
    return actualUrl;
  }

  return url;
};

/**
 * Convert multiple URLs at once
 */
export const convertLocalhostUrls = <T extends Record<string, any>>(
  obj: T,
  urlKeys: (keyof T)[]
): T => {
  const result = { ...obj };

  urlKeys.forEach(key => {
    if (typeof result[key] === 'string') {
      result[key] = convertLocalhostUrl(result[key] as string) as T[keyof T];
    }
  });

  return result;
};
