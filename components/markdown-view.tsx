import { useColorScheme } from '@/hooks/use-color-scheme';
import { openUrl } from '@/utils/url-utils';
import React from 'react';
import { StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';

interface MarkdownViewProps {
  text: string;
  style?: any;
}

/**
 * Convert plain URLs in text to markdown links with condensed format
 */
function processUrlsToMarkdown(text: string): string {
  if (!text) return '';
  
  // First, protect existing markdown links by temporarily replacing them
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const protectedLinks: string[] = [];
  let protectedText = text.replace(markdownLinkRegex, (match) => {
    protectedLinks.push(match);
    return `__PROTECTED_LINK_${protectedLinks.length - 1}__`;
  });
  
  // Now find and replace plain URLs
  const urlRegex = /https?:\/\/[^\s]+/gi;
  let linkCounter = 0;
  protectedText = protectedText.replace(urlRegex, (url) => {
    linkCounter++;
    return `[[${linkCounter}]](${url})`;
  });
  
  // Restore protected markdown links
  protectedText = protectedText.replace(/__PROTECTED_LINK_(\d+)__/g, (match, index) => {
    return protectedLinks[parseInt(index)];
  });
  
  return protectedText;
}

/**
 * Component that renders markdown text with proper formatting and auto-converts URLs
 */
export function MarkdownView({ text, style }: MarkdownViewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!text) {
    return null;
  }

  // Pre-process text to convert plain URLs to markdown links
  const processedText = processUrlsToMarkdown(text);

  const markdownStyles = {
    body: {
      color: isDark ? '#fff' : '#000',
      fontSize: 14,
      lineHeight: 20,
      ...style,
    },
    link: {
      color: isDark ? '#5AC8FA' : '#007AFF',
      backgroundColor: isDark ? '#1a3a5c' : '#e6f2ff',
      fontWeight: '600',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    text: {
      color: isDark ? '#fff' : '#000',
    },
    strong: {
      fontWeight: '600',
      color: isDark ? '#fff' : '#000',
    },
    em: {
      fontStyle: 'italic',
      color: isDark ? '#fff' : '#000',
    },
    code_inline: {
      backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
      color: isDark ? '#5AC8FA' : '#007AFF',
      fontFamily: 'monospace',
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 3,
    },
    code_block: {
      backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
      color: isDark ? '#fff' : '#000',
      fontFamily: 'monospace',
      padding: 8,
      borderRadius: 6,
    },
    fence: {
      backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
      color: isDark ? '#fff' : '#000',
      fontFamily: 'monospace',
      padding: 8,
      borderRadius: 6,
    },
  };

  return (
    <Markdown
      style={markdownStyles}
      onLinkPress={(url) => {
        openUrl(url);
        return false;
      }}
    >
      {processedText}
    </Markdown>
  );
}

const styles = StyleSheet.create({});

