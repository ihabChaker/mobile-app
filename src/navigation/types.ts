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
 * Main Top Tabs Navigation
 */
export type MainTabParamList = {
  Parcours: undefined;
  Carte: undefined;
  Podcasts: undefined;
  Profil: undefined;
};

/**
 * Main Stack Navigation (for detail screens)
 */
export type MainStackParamList = {
  MainTabs: undefined;
  ParcoursDetail: { parcoursId: number };
  Quiz: { poiId: number; poiName: string };
  Rewards: undefined;
  Leaderboard: undefined;
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
