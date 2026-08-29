/**
 * The full keyword index — every recurring theme in the notebook.
 *
 * The right-hand pane on the home screen shows the top of this list; this is
 * the whole thing, and it is what makes the index reachable on a narrow window
 * where that pane never appears.
 */
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';

import { KeywordRow } from '@/components/index/keyword-index';
import { AppShell } from '@/components/shell/app-shell';
import { Button, Text } from '@/components/ui';
import { useLogs } from '@/contexts/logs-context';
import { useLayout, useTheme } from '@/hooks/use-theme';
import { keywordIndex } from '@/utils/keywords';
import { getIndex } from '@/utils/search';

/** Wide enough for two or three columns of keywords, unlike a reading column. */
const COLUMN_MIN = 240;

export default function KeywordsScreen() {
  const t = useTheme();
  const l = useLayout();
  const router = useRouter();
  const { logs, loading } = useLogs();

  const index = useMemo(() => getIndex(logs), [logs]);
  const keywords = useMemo(() => keywordIndex(index, { limit: 120 }), [index]);

  const available = Math.min(l.width - l.gutter * 2, t.layout.measureWide);
  const columns = Math.max(1, Math.floor(available / COLUMN_MIN));

  return (
    <AppShell
      barLeading={
        <Button
          variant="ghost"
          size="sm"
          icon="arrow-back"
          label={l.isMedium ? 'All entries' : undefined}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          accessibilityLabel="Back to all entries"
        />
      }
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: l.gutter,
          paddingTop: t.space.xl,
          paddingBottom: t.space.huge,
        }}
      >
        <View style={{ width: '100%', maxWidth: t.layout.measureWide, alignSelf: 'center' }}>
          <Text variant="display">Index</Text>
          <Text
            variant="body"
            tone="muted"
            style={{ marginTop: t.space.sm, marginBottom: t.space.xl, maxWidth: t.layout.measure }}
          >
            {keywords.length > 0
              ? 'What this notebook keeps coming back to. Ordered by how much a word is actually used, discounted by how thinly it is spread — a subject you return to again and again outranks a word you write once in every entry. The number is how many entries mention it.'
              : 'Themes appear here once there are a few entries to compare.'}
          </Text>

          {loading ? (
            <Text variant="uiSmall" tone="faint">
              Reading your notebook…
            </Text>
          ) : keywords.length === 0 ? (
            <Button
              variant="secondary"
              label="Write an entry"
              icon="add"
              onPress={() => router.push('/entry/new')}
            />
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space.sm }}>
              {keywords.map((keyword) => (
                <View
                  key={keyword.term}
                  style={{
                    width:
                      columns === 1
                        ? '100%'
                        : `${100 / columns}%` as any,
                    maxWidth: columns === 1 ? undefined : available / columns - t.space.sm,
                  }}
                >
                  <KeywordRow
                    keyword={keyword}
                    onPress={(term) => router.push(`/?keyword=${encodeURIComponent(term)}` as any)}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </AppShell>
  );
}
