import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
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

const Tab = createMaterialTopTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray500,
        tabBarLabelStyle: {
          ...typography.labelMedium,
          textTransform: 'none',
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.gray300,
        },
        tabBarIndicatorStyle: {
          backgroundColor: colors.primary,
          height: 3,
        },
      }}
    >
      <Tab.Screen
        name="Parcours"
        component={ParcoursScreen}
        options={{ tabBarLabel: 'Parcours' }}
      />
      <Tab.Screen
        name="Carte"
        component={CarteScreen}
        options={{ tabBarLabel: 'Carte' }}
      />
      <Tab.Screen
        name="Podcasts"
        component={PodcastScreen}
        options={{ tabBarLabel: 'Podcasts' }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfilScreen}
        options={{ tabBarLabel: 'Profil' }}
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
