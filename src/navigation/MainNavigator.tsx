import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainStackParamList, MainTabParamList } from './types';
import { ParcoursScreen } from '@/screens/main/ParcoursScreen';
import { CarteScreen } from '@/screens/main/CarteScreen';
import { ProfilScreen } from '@/screens/main/ProfilScreen';
import { PodcastScreen } from '@/screens/main/PodcastScreen';
import { ParcoursDetailScreen } from '@/screens/main/ParcoursDetailScreen';
import { QuizScreen } from '@/screens/main/QuizScreen';
import { RewardsScreen } from '@/screens/main/RewardsScreen';
import { LeaderboardScreen } from '@/screens/main/LeaderboardScreen';
import { colors, typography } from '@/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray500,
        tabBarLabelStyle: {
          ...typography.labelSmall,
          fontSize: 12,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.gray300,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Parcours"
        component={ParcoursScreen}
        options={{ 
          tabBarLabel: 'Parcours',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="Carte"
        component={CarteScreen}
        options={{ 
          tabBarLabel: 'Carte',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="Podcasts"
        component={PodcastScreen}
        options={{ 
          tabBarLabel: 'Podcasts',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfilScreen}
        options={{ 
          tabBarLabel: 'Profil',
          tabBarIcon: () => null,
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
        name="Quiz"
        component={QuizScreen}
        options={{
          title: 'Quiz',
          headerBackTitle: 'Retour',
        }}
      />
      <Stack.Screen
        name="Rewards"
        component={RewardsScreen}
        options={{
          title: 'Récompenses',
          headerBackTitle: 'Retour',
        }}
      />
      <Stack.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          title: 'Classement',
          headerBackTitle: 'Retour',
        }}
      />
    </Stack.Navigator>
  );
};
