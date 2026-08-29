/**
 * Date filtering. Presets cover the common cases; the custom range is kept
 * because the previous build had it — it just no longer costs a modal.
 *
 * The same control set renders in the rail on wide screens and in a panel
 * above the list on compact ones.
 */
import { endOfMonth, format, startOfMonth, subDays, subMonths } from 'date-fns';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Field, Row, Text } from '@/components/ui';
import { PaneHeading, PaneItem } from '@/components/shell/app-shell';
import { useTheme } from '@/hooks/use-theme';
import type { ResearchLog } from '@/types/research-log';
import { toDate } from '@/utils/entry';

export type PresetId = 'all' | 'last7' | 'last30' | 'thisMonth' | 'lastMonth' | 'custom';

export interface EntryFilter {
  preset: PresetId;
  dateFrom?: string;
  dateTo?: string;
}

export const NO_FILTER: EntryFilter = { preset: 'all' };

const iso = (d: Date) => format(d, 'yyyy-MM-dd');

/** Resolve a preset to a concrete range. `custom` keeps whatever is set. */
export function resolveRange(filter: EntryFilter): { from?: string; to?: string } {
  const now = new Date();
  switch (filter.preset) {
    case 'last7':
      return { from: iso(subDays(now, 6)), to: iso(now) };
    case 'last30':
      return { from: iso(subDays(now, 29)), to: iso(now) };
    case 'thisMonth':
      return { from: iso(startOfMonth(now)), to: iso(endOfMonth(now)) };
    case 'lastMonth': {
      const m = subMonths(now, 1);
      return { from: iso(startOfMonth(m)), to: iso(endOfMonth(m)) };
    }
    case 'custom':
      return { from: filter.dateFrom, to: filter.dateTo };
    default:
      return {};
  }
}

/** Apply a filter to the corpus. */
export function applyFilter(logs: ResearchLog[], filter: EntryFilter): ResearchLog[] {
  const { from, to } = resolveRange(filter);
  if (!from && !to) return logs;

  const fromT = from ? toDate(from)?.getTime() : undefined;
  // `to` is inclusive of the whole day.
  const toD = to ? toDate(to) : null;
  const toT = toD ? new Date(toD.getFullYear(), toD.getMonth(), toD.getDate(), 23, 59, 59, 999).getTime() : undefined;

  return logs.filter((log) => {
    const t = toDate(log.date)?.getTime();
    if (t == null) return false;
    if (fromT != null && t < fromT) return false;
    if (toT != null && t > toT) return false;
    return true;
  });
}

export function useEntryFilter(logs: ResearchLog[]) {
  const [filter, setFilter] = useState<EntryFilter>(NO_FILTER);
  const filtered = useMemo(() => applyFilter(logs, filter), [logs, filter]);
  const active = filter.preset !== 'all';
  return { filter, setFilter, filtered, active };
}

const PRESETS: { id: PresetId; label: string }[] = [
  { id: 'all', label: 'All entries' },
  { id: 'last7', label: 'Last 7 days' },
  { id: 'last30', label: 'Last 30 days' },
  { id: 'thisMonth', label: 'This month' },
  { id: 'lastMonth', label: 'Last month' },
];

interface EntryFiltersProps {
  filter: EntryFilter;
  onChange: (next: EntryFilter) => void;
  /** Count shown beside "All entries". */
  total: number;
  /** Count matching the current filter. */
  matching: number;
}

export function EntryFilters({ filter, onChange, total, matching }: EntryFiltersProps) {
  const t = useTheme();
  const showCustom = filter.preset === 'custom';

  return (
    <View>
      <PaneHeading>Range</PaneHeading>
      {PRESETS.map((p) => (
        <PaneItem
          key={p.id}
          label={p.label}
          selected={filter.preset === p.id}
          count={p.id === 'all' ? total : filter.preset === p.id ? matching : undefined}
          onPress={() => onChange({ preset: p.id })}
        />
      ))}
      <PaneItem
        label="Custom range"
        selected={showCustom}
        count={showCustom ? matching : undefined}
        onPress={() => onChange({ preset: 'custom', dateFrom: filter.dateFrom, dateTo: filter.dateTo })}
      />

      {showCustom && (
        <View style={{ gap: t.space.sm, paddingHorizontal: t.space.sm, paddingTop: t.space.sm }}>
          <Row gap="sm">
            <Field
              containerStyle={{ flex: 1 }}
              label="From"
              value={filter.dateFrom ?? ''}
              onChangeText={(v) => onChange({ ...filter, preset: 'custom', dateFrom: v })}
              placeholder="YYYY-MM-DD"
              variant="ui"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Field
              containerStyle={{ flex: 1 }}
              label="To"
              value={filter.dateTo ?? ''}
              onChangeText={(v) => onChange({ ...filter, preset: 'custom', dateTo: v })}
              placeholder="YYYY-MM-DD"
              variant="ui"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </Row>
          <Text variant="uiSmall" tone="faint">
            Leave either side blank for an open-ended range.
          </Text>
        </View>
      )}
    </View>
  );
}
