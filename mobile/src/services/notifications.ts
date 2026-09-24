import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

const PUSH_TOKEN_STORAGE_KEY = '@crescelo_device_push_token';

/**
 * Registers device for push notifications.
 * Works seamlessly with Expo Notifications in production APKs and Expo Go.
 */
export async function registerForPushNotifications(assistantId?: string): Promise<string | null> {
  try {
    // Only physical devices can receive remote push notifications
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
      return null;
    }

    let Notifications: any;
    try {
      // @ts-ignore
      Notifications = await import('expo-notifications');
    } catch {
      console.log('[Push] expo-notifications module not loaded');
      return null;
    }

    if (!Notifications || !Notifications.getPermissionsAsync) {
      return null;
    }

    // Set notification channel on Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('crescelo-appointments', {
        name: 'Crescelo Appointments & Bookings',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#abff44',
        sound: 'default',
        enableLights: true,
        enableVibrate: true,
      });
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[Push] Push notification permissions not granted');
      return null;
    }

    // Get Expo Push Token
    let tokenData;
    try {
      tokenData = await Notifications.getExpoPushTokenAsync();
    } catch (tokenErr) {
      console.log('[Push] Could not obtain push token (e.g. running in simulator):', tokenErr);
      return null;
    }

    const token = tokenData?.data;
    if (token) {
      await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
      await api.registerPushToken(token, assistantId, `${Platform.OS} device`);
      return token;
    }

    return null;
  } catch (error) {
    console.warn('[Push] Error in registerForPushNotifications:', error);
    return null;
  }
}

/**
 * Clears push token from backend and local storage on logout
 */
export async function unregisterPushNotifications(): Promise<void> {
  try {
    const token = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
    if (token) {
      await api.unregisterPushToken(token);
      await AsyncStorage.removeItem(PUSH_TOKEN_STORAGE_KEY);
    }
  } catch (error) {
    console.warn('[Push] Error in unregisterPushNotifications:', error);
  }
}
