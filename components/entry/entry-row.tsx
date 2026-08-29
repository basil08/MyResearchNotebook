/**
 * EntryRow — one day, scannable in one glance.
 *
 * The old card concatenated all eight fields and cut at 100 characters, which
 * is why nothing could be told apart. Here each filled field gets its own line
 * with a fixed-width scan label, so the eye runs straight down the left edge.
 * Fields are often long paragraphs; the leading substring is shown verbatim
 * (no summarising) and the full text lives on the entry page.
 *
 * Row actions appear on hover on pointer devices only. On touch they would sit
 * permanently on every row, competing with the content — the entry page owns
 * them there instead.
 */
import React, { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';

import { Button, Row, Text } from '@/components/ui';
import { useLayout, useTheme } from '@/hooks/use-theme';
import type { ResearchLog } from '@/types/research-log';
import { formatEntryTime, formatRowDate, overflowCount, summaryLines } from '@/utils/entry';

const LABEL_WIDTH = 68;

interface EntryRowProps {
  log: ResearchLog;
  onOpen: (log: ResearchLog) => void;
  onEdit: (log: ResearchLog) => void;
  onDelete: (log: ResearchLog) => void;
  /** How many field lines to show. */
  lines?: number;
}

export function EntryRow({ log, onOpen, onEdit, onDelete, lines = 4 }: EntryRowProps) {
  const t = useTheme();
  const l = useLayout();
  const [hovered, setHovered] = useState(false);

  const shown = summaryLines(log, lines);
  const more = overflowCount(log, shown.length);
  const time = formatEntryTime(log);
  const canHover = Platform.OS === 'web' && l.isMedium;

  return (
    <View
      // @ts-expect-error RN-Web hover props
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`Entry for ${formatRowDate(log)}`}
        onPress={() => onOpen(log)}
        style={{
          paddingVertical: t.space.lg,
          borderBottomWidth: 1,
          borderBottomColor: t.colors.hairline,
          backgroundColor: hovered ? t.colors.wash : 'transparent',
          marginHorizontal: -t.space.md,
          paddingHorizontal: t.space.md,
          borderRadius: t.radius.sm,
          ...(Platform.OS === 'web' ? { cursor: 'pointer' } : null),
        }}
      >
        <Row gap="md" align="baseline">
          <Text variant="title">{formatRowDate(log)}</Text>
          {time && (
            <Text variant="mono" tone="faint">
              {time}
            </Text>
          )}
          <View style={{ flex: 1 }} />
          {canHover && hovered && (
            <Row gap="xs">
              <Button
                variant="ghost"
                size="sm"
                icon="edit"
                onPress={() => onEdit(log)}
                accessibilityLabel="Edit entry"
              />
              <Button
                variant="ghost"
                size="sm"
                icon="delete-outline"
                onPress={() => onDelete(log)}
                accessibilityLabel="Delete entry"
              />
            </Row>
          )}
        </Row>

        {shown.length > 0 ? (
          <View style={{ marginTop: t.space.sm, gap: 3 }}>
            {shown.map((line) => (
              <View key={line.field} style={{ flexDirection: 'row', gap: t.space.md }}>
                <Text
                  variant="label"
                  tone="faint"
                  numberOfLines={1}
                  style={{ width: LABEL_WIDTH, lineHeight: 20 }}
                >
                  {line.label}
                </Text>
                <Text
                  variant="body"
                  tone="muted"
                  numberOfLines={1}
                  style={{ flex: 1, fontSize: 13.5, lineHeight: 20 }}
                >
                  {line.value}
                </Text>
              </View>
            ))}
            {more > 0 && (
              <Text
                variant="uiSmall"
                tone="faint"
                style={{ marginLeft: LABEL_WIDTH + t.space.md, marginTop: 2 }}
              >
                +{more} more {more === 1 ? 'field' : 'fields'}
              </Text>
            )}
          </View>
        ) : (
          <Text variant="body" tone="faint" style={{ marginTop: t.space.sm }}>
            Empty entry
          </Text>
        )}
      </Pressable>
    </View>
  );
}

/** Month separator between runs of entries. */
export function MonthHeading({ label, count }: { label: string; count: number }) {
  const t = useTheme();
  return (
    <Row
      gap="md"
      align="center"
      style={{ paddingTop: t.space.xxl, paddingBottom: t.space.sm }}
    >
      <Text variant="label" tone="faint">
        {label}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: t.colors.hairline }} />
      <Text variant="uiSmall" tone="faint">
        {count}
      </Text>
    </Row>
  );
}
