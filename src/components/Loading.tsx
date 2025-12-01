import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { colors, typography } from '@/theme';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
}

export const Loading: React.FC<LoadingProps> = ({
  message = 'Chargement...',
  size = 'large',
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={colors.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  message: {
    ...typography.bodyMedium,
    color: colors.text,
    marginTop: 16,
  },
});
