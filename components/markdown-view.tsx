/**
 * Markdown rendering for entry content.
 *
 * Plain URLs pasted into an entry are condensed to numbered link chips —
 * [1], [2] — so a wall of raw URLs does not wreck the measure. Existing
 * markdown links are left alone.
 */
import React, { useMemo } from 'react';
import type { TextStyle } from 'react-native';
import Markdown from 'react-native-markdown-display';

import { useTheme } from '@/hooks/use-theme';
import { openUrl } from '@/utils/url-utils';

interface MarkdownViewProps {
  text: string;
  /** Body size override — defaults to the `body` type token. */
  variant?: 'body' | 'bodyLarge';
}

const MD_LINK = /\[([^\]]+)\]\(([^)]+)\)/g;
const BARE_URL = /https?:\/\/[^\s)]+/gi;
const PLACEHOLDER = /@@LINK(\d+)@@/g;

/** Replace bare URLs with numbered markdown links, protecting existing ones. */
function condenseUrls(text: string): string {
  if (!text) return '';

  const kept: string[] = [];
  let out = text.replace(MD_LINK, (match) => {
    kept.push(match);
    return `@@LINK${kept.length - 1}@@`;
  });

  let n = 0;
  out = out.replace(BARE_URL, (url) => `[[${++n}]](${url})`);

  return out.replace(PLACEHOLDER, (_, i) => kept[Number(i)]);
}

export function MarkdownView({ text, variant = 'body' }: MarkdownViewProps) {
  const t = useTheme();

  const styles = useMemo(
    () => ({
      body: { ...t.type[variant], color: t.colors.ink } as TextStyle,
      paragraph: { marginTop: 0, marginBottom: t.space.md },
      link: {
        color: t.colors.accent,
        backgroundColor: t.colors.accentSoft,
        borderRadius: t.radius.sm,
        paddingHorizontal: 4,
        fontWeight: '600',
      } as TextStyle,
      strong: { fontWeight: '600', color: t.colors.ink } as TextStyle,
      em: { fontStyle: 'italic' } as TextStyle,
      bullet_list: { marginBottom: t.space.md },
      ordered_list: { marginBottom: t.space.md },
      heading1: { ...t.type.heading, color: t.colors.ink, marginBottom: t.space.sm } as TextStyle,
      heading2: { ...t.type.subhead, color: t.colors.ink, marginBottom: t.space.sm } as TextStyle,
      heading3: { ...t.type.subhead, color: t.colors.ink, marginBottom: t.space.xs } as TextStyle,
      blockquote: {
        backgroundColor: 'transparent',
        borderLeftWidth: 2,
        borderLeftColor: t.colors.hairlineStrong,
        paddingLeft: t.space.md,
        marginLeft: 0,
      },
      /*
       * Inline code inherits the paragraph's size and leading and changes only
       * family and colour. Spreading the `mono` token here would drop a 12.5/20
       * run into a 15/25 line and visibly break the baseline, and inline
       * padding does not lay out cleanly in React Native text.
       */
      code_inline: {
        fontFamily: t.type.mono.fontFamily,
        color: t.colors.accent,
        // react-native-markdown-display ships a bordered, padded default for
        // this node. Omitting a property keeps the library's value, so each
        // one has to be zeroed explicitly.
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: 0,
      } as TextStyle,
      code_block: {
        ...t.type.mono,
        backgroundColor: t.colors.sunken,
        color: t.colors.ink,
        borderWidth: 1,
        borderColor: t.colors.hairline,
        borderRadius: t.radius.md,
        padding: t.space.md,
      } as TextStyle,
      fence: {
        ...t.type.mono,
        backgroundColor: t.colors.sunken,
        color: t.colors.ink,
        borderWidth: 1,
        borderColor: t.colors.hairline,
        borderRadius: t.radius.md,
        padding: t.space.md,
      } as TextStyle,
      hr: { backgroundColor: t.colors.hairline, height: 1 },
    }),
    [t, variant]
  );

  if (!text) return null;

  return (
    <Markdown
      style={styles as any}
      onLinkPress={(url) => {
        openUrl(url);
        return false;
      }}
    >
      {condenseUrls(text)}
    </Markdown>
  );
}
