/**
 * The keyword index — the recurring themes of the notebook, weighted.
 *
 * Renders in two places from the same data: a short list in the right-hand
 * pane on wide screens, and the full list on `/keywords`.
 */
import React from 'react';
import { Platform, Pressable, View } from 'react-native';

import { Row, Text } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import type { Keyword } from '@/utils/keywords';

interface KeywordRowProps {
  keyword: Keyword;
  selected?: boolean;
  onPress: (term: string) => void;
}

export function KeywordRow({ keyword, selected, onPress }: KeywordRowProps) {
  const t = useTheme();
  const [hovered, setHovered] = React.useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={`${keyword.label}, in ${keyword.entries} ${
        keyword.entries === 1 ? 'entry' : 'entries'
      }`}
      onPress={() => onPress(keyword.term)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={{
        paddingVertical: t.space.xs + 2,
        paddingHorizontal: t.space.sm,
        borderRadius: t.radius.sm,
        backgroundColor: selected
          ? t.colors.accentSoft
          : hovered
            ? t.colors.wash
            : 'transparent',
        ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
      }}
    >
      <Row gap="sm" align="baseline">
        <Text
          variant="ui"
          tone={selected ? 'accent' : 'default'}
          numberOfLines={1}
          style={{ flex: 1 }}
        >
          {keyword.label}
        </Text>
        <Text variant="uiSmall" tone="faint" style={{ fontVariant: ['tabular-nums'] }}>
          {keyword.entries}
        </Text>
      </Row>

      {/*
        The bar encodes the ranking weight, which is not the same as the count
        beside it — see utils/keywords.ts. It is deliberately quiet: it is there
        to make the shape of the list scannable, not to be read precisely.
      */}
      <View
        style={{
          height: 3,
          marginTop: 4,
          borderRadius: 1,
          backgroundColor: t.colors.sunken,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            height: '100%',
            width: `${Math.max(4, keyword.relative * 100)}%`,
            backgroundColor: selected ? t.colors.accent : t.colors.hairlineStrong,
            borderRadius: 1,
          }}
        />
      </View>
    </Pressable>
  );
}

interface KeywordListProps {
  keywords: Keyword[];
  selected?: string | null;
  onSelect: (term: string) => void;
  /** Shown when the corpus is too thin to have themes yet. */
  emptyHint?: string;
}

export function KeywordList({ keywords, selected, onSelect, emptyHint }: KeywordListProps) {
  const t = useTheme();

  if (keywords.length === 0) {
    return (
      <Text variant="uiSmall" tone="faint" style={{ paddingHorizontal: t.space.sm }}>
        {emptyHint ?? 'Write a few more entries and the themes will show up here.'}
      </Text>
    );
  }

  return (
    <View style={{ gap: 2 }}>
      {keywords.map((keyword) => (
        <KeywordRow
          key={keyword.term}
          keyword={keyword}
          selected={selected === keyword.term}
          onPress={onSelect}
        />
      ))}
    </View>
  );
}
