/**
 * About — what Friday is, why it is called that, and how it behaves.
 *
 * Replaces the Expo-template About screen removed in Milestone 1 (ADR-010).
 * Everything here describes the app as it actually is now; if a section stops
 * being true, fix the section.
 */
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';

import { AppShell } from '@/components/shell/app-shell';
import { Button, Divider, Row, Text } from '@/components/ui';
import { fieldMeta, fieldPrompt, logFields } from '@/constants/design';
import { useAuth } from '@/contexts/auth-context';
import { useLayout, useTheme } from '@/hooks/use-theme';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ marginBottom: t.space.xxl }}>
      <Text variant="heading" style={{ marginBottom: t.space.md }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return (
    <Text variant="body" tone="muted" style={{ marginBottom: t.space.md }}>
      {children}
    </Text>
  );
}

export default function AboutScreen() {
  const t = useTheme();
  const l = useLayout();
  const router = useRouter();
  const { user } = useAuth();

  return (
    <AppShell
      barLeading={
        <Button
          variant="ghost"
          size="sm"
          icon="arrow-back"
          label={l.isMedium ? (user ? 'All entries' : 'Sign in') : undefined}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          accessibilityLabel={user ? 'Back to all entries' : 'Go to sign in'}
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
        <View style={{ width: '100%', maxWidth: t.layout.measure, alignSelf: 'center' }}>
          <Text variant="display">About Friday</Text>
          <Text variant="body" tone="muted" style={{ marginTop: t.space.sm, marginBottom: t.space.xxxl }}>
            A daily record of what you read, learned, thought and built — kept in one place,
            in your own words, and searchable later.
          </Text>

          <Section title="The name">
            <Para>
              Friday is the one who keeps the record and does the legwork. The name is
              borrowed three times over: the reanimated assistant in Project Itoh&apos;s
              Empire of Corpses, Crusoe&apos;s companion on the island, and Stark&apos;s
              AI after JARVIS.
            </Para>
            <Para>
              All three are the same idea — the second pair of hands that remembers what
              you did, so you can get on with doing the next thing.
            </Para>
          </Section>

          <Section title="How an entry works">
            <Para>
              One entry per day, one page per entry. Reading and writing are the same page:
              press Edit, or just click any field, and start typing. There is no Save
              button — edits save themselves a moment after you stop typing, and the bar
              tells you when that has happened.
            </Para>
            <Para>
              Every field takes Markdown. Read mode renders it; write mode shows the source.
              Paste a URL anywhere and it condenses to a numbered link so it does not
              swallow the line.
            </Para>
            <Para>
              Every field is optional. A day where you only read something is still a
              perfectly good entry.
            </Para>
          </Section>

          <Section title="The eight fields">
            <View
              style={{
                borderWidth: 1,
                borderColor: t.colors.hairline,
                borderRadius: t.radius.md,
              }}
            >
              {logFields.map((field, i) => (
                <View key={field}>
                  {i > 0 && <Divider />}
                  <Row gap="md" align="flex-start" style={{ padding: t.space.md }}>
                    <Text variant="label" tone="faint" style={{ width: 92, lineHeight: 22 }}>
                      {fieldMeta[field].short}
                    </Text>
                    <Text variant="body" tone="muted" style={{ flex: 1 }}>
                      {fieldPrompt[field]}
                    </Text>
                  </Row>
                </View>
              ))}
            </View>
          </Section>

          <Section title="Where your notes live">
            <Para>
              Entries are stored in a Google Sheet you own, reached through a Google Apps
              Script endpoint. Nothing is kept on a server belonging to this app, and you
              can open, export or analyse the sheet directly at any time.
            </Para>
            <Para>
              Signing in uses Firebase Authentication. On the web, every request passes
              through an authenticated proxy that verifies your identity token before it
              touches the sheet.
            </Para>
          </Section>

          <Section title="Getting the most out of it">
            <Para>
              Write the entry at the end of the day, while you can still remember why
              something mattered. Use Next to leave yourself tomorrow&apos;s first move —
              it is the field that most often saves a morning.
            </Para>
            <Para>
              Be specific. &ldquo;Read the paper&rdquo; tells future-you nothing;
              &ldquo;Kraft inequality gives the bridge from codes to probability&rdquo;
              is still useful a year later, and it is what search will find.
            </Para>
          </Section>

          <Divider spacing="lg" />
          <Text variant="uiSmall" tone="faint">
            Friday · built on Expo and React Native · runs on the web, iOS and Android
          </Text>
        </View>
      </ScrollView>
    </AppShell>
  );
}
