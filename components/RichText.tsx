// ============================================================
// STAGEY MOBILE — RICH TEXT RENDERER
// Renders article / guide bodies. Content may be HTML or lightly
// formatted plain text / Markdown — we wrap bare newlines so plain
// text still renders with paragraph spacing.
// ============================================================
import React, { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing } from '../constants';

function looksLikeHtml(s: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(s);
}

function markdownishToHtml(s: string): string {
  // Minimal conversion so plain-text / light-markdown bodies render nicely.
  const escaped = s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return escaped
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      const heading = trimmed.match(/^(#{1,3})\s+(.*)$/);
      if (heading) {
        const level = heading[1].length + 1;
        return `<h${level}>${heading[2]}</h${level}>`;
      }
      return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('');
}

export default function RichText({ html }: { html: string }) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const source = useMemo(
    () => ({ html: looksLikeHtml(html) ? html : markdownishToHtml(html) }),
    [html],
  );

  const baseStyle = useMemo(
    () => ({ color: colors.foreground, fontSize: 16, lineHeight: 24 }),
    [colors.foreground],
  );

  const tagsStyles = useMemo(
    () => ({
      p: { marginTop: 0, marginBottom: Spacing.md },
      h1: { color: colors.foreground, fontSize: 24, fontWeight: '700' as const, marginBottom: Spacing.sm },
      h2: { color: colors.foreground, fontSize: 20, fontWeight: '700' as const, marginBottom: Spacing.sm },
      h3: { color: colors.foreground, fontSize: 18, fontWeight: '600' as const, marginBottom: Spacing.sm },
      a: { color: colors.primary },
      li: { color: colors.foreground, marginBottom: Spacing.xs },
      blockquote: {
        borderLeftWidth: 3,
        borderLeftColor: colors.primary,
        paddingLeft: Spacing.md,
        marginBottom: Spacing.md,
        opacity: 0.9,
      },
    }),
    [colors.foreground, colors.primary],
  );

  return (
    <RenderHtml
      contentWidth={width - Spacing.screenPadding * 2}
      source={source}
      baseStyle={baseStyle}
      tagsStyles={tagsStyles as any}
      enableExperimentalMarginCollapsing
    />
  );
}
