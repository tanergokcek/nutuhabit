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
  limitExceeded: string;
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
  homeLayout: string;
  homeLayoutSubtitle: string;
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
  guestUser: string;
  guestSubtitle: string;
  loginRegister: string;
  sleepHint: string;
  timeHint: string;
  weekDays: string[];
  tabHome: string;
  tabHabits: string;
  tabAdd: string;
  tabCharts: string;
  tabMenu: string;
  menuCalendar: string;
  menuNotes: string;
  menuTodos: string;
  menuSettings: string;
  menuAICoach: string;
  aiCoachPro: string;
  aiCoachUnlock: string;
  aiCoachFeature1: string;
  aiCoachFeature2: string;
  aiCoachFeature3: string;
  aiCoachFeature4: string;
  aiCoachPremiumBtn: string;
  aiCoachNotNow: string;
  aiCoachAnalyzeBtn: string;
  aiCoachAnalyzing: string;
  aiCoachChatPlaceholder: string;
  aiCoachTyping: string;
  aiCoachSubtitle: string;
  aiCoachAnalysisTitle: string;
  aiCoachStartHint: string;
  aiCoachPaymentSuccess: string;
  aiCoachPaymentSuccessMsg: string;
  aiCoachDataMissing: string;
  aiCoachDataMissingMsg: string;
  periodLabel: string;
  timesLabel: string;
  logHabitTitle: string;
  habitSelectPlaceholder: string;
  habitPickerTitle: string;
  notesLabel: string;
  notesPlaceholder: string;
  dateToday: string;
  hourUnit: string;
  minuteUnit: string;
  streakDayLabel: string;
  isFirstDayTitle: string;
  greatJobTitle: string;
  firstDaySub: string;
  keepGoingSub: string;
  continueBtn: string;
  noHabitOfType: string;
  addNewHabitLink: string;
  statusDidnt: string;
  statusExcused: string;
  statusDid: string;
  weekDaysFull: string[];
  sleepHabitHint: string;
  thisWeek: string;
  totalLabel: string;
  sleepStreakTitle: string;
  sleepStreakSub: string;
  todayLabel: string;
  thisMonth: string;
  sleepHabitTitle: string;
  loginRequired: string;
  loginToNote: string;
  deleteNoteTitle: string;
  deleteNoteConfirm: string;
  notesTitle: string;
  allNotes: string;
  habitNoteFilter: string;
  personalNoteFilter: string;
  loadingNotes: string;
  noNotesYet: string;
  habitDefaultName: string;
  personalLabel: string;
  personalNoteTitle: string;
  notePlaceholder: string;
  habitNotFound: string;
  backBtn: string;
  totalDaysLabel: string;
  longestStreakLabel: string;
  completionLabel: string;
  goalMet: string;
  goalLabel: string;
  noDataToday: string;
  sleepDetailHint: string;
  yearlyGoalLabel: string;
  dailyGoalLabel: string;
  completed: string;
  notCompleted: string;
  excused: string;
  hasData: string;
  recordedToday: string;
  timeDetailHint: string;
  badHabitStreakSub: string;
  currentStreakLabel: string;
  dailyLimitLabel: string;
  errorTitle: string;
  habitUpdateError: string;
  deleteHabitFullConfirm: string;
  editHabitTitle: string;
  modeCantChange: string;
  changeIcon: string;
  habitGoalMinutesLabel: string;
  habitLimitCountLabel: string;
  habitLimitMinutesLabel: string;
  priorityHigh: string;
  priorityNormal: string;
  priorityLow: string;
  editTask: string;
  newTask: string;
  taskPlaceholder: string;
  updateBtn: string;
  deleteTaskTitle: string;
  deleteTaskConfirm: string;
  clearDoneTitle: string;
  clearDoneConfirm: string;
  clearLabel: string;
  todoStatus: string;
  activeFilter: string;
  doneFilter: string;
  loadingTasks: string;
  noDoneTasks: string;
  noActiveTasks: string;
  emptyTodoList: string;
  addTask: string;
  hourUnitShort: string;
  minUnitShort: string;
  monthNames: string[];
  dayNamesShort: string[];
  calendarBack: string;
  habitsTracked: string;
  statusDone: string;
  statusMissed: string;
  dailyMorning: string;
  aiCoachFreeMonths: string;
  monthlyLabel: string;
  yearlyLabel: string;
  yearly: string;
  turkeyLabel: string;
  internationalLabel: string;
  successLabel: string;
  averageLabel: string;
  limitExceededLabel: string;
  reportIntro: string;
  elapsedTimeLabel: string;
  dailyRecords: string;
  deleteEntryTitle: string;
  menuDailyRecords: string;
  weeklyLabel: string;
  aiCoachTitle: string;
  delete: string;
  priorityLabel: string;
  addBtn: string;
  todosTitle: string;
  dailyTime: string;
  newHabitTitle: string;
  habitTypeSelect: string;
  habitNameLabel: string;
  habitNamePlaceholder: string;
  detailLabel: string;
  frequencyLabel: string;
  limitLabel: string;
  reminderLabel: string;
  reminderOn: string;
  reminderOff: string;
  colorLabel: string;
  iconLabel: string;
  cancelBtn: string;
  saveBtn: string;
  savingBtn: string;
  typeDone: string;
  typeTime: string;
  typeBad: string;
  freqEveryday: string;
  freqWeekdays: string;
  freqWeekends: string;
  freqCustom: string;
  periodDayLabel: string;
  periodWeekLabel: string;
  periodMonthLabel: string;
  stepperTimes: string;
  customDayTitle: string;
  customDayHint: string;
  reminderToggleLabel: string;
  reminderTimePickerTitle: string;
  reminderTimeSelectLabel: string;
  loginRequiredMsg: string;
  dbSaveError: string;
  futureDateTitle: string;
  futureDateMsg: string;
  limitWarningTitle: string;
  limitWarningMsg: string;
  selectBadHabitOccurrence: string;
  updateError: string;
  sectionAccount: string;
  changeName: string;
  changeEmail: string;
  changePassword: string;
  editProfileTitle: string;
  newNameLabel: string;
  newEmailLabel: string;
  newPasswordLabel: string;
  updateSuccess: string;
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
  tabDone: 'Yapıldı',
  tabTime: 'Süre',
  tabBad: 'Kötü Alışkanlık',
  logToStart: 'Başlamak için kaydet',
  weeklyGoalLabel: 'Haftalık Hedef',
  weeklyGoalReached: '% haftalık hedefe ulaşıldı',
  clean: 'Temiz',
  exceededTimes: (n) => `${n} kez aşıldı`,
  limitExceeded: 'LİMİT AŞILDI',
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
  homeLayout: 'Ana Sayfa Düzeni',
  homeLayoutSubtitle: 'Sekmeli görünümü kullan',
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
  guestUser: 'Misafir Kullanıcı',
  guestSubtitle: 'Veriler yalnızca bu cihazda saklanır',
  loginRegister: 'Giriş Yap / Kayıt Ol',
  sleepHint: 'İlk uyku vaktin ne zaman? Girmek için dokun',
  timeHint: 'Gününüzün neye ne kadar zamanınızın gittiğini buradan göreceksiniz',
  dailyTime: 'Günlük Zaman',
  weekDays: ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'],
  tabHome: 'Ana Sayfa',
  tabHabits: 'Alışkanlıklar',
  tabAdd: 'Ekle',
  tabCharts: 'Grafik',
  tabMenu: 'Menü',
  menuCalendar: 'Takvim',
  menuNotes: 'Notlar',
  menuTodos: 'Yapılacaklar',
  menuSettings: 'Ayarlar',
  menuAICoach: 'AI Koçunuz',
  aiCoachPro: 'NutuHabit Pro',
  aiCoachUnlock: 'Tüm özellikleri açın',
  aiCoachFeature1: 'AI Coach — Kişisel alışkanlık danışmanı',
  aiCoachFeature2: 'Gelişmiş istatistikler ve analizler',
  aiCoachFeature3: 'Sınırsız hatırlatıcı',
  aiCoachFeature4: '3\'ten fazla alışkanlık ekleme',
  aiCoachPremiumBtn: "Premium'a Geç",
  aiCoachNotNow: 'Şimdi değil',
  aiCoachAnalyzeBtn: 'Verilerimi Analiz Et',
  aiCoachAnalyzing: 'Analiz Ediliyor...',
  aiCoachChatPlaceholder: 'Bir soru sor...',
  aiCoachTyping: 'Yazıyor...',
  aiCoachSubtitle: 'Sizin için buradayım, istediğinizi sorabilirsiniz.',
  aiCoachAnalysisTitle: 'Genel Analiz',
  aiCoachStartHint: 'Alışkanlıklarınızı analiz edebilir veya bana aklınızdaki soruları sorabilirsiniz.',
  aiCoachPaymentSuccess: 'Ödeme Başarılı',
  aiCoachPaymentSuccessMsg: 'NutuHabit Pro dünyasına hoş geldin! Ödemen başarıyla alındı ve tüm özellikler sınırsız olarak açıldı.',
  aiCoachDataMissing: 'Veri Eksik',
  aiCoachDataMissingMsg: 'Henüz hiçbir alışkanlık kaydı girmediniz. Analiz yapabilmem için birkaç gün kayıt tutmalısınız.',
  newHabitTitle: 'Yeni Alışkanlık',
  habitTypeSelect: 'Alışkanlık Türü Seç',
  habitNameLabel: 'Alışkanlık Adı:',
  habitNamePlaceholder: 'Örn: Sabah meditasyonu',
  detailLabel: 'Detay',
  frequencyLabel: 'Sıklık',
  limitLabel: 'Limit',
  reminderLabel: 'Hatırlatıcı',
  reminderOn: 'Açık',
  reminderOff: 'Kapalı',
  colorLabel: 'Renk',
  iconLabel: 'İkon Seç',
  cancelBtn: 'İptal',
  saveBtn: 'Kaydet',
  savingBtn: 'Kaydediliyor...',
  typeDone: 'YAPILDI',
  typeTime: 'SÜRE',
  typeBad: 'KÖTÜ ALIŞKANLIK',
  freqEveryday: 'Her gün',
  freqWeekdays: 'Hafta içi',
  freqWeekends: 'Hafta sonu',
  freqCustom: 'Özel',
  periodDayLabel: 'Gün',
  periodWeekLabel: 'Hafta',
  periodMonthLabel: 'Ay',
  stepperTimes: 'kez',
  customDayTitle: 'Günleri seç',
  customDayHint: 'En az bir gün seçin',
  reminderToggleLabel: 'Hatırlatıcıyı Aç',
  reminderTimePickerTitle: 'Hatırlatıcı Saati',
  reminderTimeSelectLabel: 'Saat Seç',
  loginRequiredMsg: 'Alışkanlık oluşturmak için giriş yapmalısınız.',
  dbSaveError: 'Alışkanlık veri tabanına kaydedilemedi.',
  periodLabel: 'Periyot',
  timesLabel: 'Kaç kez',
  logHabitTitle: 'KAYIT',
  habitSelectPlaceholder: 'Alışkanlık seç...',
  habitPickerTitle: 'Alışkanlık Seç',
  notesLabel: 'Notlar',
  notesPlaceholder: 'Bugün nasıl geçti?...',
  dateToday: 'Bugün',
  hourUnit: 'saat',
  minuteUnit: 'dakika',
  streakDayLabel: '. gün',
  isFirstDayTitle: 'İlk gün! 🎉',
  greatJobTitle: 'Harika gidiyorsun!',
  firstDaySub: 'Harika başlangıç, devam et!',
  keepGoingSub: 'Serini kırmıyorsun, süper! 💪',
  continueBtn: 'Devam Et',
  noHabitOfType: 'Bu tipte alışkanlık yok.',
  addNewHabitLink: '+ Yeni alışkanlık ekle',
  statusDidnt: 'Yapmadım.',
  statusExcused: 'Mazeretliyim.',
  statusDid: 'Yaptım.',
  weekDaysFull: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
  sleepHabitHint: 'İlk alışkanlığınız için uyku vaktinizi girin',
  totalLabel: 'toplam',
  sleepStreakTitle: 'Uyku Serisi',
  sleepStreakSub: 'Uyku rutinine sadık kalmaya devam et 💪',
  todayLabel: 'bugün',
  thisMonth: 'bu ay',
  sleepHabitTitle: 'Uyku Takvimi',
  loginRequired: 'Giriş Gerekli',
  loginToNote: 'Not eklemek için giriş yapmalısın.',
  deleteNoteTitle: 'Notu Sil',
  deleteNoteConfirm: 'Bu notu silmek istediğine emin misin?',
  notesTitle: 'Notlar',
  allNotes: 'Tümü',
  habitNoteFilter: 'Alışkanlık notu',
  personalNoteFilter: 'Kişisel not',
  loadingNotes: 'Notlar yükleniyor...',
  noNotesYet: 'Henüz not yok. Alışkanlık eklerken veya + butonuyla not oluşturabilirsin.',
  habitDefaultName: 'Alışkanlık',
  personalLabel: 'Kişisel',
  personalNoteTitle: 'Kişisel Not',
  notePlaceholder: 'Bugün ne hissettirdi?',
  habitNotFound: 'Alışkanlık bulunamadı',
  backBtn: 'Geri Dön',
  totalDaysLabel: 'Toplam Gün',
  longestStreakLabel: 'En Uzun Seri',
  completionLabel: 'Tamamlama',
  goalMet: 'Hedefe ulaşıldı',
  goalLabel: 'Hedef',
  noDataToday: 'Bugün kayıt yok',
  sleepDetailHint: 'Ana sayfadaki uyku kartından saat girerek kaydet',
  yearlyGoalLabel: 'Yıllık Hedef',
  dailyGoalLabel: 'Günlük Hedef',
  completed: 'Yaptım',
  notCompleted: 'Yapmadım',
  excused: 'Mazeretliyim',
  hasData: 'Kayıt var',
  recordedToday: 'Bugün %s kaydedildi',
  timeDetailHint: 'Ekle butonundan süre kaydet',
  badHabitStreakSub: 'Limiti aşmadan geçirilen günler',
  currentStreakLabel: 'Güncel Seri',
  dailyLimitLabel: 'Günlük Limit',
  errorTitle: 'Hata',
  habitUpdateError: 'Alışkanlık güncellenemedi.',
  deleteHabitFullConfirm: '"%s" ve tüm kayıtları silinecek. Bu işlem geri alınamaz.',
  editHabitTitle: 'Alışkanlığı Düzenle',
  modeCantChange: 'modu (değiştirilemez)',
  changeIcon: 'İkonu değiştir',
  habitGoalMinutesLabel: 'Hedef Süre (dakika)',
  habitLimitCountLabel: 'Limit (kez)',
  habitLimitMinutesLabel: 'Günlük Limit (dakika)',
  priorityHigh: 'Yüksek',
  priorityNormal: 'Normal',
  priorityLow: 'Düşük',
  editTask: 'Görevi Düzenle',
  newTask: 'Yeni Görev',
  taskPlaceholder: 'Ne yapılacak?',
  updateBtn: 'Güncelle',
  deleteTaskTitle: 'Görevi Sil',
  deleteTaskConfirm: 'Bu görevi silmek istiyor musun?',
  clearDoneTitle: 'Tamamlananları Temizle',
  clearDoneConfirm: '%n tamamlanmış görev silinecek.',
  clearLabel: 'Temizle',
  todoStatus: '%a bekliyor · %d tamamlandı',
  activeFilter: 'Bekleyenler',
  doneFilter: 'Tamamlananlar',
  loadingTasks: 'Görevler yükleniyor…',
  noDoneTasks: 'Henüz tamamlanan görev yok',
  noActiveTasks: 'Bekleyen görev yok, harika!',
  emptyTodoList: 'Listen boş, yeni görev ekle',
  addTask: 'Ekle',
  hourUnitShort: 'sa',
  minUnitShort: 'dk',
  monthNames: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
  dayNamesShort: ['PZ', 'PT', 'SA', 'ÇA', 'PE', 'CU', 'CT'],
  calendarBack: 'Geri',
  habitsTracked: 'alışkanlık takip edildi',
  statusDone: 'Tamamlandı',
  statusMissed: 'Kaçırıldı',
  dailyMorning: 'Günlük · Sabah',
  aiCoachFreeMonths: '2 ay ücretsiz',
  monthlyLabel: 'Aylık',
  yearlyLabel: 'Yıllık',
  yearly: 'Yıllık',
  turkeyLabel: 'Türkiye',
  internationalLabel: 'Uluslararası',
  successLabel: 'Başarı',
  averageLabel: 'Ortalama',
  limitExceededLabel: 'Limit aşımı',
  reportIntro: 'Verilerini derinlemesine inceledim. İşte senin için hazırladığım gelişim raporu:\n\n',
  elapsedTimeLabel: 'Geçen süre',
  dailyRecords: 'GÜNLÜK KAYITLAR',
  deleteEntryTitle: 'Kaydı Sil',
  menuDailyRecords: 'Günlük Kayıtlar',
  weeklyLabel: 'bu hafta',
  aiCoachTitle: 'AI Koç',
  delete: 'Sil',
  priorityLabel: 'Öncelik',
  addBtn: 'Ekle',
  todosTitle: 'Yapılacaklar',
  futureDateTitle: 'Gelecek Tarih',
  futureDateMsg: 'Gelecekteki bir tarih için kayıt giremezsiniz.',
  limitWarningTitle: 'Limit Aşıldı!',
  limitWarningMsg: 'Bugünlük sınırı geçtin, daha dikkatli olmalısın.',
  selectBadHabitOccurrence: 'Lütfen kötü alışkanlığı gerçekleştirdiğinizi onaylayın.',
  updateError: 'Güncelleme sırasında bir hata oluştu.',
  sectionAccount: 'HESAP AYARLARI',
  changeName: 'İsim Soyisim Değiştir',
  changeEmail: 'E-posta Değiştir',
  changePassword: 'Şifre Değiştir',
  editProfileTitle: 'Profili Düzenle',
  newNameLabel: 'Yeni İsim',
  newEmailLabel: 'Yeni E-posta',
  newPasswordLabel: 'Yeni Şifre',
  updateSuccess: 'Başarıyla güncellendi.',
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
  limitExceeded: 'LIMIT EXCEEDED',
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
  homeLayout: 'Home Layout',
  homeLayoutSubtitle: 'Use tabbed view',
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
  guestUser: 'Guest User',
  guestSubtitle: 'Data is stored only on this device',
  loginRegister: 'Login / Register',
  sleepHint: 'When is your first sleep time? Tap to enter',
  timeHint: 'You will see how your day is spent here',
  dailyTime: 'Daily Time',
  weekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  tabHome: 'Home',
  tabHabits: 'Habits',
  tabAdd: 'Add',
  tabCharts: 'Charts',
  tabMenu: 'Menu',
  menuCalendar: 'Calendar',
  menuNotes: 'Notes',
  menuTodos: 'Todos',
  menuSettings: 'Settings',
  menuAICoach: 'AI Coach',
  aiCoachPro: 'NutuHabit Pro',
  aiCoachUnlock: 'Unlock all features',
  aiCoachFeature1: 'AI Coach — Personal habit consultant',
  aiCoachFeature2: 'Advanced statistics and analysis',
  aiCoachFeature3: 'Unlimited reminders',
  aiCoachFeature4: 'Add more than 3 habits',
  aiCoachPremiumBtn: 'Go Premium',
  aiCoachNotNow: 'Not now',
  aiCoachAnalyzeBtn: 'Analyze My Data',
  aiCoachAnalyzing: 'Analyzing...',
  aiCoachChatPlaceholder: 'Ask a question...',
  aiCoachTyping: 'Typing...',
  aiCoachSubtitle: "I'm here for you, feel free to ask anything.",
  aiCoachAnalysisTitle: 'General Analysis',
  aiCoachStartHint: 'You can analyze your habits or ask me any questions on your mind.',
  aiCoachPaymentSuccess: 'Payment Successful',
  aiCoachPaymentSuccessMsg: 'Welcome to NutuHabit Pro! Your payment was successful and all features are now unlocked.',
  aiCoachDataMissing: 'Data Missing',
  aiCoachDataMissingMsg: 'You haven’t entered any habit records yet. You need to keep logs for a few days for me to analyze.',
  newHabitTitle: 'New Habit',
  habitTypeSelect: 'Select Habit Type',
  habitNameLabel: 'Habit Name:',
  habitNamePlaceholder: 'e.g. Morning meditation',
  detailLabel: 'Detail',
  frequencyLabel: 'Frequency',
  limitLabel: 'Limit',
  reminderLabel: 'Reminder',
  reminderOn: 'On',
  reminderOff: 'Off',
  colorLabel: 'Color',
  iconLabel: 'Select Icon',
  cancelBtn: 'Cancel',
  saveBtn: 'Save',
  savingBtn: 'Saving...',
  typeDone: 'DONE',
  typeTime: 'TIME',
  typeBad: 'BAD HABIT',
  freqEveryday: 'Every day',
  freqWeekdays: 'Weekdays',
  freqWeekends: 'Weekends',
  freqCustom: 'Custom',
  periodDayLabel: 'Day',
  periodWeekLabel: 'Week',
  periodMonthLabel: 'Month',
  stepperTimes: 'times',
  customDayTitle: 'Select days',
  customDayHint: 'Select at least one day',
  reminderToggleLabel: 'Enable Reminder',
  reminderTimePickerTitle: 'Reminder Time',
  reminderTimeSelectLabel: 'Select Time',
  loginRequiredMsg: 'You must log in to create a habit.',
  dbSaveError: 'Failed to save habit to database.',
  periodLabel: 'Period',
  timesLabel: 'How many times',
  logHabitTitle: 'LOG',
  habitSelectPlaceholder: 'Select habit...',
  habitPickerTitle: 'Select Habit',
  notesLabel: 'Notes',
  notesPlaceholder: 'How was your day?...',
  dateToday: 'Today',
  hourUnit: 'hours',
  minuteUnit: 'minutes',
  streakDayLabel: '. day',
  isFirstDayTitle: 'First day! 🎉',
  greatJobTitle: 'Great job!',
  firstDaySub: 'Awesome start, keep going!',
  keepGoingSub: "You're keeping the streak, super! 💪",
  continueBtn: 'Continue',
  noHabitOfType: 'No habits of this type.',
  addNewHabitLink: '+ Add new habit',
  statusDidnt: "I didn't.",
  statusExcused: "I'm excused.",
  statusDid: 'I did.',
  weekDaysFull: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  sleepHabitHint: 'Enter your sleep time for your first habit',
  totalLabel: 'total',
  sleepStreakTitle: 'Sleep Streak',
  sleepStreakSub: 'Keep sticking to your sleep routine 💪',
  todayLabel: 'today',
  thisMonth: 'this month',
  sleepHabitTitle: 'Sleep Schedule',
  loginRequired: 'Login Required',
  loginToNote: 'You must log in to add a note.',
  deleteNoteTitle: 'Delete Note',
  deleteNoteConfirm: 'Are you sure you want to delete this note?',
  notesTitle: 'Notes',
  allNotes: 'All',
  habitNoteFilter: 'Habit note',
  personalNoteFilter: 'Personal note',
  loadingNotes: 'Loading notes...',
  noNotesYet: 'No notes yet. You can create notes while logging habits or by using the + button.',
  habitDefaultName: 'Habit',
  personalLabel: 'Personal',
  personalNoteTitle: 'Personal Note',
  notePlaceholder: 'How did it feel today?',
  habitNotFound: 'Habit not found',
  backBtn: 'Go Back',
  totalDaysLabel: 'Total Days',
  longestStreakLabel: 'Longest Streak',
  completionLabel: 'Completion',
  goalMet: 'Goal met',
  goalLabel: 'Goal',
  noDataToday: 'No data for today',
  sleepDetailHint: 'Record sleep by entering hours on the home card',
  yearlyGoalLabel: 'Yearly Goal',
  dailyGoalLabel: 'Daily Goal',
  completed: 'Done',
  notCompleted: 'Failed',
  excused: 'Excused',
  hasData: 'Logged',
  recordedToday: 'Today %s recorded',
  timeDetailHint: 'Record time from the add button',
  badHabitStreakSub: 'Days passed without exceeding the limit',
  currentStreakLabel: 'Current Streak',
  dailyLimitLabel: 'Daily Limit',
  errorTitle: 'Error',
  habitUpdateError: 'Failed to update habit.',
  deleteHabitFullConfirm: '"%s" and all its logs will be deleted. This action cannot be undone.',
  editHabitTitle: 'Edit Habit',
  modeCantChange: 'mode (cannot be changed)',
  changeIcon: 'Change icon',
  habitGoalMinutesLabel: 'Goal Duration (minutes)',
  habitLimitCountLabel: 'Limit (times)',
  habitLimitMinutesLabel: 'Daily Limit (minutes)',
  priorityHigh: 'High',
  priorityNormal: 'Normal',
  priorityLow: 'Low',
  editTask: 'Edit Task',
  newTask: 'New Task',
  taskPlaceholder: 'What needs to be done?',
  updateBtn: 'Update',
  deleteTaskTitle: 'Delete Task',
  deleteTaskConfirm: 'Do you want to delete this task?',
  clearDoneTitle: 'Clear Completed',
  clearDoneConfirm: '%n completed tasks will be deleted.',
  clearLabel: 'Clear',
  todoStatus: '%a pending · %d completed',
  activeFilter: 'Pending',
  doneFilter: 'Completed',
  loadingTasks: 'Loading tasks...',
  noDoneTasks: 'No completed tasks yet',
  noActiveTasks: 'No pending tasks, great!',
  emptyTodoList: 'Your list is empty, add a new task',
  addTask: 'Add',
  hourUnitShort: 'h',
  minUnitShort: 'm',
  monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  dayNamesShort: ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'],
  calendarBack: 'Back',
  habitsTracked: 'habits tracked',
  statusDone: 'Done',
  statusMissed: 'Missed',
  dailyMorning: 'Daily · Morning',
  aiCoachFreeMonths: '2 months free',
  monthlyLabel: 'Monthly',
  yearlyLabel: 'Yearly',
  yearly: 'Yearly',
  turkeyLabel: 'Turkey',
  internationalLabel: 'International',
  successLabel: 'Success',
  averageLabel: 'Average',
  limitExceededLabel: 'Limit exceeded',
  reportIntro: 'I have analyzed your data in depth. Here is the progress report I prepared for you:\n\n',
  elapsedTimeLabel: 'Elapsed time',
  dailyRecords: 'DAILY RECORDS',
  deleteEntryTitle: 'Delete Entry',
  menuDailyRecords: 'Daily Records',
  weeklyLabel: 'this week',
  aiCoachTitle: 'AI Coach',
  delete: 'Delete',
  priorityLabel: 'Priority',
  addBtn: 'Add',
  todosTitle: 'Todos',
  futureDateTitle: 'Future Date',
  futureDateMsg: 'You cannot enter data for a future date.',
  limitWarningTitle: 'Limit Exceeded!',
  limitWarningMsg: 'You have passed the limit for today, be more careful.',
  selectBadHabitOccurrence: 'Please confirm that you performed the bad habit.',
  updateError: 'An error occurred during update.',
  sectionAccount: 'ACCOUNT SETTINGS',
  changeName: 'Change Name',
  changeEmail: 'Change Email',
  changePassword: 'Change Password',
  editProfileTitle: 'Edit Profile',
  newNameLabel: 'New Name',
  newEmailLabel: 'New Email',
  newPasswordLabel: 'New Password',
  updateSuccess: 'Updated successfully.',
};
