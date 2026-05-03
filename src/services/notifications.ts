import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const HABIT_CHANNEL_ID = 'habit-reminders';

async function setupNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(HABIT_CHANNEL_ID, {
      name: 'Alışkanlık Hatırlatıcıları',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
}

export async function requestNotificationPermissions() {
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
}

export async function scheduleHabitReminder(habitId: string, habitName: string, time: string) {
  // time format "HH:mm"
  const [hours, minutes] = time.split(':').map(Number);

  // First, cancel any existing notification for this habit
  await cancelHabitReminder(habitId);

  // Schedule new notification
  await Notifications.scheduleNotificationAsync({
    identifier: habitId,
    content: {
      title: 'Alışkanlık Hatırlatıcısı 🔔',
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
}

export async function cancelHabitReminder(habitId: string) {
  await Notifications.cancelScheduledNotificationAsync(habitId);
}

export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function syncAllHabitReminders(habits: any[]) {
  // Clear all first to avoid duplicates
  await cancelAllReminders();
  
  for (const habit of habits) {
    if (habit.reminderEnabled && habit.reminderTime) {
      await scheduleHabitReminder(habit.id, habit.name, habit.reminderTime);
    }
  }
}
