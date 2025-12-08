import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainStackParamList, MainTabParamList } from './types';
import { ParcoursScreen } from '@/screens/main/ParcoursScreen';
import { CarteScreen } from '@/screens/main/CarteScreen';
import { ProfilScreen } from '@/screens/main/ProfilScreen';
import { ParcoursDetailScreen } from '@/screens/main/ParcoursDetailScreen';
import { ParcoursTrackingScreen } from '@/screens/main/ParcoursTrackingScreen';
import { ParcoursCompletionScreen } from '@/screens/main/ParcoursCompletionScreen';
import { QuizScreen } from '@/screens/main/QuizScreen';
import { TreasureHuntScreen } from '@/screens/main/TreasureHuntScreen';
import { RewardsScreen } from '@/screens/main/RewardsScreen';
import { colors } from '@/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

// Custom tab bar icon component
const TabIcon: React.FC<{ icon: string; label: string; focused: boolean }> = ({
  icon,
  label,
  focused,
}) => (
  <View style={tabStyles.iconContainer}>
    <Text style={[tabStyles.icon, focused && tabStyles.iconFocused]}>
      {icon}
    </Text>
    <Text style={[tabStyles.label, focused && tabStyles.labelFocused]}>
      {label}
    </Text>
  </View>
);

const tabStyles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2,
    minHeight: 52,
    width: 70,
  },
  icon: {
    fontSize: 20,
    marginBottom: 4,
  },
  iconFocused: {
    transform: [{ scale: 1.1 }],
  },
  label: {
    fontSize: 9,
    fontWeight: '500',
    color: colors.gray500,
    textAlign: 'center',
    marginTop: 2,
  },
  labelFocused: {
    color: colors.primary,
    fontWeight: '700',
  },
});

const MainTabs: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray500,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          elevation: 16,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          height: 70 + (Platform.OS === 'ios' ? insets.bottom : 10),
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 10,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Parcours"
        component={ParcoursScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🥾" label="Parcours" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Carte"
        component={CarteScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🗺️" label="Carte" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="RewardsTab"
        component={RewardsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🎁" label="Récompenses" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfilScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👤" label="Profil" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ParcoursDetail"
        component={ParcoursDetailScreen}
        options={{
          title: 'Détail du parcours',
          headerBackTitle: 'Retour',
        }}
      />
      <Stack.Screen
        name="ParcoursTracking"
        component={ParcoursTrackingScreen}
        options={{
          title: 'Parcours en cours',
          headerBackTitle: 'Retour',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ParcoursCompletion"
        component={ParcoursCompletionScreen}
        options={{
          title: 'Félicitations',
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="Quiz"
        component={QuizScreen}
        options={{
          title: 'Quiz',
          headerBackTitle: 'Retour',
        }}
      />
      <Stack.Screen
        name="TreasureHunt"
        component={TreasureHuntScreen}
        options={{
          title: 'Chasse au trésor',
          headerBackTitle: 'Retour',
        }}
      />
    </Stack.Navigator>
  );
};
