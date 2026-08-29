/**
 * EntryList — the corpus, grouped by month.
 *
 * Scroll fixes over the old list:
 *   - the artificial 300ms setTimeout before each page is gone
 *   - page size 30 instead of 10, so a normal scroll does not stall
 *   - the reading column is capped but the *viewport* is not, so the list is
 *     roughly half as tall as it was inside the old 800px letterbox
 */
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { useLayout, useTheme } from '@/hooks/use-theme';
import type { ResearchLog } from '@/types/research-log';
import { entryMonthKey, formatMonthLabel } from '@/utils/entry';
import { EntryRow, MonthHeading } from './entry-row';

const PAGE = 30;

type ListItem =
  | { kind: 'month'; key: string; label: string; count: number }
  | { kind: 'entry'; key: string; log: ResearchLog };

interface EntryListProps {
  logs: ResearchLog[];
  refreshing: boolean;
  onRefresh: () => void;
  onOpen: (log: ResearchLog) => void;
  onEdit: (log: ResearchLog) => void;
  onDelete: (log: ResearchLog) => void;
  /** Rendered above the first row, inside the reading column. */
  header?: React.ReactNode;
  emptyTitle?: string;
  emptyBody?: string;
  emptyAction?: { label: string; onPress: () => void };
}

export function EntryList({
  logs,
  refreshing,
  onRefresh,
  onOpen,
  onEdit,
  onDelete,
  header,
  emptyTitle = 'Nothing here yet',
  emptyBody = 'Your first entry starts the record.',
  emptyAction,
}: EntryListProps) {
  const t = useTheme();
  const l = useLayout();
  const [limit, setLimit] = useState(PAGE);

  const visible = useMemo(() => logs.slice(0, limit), [logs, limit]);
  const hasMore = limit < logs.length;

  /** Flatten into month headings + entries, counting each month in full. */
  const items = useMemo(() => {
    const totals = new Map<string, number>();
    for (const log of logs) {
      const k = entryMonthKey(log);
      totals.set(k, (totals.get(k) ?? 0) + 1);
    }

    const out: ListItem[] = [];
    let current: string | null = null;
    for (const log of visible) {
      const k = entryMonthKey(log);
      if (k !== current) {
        current = k;
        out.push({ kind: 'month', key: `m:${k}`, label: formatMonthLabel(k), count: totals.get(k) ?? 0 });
      }
      out.push({ kind: 'entry', key: log.id, log });
    }
    return out;
  }, [visible, logs]);

  const loadMore = useCallback(() => {
    if (hasMore) setLimit((n) => n + PAGE);
  }, [hasMore]);

  const column = {
    width: '100%' as const,
    maxWidth: t.layout.measureWide,
    alignSelf: 'center' as const,
  };

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.key}
      renderItem={({ item }) =>
        item.kind === 'month' ? (
          <View style={column}>
            <MonthHeading label={item.label} count={item.count} />
          </View>
        ) : (
          <View style={column}>
            <EntryRow log={item.log} onOpen={onOpen} onEdit={onEdit} onDelete={onDelete} />
          </View>
        )
      }
      contentContainerStyle={{
        paddingHorizontal: l.gutter,
        paddingBottom: t.space.huge,
      }}
      ListHeaderComponent={header ? <View style={column}>{header}</View> : null}
      ListEmptyComponent={
        <View style={[column, { paddingVertical: t.space.huge, gap: t.space.md }]}>
          <Text variant="heading">{emptyTitle}</Text>
          <Text variant="body" tone="muted">
            {emptyBody}
          </Text>
          {emptyAction && (
            <View style={{ marginTop: t.space.sm }}>
              <Button variant="primary" label={emptyAction.label} onPress={emptyAction.onPress} />
            </View>
          )}
        </View>
      }
      ListFooterComponent={
        hasMore ? (
          <View style={[column, { paddingVertical: t.space.xl, alignItems: 'center' }]}>
            <ActivityIndicator size="small" color={t.colors.inkFaint} />
          </View>
        ) : logs.length > 0 ? (
          <View style={[column, { paddingVertical: t.space.xl, alignItems: 'center' }]}>
            <Text variant="uiSmall" tone="faint">
              {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
            </Text>
          </View>
        ) : null
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={t.colors.inkFaint}
        />
      }
      onEndReached={loadMore}
      onEndReachedThreshold={0.6}
      removeClippedSubviews={false}
      initialNumToRender={12}
      maxToRenderPerBatch={12}
      windowSize={11}
    />
  );
}
