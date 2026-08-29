/**
 * AppShell — the responsive frame every screen sits in.
 *
 * Replaces the fixed 800px centred column (ADR-004). The window fills the
 * viewport; extra width goes to navigation and context, never to empty margin.
 *
 *   <  900   one column
 *   >= 1180  rail | content
 *   >= 1500  rail | content | aside
 *
 * The bar stays put and only the content region scrolls, so a long corpus
 * never pushes the actions off screen.
 */
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';

import { Button, Icon, Row, Text } from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { useLayout, useTheme } from '@/hooks/use-theme';
import { ThemeToggle } from './theme-toggle';

export interface AppShellProps {
  /** Left navigation, shown at lg and above. */
  rail?: React.ReactNode;
  /** Right context pane, shown at xl and above. */
  aside?: React.ReactNode;
  /** Replaces the brand mark — e.g. a back control on the entry page. */
  barLeading?: React.ReactNode;
  /** Actions at the right of the bar, before the appearance and account controls. */
  barActions?: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ rail, aside, barLeading, barActions, children }: AppShellProps) {
  const t = useTheme();
  const l = useLayout();
  const router = useRouter();
  const { signOut, user } = useAuth();

  const showRail = !!rail && l.isWide;
  const showAside = !!aside && l.isUltraWide;

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.ground }}>
      {/* Bar */}
      <View
        style={{
          height: t.layout.barHeight,
          flexDirection: 'row',
          alignItems: 'center',
          gap: t.space.sm,
          paddingHorizontal: l.gutter,
          borderBottomWidth: 1,
          borderBottomColor: t.colors.hairline,
          backgroundColor: t.colors.ground,
        }}
      >
        {barLeading ?? (
          <Text
            variant="subhead"
            style={{ fontFamily: t.type.heading.fontFamily, letterSpacing: -0.2 }}
            onPress={() => router.push('/')}
            accessibilityRole="link"
          >
            Friday
          </Text>
        )}

        <View style={{ flex: 1 }} />

        {barActions}
        <ThemeToggle />
        <Button
          variant="ghost"
          size="sm"
          icon="logout"
          label={l.isMedium ? 'Sign out' : undefined}
          onPress={() => void signOut()}
          accessibilityLabel={`Sign out${user?.email ? `, ${user.email}` : ''}`}
        />
      </View>

      {/* Body */}
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {showRail && (
          <View
            style={{
              width: t.layout.railWidth,
              borderRightWidth: 1,
              borderRightColor: t.colors.hairline,
              paddingVertical: t.space.lg,
              paddingHorizontal: t.space.md,
            }}
          >
            {rail}
          </View>
        )}

        <View style={{ flex: 1, minWidth: 0 }}>{children}</View>

        {showAside && (
          <View
            style={{
              width: t.layout.asideWidth,
              borderLeftWidth: 1,
              borderLeftColor: t.colors.hairline,
              paddingVertical: t.space.lg,
              paddingHorizontal: t.space.md,
            }}
          >
            {aside}
          </View>
        )}
      </View>
    </View>
  );
}

/** A section heading inside the rail or aside. */
export function PaneHeading({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return (
    <Text
      variant="label"
      tone="faint"
      style={{ paddingHorizontal: t.space.sm, marginBottom: t.space.sm, marginTop: t.space.lg }}
    >
      {children}
    </Text>
  );
}

/** A row in the rail. */
export function PaneItem({
  label,
  icon,
  count,
  selected,
  onPress,
}: {
  label: string;
  icon?: React.ComponentProps<typeof Icon>['name'];
  count?: number;
  selected?: boolean;
  onPress?: () => void;
}) {
  const t = useTheme();
  const [hovered, setHovered] = React.useState(false);

  return (
    <View
      // @ts-expect-error RN-Web hover props
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Row
        gap="sm"
        onTouchEnd={onPress}
        // @ts-expect-error web click
        onClick={onPress}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        style={{
          paddingVertical: t.space.xs + 2,
          paddingHorizontal: t.space.sm,
          borderRadius: t.radius.sm,
          backgroundColor: selected
            ? t.colors.accentSoft
            : hovered
              ? t.colors.wash
              : 'transparent',
          ...(Platform.OS === 'web' ? { cursor: 'pointer' } : null),
        }}
      >
        {icon && <Icon name={icon} size="sm" tone={selected ? 'accent' : 'faint'} />}
        <Text variant="ui" tone={selected ? 'accent' : 'muted'} numberOfLines={1} style={{ flex: 1 }}>
          {label}
        </Text>
        {count != null && (
          <Text variant="uiSmall" tone="faint">
            {count}
          </Text>
        )}
      </Row>
    </View>
  );
}
