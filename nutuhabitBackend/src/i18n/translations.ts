export type Language = 'tr' | 'en';

export interface Translations {
  // Common
  cancel: string;
  save: string;
  deleteLabel: string;
  edit: string;
  confirm: string;
  comingSoon: string;
  comingSoonMsg: string;
  // Greetings (home)
  goodMorning: string;
  goodAfternoon: string;
  goodEvening: string;
  welcomeUser: string;
  howAreYou: string;
  // Home
  addNewHabit: string;
  activeHabitSection: string;
  timeHabitSection: string;
  badHabitSection: string;
  change: string;
  noHabitsYet: string;
  noHabitsHint: string;
  daily: string;
  weekly: string;
  monthly: string;
  startStreak: string;
  weeklyGoal: string;
  dayUnit: string;
  noStreak: string;
  fireStreak: string;
  thisWeek: string;
  exceeded: string;
  // Sleep
  sleepSchedule: string;
  bedtimeLabel: string;
  wakeUpLabel: string;
  durationLabel: string;
  confirmSleep: string;
  bedtimeModal: string;
  wakeUpModal: string;
  totalSleep: string;
  sleepGood: string;
  sleepOkay: string;
  sleepPoor: string;
  sleepPickerBed: string;
  sleepPickerWake: string;
  remaining: string;
  // Habits tab
  habitsTitle: string;
  tabDone: string;
  tabTime: string;
  tabBad: string;
  logToStart: string;
  weeklyGoalLabel: string;
  weeklyGoalReached: string;
  clean: string;
  exceededTimes: (n: number) => string;
  timesUnit: string;
  minUnit: string;
  exceedLabel: string;
  emptyDone: string;
  emptyTime: string;
  emptyBad: string;
  addHabitHint: string;
  whatToDo: string;
  deleteHabitTitle: string;
  deleteHabitConfirm: (name: string) => string;
  goBack: string;
  totalTrackedTime: string;
  stayStrong: string;
  missLabel: string;
  skipLabel: string;
  // Stats
  statsTitle: string;
  statsSubtitle: string;
  today: string;
  overallRate: string;
  thisWeekLabel: string;
  habitsCount: string;
  weeklyCompletion: string;
  workedThisWeek: (d: string) => string;
  weeklyTrend: string;
  monthlyView: string;
  notEnoughData: string;
  less: string;
  full: string;
  // Profile
  profileTitle: string;
  userDefault: string;
  free: string;
  habitsLabel: string;
  timeTracking: string;
  badHabitLabel: string;
  account: string;
  notifications: string;
  notificationsOn: string;
  editProfile: string;
  appearance: string;
  themeLabel: string;
  themeDark: string;
  themeLight: string;
  appSection: string;
  aboutLabel: string;
  upgradeToPremium: string;
  premiumSubtitle: string;
  unlimitedHabits: string;
  detailedStats: string;
  customThemes: string;
  smartReminders: string;
  menuReminder: string;
  cloudBackup: string;
  upgradeNow: string;
  signOut: string;
  signOutTitle: string;
  signOutMsg: string;
  habitsActive: (n: number) => string;
  // Settings
  settingsTitle: string;
  sectionAppearance: string;
  sectionApp: string;
  sectionAbout: string;
  darkMode: string;
  darkModeSubtitle: string;
  notificationsSubtitle: string;
  language: string;
  languageCurrent: string;
  weeklyReport: string;
  weeklyReportSubtitle: string;
  privacy: string;
  privacySubtitle: string;
  resetData: string;
  resetDataSubtitle: string;
  resetDataConfirmTitle: string;
  resetDataConfirmMsg: string;
  resetDataBtn: string;
  resetDone: string;
  aboutApp: string;
  aboutVersion: string;
  rateUs: string;
  rateSubtitle: string;
  freeMember: string;
  // Stats extra charts
  habitDistribution: string;
  topCompleted: string;
  // Graph page extra charts
  barChartTitle: string;
  habitBreakdownTitle: string;
  pieChartTitle: string;
  pieDone: string;
  pieFailed: string;
  pieExcused: string;
  pieClean: string;
  pieExceeded: string;
  // Graph page
  graphsTitle: string;
  graphSubtitle: string;
  periodDay: string;
  periodWeek: string;
  periodMonth: string;
  periodYear: string;
  totalMinsLabel: string;
  avgPerDayLabel: string;
  completionRateLabel: string;
  completedDaysLabel: string;
  totalExcLabel: string;
  cleanDaysLabel: string;
}

