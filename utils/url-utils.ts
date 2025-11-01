import { Linking } from 'react-native';

export interface ParsedContent {
  type: 'text' | 'link';
  content: string;
  url?: string;
  linkNumber?: number;
}

/**
 * Parse text and extract URLs, replacing them with condensed [1], [2], etc.
 */
export function parseTextWithUrls(text: string): {
  segments: ParsedContent[];
  urls: string[];
} {
  if (!text) {
    return { segments: [], urls: [] };
  }

  // Regex to match URLs (http, https)
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const urls: string[] = [];
  const segments: ParsedContent[] = [];
  
  let lastIndex = 0;
  let match;
  let linkCounter = 0;

  while ((match = urlRegex.exec(text)) !== null) {
    const url = match[0];
    const startIndex = match.index;

    // Add text before the URL
    if (startIndex > lastIndex) {
      const textBefore = text.substring(lastIndex, startIndex);
      if (textBefore.trim()) {
        segments.push({
          type: 'text',
          content: textBefore,
        });
      }
    }

    // Add the URL as a link segment
    linkCounter++;
    urls.push(url);
    segments.push({
      type: 'link',
      content: `[${linkCounter}]`,
      url: url,
      linkNumber: linkCounter,
    });

    lastIndex = startIndex + url.length;
  }

  // Add remaining text after last URL
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    if (remainingText.trim()) {
      segments.push({
        type: 'text',
        content: remainingText,
      });
    }
  }

  // If no URLs found, return the original text
  if (segments.length === 0 && text.trim()) {
    segments.push({
      type: 'text',
      content: text,
    });
  }

  return { segments, urls };
}

/**
 * Open a URL in the device's browser
 */
export async function openUrl(url: string): Promise<void> {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.error(`Cannot open URL: ${url}`);
    }
  } catch (error) {
    console.error('Error opening URL:', error);
  }
}

/**
 * Get a shortened display version of a URL
 */
export function getShortenedUrl(url: string, maxLength: number = 40): string {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    const path = urlObj.pathname + urlObj.search;
    
    if (path.length <= 1) {
      return domain;
    }
    
    const fullUrl = domain + path;
    if (fullUrl.length <= maxLength) {
      return fullUrl;
    }
    
    return domain + path.substring(0, maxLength - domain.length - 3) + '...';
  } catch {
    return url.length > maxLength ? url.substring(0, maxLength - 3) + '...' : url;
  }
}

