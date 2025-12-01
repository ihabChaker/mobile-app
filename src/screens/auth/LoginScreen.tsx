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

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      setIsLoading(true);
      dispatch(setLoading(true));

      const response = await authService.login({ email, password });

      dispatch(
        setCredentials({
          user: response.user,
          token: response.access_token,
        })
      );

      // La navigation sera gérée automatiquement par le NavigationContainer
    } catch (error: any) {
      dispatch(setError(error.message || 'Erreur de connexion'));
      Alert.alert('Erreur', error.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.subtitle}>
            Connectez-vous pour continuer votre aventure historique
          </Text>
        </View>

        {/* Formulaire */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="votre@email.com"
              placeholderTextColor={colors.gray500}
              value={email}
              onChangeText={setEmail}
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
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.loginButtonText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Pas encore de compte ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>S'inscrire</Text>
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
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
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
  inputContainer: {
    marginBottom: spacing.lg,
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
    paddingVertical: spacing.md,
    ...typography.bodyLarge,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.gray300,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xl,
  },
  forgotPasswordText: {
    ...typography.bodySmall,
    color: colors.primary,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 3,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    ...typography.button,
    color: colors.white,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  registerText: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  registerLink: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '600',
  },
});
