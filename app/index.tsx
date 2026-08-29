/**
 * Home — the corpus.
 */
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { EntryFilters, useEntryFilter } from '@/components/entry/entry-filters';
import { EntryList } from '@/components/entry/entry-list';
import { KeywordList } from '@/components/index/keyword-index';
import { AppShell, PaneHeading, PaneItem } from '@/components/shell/app-shell';
import { Button, Divider, Row, Text } from '@/components/ui';
import { useLogs } from '@/contexts/logs-context';
import { useLayout, useTheme } from '@/hooks/use-theme';
import type { ResearchLog } from '@/types/research-log';
import { showAlert, showSimpleAlert } from '@/utils/alert';
import { formatRowDate } from '@/utils/entry';
import { entriesWithTerm, keywordIndex, labelForTerm } from '@/utils/keywords';
import { getIndex } from '@/utils/search';

export default function HomeScreen() {
  const t = useTheme();
  const l = useLayout();
  const router = useRouter();
  const { keyword } = useLocalSearchParams<{ keyword?: string }>();
  const { logs, loading, refreshing, error, refresh, remove } = useLogs();
  const { filter, setFilter, filtered, active } = useEntryFilter(logs);
  const [showFilters, setShowFilters] = useState(false);

  const index = useMemo(() => getIndex(logs), [logs]);
  const keywords = useMemo(() => keywordIndex(index, { limit: 14 }), [index]);

  /*
   * The keyword filter lives in the URL rather than in component state, so a
   * theme can be linked, reloaded and reached from the full index page.
   */
  const term = keyword ? String(keyword) : null;
  const visible = useMemo(() => {
    if (!term) return filtered;
    const ids = entriesWithTerm(index, term);
    return filtered.filter((log) => ids.has(log.id));
  }, [filtered, index, term]);

  const selectKeyword = (next: string) =>
    router.setParams({ keyword: next === term ? undefined : next });

  const openEntry = (log: ResearchLog) => router.push(`/entry/${log.id}` as any);
  // `mode=write` is what the entry page reads; `edit=1` was the Milestone 1
  // spelling and silently opened read mode after Milestone 2 replaced it.
  const editEntry = (log: ResearchLog) => router.push(`/entry/${log.id}?mode=write` as any);

  const deleteEntry = (log: ResearchLog) => {
    showAlert(
      'Delete this entry?',
      `The entry for ${formatRowDate(log)} will be removed from your notebook. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            remove(log.id).catch((e: any) =>
              showSimpleAlert('Could not delete', e?.message ?? 'The entry is still there. Try again.')
            );
          },
        },
      ]
    );
  };

  const filters = (
    <EntryFilters
      filter={filter}
      onChange={setFilter}
      total={logs.length}
      matching={filtered.length}
    />
  );

  const rail = (
    <View style={{ flex: 1 }}>
      {filters}
      <View style={{ flex: 1 }} />
      <Divider spacing="sm" />
      <PaneItem label="Index" icon="tag" onPress={() => router.push('/keywords')} />
      <PaneItem label="About Friday" icon="info-outline" onPress={() => router.push('/about')} />
    </View>
  );

  const aside = (
    <View>
      <PaneHeading>Index</PaneHeading>
      <KeywordList keywords={keywords} selected={term} onSelect={selectKeyword} />
      {keywords.length > 0 && (
        <View style={{ marginTop: t.space.sm }}>
          <PaneItem label="All keywords" onPress={() => router.push('/keywords')} />
        </View>
      )}
    </View>
  );

  const barActions = (
    <Row gap="sm">
      {!l.isWide && (
        <Button
          variant={active ? 'primary' : 'ghost'}
          size="sm"
          icon="filter-list"
          label={l.isMedium ? 'Filter' : undefined}
          onPress={() => setShowFilters((v) => !v)}
          accessibilityLabel="Filter entries by date"
        />
      )}
      <Button
        variant="primary"
        size="sm"
        icon="add"
        label={l.isMedium ? 'New entry' : undefined}
        onPress={() => router.push('/entry/new')}
        accessibilityLabel="New entry"
      />
    </Row>
  );

  const header = (
    <View style={{ paddingTop: t.space.xl }}>
      {error && (
        <View
          style={{
            borderLeftWidth: 2,
            borderLeftColor: t.colors.danger,
            backgroundColor: t.colors.dangerSoft,
            padding: t.space.md,
            marginBottom: t.space.lg,
            gap: t.space.xs,
          }}
        >
          <Text variant="subhead" tone="danger">
            Could not load your notebook
          </Text>
          <Text variant="uiSmall" tone="muted">
            {error}
          </Text>
          <View style={{ marginTop: t.space.xs }}>
            <Button variant="secondary" size="sm" label="Try again" onPress={() => void refresh()} />
          </View>
        </View>
      )}

      {!l.isWide && showFilters && (
        <View
          style={{
            borderWidth: 1,
            borderColor: t.colors.hairline,
            borderRadius: t.radius.md,
            paddingBottom: t.space.md,
            marginBottom: t.space.lg,
          }}
        >
          {filters}
        </View>
      )}

      {(active || term) && (
        <Row gap="sm" wrap style={{ marginBottom: t.space.sm }}>
          <Text variant="uiSmall" tone="muted">
            {visible.length} of {logs.length} entries
          </Text>
          {term && (
            <Button
              variant="secondary"
              size="sm"
              icon="tag"
              iconRight="close"
              label={labelForTerm(index, term)}
              onPress={() => router.setParams({ keyword: undefined })}
              accessibilityLabel={`Clear the ${labelForTerm(index, term)} keyword filter`}
            />
          )}
          {active && (
            <Button
              variant="ghost"
              size="sm"
              label="Clear dates"
              onPress={() => setFilter({ preset: 'all' })}
            />
          )}
        </Row>
      )}
    </View>
  );

  const clearEverything = () => {
    setFilter({ preset: 'all' });
    router.setParams({ keyword: undefined });
  };

  return (
    <AppShell rail={rail} aside={aside} barActions={barActions}>
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: t.space.md }}>
          <ActivityIndicator size="large" color={t.colors.accent} />
          <Text variant="uiSmall" tone="faint">
            Reading your notebook…
          </Text>
        </View>
      ) : (
        <EntryList
          logs={visible}
          refreshing={refreshing}
          onRefresh={refresh}
          onOpen={openEntry}
          onEdit={editEntry}
          onDelete={deleteEntry}
          header={header}
          emptyTitle={active || term ? 'Nothing matches' : 'Nothing here yet'}
          emptyBody={
            term
              ? `No entry mentions ${labelForTerm(index, term)} in this range.`
              : active
                ? 'Widen the range, or clear the filter to see everything.'
                : 'Your first entry starts the record.'
          }
          emptyAction={
            active || term
              ? { label: 'Clear filters', onPress: clearEverything }
              : { label: 'New entry', onPress: () => router.push('/entry/new') }
          }
        />
      )}
    </AppShell>
  );
}
