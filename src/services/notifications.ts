import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

// Expo Go checks for Android SDK 53+
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Dynamic import helper
const getNotifications = () => {
  if (Platform.OS === 'android' && isExpoGo) return null;
  return require('expo-notifications');
};

const Notifications = getNotifications();

// Configure how notifications are handled when the app is in the foreground
if (Notifications) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (e) {
    console.warn('Notification handler setup failed:', e);
  }
}

const HABIT_CHANNEL_ID = 'habit-reminders';

async function setupNotificationChannel() {
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync(HABIT_CHANNEL_ID, {
        name: 'Alışkanlık Hatırlatıcıları',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    } catch (e) {
      console.warn('Android notification channel setup failed (likely Expo Go limitation):', e);
    }
  }
}

export async function requestNotificationPermissions() {
  // Android Expo Go SDK 53+ limitation check
  if (Platform.OS === 'android' && isExpoGo) {
    console.log('Skipping notification permission request in Expo Go (Android limitation)');
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus === 'granted') {
      await setupNotificationChannel();
    }
    
    return finalStatus === 'granted';
  } catch (error) {
    console.error("Error requesting notification permissions:", error);
    return false;
  }
}

export async function scheduleHabitReminder(habitId: string, habitName: string, time: string) {
  if (Platform.OS === 'android' && isExpoGo) return;

  try {
    // time format "HH:mm"
    const [hours, minutes] = time.split(':').map(Number);

    // First, cancel any existing notification for this habit
    await cancelHabitReminder(habitId);

    // Schedule new notification
    await Notifications.scheduleNotificationAsync({
      identifier: habitId,
      content: {
        title: 'Alışkanlık Hatırlatıcıları 🔔',
        body: `"${habitName}" alışkanlığını tamamlama zamanı geldi!`,
        data: { habitId },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: hours,
        minute: minutes,
        repeats: true,
        channelId: HABIT_CHANNEL_ID,
      } as Notifications.NotificationTriggerInput,
    });
  } catch (error) {
    console.error("Error scheduling notification:", error);
  }
}

export async function cancelHabitReminder(habitId: string) {
  if (Platform.OS === 'android' && isExpoGo) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(habitId);
  } catch (e) {
    console.warn('Cancel notification failed:', e);
  }
}

export async function cancelAllReminders() {
  if (Platform.OS === 'android' && isExpoGo) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    console.warn('Cancel all notifications failed:', e);
  }
}

export async function syncAllHabitReminders(habits: any[]) {
  if (Platform.OS === 'android' && isExpoGo) return;
  
  try {
    // Clear all first to avoid duplicates
    await cancelAllReminders();
    
    for (const habit of habits) {
      if (habit.reminderEnabled && habit.reminderTime) {
        await scheduleHabitReminder(habit.id, habit.name, habit.reminderTime);
      }
    }
  } catch (error) {
    console.error("Error syncing reminders:", error);
  }
}
