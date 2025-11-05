import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="book.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          About Research Notebook
        </ThemedText>
      </ThemedView>
      <ThemedText>
        Your daily companion for tracking research, learning, and personal development.
      </ThemedText>

      <Collapsible title="Features">
        <ThemedText>
          • <ThemedText type="defaultSemiBold">Daily Logs:</ThemedText> Track your daily research activities, learnings, and accomplishments.
        </ThemedText>
        <ThemedText>
          • <ThemedText type="defaultSemiBold">Comprehensive Fields:</ThemedText> Document what you plan to read, what you've read, learned, thought about, coded, wrote, and what to try tomorrow.
        </ThemedText>
        <ThemedText>
          • <ThemedText type="defaultSemiBold">Filtering:</ThemedText> Filter logs by date ranges including quick filters for last 7 days, this month, and last month.
        </ThemedText>
        <ThemedText>
          • <ThemedText type="defaultSemiBold">Full CRUD:</ThemedText> Create, read, update, and delete your research logs.
        </ThemedText>
      </Collapsible>

      <Collapsible title="How to Use">
        <ThemedText>
          1. Tap <ThemedText type="defaultSemiBold">"+ New Log"</ThemedText> on the home screen to create a new research log entry.
        </ThemedText>
        <ThemedText>
          2. Fill in the fields that are relevant to your day - all fields are optional.
        </ThemedText>
        <ThemedText>
          3. Tap <ThemedText type="defaultSemiBold">"Edit"</ThemedText> on any log to update it.
        </ThemedText>
        <ThemedText>
          4. Tap <ThemedText type="defaultSemiBold">"Delete"</ThemedText> to remove a log (with confirmation).
        </ThemedText>
        <ThemedText>
          5. Use the <ThemedText type="defaultSemiBold">filter button</ThemedText> to filter logs by date range.
        </ThemedText>
        <ThemedText>
          6. Pull down on the list to refresh and sync with your Google Sheet database.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Data Storage">
        <ThemedText>
          Your research logs are stored in a Google Sheet, making them accessible from anywhere and easy to export or analyze using spreadsheet tools.
        </ThemedText>
        <ThemedText style={{ marginTop: 8 }}>
          The Google Sheet URL is configured in your environment variables. Make sure your sheet has the proper permissions and API setup.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Tips for Maximum Productivity">
        <ThemedText>
          • Make it a daily habit to fill out your research log at the end of each day.
        </ThemedText>
        <ThemedText>
          • Use the "Try Tomorrow" field to set intentions for the next day.
        </ThemedText>
        <ThemedText>
          • Review past logs regularly to track your progress and identify patterns.
        </ThemedText>
        <ThemedText>
          • Be honest and detailed - your future self will thank you!
        </ThemedText>
      </Collapsible>

      <Collapsible title="Technical Stack">
        <ThemedText>
          • <ThemedText type="defaultSemiBold">Framework:</ThemedText> React Native with Expo
        </ThemedText>
        <ThemedText>
          • <ThemedText type="defaultSemiBold">Language:</ThemedText> TypeScript
        </ThemedText>
        <ThemedText>
          • <ThemedText type="defaultSemiBold">Backend:</ThemedText> Google Sheets API
        </ThemedText>
        <ThemedText>
          • <ThemedText type="defaultSemiBold">Features:</ThemedText> Dark mode support, pull-to-refresh, date filtering
        </ThemedText>
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
