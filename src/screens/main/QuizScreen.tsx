import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Animated,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/types';
import { colors, typography, spacing } from '@/theme';
import { quizService, QuizQuestion } from '@/services/quiz.service';

type Props = NativeStackScreenProps<MainStackParamList, 'Quiz'>;

interface QuizState {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  selectedAnswer: number | null;
  answers: Map<number, number>;
  score: number;
  loading: boolean;
  showResult: boolean;
  isCorrect: boolean | null;
  pointsEarned: number;
  completed: boolean;
}

/**
 * Écran Quiz - Affiche et gère les quiz pour les POIs
 * Phase 4 - Gamification
 */
export const QuizScreen: React.FC<Props> = ({ route, navigation }) => {
  const { poiId, poiName } = route.params;
  const [state, setState] = useState<QuizState>({
    questions: [],
    currentQuestionIndex: 0,
    selectedAnswer: null,
    answers: new Map(),
    score: 0,
    loading: true,
    showResult: false,
    isCorrect: null,
    pointsEarned: 0,
    completed: false,
  });

  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];

  useEffect(() => {
    loadQuestions();
  }, [poiId]);

  const loadQuestions = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const questions = await quizService.getQuestionsByPOI(poiId);
      setState((prev) => ({
        ...prev,
        questions,
        loading: false,
      }));
    } catch (error) {
      console.error('Error loading questions:', error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleSelectAnswer = (answerIndex: number) => {
    setState((prev) => ({
      ...prev,
      selectedAnswer: answerIndex,
    }));
  };

  const handleSubmitAnswer = async () => {
    if (state.selectedAnswer === null) return;

    const currentQuestion = state.questions[state.currentQuestionIndex];
    const isCorrect = state.selectedAnswer === currentQuestion.correctAnswer;
    const points = isCorrect ? currentQuestion.points : 0;

    try {
      // Submit answer to backend
      await quizService.submitAnswer(
        currentQuestion.id,
        state.selectedAnswer
      );

      // Update local state
      const newAnswers = new Map(state.answers);
      newAnswers.set(currentQuestion.id, state.selectedAnswer);

      setState((prev) => ({
        ...prev,
        answers: newAnswers,
        isCorrect,
        pointsEarned: points,
        score: prev.score + points,
        showResult: true,
      }));

      // Animate result modal
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const handleNextQuestion = () => {
    // Reset animations
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);

    const nextIndex = state.currentQuestionIndex + 1;
    
    if (nextIndex >= state.questions.length) {
      // Quiz completed
      setState((prev) => ({
        ...prev,
        completed: true,
        showResult: false,
        selectedAnswer: null,
      }));
    } else {
      // Next question
      setState((prev) => ({
        ...prev,
        currentQuestionIndex: nextIndex,
        selectedAnswer: null,
        showResult: false,
        isCorrect: null,
        pointsEarned: 0,
      }));
    }
  };

  const handleFinish = () => {
    navigation.goBack();
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
        return colors.text;
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

  if (state.loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement du quiz...</Text>
      </View>
    );
  }

  if (state.questions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🧠</Text>
        <Text style={styles.emptyTitle}>Aucun quiz disponible</Text>
        <Text style={styles.emptyText}>
          Ce point d'intérêt n'a pas encore de quiz.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (state.completed) {
    const accuracy = (state.score / state.questions.reduce((sum, q) => sum + q.points, 0)) * 100;
    
    return (
      <View style={styles.completedContainer}>
        <Text style={styles.completedIcon}>🎉</Text>
        <Text style={styles.completedTitle}>Quiz terminé !</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{state.score}</Text>
            <Text style={styles.statLabel}>Points gagnés</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{state.questions.length}</Text>
            <Text style={styles.statLabel}>Questions</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{Math.round(accuracy)}%</Text>
            <Text style={styles.statLabel}>Précision</Text>
          </View>
        </View>

        <View style={styles.messageContainer}>
          {accuracy >= 80 ? (
            <>
              <Text style={styles.messageTitle}>Excellent travail ! 🌟</Text>
              <Text style={styles.messageText}>
                Vous maîtrisez parfaitement l'histoire de ce lieu.
              </Text>
            </>
          ) : accuracy >= 60 ? (
            <>
              <Text style={styles.messageTitle}>Bon travail ! 👍</Text>
              <Text style={styles.messageText}>
                Vous avez de bonnes connaissances, continuez comme ça !
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.messageTitle}>Bien essayé ! 💪</Text>
              <Text style={styles.messageText}>
                Explorez davantage pour améliorer vos connaissances.
              </Text>
            </>
          )}
        </View>

        <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
          <Text style={styles.finishButtonText}>Terminer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const progress = ((state.currentQuestionIndex + 1) / state.questions.length) * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.poiName}>{poiName}</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Question {state.currentQuestionIndex + 1} / {state.questions.length}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Question Card */}
        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(currentQuestion.difficulty) },
              ]}
            >
              <Text style={styles.difficultyText}>
                {getDifficultyLabel(currentQuestion.difficulty)}
              </Text>
            </View>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsText}>⭐ {currentQuestion.points} pts</Text>
            </View>
          </View>

          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                state.selectedAnswer === index && styles.optionButtonSelected,
              ]}
              onPress={() => handleSelectAnswer(index)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.optionRadio,
                  state.selectedAnswer === index && styles.optionRadioSelected,
                ]}
              >
                {state.selectedAnswer === index && (
                  <View style={styles.optionRadioInner} />
                )}
              </View>
              <Text
                style={[
                  styles.optionText,
                  state.selectedAnswer === index && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            state.selectedAnswer === null && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmitAnswer}
          disabled={state.selectedAnswer === null}
        >
          <Text style={styles.submitButtonText}>Valider ma réponse</Text>
        </TouchableOpacity>
      </View>

      {/* Result Modal */}
      <Modal
        visible={state.showResult}
        transparent
        animationType="none"
        onRequestClose={handleNextQuestion}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.resultModal,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={styles.resultIcon}>
              {state.isCorrect ? '✅' : '❌'}
            </Text>
            <Text style={styles.resultTitle}>
              {state.isCorrect ? 'Bonne réponse !' : 'Mauvaise réponse'}
            </Text>
            <Text style={styles.resultPoints}>
              {state.isCorrect
                ? `+${state.pointsEarned} points`
                : 'Aucun point gagné'}
            </Text>

            {!state.isCorrect && (
              <View style={styles.correctAnswerContainer}>
                <Text style={styles.correctAnswerLabel}>Réponse correcte :</Text>
                <Text style={styles.correctAnswerText}>
                  {currentQuestion.options[currentQuestion.correctAnswer]}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNextQuestion}
            >
              <Text style={styles.nextButtonText}>
                {state.currentQuestionIndex + 1 >= state.questions.length
                  ? 'Voir les résultats'
                  : 'Question suivante'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.bodyMedium,
    color: colors.gray600,
    textAlign: 'center',
    marginBottom: spacing.xl,
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
    fontWeight: '600',
  },
  header: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  poiName: {
    ...typography.h5,
    color: colors.text,
    marginBottom: spacing.md,
  },
  progressContainer: {
    gap: spacing.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    ...typography.labelSmall,
    color: colors.gray400,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  questionCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  difficultyText: {
    ...typography.labelSmall,
    color: colors.white,
    fontWeight: '600',
  },
  pointsBadge: {
    backgroundColor: colors.gray100,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  pointsText: {
    ...typography.labelSmall,
    color: colors.text,
    fontWeight: '600',
  },
  questionText: {
    ...typography.h6,
    color: colors.text,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: spacing.md,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.gray200,
  },
  optionButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray300,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionRadioSelected: {
    borderColor: colors.primary,
  },
  optionRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  optionText: {
    ...typography.bodyMedium,
    color: colors.text,
    flex: 1,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray300,
  },
  submitButtonText: {
    ...typography.button,
    color: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  resultModal: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  resultIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  resultTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  resultPoints: {
    ...typography.h6,
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  correctAnswerContainer: {
    backgroundColor: colors.gray100,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
    width: '100%',
  },
  correctAnswerLabel: {
    ...typography.labelMedium,
    color: colors.gray400,
    marginBottom: spacing.xs,
  },
  correctAnswerText: {
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
    width: '100%',
  },
  nextButtonText: {
    ...typography.button,
    color: colors.white,
    textAlign: 'center',
  },
  completedContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedIcon: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  completedTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xl,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
    width: '100%',
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h4,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.labelSmall,
    color: colors.gray400,
    textAlign: 'center',
  },
  messageContainer: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.xl,
    width: '100%',
  },
  messageTitle: {
    ...typography.h6,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  messageText: {
    ...typography.bodyMedium,
    color: colors.gray400,
    textAlign: 'center',
  },
  finishButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
    width: '100%',
  },
  finishButtonText: {
    ...typography.button,
    color: colors.white,
    textAlign: 'center',
  },
});
