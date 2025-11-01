import { useColorScheme } from '@/hooks/use-color-scheme';
import { openUrl, parseTextWithUrls } from '@/utils/url-utils';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface ParsedTextViewProps {
  text: string;
  style?: any;
}

/**
 * Component that renders text with clickable, condensed URLs
 */
export function ParsedTextView({ text, style }: ParsedTextViewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { segments } = parseTextWithUrls(text);

  if (segments.length === 0) {
    return null;
  }

  // Get text color from style or use themed default
  const textColor = style?.color || (isDark ? '#fff' : '#000');

  return (
    <Text style={[style, { color: textColor }]}>
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return (
            <Text key={index} style={[style, { color: textColor }]}>
              {segment.content}
            </Text>
          );
        } else {
          return (
            <TouchableOpacity
              key={index}
              onPress={() => segment.url && openUrl(segment.url)}
              style={styles.linkContainer}
            >
              <Text
                style={[
                  styles.link,
                  {
                    color: isDark ? '#5AC8FA' : '#007AFF',
                    backgroundColor: isDark ? '#1a3a5c' : '#e6f2ff',
                  },
                ]}
              >
                {segment.content}
              </Text>
            </TouchableOpacity>
          );
        }
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  linkContainer: {
    display: 'inline-flex',
  },
  link: {
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginHorizontal: 2,
  },
});

