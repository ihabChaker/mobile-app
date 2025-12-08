import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '@/navigation/types';
import { colors, typography, spacing } from '@/theme';
import quizService, { Quiz } from '@/services/quiz.service';

type QuizScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'Quiz'>;
  route: RouteProp<MainStackParamList, 'Quiz'>;
};

/**
 * Écran de quiz interactif
 * Phase 4 - Gamification
 */
export const QuizScreen: React.FC<QuizScreenProps> = ({
  navigation,
  route,
}) => {
  const { quizId } = route.params;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Map<number, number>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{
    score: number;
    maxScore: number;
    pointsEarned: number;
    questionResults: { questionId: number; correct: boolean; points: number }[];
  } | null>(null);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      setIsLoading(true);
      const quizData = await quizService.getQuizById(quizId);
      setQuiz(quizData);
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de charger le quiz');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const questions = quiz?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress =
    totalQuestions > 0
      ? ((currentQuestionIndex + 1) / totalQuestions) * 100
      : 0;

  const handleAnswerSelect = (answerId: number) => {
    if (showResults || !currentQuestion) return;

    const newAnswers = new Map(selectedAnswers);
    newAnswers.set(currentQuestion.id, answerId);
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    // Check if all questions are answered
    const unansweredCount = questions.filter(
      q => !selectedAnswers.has(q.id)
    ).length;
    if (unansweredCount > 0) {
      Alert.alert(
        'Questions non répondues',
        `Il reste ${unansweredCount} question(s) sans réponse. Voulez-vous continuer ?`,
        [
          { text: 'Revoir', style: 'cancel' },
          { text: 'Soumettre', style: 'destructive', onPress: submitQuiz },
        ]
      );
      return;
    }

    submitQuiz();
  };

  const submitQuiz = async () => {
    if (!quiz) return;

    try {
      setIsSubmitting(true);
      const answers = Array.from(selectedAnswers.entries()).map(
        ([questionId, answerId]) => ({
          questionId,
          answerId,
        })
      );

      const result = await quizService.submitQuizAttempt(quiz.id, answers);

      setResults({
        score: result.score,
        maxScore: result.totalQuestions,
        pointsEarned: result.pointsEarned,
        questionResults: [],
      });
      setShowResults(true);
    } catch (error: any) {
      Alert.alert(
        'Erreur',
        error.message || 'Impossible de soumettre le quiz',
        [
          { text: 'Réessayer', onPress: submitQuiz },
          {
            text: 'Quitter',
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return colors.success;
      case 'medium':
        return colors.warning;
      case 'hard':
        return colors.error;
      default:
        return colors.gray500;
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Facile';
      case 'medium':
        return 'Moyen';
      case 'hard':
        return 'Difficile';
      default:
        return difficulty;
    }
  };

  const getScoreEmoji = (percentage: number) => {
    if (percentage >= 80) return '🏆';
    if (percentage >= 60) return '👍';
    if (percentage >= 40) return '📚';
    return '💪';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top', 'bottom']}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement du quiz...</Text>
      </SafeAreaView>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <SafeAreaView style={styles.errorContainer} edges={['top', 'bottom']}>
        <Text style={styles.errorIcon}>📝</Text>
        <Text style={styles.errorText}>Aucune question disponible</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Results screen
  if (showResults && results) {
    const percentage =
      results.maxScore > 0 ? (results.score / results.maxScore) * 100 : 0;

    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.resultsContainer}>
          <View style={styles.resultsCard}>
            <Text style={styles.resultsEmoji}>{getScoreEmoji(percentage)}</Text>
            <Text style={styles.resultsTitle}>Quiz terminé !</Text>

            <View style={styles.scoreContainer}>
              <Text style={styles.scoreValue}>{results.score}</Text>
              <Text style={styles.scoreMax}>
                / {results.maxScore} questions
              </Text>
            </View>

            <Text style={styles.percentageText}>
              {Math.round(percentage)}% de bonnes réponses
            </Text>

            <View style={styles.pointsEarnedContainer}>
              <Text style={styles.pointsEarnedLabel}>Points gagnés</Text>
              <Text style={styles.pointsEarnedValue}>
                +{results.pointsEarned} pts
              </Text>
            </View>
          </View>

          {/* Question breakdown */}
          <View style={styles.breakdownContainer}>
            <Text style={styles.breakdownTitle}>Détail des réponses</Text>
            {results.questionResults.map((qr, index) => {
              const question = questions.find(q => q.id === qr.questionId);
              return (
                <View key={qr.questionId} style={styles.breakdownItem}>
                  <View
                    style={[
                      styles.breakdownIndicator,
                      {
                        backgroundColor: qr.correct
                          ? colors.success
                          : colors.error,
                      },
                    ]}
                  />
                  <View style={styles.breakdownContent}>
                    <Text style={styles.breakdownQuestion} numberOfLines={2}>
                      Q{index + 1}: {question?.questionText || 'Question'}
                    </Text>
                    <Text
                      style={[
                        styles.breakdownResult,
                        { color: qr.correct ? colors.success : colors.error },
                      ]}
                    >
                      {qr.correct
                        ? `✓ Correct (+${qr.points} pts)`
                        : '✗ Incorrect'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.finishButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.finishButtonText}>Terminer</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Quiz questions screen
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Progress header */}
      <View style={styles.progressHeader}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1} / {totalQuestions}
          </Text>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(quiz.difficulty) },
            ]}
          >
            <Text style={styles.difficultyText}>
              {getDifficultyLabel(quiz.difficulty)}
            </Text>
          </View>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
      </View>

      <ScrollView
        style={styles.questionContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Question */}
        <View style={styles.questionCard}>
          <Text style={styles.questionNumber}>
            Question {currentQuestionIndex + 1}
          </Text>
          <Text style={styles.questionText}>
            {currentQuestion?.questionText || ''}
          </Text>
          {currentQuestion?.points && (
            <Text style={styles.questionPoints}>
              {currentQuestion.points} points
            </Text>
          )}
        </View>

        {/* Answers */}
        <View style={styles.answersContainer}>
          {(currentQuestion?.answers || []).map((answer, index) => {
            const isSelected =
              selectedAnswers.get(currentQuestion.id) === answer.id;
            const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

            return (
              <TouchableOpacity
                key={answer.id}
                style={[
                  styles.answerButton,
                  isSelected && styles.answerButtonSelected,
                ]}
                onPress={() => handleAnswerSelect(answer.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.answerLetter,
                    isSelected && styles.answerLetterSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.answerLetterText,
                      isSelected && styles.answerLetterTextSelected,
                    ]}
                  >
                    {letters[index] || index + 1}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.answerText,
                    isSelected && styles.answerTextSelected,
                  ]}
                >
                  {answer.answerText}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Navigation buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentQuestionIndex === 0 && styles.navButtonDisabled,
          ]}
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <Text
            style={[
              styles.navButtonText,
              currentQuestionIndex === 0 && styles.navButtonTextDisabled,
            ]}
          >
            ← Précédent
          </Text>
        </TouchableOpacity>

        {currentQuestionIndex === totalQuestions - 1 ? (
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>Soumettre</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.navButton} onPress={handleNext}>
            <Text style={styles.navButtonText}>Suivant →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Question dots */}
      <View style={styles.dotsContainer}>
        {questions.map((q, index) => {
          const isAnswered = selectedAnswers.has(q.id);
          const isCurrent = index === currentQuestionIndex;

          return (
            <TouchableOpacity
              key={q.id}
              style={[
                styles.dot,
                isAnswered && styles.dotAnswered,
                isCurrent && styles.dotCurrent,
              ]}
              onPress={() => setCurrentQuestionIndex(index)}
            />
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.gray600,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.h5,
    color: colors.gray600,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  backButtonText: {
    ...typography.labelLarge,
    color: colors.white,
  },
  progressHeader: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressText: {
    ...typography.labelMedium,
    color: colors.gray700,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  difficultyText: {
    ...typography.labelSmall,
    color: colors.white,
    textTransform: 'capitalize',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: colors.gray200,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  questionContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  questionNumber: {
    ...typography.labelSmall,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  questionText: {
    ...typography.h5,
    color: colors.gray900,
    lineHeight: 26,
  },
  questionPoints: {
    ...typography.labelSmall,
    color: colors.gray500,
    marginTop: spacing.sm,
  },
  answersContainer: {
    gap: spacing.md,
  },
  answerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.gray200,
  },
  answerButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '10',
  },
  answerLetter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  answerLetterSelected: {
    backgroundColor: colors.primary,
  },
  answerLetterText: {
    ...typography.labelLarge,
    color: colors.gray600,
  },
  answerLetterTextSelected: {
    color: colors.white,
  },
  answerText: {
    ...typography.bodyMedium,
    color: colors.gray800,
    flex: 1,
  },
  answerTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  navButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    ...typography.labelLarge,
    color: colors.primary,
  },
  navButtonTextDisabled: {
    color: colors.gray400,
  },
  submitButton: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    ...typography.labelLarge,
    color: colors.white,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.gray300,
  },
  dotAnswered: {
    backgroundColor: colors.primary,
  },
  dotCurrent: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  // Results styles
  resultsContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  resultsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: spacing.lg,
  },
  resultsEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  resultsTitle: {
    ...typography.h3,
    color: colors.gray900,
    marginBottom: spacing.lg,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
  },
  scoreMax: {
    ...typography.h4,
    color: colors.gray500,
    marginLeft: spacing.xs,
  },
  percentageText: {
    ...typography.bodyLarge,
    color: colors.gray600,
    marginBottom: spacing.lg,
  },
  pointsEarnedContainer: {
    backgroundColor: colors.success + '15',
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  pointsEarnedLabel: {
    ...typography.labelSmall,
    color: colors.gray600,
    marginBottom: spacing.xs,
  },
  pointsEarnedValue: {
    ...typography.h5,
    color: colors.success,
    fontWeight: 'bold',
  },
  breakdownContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    width: '100%',
    marginBottom: spacing.lg,
  },
  breakdownTitle: {
    ...typography.h6,
    color: colors.gray900,
    marginBottom: spacing.md,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  breakdownIndicator: {
    width: 4,
    height: '100%',
    minHeight: 40,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  breakdownContent: {
    flex: 1,
  },
  breakdownQuestion: {
    ...typography.bodySmall,
    color: colors.gray700,
    marginBottom: spacing.xs,
  },
  breakdownResult: {
    ...typography.labelSmall,
  },
  finishButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  finishButtonText: {
    ...typography.labelLarge,
    color: colors.white,
  },
});

export default QuizScreen;
