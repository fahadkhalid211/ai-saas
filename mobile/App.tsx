import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { colors } from './src/theme/colors';
import { CresceloMark } from './src/components/CresceloMark';
import { SplashScreen } from './src/screens/SplashScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { LiveChatScreen } from './src/screens/LiveChatScreen';
import { AppointmentsScreen } from './src/screens/AppointmentsScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { Calendar, Bell, Settings, MessageSquare } from 'lucide-react-native';
import { api } from './src/services/api';

const Tab = createBottomTabNavigator();

// Custom Dark Navigation Theme
const CresceloNavTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accent,
    background: colors.bgDark,
    card: colors.bg,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.accent,
  },
};

function MainTabs() {
  const { selectedAssistant } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [waitingChatCount, setWaitingChatCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    const fetchBadges = async () => {
      if (!selectedAssistant) return;
      try {
        const [notifRes, convList] = await Promise.all([
          api.getNotifications(selectedAssistant.id, 20).catch(() => ({ unreadCount: 0 })),
          api.getConversations(selectedAssistant.id).catch(() => []),
        ]);
        if (isMounted) {
          setUnreadCount(notifRes.unreadCount || 0);
          const waiting = (convList || []).filter(
            (c: any) => c.status === 'waiting_for_agent' && !c.isLiveTakeover
          ).length;
          setWaitingChatCount(waiting);
        }
      } catch (e) {
        // silent
      }
    };

    fetchBadges();
    const interval = setInterval(fetchBadges, 20000); // 20s background poll for badges
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedAssistant]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="LiveChat"
        component={LiveChatScreen}
        options={{
          tabBarLabel: 'Live Chat',
          tabBarBadge: waitingChatCount > 0 ? waitingChatCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.warning,
            color: '#04140d',
            fontSize: 10,
            fontWeight: '700',
          },
          tabBarIcon: ({ color }: { color: string; size?: number }) => (
            <MessageSquare color={color} size={22} />
          ),
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={AppointmentsScreen}
        options={{
          tabBarLabel: 'Appointments',
          tabBarIcon: ({ color }: { color: string; size?: number }) => (
            <Calendar color={color} size={22} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.accent,
            color: colors.textInverse,
            fontSize: 10,
            fontWeight: '700',
          },
          tabBarIcon: ({ color }: { color: string; size?: number }) => (
            <Bell color={color} size={22} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }: { color: string; size?: number }) => (
            <Settings color={color} size={22} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function NavigationRoot() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer theme={CresceloNavTheme}>
      <StatusBar style="light" backgroundColor={colors.bgDark} />
      {isAuthenticated ? <MainTabs /> : <LoginScreen />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationRoot />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: colors.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
