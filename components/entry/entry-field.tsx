/**
 * One field of an entry, in whichever mode the page is in.
 *
 * Read and write use the same label, the same measure and the same vertical
 * rhythm, so toggling between them does not reflow the page — which is what
 * makes it feel like one document rather than a form pretending to be one.
 *
 * Markdown is the storage format. Read mode renders it; write mode shows the
 * source. That is the honest thing to do here: a live-rendering editor on top
 * of React Native's TextInput would mean reimplementing text layout, and
 * getting it subtly wrong is worse than showing the source.
 */
import React, { useCallback, useState } from 'react';
import { Platform, Pressable, TextInput, View } from 'react-native';

import { MarkdownView } from '@/components/markdown-view';
import { Text } from '@/components/ui';
import { fieldMeta, fieldPrompt, type LogField } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';

const MIN_HEIGHT = 30;

interface EntryFieldProps {
  field: LogField;
  value: string;
  mode: 'read' | 'write';
  onChange: (value: string) => void;
  /** Read mode: clicking the body jumps into write mode focused here. */
  onRequestEdit: (field: LogField) => void;
  inputRef?: (input: TextInput | null) => void;
  autoFocus?: boolean;
}

export function EntryField({
  field,
  value,
  mode,
  onChange,
  onRequestEdit,
  inputRef,
  autoFocus,
}: EntryFieldProps) {
  const t = useTheme();
  const [height, setHeight] = useState(MIN_HEIGHT);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  const grow = useCallback((h: number) => {
    setHeight((prev) => (Math.abs(prev - h) > 1 ? Math.max(MIN_HEIGHT, h) : prev));
  }, []);

  const label = (
    <Text variant="label" tone="faint" style={{ marginBottom: t.space.xs + 1 }}>
      {fieldMeta[field].short}
    </Text>
  );

  if (mode === 'read') {
    return (
      <View style={{ marginBottom: t.space.xl }}>
        {label}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Edit ${fieldMeta[field].short}`}
          onPress={() => onRequestEdit(field)}
          onHoverIn={() => setHovered(true)}
          onHoverOut={() => setHovered(false)}
          style={{
            marginHorizontal: -t.space.sm,
            paddingHorizontal: t.space.sm,
            paddingVertical: t.space.xs + 2,
            borderRadius: t.radius.sm,
            borderWidth: 1,
            borderColor: 'transparent',
            backgroundColor: hovered ? t.colors.wash : 'transparent',
            ...(Platform.OS === 'web' ? ({ cursor: 'text' } as object) : null),
          }}
        >
          <MarkdownView text={value} />
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={{ marginBottom: t.space.xl }}
      // @ts-expect-error RN-Web hover props
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onContentSizeChange={(e) => grow(e.nativeEvent.contentSize.height)}
        placeholder={fieldPrompt[field]}
        placeholderTextColor={t.colors.inkFaint}
        selectionColor={t.colors.accent}
        multiline
        autoFocus={autoFocus}
        scrollEnabled={false}
        textAlignVertical="top"
        accessibilityLabel={fieldPrompt[field]}
        style={[
          t.type.body,
          {
            color: t.colors.ink,
            height: Math.max(MIN_HEIGHT, height),
            marginHorizontal: -t.space.sm,
            paddingHorizontal: t.space.sm,
            paddingVertical: t.space.xs + 2,
            borderRadius: t.radius.sm,
            borderWidth: 1,
            borderColor: focused ? t.colors.hairlineStrong : 'transparent',
            backgroundColor: focused
              ? t.colors.surface
              : hovered
                ? t.colors.wash
                : 'transparent',
          },
          Platform.OS === 'web'
            ? ({
                outlineStyle: 'none',
                transitionProperty: 'background-color, border-color',
                transitionDuration: `${t.motion.duration.fast}ms`,
              } as any)
            : null,
        ]}
      />
    </View>
  );
}
