import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialTopTabNavigationProp } from '@react-navigation/material-top-tabs';

/**
 * Auth Stack Navigation
 */
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

/**
 * Main Bottom Tabs Navigation
 */
export type MainTabParamList = {
  Parcours: undefined;
  Carte: undefined;
  RewardsTab: undefined;
  LeaderboardTab: undefined;
  Profil: undefined;
};

/**
 * Main Stack Navigation (for detail screens)
 */
export type MainStackParamList = {
  MainTabs: undefined;
  ParcoursDetail: { parcoursId: number };
  ParcoursTracking: { parcoursId: number; sessionId: number };
  ParcoursCompletion: {
    parcoursName: string;
    distance: number;
    duration: number;
    pointsEarned: number;
    poisVisited: number;
  };
  Quiz: { quizId: number; quizTitle: string };
};

/**
 * Root Stack Navigation
 */
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

/**
 * Navigation Props Types
 */
export type AuthNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  keyof AuthStackParamList
>;

export type MainTabNavigationProp = MaterialTopTabNavigationProp<
  MainTabParamList,
  keyof MainTabParamList
>;

export type RootNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  keyof RootStackParamList
>;