export const tr: Translations = {
  cancel: 'Vazgeç',
  save: 'Kaydet',
  deleteLabel: 'Sil',
  edit: 'Düzenle',
  confirm: 'Onayla',
  comingSoon: 'Yakında',
  comingSoonMsg: 'Bu özellik yakında eklenecek.',
  goodMorning: 'Günaydın',
  goodAfternoon: 'İyi günler',
  goodEvening: 'İyi akşamlar',
  welcomeUser: 'Hoş geldin',
  howAreYou: 'Nasılsın',
  addNewHabit: 'Yeni Alışkanlık',
  activeHabitSection: 'AKTİF ALIŞ.',
  timeHabitSection: 'ZAMAN ALIŞ.',
  badHabitSection: 'KÖTÜ ALIŞ.',
  change: 'DEĞİŞTİR',
  noHabitsYet: 'Henüz alışkanlık yok',
  noHabitsHint: '"Yeni Alışkanlık" ile başla',
  daily: 'Günlük',
  weekly: 'Haftalık',
  monthly: 'Aylık',
  startStreak: 'Seri başlat',
  weeklyGoal: 'Haftalık Hedef',
  dayUnit: 'gün',
  noStreak: 'seri yok',
  fireStreak: '🔥 seri',
  thisWeek: 'bu hafta',
  exceeded: 'aşıldı',
  sleepSchedule: 'Uyku Takvimi',
  bedtimeLabel: 'YATIŞ',
  wakeUpLabel: 'UYANMA',
  durationLabel: 'SÜRE',
  confirmSleep: 'Uyku Saatini Onayla',
  bedtimeModal: 'Yatış Saati',
  wakeUpModal: 'Uyanma Saati',
  totalSleep: 'toplam uyku süresi',
  sleepGood: 'İyi',
  sleepOkay: 'Orta',
  sleepPoor: 'Yetersiz',
  sleepPickerBed: 'Uyku Saati',
  sleepPickerWake: 'Uyanma Saati',
  remaining: 'kaldı',
  habitsTitle: 'Alışkanlıklar',
  tabDone: 'Done',
  tabTime: 'Time',
  tabBad: 'Kötü Alışkanlık',
  logToStart: 'Başlamak için kaydet',
  weeklyGoalLabel: 'Haftalık Hedef',
  weeklyGoalReached: '% haftalık hedefe ulaşıldı',
  clean: 'Temiz',
  exceededTimes: (n) => `${n} kez aşıldı`,
  timesUnit: 'kez',
  minUnit: 'dk',
  exceedLabel: 'aşım',
  emptyDone: 'Henüz streak alışkanlığı yok',
  emptyTime: 'Henüz zaman alışkanlığı yok',
  emptyBad: 'Henüz kötü alışkanlık yok',
  addHabitHint: 'Eklemek için + butonuna dokun',
  whatToDo: 'Ne yapmak istiyorsun?',
  deleteHabitTitle: 'Alışkanlığı Sil',
  deleteHabitConfirm: (name) => `"${name}" silinsin mi?`,
  goBack: 'Vazgeç',
  totalTrackedTime: 'Toplam takip edilen süre',
  stayStrong: 'Güçlü kal 💪',
  missLabel: 'miss',
  skipLabel: 'skip',
  statsTitle: 'İstatistikler',
  statsSubtitle: 'Bugün ve bu haftanın özeti',
  today: 'Bugün',
  overallRate: 'Genel Oran',
  thisWeekLabel: 'Bu Hafta',
  habitsCount: 'Alışkanlık',
  weeklyCompletion: 'Haftalık Tamamlama',
  workedThisWeek: (d) => `Bu hafta toplam ${d} çalıştın!`,
  weeklyTrend: 'Haftalık Trend',
  monthlyView: 'Aylık Görünüm',
  notEnoughData: 'Yeterli veri yok',
  less: 'Az',
  full: 'Tam',
  profileTitle: 'Profil',
  userDefault: 'Kullanıcı',
  free: 'Ücretsiz',
  habitsLabel: 'Alışkanlık',
  timeTracking: 'Süre Takibi',
  badHabitLabel: 'Kötü Alışkanlık',
  account: 'Hesap',
  notifications: 'Bildirimler',
  notificationsOn: 'Açık',
  editProfile: 'Profili Düzenle',
  appearance: 'Görünüm',
  themeLabel: 'Tema',
  themeDark: 'Koyu',
  themeLight: 'Açık',
  appSection: 'Uygulama',
  aboutLabel: 'Hakkında',
  upgradeToPremium: '⭐ Premium\'a Geç',
  premiumSubtitle: 'Tüm özelliklere sınırsız erişim',
  unlimitedHabits: '🔓 Sınırsız alışkanlık',
  detailedStats: '📊 Detaylı istatistikler',
  customThemes: '🎨 Özel temalar',
  smartReminders: '🔔 Akıllı hatırlatıcılar',
  menuReminder: 'Hatırlatıcı',
  cloudBackup: '☁️ Bulut yedekleme',
  upgradeNow: 'Şimdi Yükselt →',
  signOut: 'Çıkış Yap',
  signOutTitle: 'Çıkış Yap',
  signOutMsg: 'Hesabından çıkmak istediğine emin misin?',
  habitsActive: (n) => `${n} alışkanlık`,
  settingsTitle: 'Ayarlar',
  sectionAppearance: 'GÖRÜNÜM',
  sectionApp: 'UYGULAMA',
  sectionAbout: 'HAKKINDA',
  darkMode: 'Gece Modu',
  darkModeSubtitle: 'Koyu tema',
  notificationsSubtitle: 'Tüm hatırlatıcılar',
  language: 'Dil',
  languageCurrent: 'Türkçe',
  weeklyReport: 'Haftalık Rapor',
  weeklyReportSubtitle: 'Her Pazar sabahı',
  privacy: 'Gizlilik',
  privacySubtitle: 'Veri ve izinler',
  resetData: 'Verileri Sıfırla',
  resetDataSubtitle: 'Tüm alışkanlıkları sil',
  resetDataConfirmTitle: 'Verileri Sıfırla',
  resetDataConfirmMsg: 'Tüm alışkanlık verileriniz silinecek. Emin misiniz?',
  resetDataBtn: 'Sıfırla',
  resetDone: 'Sıfırlandı',
  aboutApp: 'NutuHabit',
  aboutVersion: 'Versiyon 1.0.0',
  rateUs: 'Puan Ver',
  rateSubtitle: 'App Store\'da değerlendir',
  freeMember: 'Ücretsiz üye',
  habitDistribution: 'Alışkanlık Dağılımı',
  topCompleted: 'En Çok Tamamlanan',
  barChartTitle: 'Çubuk Grafik',
  habitBreakdownTitle: 'Alışkanlık Bazlı',
  pieChartTitle: 'Pasta Grafik',
  pieDone: 'Tamamlandı',
  pieFailed: 'Başarısız',
  pieExcused: 'Mazeretli',
  pieClean: 'Temiz Gün',
  pieExceeded: 'Aşıldı',
  graphsTitle: 'Grafikler',
  graphSubtitle: 'Alışkanlık trendlerin',
  periodDay: 'Gün',
  periodWeek: 'Hafta',
  periodMonth: 'Ay',
  periodYear: 'Yıl',
  totalMinsLabel: 'Toplam Süre',
  avgPerDayLabel: 'Günlük Ort.',
  completionRateLabel: 'Tamamlama',
  completedDaysLabel: 'Tamamlanan',
  totalExcLabel: 'Toplam Aşım',
  cleanDaysLabel: 'Temiz Gün',
};

