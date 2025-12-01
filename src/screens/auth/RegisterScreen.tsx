import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/types';
import { colors, typography, spacing } from '@/theme';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials, setLoading, setError } from '@/store/slices/authSlice';
import authService from '@/services/auth.service';

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  navigation,
}) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    const { firstName, lastName, username, email, password, confirmPassword } =
      formData;

    // Validation
    if (!firstName.trim() || !lastName.trim() || !username.trim() || !email.trim() || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return;
    }

    if (username.length < 3) {
      Alert.alert('Erreur', "Le nom d'utilisateur doit contenir au moins 3 caractères");
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Erreur',
        'Le mot de passe doit contenir au moins 6 caractères'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setIsLoading(true);
      dispatch(setLoading(true));

      const response = await authService.register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
      });

      dispatch(
        setCredentials({
          user: response.user,
          token: response.access_token,
        })
      );

      Alert.alert(
        'Bienvenue !',
        `Votre compte a été créé avec succès, ${response.user.firstName}. Profitez de votre aventure HistoRando !`,
        [{ text: 'Commencer', style: 'default' }]
      );
    } catch (error: any) {
      const errorMessage = error.message || "Erreur lors de l'inscription";
      dispatch(setError(errorMessage));
      Alert.alert('Échec de l\'inscription', errorMessage);
    } finally {
      setIsLoading(false);
      dispatch(setLoading(false));
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>
            Rejoignez HistoRando et commencez votre aventure
          </Text>
        </View>

        {/* Formulaire */}
        <View style={styles.form}>
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Prénom</Text>
              <TextInput
                style={styles.input}
                placeholder="Jean"
                placeholderTextColor={colors.gray500}
                value={formData.firstName}
                onChangeText={value => updateField('firstName', value)}
                autoCapitalize="words"
              />
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Nom</Text>
              <TextInput
                style={styles.input}
                placeholder="Dupont"
                placeholderTextColor={colors.gray500}
                value={formData.lastName}
                onChangeText={value => updateField('lastName', value)}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nom d'utilisateur</Text>
            <TextInput
              style={styles.input}
              placeholder="jean_dupont"
              placeholderTextColor={colors.gray500}
              value={formData.username}
              onChangeText={value => updateField('username', value)}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="jean@email.com"
              placeholderTextColor={colors.gray500}
              value={formData.email}
              onChangeText={value => updateField('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.gray500}
              value={formData.password}
              onChangeText={value => updateField('password', value)}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirmer le mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.gray500}
              value={formData.confirmPassword}
              onChangeText={value => updateField('confirmPassword', value)}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.registerButton,
              isLoading && styles.registerButtonDisabled,
            ]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.registerButtonText}>S'inscrire</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Déjà un compte ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  form: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    ...typography.labelMedium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.bodyLarge,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.gray300,
  },
  registerButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 3,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    ...typography.button,
    color: colors.white,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  loginText: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  loginLink: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '600',
  },
});
