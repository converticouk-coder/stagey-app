// ============================================================
// STAGEY MOBILE — STAGE NAME GENERATOR
// Fun quiz: answer 5 questions → AI-generated stage name + explanation.
// NEW screen (no pre-registered name) — registered as "StageName".
// ============================================================
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { Sparkles, Copy, RotateCcw } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { QuizAPI } from '../../services/api';
import {
  Screen,
  PrimaryButton,
  useListBottomPadding,
} from '../../components/ui';
import { TextStyles, Spacing, Radius, PrimaryGradient, STAGE_NAME_QUESTIONS } from '../../constants';

export default function StageNameScreen() {
  const { colors } = useTheme();
  const bottomPad = useListBottomPadding();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ stageName: string; explanation: string } | null>(null);

  const allAnswered = STAGE_NAME_QUESTIONS.every((q) => answers[q.id]);

  async function generate() {
    if (!allAnswered) return;
    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const res = await QuizAPI.generateStageName(answers);
      setResult(res);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Could not generate', text2: e?.message });
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setAnswers({});
    setResult(null);
  }

  async function copyName() {
    if (!result) return;
    await Clipboard.setStringAsync(result.stageName);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Toast.show({ type: 'success', text1: 'Copied!', text2: result.stageName });
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: Spacing.screenPadding, paddingBottom: bottomPad }}>
        {result ? (
          <View>
            <LinearGradient
              colors={PrimaryGradient.colors}
              start={PrimaryGradient.start}
              end={PrimaryGradient.end}
              style={styles.resultCard}
            >
              <Sparkles size={28} color="#fff" />
              <Text style={[TextStyles.caption, { color: '#ffffffcc', marginTop: Spacing.sm }]}>Your stage name is</Text>
              <Text testID="text-stage-name" style={[TextStyles.h1, { color: '#fff', textAlign: 'center', marginTop: Spacing.xs }]}>
                {result.stageName}
              </Text>
            </LinearGradient>
            <Text style={[TextStyles.body, { color: colors.foreground, marginTop: Spacing.lg, textAlign: 'center' }]}>
              {result.explanation}
            </Text>
            <View style={{ marginTop: Spacing.xl, gap: Spacing.md }}>
              <PrimaryButton testID="button-copy-name" label="Copy stage name" icon={<Copy size={16} color="#fff" />} onPress={copyName} />
              <Pressable testID="button-stagename-reset" onPress={reset} style={[styles.resetBtn, { borderColor: colors.border }]}>
                <RotateCcw size={16} color={colors.foreground} />
                <Text style={[TextStyles.button, { color: colors.foreground, marginLeft: Spacing.sm }]}>Try again</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md }}>
              <Sparkles size={24} color={colors.primary} />
              <Text style={[TextStyles.h2, { color: colors.foreground, flex: 1 }]}>What's your stage name?</Text>
            </View>
            <Text style={[TextStyles.body, { color: colors.mutedForeground, marginBottom: Spacing.lg }]}>
              Answer five quick questions and we'll conjure your perfect theatrical alias.
            </Text>

            {STAGE_NAME_QUESTIONS.map((q) => (
              <View key={q.id} style={styles.qBlock}>
                <Text style={[TextStyles.label, { color: colors.foreground, marginBottom: Spacing.sm }]}>{q.question}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
                  {q.options.map((opt) => {
                    const selected = answers[q.id] === opt;
                    return (
                      <Pressable
                        key={opt}
                        testID={`option-${q.id}-${opt}`}
                        onPress={() => setAnswers((p) => ({ ...p, [q.id]: opt }))}
                        style={[
                          styles.optChip,
                          { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primary : 'transparent' },
                        ]}
                      >
                        <Text style={[TextStyles.label, { color: selected ? '#fff' : colors.foreground }]}>{opt}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}

            <View style={{ marginTop: Spacing.lg }}>
              <PrimaryButton
                testID="button-generate-name"
                label={allAnswered ? 'Reveal my stage name' : 'Answer all questions'}
                disabled={!allAnswered}
                loading={loading}
                icon={<Sparkles size={16} color="#fff" />}
                onPress={generate}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  resultCard: {
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.lg,
  },
  qBlock: { marginBottom: Spacing.xl },
  optChip: {
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
});
