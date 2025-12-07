import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/types';
import { colors, typography, spacing } from '@/theme';
import { Button } from '@/components';

const { width } = Dimensions.get('window');

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Logo HistoRando */}
      <View style={styles.illustrationContainer}>
        <Image
          source={require('../../../assets/logo.jpeg')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Titre et description */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>HistoRando</Text>
        <Text style={styles.subtitle}>
          Découvrez l'histoire de la Normandie à travers des parcours
          historiques immersifs
        </Text>
      </View>

      {/* Bouton Commencer */}
      <View style={styles.buttonContainer}>
        <Button
          title="Commencer"
          onPress={() => navigation.navigate('Login')}
          variant="primary"
          size="large"
        />

        <Button
          title="Créer un compte"
          onPress={() => navigation.navigate('Register')}
          variant="outline"
          size="large"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  logo: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 20,
  },
  contentContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
});