export const en: Translations = {
  cancel: 'Cancel',
  save: 'Save',
  deleteLabel: 'Delete',
  edit: 'Edit',
  confirm: 'Confirm',
  comingSoon: 'Coming Soon',
  comingSoonMsg: 'This feature is coming soon.',
  goodMorning: 'Good morning',
  goodAfternoon: 'Good afternoon',
  goodEvening: 'Good evening',
  welcomeUser: 'Welcome',
  howAreYou: 'How are you',
  addNewHabit: 'New Habit',
  activeHabitSection: 'ACTIVE HABIT',
  timeHabitSection: 'TIME HABIT',
  badHabitSection: 'BAD HABIT',
  change: 'CHANGE',
  noHabitsYet: 'No habits yet',
  noHabitsHint: 'Start with "New Habit" above',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  startStreak: 'Start a streak',
  weeklyGoal: 'Weekly Goal',
  dayUnit: 'day',
  noStreak: 'no streak',
  fireStreak: '🔥 streak',
  thisWeek: 'this week',
  exceeded: 'exceeded',
  sleepSchedule: 'Sleep Schedule',
  bedtimeLabel: 'BEDTIME',
  wakeUpLabel: 'WAKE UP',
  durationLabel: 'DURATION',
  confirmSleep: 'Confirm Sleep',
  bedtimeModal: 'Bedtime',
  wakeUpModal: 'Wake Time',
  totalSleep: 'total sleep',
  sleepGood: 'Good',
  sleepOkay: 'Okay',
  sleepPoor: 'Poor',
  sleepPickerBed: 'Bedtime',
  sleepPickerWake: 'Wake Time',
  remaining: 'remaining',
  habitsTitle: 'Habits',
  tabDone: 'Done',
  tabTime: 'Time',
  tabBad: 'Bad Habit',
  logToStart: 'Log to start',
  weeklyGoalLabel: 'Weekly Goal',
  weeklyGoalReached: '% of weekly goal',
  clean: 'Clean',
  exceededTimes: (n) => `exceeded ${n}×`,
  timesUnit: 'times',
  minUnit: 'min',
  exceedLabel: 'exceeded',
  emptyDone: 'No streak habit yet',
  emptyTime: 'No time habit yet',
  emptyBad: 'No bad habit yet',
  addHabitHint: 'Tap + in the tab bar to add one',
  whatToDo: 'What do you want to do?',
  deleteHabitTitle: 'Delete Habit',
  deleteHabitConfirm: (name) => `Delete "${name}"?`,
  goBack: 'Cancel',
  totalTrackedTime: 'Total tracked time',
  stayStrong: 'Stay strong 💪',
  missLabel: 'miss',
  skipLabel: 'skip',
  statsTitle: 'Statistics',
  statsSubtitle: "Today's and this week's summary",
  today: 'Today',
  overallRate: 'Overall Rate',
  thisWeekLabel: 'This Week',
  habitsCount: 'Habits',
  weeklyCompletion: 'Weekly Completion',
  workedThisWeek: (d) => `You worked ${d} this week!`,
  weeklyTrend: 'Weekly Trend',
  monthlyView: 'Monthly View',
  notEnoughData: 'Not enough data',
  less: 'Less',
  full: 'Full',
  profileTitle: 'Profile',
  userDefault: 'User',
  free: 'Free',
  habitsLabel: 'Habits',
  timeTracking: 'Time Tracking',
  badHabitLabel: 'Bad Habit',
  account: 'Account',
  notifications: 'Notifications',
  notificationsOn: 'On',
  editProfile: 'Edit Profile',
  appearance: 'Appearance',
  themeLabel: 'Theme',
  themeDark: 'Dark',
  themeLight: 'Light',
  appSection: 'App',
  aboutLabel: 'About',
  upgradeToPremium: '⭐ Go Premium',
  premiumSubtitle: 'Unlimited access to all features',
  unlimitedHabits: '🔓 Unlimited habits',
  detailedStats: '📊 Detailed statistics',
  customThemes: '🎨 Custom themes',
  smartReminders: '🔔 Smart reminders',
  menuReminder: 'Reminder',
  cloudBackup: '☁️ Cloud backup',
  upgradeNow: 'Upgrade Now →',
  signOut: 'Sign Out',
  signOutTitle: 'Sign Out',
  signOutMsg: 'Are you sure you want to sign out?',
  habitsActive: (n) => `${n} habits`,
  settingsTitle: 'Settings',
  sectionAppearance: 'APPEARANCE',
  sectionApp: 'APP',
  sectionAbout: 'ABOUT',
  darkMode: 'Dark Mode',
  darkModeSubtitle: 'Dark theme',
  notificationsSubtitle: 'All reminders',
  language: 'Language',
  languageCurrent: 'English',
  weeklyReport: 'Weekly Report',
  weeklyReportSubtitle: 'Every Sunday morning',
  privacy: 'Privacy',
  privacySubtitle: 'Data & permissions',
  resetData: 'Reset Data',
  resetDataSubtitle: 'Delete all habits',
  resetDataConfirmTitle: 'Reset Data',
  resetDataConfirmMsg: 'All your habit data will be deleted. Are you sure?',
  resetDataBtn: 'Reset',
  resetDone: 'Done',
  aboutApp: 'NutuHabit',
  aboutVersion: 'Version 1.0.0',
  rateUs: 'Rate Us',
  rateSubtitle: 'Rate on App Store',
  freeMember: 'Free member',
  habitDistribution: 'Habit Distribution',
  topCompleted: 'Top Completed',
  barChartTitle: 'Bar Chart',
  habitBreakdownTitle: 'By Habit',
  pieChartTitle: 'Pie Chart',
  pieDone: 'Completed',
  pieFailed: 'Failed',
  pieExcused: 'Excused',
  pieClean: 'Clean Days',
  pieExceeded: 'Exceeded',
  graphsTitle: 'Graphs',
  graphSubtitle: 'Your habit trends',
  periodDay: 'Day',
  periodWeek: 'Week',
  periodMonth: 'Month',
  periodYear: 'Year',
  totalMinsLabel: 'Total Time',
  avgPerDayLabel: 'Daily Avg.',
  completionRateLabel: 'Completion',
  completedDaysLabel: 'Completed',
  totalExcLabel: 'Total Exceeded',
  cleanDaysLabel: 'Clean Days',
};
