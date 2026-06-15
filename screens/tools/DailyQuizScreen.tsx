// ============================================================
// STAGEY MOBILE — DAILY QUIZ
// One quiz per day. Answer all questions, submit, see score + streak.
// Works for guests (preview) and logged-in users.
// ============================================================
import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { Brain, Flame, CheckCircle, XCircle } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { QuizAPI } from '../../services/api';
import {
  Screen,
  LoadingState,
  ErrorState,
  Badge,
  PrimaryButton,
  useListBottomPadding,
} from '../../components/ui';
import { TextStyles, Spacing, Radius, QUIZ_DIFFICULTY_COLORS } from '../../constants';
import type { QuizSubmitResult } from '../../types';

export default function DailyQuizScreen() {
  const { colors } = useTheme();
  const bottomPad = useListBottomPadding();
  const { isAuthenticated } = useAuth();

  const { data: quiz, isLoading, isError, refetch } = useQuery({
    queryKey: ['daily-quiz', isAuthenticated],
    queryFn: () => (isAuthenticated ? QuizAPI.getToday() : QuizAPI.getPreview()),
  });

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<QuizSubmitResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const allAnswered = useMemo(
    () => quiz != null && quiz.questions.every((q) => answers[q.index] != null),
    [quiz, answers],
  );

  async function handleSubmit() {
    if (!quiz || !allAnswered) return;
    setSubmitting(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const ordered = quiz.questions.map((q) => answers[q.index]);
      const res = await QuizAPI.submit(quiz.id, ordered);
      setResult(res);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Could not submit', text2: e?.message });
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) return <Screen><LoadingState label="Loading today's quiz…" /></Screen>;
  if (isError || !quiz) return <Screen><ErrorState onRetry={refetch} /></Screen>;

  const completed = quiz.completed || result != null;
  const finalResult = result;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: Spacing.screenPadding, paddingBottom: bottomPad }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
          <Brain size={24} color={colors.primary} />
          <Text style={[TextStyles.h2, { color: colors.foreground, flex: 1 }]}>{quiz.title}</Text>
          {quiz.streak > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Flame size={18} color="#F97316" />
              <Text style={[TextStyles.label, { color: '#F97316', marginLeft: 2 }]}>{quiz.streak}</Text>
            </View>
          )}
        </View>

        {finalResult && (
          <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.primary }]}>
            <Text style={[TextStyles.h1, { color: colors.primary, textAlign: 'center' }]}>
              {finalResult.score}/{finalResult.totalQuestions}
            </Text>
            <Text style={[TextStyles.body, { color: colors.foreground, textAlign: 'center', marginTop: Spacing.xs }]}>
              {finalResult.scoreMessage?.message ?? `${finalResult.percentage}%`}
            </Text>
            {!!finalResult.streakMessage && (
              <Text style={[TextStyles.caption, { color: colors.mutedForeground, textAlign: 'center', marginTop: Spacing.xs }]}>
                {finalResult.streakMessage}
              </Text>
            )}
          </View>
        )}

        {completed && !finalResult && (
          <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[TextStyles.body, { color: colors.foreground, textAlign: 'center' }]}>
              {quiz.result ? `You scored ${quiz.result.score}/${quiz.questions.length} today.` : "You've completed today's quiz."}
            </Text>
            <Text style={[TextStyles.caption, { color: colors.mutedForeground, textAlign: 'center', marginTop: Spacing.xs }]}>
              Come back tomorrow for a new quiz!
            </Text>
          </View>
        )}

        {quiz.questions.map((q) => {
          const chosen = answers[q.index];
          const correctIndex = q.correctIndex;
          const showAnswers = finalResult != null && correctIndex != null;
          return (
            <View key={q.index} testID={`card-question-${q.index}`} style={[styles.qCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.sm }}>
                <Text style={[TextStyles.caption, { color: colors.mutedForeground }]}>Q{q.index + 1}</Text>
                <Badge label={q.difficulty} color="#fff" bg={QUIZ_DIFFICULTY_COLORS[q.difficulty] ?? colors.primary} />
              </View>
              <Text style={[TextStyles.label, { color: colors.foreground, marginBottom: Spacing.md }]}>{q.question}</Text>
              {q.options.map((opt, i) => {
                const selected = chosen === i;
                let borderColor = colors.border;
                let bg = 'transparent';
                if (showAnswers && i === correctIndex) { borderColor = '#22C55E'; bg = '#22C55E22'; }
                else if (showAnswers && selected && i !== correctIndex) { borderColor = '#EF4444'; bg = '#EF444422'; }
                else if (selected) { borderColor = colors.primary; bg = colors.primary; }
                return (
                  <Pressable
                    key={i}
                    testID={`option-${q.index}-${i}`}
                    disabled={completed}
                    onPress={() => setAnswers((p) => ({ ...p, [q.index]: i }))}
                    style={[styles.option, { borderColor, backgroundColor: bg }]}
                  >
                    <Text style={[TextStyles.body, { color: selected && !showAnswers ? '#fff' : colors.foreground, flex: 1 }]}>{opt}</Text>
                    {showAnswers && i === correctIndex && <CheckCircle size={16} color="#22C55E" />}
                    {showAnswers && selected && i !== correctIndex && <XCircle size={16} color="#EF4444" />}
                  </Pressable>
                );
              })}
              {showAnswers && !!q.explanation && (
                <Text style={[TextStyles.caption, { color: colors.mutedForeground, marginTop: Spacing.sm, fontStyle: 'italic' }]}>
                  {q.explanation}
                </Text>
              )}
            </View>
          );
        })}

        {!completed && (
          <PrimaryButton
            testID="button-submit-quiz"
            label={allAnswered ? 'Submit answers' : `Answer all ${quiz.questions.length} questions`}
            disabled={!allAnswered}
            loading={submitting}
            onPress={handleSubmit}
          />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  resultCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.xl,
    marginVertical: Spacing.lg,
  },
  qCard: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.cardPadding,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
});
