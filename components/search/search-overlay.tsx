/**
 * Search — a command-palette overlay over the whole corpus.
 *
 * Opens on ⌘K / Ctrl-K or the bar control, closes on Escape. Arrow keys move
 * the selection, Enter opens it. Each result shows *why* it matched: the field
 * name and a snippet windowed on the densest cluster of hits, with the hits
 * marked.
 */
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  TextInput,
  View,
  type ViewStyle,
} from 'react-native';

import { Icon, Row, Text } from '@/components/ui';
import { fieldMeta } from '@/constants/design';
import { useLayout, useTheme } from '@/hooks/use-theme';
import { useSearch } from '@/hooks/use-search';
import { formatRowDate } from '@/utils/entry';
import type { SearchResult } from '@/utils/search';

interface SearchOverlayProps {
  visible: boolean;
  onClose: () => void;
}

export function SearchOverlay({ visible, onClose }: SearchOverlayProps) {
  const t = useTheme();
  const l = useLayout();
  const router = useRouter();
  const { query, setQuery, results, active, index } = useSearch();
  const [selected, setSelected] = useState(0);
  const input = useRef<TextInput>(null);
  const list = useRef<FlatList<SearchResult>>(null);

  // A new query invalidates the old selection.
  useEffect(() => setSelected(0), [query]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => input.current?.focus(), 60);
    return () => clearTimeout(timer);
  }, [visible]);

  const open = useCallback(
    (result: SearchResult) => {
      onClose();
      setQuery('');
      router.push(`/entry/${result.log.id}` as any);
    },
    [onClose, router, setQuery]
  );

  // Keyboard navigation. Web only — on touch the list is scrolled and tapped.
  useEffect(() => {
    if (!visible || Platform.OS !== 'web' || typeof window === 'undefined') return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (results.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const result = results[selected];
        if (result) open(result);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, results, selected, onClose, open]);

  // Keep the selected row on screen as the arrows move it.
  useEffect(() => {
    if (results.length === 0) return;
    list.current?.scrollToIndex({ index: selected, viewPosition: 0.5, animated: false });
  }, [selected, results.length]);

  const panel: ViewStyle = {
    width: '100%',
    maxWidth: 680,
    maxHeight: l.isCompact ? '92%' : '76%',
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.hairlineStrong,
    overflow: 'hidden',
    ...(t.shadow('overlay') as ViewStyle),
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        accessibilityLabel="Close search"
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: t.colors.scrim,
          alignItems: 'center',
          justifyContent: l.isCompact ? 'flex-end' : 'flex-start',
          paddingTop: l.isCompact ? 0 : 96,
          paddingHorizontal: l.isCompact ? 0 : t.space.lg,
        }}
      >
        {/* Swallow presses inside the panel so they do not close it. */}
        <Pressable style={panel} onPress={() => {}}>
          <Row
            gap="sm"
            style={{
              paddingHorizontal: t.space.lg,
              paddingVertical: t.space.md,
              borderBottomWidth: 1,
              borderBottomColor: t.colors.hairline,
            }}
          >
            <Icon name="search" size="md" tone="faint" />
            <TextInput
              ref={input}
              value={query}
              onChangeText={setQuery}
              placeholder="Search every entry…"
              placeholderTextColor={t.colors.inkFaint}
              selectionColor={t.colors.accent}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              accessibilityLabel="Search entries"
              style={[
                t.type.bodyLarge,
                { flex: 1, color: t.colors.ink },
                Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null,
              ]}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')} accessibilityLabel="Clear search">
                <Icon name="close" size="sm" tone="faint" />
              </Pressable>
            )}
          </Row>

          {active && results.length === 0 ? (
            <View style={{ padding: t.space.xl, gap: t.space.xs }}>
              <Text variant="subhead">No entry matches that</Text>
              <Text variant="uiSmall" tone="muted">
                Try a single distinctive word. Wrap words in quotes to require them
                together.
              </Text>
            </View>
          ) : !active ? (
            <View style={{ padding: t.space.xl, gap: t.space.sm }}>
              <Text variant="uiSmall" tone="muted">
                Searches the full text of every field across {index.size}{' '}
                {index.size === 1 ? 'entry' : 'entries'}.
              </Text>
              <Text variant="uiSmall" tone="faint">
                Word endings are matched too, so “compress” finds “compression”. Use
                &quot;quotes&quot; for an exact phrase.
              </Text>
            </View>
          ) : (
            <FlatList
              ref={list}
              data={results}
              keyExtractor={(r) => r.log.id}
              keyboardShouldPersistTaps="handled"
              onScrollToIndexFailed={() => {}}
              renderItem={({ item, index: i }) => (
                <ResultRow
                  result={item}
                  selected={i === selected}
                  onHover={() => setSelected(i)}
                  onPress={() => open(item)}
                />
              )}
              ListFooterComponent={
                <Text
                  variant="uiSmall"
                  tone="faint"
                  style={{ padding: t.space.md, textAlign: 'center' }}
                >
                  {results.length} {results.length === 1 ? 'match' : 'matches'}
                </Text>
              }
            />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ResultRow({
  result,
  selected,
  onHover,
  onPress,
}: {
  result: SearchResult;
  selected: boolean;
  onHover: () => void;
  onPress: () => void;
}) {
  const t = useTheme();

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Entry for ${formatRowDate(result.log)}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      onHoverIn={onHover}
      style={{
        paddingHorizontal: t.space.lg,
        paddingVertical: t.space.md,
        borderBottomWidth: 1,
        borderBottomColor: t.colors.hairline,
        backgroundColor: selected ? t.colors.accentSoft : 'transparent',
        ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
      }}
    >
      <Row gap="sm" align="baseline">
        <Text variant="subhead" style={{ fontFamily: t.type.heading.fontFamily }}>
          {formatRowDate(result.log)}
        </Text>
        <View style={{ flex: 1 }} />
        {selected && (
          <Text variant="uiSmall" tone="faint">
            ↵
          </Text>
        )}
      </Row>

      {result.matches.slice(0, 2).map((match) => (
        <View key={match.field} style={{ flexDirection: 'row', gap: t.space.md, marginTop: 5 }}>
          <Text variant="label" tone="faint" style={{ width: 68, lineHeight: 20 }}>
            {fieldMeta[match.field].short}
          </Text>
          <Text variant="body" tone="muted" style={{ flex: 1, fontSize: 13.5, lineHeight: 20 }}>
            {match.segments.map((segment, i) => (
              <Text
                key={i}
                variant="body"
                style={{
                  fontSize: 13.5,
                  lineHeight: 20,
                  color: segment.hit ? t.colors.ink : t.colors.inkMuted,
                  backgroundColor: segment.hit ? t.colors.highlight : 'transparent',
                  fontWeight: segment.hit ? '600' : '400',
                }}
              >
                {segment.text}
              </Text>
            ))}
          </Text>
        </View>
      ))}
    </Pressable>
  );
}

/**
 * ⌘K / Ctrl-K anywhere in the app. Returns the open state to pair with
 * `SearchOverlay`.
 */
export function useSearchHotkey(): [boolean, (open: boolean) => void] {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return [open, setOpen];
}
