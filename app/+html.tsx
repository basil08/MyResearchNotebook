/**
 * The HTML shell for the static web build.
 *
 * Expo does not put the app name into the document title on its own, so this
 * sets the fallback title and the browser-chrome colours. Per-route titles are
 * set on the Stack screens in `_layout.tsx` and take over once routing starts.
 *
 * This file is web-only and never runs on native.
 */
import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        <title>Friday</title>
        <meta
          name="description"
          content="A research notebook. One entry a day: what you planned, read, learned, thought and built."
        />

        {/* Browser chrome matches the paper, so the app does not sit in a white frame. */}
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#FAF9F7" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#131211" />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
