/**
 * Home — the corpus.
 */
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { EntryFilters, useEntryFilter } from '@/components/entry/entry-filters';
import { EntryList } from '@/components/entry/entry-list';
import { AppShell } from '@/components/shell/app-shell';
import { Button, Row, Text } from '@/components/ui';
import { useLogs } from '@/contexts/logs-context';
import { useLayout, useTheme } from '@/hooks/use-theme';
import type { ResearchLog } from '@/types/research-log';
import { showAlert, showSimpleAlert } from '@/utils/alert';
import { formatRowDate } from '@/utils/entry';

export default function HomeScreen() {
  const t = useTheme();
  const l = useLayout();
  const router = useRouter();
  const { logs, loading, refreshing, error, refresh, remove } = useLogs();
  const { filter, setFilter, filtered, active } = useEntryFilter(logs);
  const [showFilters, setShowFilters] = useState(false);

  const openEntry = (log: ResearchLog) => router.push(`/entry/${log.id}` as any);
  const editEntry = (log: ResearchLog) => router.push(`/entry/${log.id}?edit=1` as any);

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

      {active && (
        <Row gap="sm" style={{ marginBottom: t.space.sm }}>
          <Text variant="uiSmall" tone="muted">
            {filtered.length} of {logs.length} entries
          </Text>
          <Button
            variant="ghost"
            size="sm"
            label="Clear filter"
            onPress={() => setFilter({ preset: 'all' })}
          />
        </Row>
      )}
    </View>
  );

  return (
    <AppShell rail={filters} barActions={barActions}>
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: t.space.md }}>
          <ActivityIndicator size="large" color={t.colors.accent} />
          <Text variant="uiSmall" tone="faint">
            Reading your notebook…
          </Text>
        </View>
      ) : (
        <EntryList
          logs={filtered}
          refreshing={refreshing}
          onRefresh={refresh}
          onOpen={openEntry}
          onEdit={editEntry}
          onDelete={deleteEntry}
          header={header}
          emptyTitle={active ? 'No entries in this range' : 'Nothing here yet'}
          emptyBody={
            active
              ? 'Widen the range, or clear the filter to see everything.'
              : 'Your first entry starts the record.'
          }
          emptyAction={
            active
              ? { label: 'Clear filter', onPress: () => setFilter({ preset: 'all' }) }
              : { label: 'New entry', onPress: () => router.push('/entry/new') }
          }
        />
      )}
    </AppShell>
  );
}
