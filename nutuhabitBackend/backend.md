# 🚀 NutuHabit — Backend Dokümantasyonu

> **Proje:** NutuHabit — Alışkanlık Takip Mobil Uygulaması (Expo / React Native)
> **Tarih:** 22 Mart 2026
> **Durum:** Frontend hazır (mock data), backend henüz başlanmadı

---

## 📌 Mevcut Durum Özeti

Şu anda uygulama tamamen **local mock data** ile çalışıyor:
- Zustand store'ları (habit, auth, todo, timer, theme, language) in-memory tutuluyor
- Firebase service dosyaları **placeholder** — hiçbir gerçek bağlantı yok
- Auth (Google/Apple/Email) simüle ediliyor, gerçek kimlik doğrulama yok
- Veriler uygulama kapandığında kayboluyor

---

## 🏗️ Önerilen Teknoloji Stack'i

### Seçenek 1: **Firebase (Firestore + Auth)** — ⭐ ÖNERİLEN

| Katman | Teknoloji |
|--------|-----------|
| **Authentication** | Firebase Auth (Google, Apple, Email/Password) |
| **Veritabanı** | Cloud Firestore (NoSQL) |
| **Cloud Functions** | Firebase Cloud Functions (Node.js / TypeScript) |
| **Push Notification** | Firebase Cloud Messaging (FCM) |
| **Storage** | Firebase Storage (profil fotoları vb.) |
| **Analytics** | Firebase Analytics |
| **In-App Purchase** | RevenueCat (Premium/abonelik yönetimi) |
| **AI Coach** | OpenAI API (GPT-4) + Cloud Function proxy |

**Neden Firebase?**
- ✅ Proje zaten Firebase placeholder'ları içeriyor (`src/services/firebase.ts`)
- ✅ Expo ile mükemmel entegrasyon
- ✅ Serverless — sunucu yönetimi yok
- ✅ Gerçek zamanlı senkronizasyon (real-time sync)
- ✅ Ücretsiz katman (Spark plan) başlangıç için yeterli
- ✅ Scale etmesi kolay

### Seçenek 2: Supabase (PostgreSQL)

PostgreSQL tabanlı açık kaynak alternatif. Daha karmaşık sorgular gerekirse düşünülebilir, ancak bu proje için Firebase daha uygun.

### Seçenek 3: Custom Backend (Node.js + Express + MongoDB)

Tam kontrol sağlar ama geliştirme süresi en az **2x** artar. Bu ölçekte gereksiz karmaşıklık.

---

## 📋 Yapılacaklar Listesi (Detaylı)

### Faz 1 — Firebase Kurulumu ve Authentication (3-4 gün)

#### 1.1 Firebase Projesi Oluşturma
- [ ] Firebase Console'dan yeni proje oluştur
- [ ] iOS ve Android uygulamalarını kaydet
- [ ] `google-services.json` (Android) ve `GoogleService-Info.plist` (iOS) dosyalarını indir
- [ ] Firebase SDK'yı Expo projesine entegre et (`@react-native-firebase/app`)
- [ ] `src/services/firebase.ts` dosyasını gerçek config ile güncelle

#### 1.2 Authentication Implementasyonu
- [ ] Firebase Auth'u aktifleştir (Console)
- [ ] **Email/Password** sign-in yöntemi
  - Kayıt (register) — email doğrulama ekle
  - Giriş (login)
  - Şifre sıfırlama (forgot password)
  - Şifre değiştirme (change password)
- [ ] **Google Sign-In** entegrasyonu
  - `expo-auth-session` veya `@react-native-google-signin` kullan
  - OAuth client ID oluştur
- [ ] **Apple Sign-In** entegrasyonu (iOS zorunlu)
  - `expo-apple-authentication` kullan
  - Apple Developer hesabında yapılandır
- [ ] **Misafir (Guest) modu** — anonim auth
  - Firebase Anonymous Auth kullan
  - Daha sonra hesap bağlama (account linking) özelliği
- [ ] `useAuthStore.ts` güncelle — gerçek Firebase Auth bağla
- [ ] Auth state persistence (oturum hatırlama)
- [ ] Token refresh mekanizması

#### 1.3 Kullanıcı Profili (Firestore)
- [ ] `users` koleksiyonu oluştur
- [ ] İlk kayıtta kullanıcı dokümanı oluştur
- [ ] Profil güncelleme (displayName, photoURL)
- [ ] `UserSettings` senkronizasyonu (tema, dil, bildirim tercihleri)
- [ ] Hesap silme (GDPR uyumlu)

---

### Faz 2 — Veritabanı Tasarımı ve CRUD İşlemleri (5-6 gün)

#### 2.1 Firestore Veri Modeli

```
📦 Firestore Yapısı
├── users/
│   └── {userId}/
│       ├── displayName, email, photoURL, isPremium, createdAt
│       └── settings: { theme, language, notificationsEnabled, reminderTime, weekStartsOn }
│
├── habits/
│   └── {habitId}/
│       ├── userId, name, icon, type ('done' | 'time' | 'bad')
│       ├── createdAt, updatedAt, isArchived, sortOrder
│       ├── goalMinutes (time type)
│       └── limitMinutes, limitType, limitCount, limitPeriod (bad type)
│
├── habitLogs/
│   └── {logId}/
│       ├── habitId, userId, date ('YYYY-MM-DD'), status
│       ├── completedAt, elapsedMinutes, usedMinutes, usedCount
│       └── note, createdAt, updatedAt
│
├── timerSessions/
│   └── {sessionId}/
│       ├── habitId, userId, date
│       └── startedAt, endedAt, durationSeconds
│
├── todos/
│   └── {todoId}/
│       ├── userId, text, completed, priority
│       └── createdAt, completedAt
│
├── notes/
│   └── {noteId}/
│       ├── userId, title, content
│       └── createdAt, updatedAt
│
└── reminders/
    └── {reminderId}/
        ├── userId, habitId, time ('HH:MM')
        ├── days: [0,1,2,3,4,5,6]
        └── isActive, createdAt
```

#### 2.2 Habit (Alışkanlık) CRUD
- [ ] `createHabit()` — Firestore'a yeni alışkanlık ekle
- [ ] `updateHabit()` — Alışkanlık güncelle
- [ ] `deleteHabit()` — Alışkanlık sil + ilişkili logları temizle
- [ ] `fetchHabits()` — Kullanıcının tüm alışkanlıklarını çek
- [ ] `archiveHabit()` — Arşivle (soft delete)
- [ ] `reorderHabits()` — Sıralama güncelle
- [ ] Real-time listener (`onSnapshot`) ile değişiklikleri anlık yansıt

#### 2.3 HabitLog (Alışkanlık Logu) İşlemleri
- [ ] `upsertLog()` — Log oluştur veya güncelle
- [ ] `fetchLogsByDateRange()` — Tarih aralığına göre logları çek
- [ ] `toggleLog()` — Durum döngüsü (done → failed → excused)
- [ ] `updateLogNote()` — Loga not ekle/güncelle
- [ ] Streak (seri) hesaplama mantığı — Cloud Function ile

#### 2.4 Timer Session İşlemleri
- [ ] `saveTimerSession()` — Süre bazlı alışkanlık oturumu kaydet
- [ ] `fetchSessionsByHabit()` — Alışkanlık bazlı oturumları çek
- [ ] `getTodayElapsed()` — Bugünkü toplam süre

#### 2.5 Todo (Yapılacaklar) CRUD
- [ ] `addTodo()` — Yeni görev ekle
- [ ] `toggleTodo()` — Tamamlandı/tamamlanmadı
- [ ] `deleteTodo()` — Görev sil
- [ ] `updateTodo()` — Görev güncelle
- [ ] `clearCompleted()` — Tamamlananları temizle

#### 2.6 Notes (Notlar) CRUD
- [ ] `createNote()` — Yeni not
- [ ] `updateNote()` — Not düzenle
- [ ] `deleteNote()` — Not sil
- [ ] `fetchNotes()` — Kullanıcının notlarını çek

---

### Faz 3 — İstatistikler ve Analiz (2-3 gün)

#### 3.1 İstatistik Hesaplama (Cloud Functions)
- [ ] **Günlük İstatistik** — Tamamlama oranı, toplam süre, başarısız/mazeret
- [ ] **Haftalık İstatistik** — Ortalama oran, en iyi gün, mükemmel günler
- [ ] **Alışkanlık Bazlı İstatistik** — Toplam log, başarı oranı, streak
- [ ] **Streak Hesaplama** — Mevcut seri, en uzun seri, son tamamlama
- [ ] İstatistikleri Firestore'da cache'le (performans için)

#### 3.2 Takvim (Calendar) Backend
- [ ] Ay bazlı log çekme optimize et
- [ ] Completion heatmap verisi oluştur

---

### Faz 4 — Bildirimler ve Hatırlatıcılar (2-3 gün)

#### 4.1 Push Notification Altyapısı
- [ ] Firebase Cloud Messaging (FCM) entegrasyonu
- [ ] `expo-notifications` ile push token kaydet
- [ ] Token'ı Firestore'da `users/{userId}/pushToken` olarak sakla

#### 4.2 Hatırlatıcı Sistemi
- [ ] Hatırlatıcı CRUD (oluştur, güncelle, sil, listele)
- [ ] Cloud Function ile zamanlama (scheduled function)
- [ ] Günlük hatırlatıcılar — belirlenen saatte push gönder
- [ ] Akşam özet bildirimi — "Bugün 3/5 alışkanlık tamamlandı"
- [ ] Streak koruma uyarısı — "Serinizi kaybetmeyin!"

---

### Faz 5 — AI Coach (Premium Özellik) (3-4 gün)

#### 5.1 AI Chat Backend
- [ ] Cloud Function endpoint: `/api/ai-coach/chat`
- [ ] OpenAI GPT-4 API entegrasyonu
- [ ] Kullanıcı verisini context olarak gönder (alışkanlık istatistikleri, streak'ler)
- [ ] System prompt hazırla (Türkçe/İngilizce motivasyon koçu)
- [ ] Rate limiting (günlük mesaj limiti: free=3, premium=sınırsız)

#### 5.2 AI Önerileri
- [ ] Haftalık analiz raporu oluştur
- [ ] Kişiselleştirilmiş alışkanlık önerileri
- [ ] Motivasyon mesajları (streak milestone'larında)

#### 5.3 Chat Geçmişi
- [ ] `aiChats/{chatId}` Firestore koleksiyonu
- [ ] Mesaj geçmişini sakla ve göster

---

### Faz 6 — Premium & In-App Purchase (3-4 gün)

#### 6.1 RevenueCat Entegrasyonu
- [ ] RevenueCat hesabı oluştur
- [ ] App Store Connect'te ürünleri tanımla (aylık/yıllık abonelik)
- [ ] Google Play Console'da ürünleri tanımla
- [ ] `react-native-purchases` SDK entegrasyonu
- [ ] Satın alma akışı (purchase flow) implementasyonu
- [ ] Abonelik durumu kontrolü

#### 6.2 Premium Gate
- [ ] `isPremium` flag — RevenueCat webhook ile senkronize et
- [ ] Cloud Function: RevenueCat webhook handler
- [ ] Premium kontrolleri ekle (AI Coach, sınırsız hatırlatıcı, gelişmiş istatistikler)
- [ ] Restore purchases (satın alma geri yükleme)
- [ ] Fiyatlandırma: Türkiye (₺99,99/ay — ₺999,99/yıl) ve International ($2,99/mo — $24,99/yr)

---

### Faz 7 — Senkronizasyon ve Offline Desteği (2-3 gün)

#### 7.1 Offline-First Mimari
- [ ] Firestore offline persistence aktifleştir
- [ ] Optimistic UI updates (önce local güncelle, sonra sync)
- [ ] Conflict resolution stratejisi (last-write-wins)
- [ ] Bağlantı durumu göstergesi

#### 7.2 Data Migration
- [ ] Guest → Authenticated geçişte veri taşıma
- [ ] Local mock data → Firestore migration script

---

### Faz 8 — Güvenlik ve Performans (2-3 gün)

#### 8.1 Firestore Security Rules
- [ ] Kullanıcı bazlı erişim kontrolü (sadece kendi verisini görebilsin)
- [ ] Veri validasyonu (type, required fields)
- [ ] Rate limiting kuralları
- [ ] Admin SDK erişim hakları

#### 8.2 Performans Optimizasyonu
- [ ] Firestore indeksleri oluştur (sorgu performansı)
- [ ] Pagination (liste çağrılarında sayfalama)
- [ ] Gereksiz re-render'ları önle
- [ ] Bundle size optimizasyonu

#### 8.3 Hata Yönetimi
- [ ] Firebase Crashlytics entegrasyonu
- [ ] Global error boundary
- [ ] API hata kodları ve kullanıcıya uygun mesajlar
- [ ] Retry mekanizması (ağ hataları için)

---

### Faz 9 — Test ve Deploy (2-3 gün)

#### 9.1 Test
- [ ] Firebase Emulator Suite ile local test ortamı
- [ ] Security rules test'leri
- [ ] Cloud Functions unit test'leri
- [ ] E2E test senaryoları (Detox veya Maestro)

#### 9.2 CI/CD
- [ ] EAS Build yapılandırması (Expo Application Services)
- [ ] GitHub Actions ile otomatik build
- [ ] Staging ve Production ortamları ayır

#### 9.3 Deploy
- [ ] Firebase Hosting (web versiyonu varsa)
- [ ] Cloud Functions deploy
- [ ] App Store ve Google Play Store yayınlama hazırlıkları

---

## ⏱️ Tahmini Zaman Çizelgesi

| Faz | Açıklama | Süre |
|-----|----------|------|
| **Faz 1** | Firebase Kurulumu + Auth | 3-4 gün |
| **Faz 2** | Veritabanı + CRUD İşlemleri | 5-6 gün |
| **Faz 3** | İstatistikler ve Analiz | 2-3 gün |
| **Faz 4** | Bildirimler + Hatırlatıcılar | 2-3 gün |
| **Faz 5** | AI Coach (Premium) | 3-4 gün |
| **Faz 6** | Premium + In-App Purchase | 3-4 gün |
| **Faz 7** | Senkronizasyon + Offline | 2-3 gün |
| **Faz 8** | Güvenlik + Performans | 2-3 gün |
| **Faz 9** | Test + Deploy | 2-3 gün |
| | | |
| **TOPLAM** | | **24-33 gün** |

### 📌 Notlar:
- **Minimum Viable Backend (Faz 1 + 2):** ~8-10 gün ile çalışan bir backend'iniz olur
- **Tek geliştirici, günde 4-6 saat çalışmayla** toplam süre ~**5-7 hafta**
- **Tam zamanlı çalışmayla** (günde 8 saat) ~**4-5 hafta**
- Sürelere debug, test ve beklenmedik sorunlar dahildir

---

## 🎯 Öncelik Sıralaması

Tüm fazları aynı anda yapmanıza gerek yok. Önerilen başlangıç sırası:

```
1️⃣  Faz 1 — Auth (ZORUNLU — uygulamanın temeli)
2️⃣  Faz 2 — CRUD (ZORUNLU — temel veri işlemleri)
3️⃣  Faz 8 — Security Rules (ZORUNLU — veriler güvende olmalı)
4️⃣  Faz 7 — Offline Sync (ÖNEMLİ — kullanıcı deneyimi)
5️⃣  Faz 3 — İstatistikler (ÖNEMLİ — mevcut ekranlar buna bağlı)
6️⃣  Faz 4 — Bildirimler (ÖNEMLİ — retention için kritik)
7️⃣  Faz 6 — Premium/IAP (PARA — gelir modeli)
8️⃣  Faz 5 — AI Coach (PREMIUM — gelir sonrası)
9️⃣  Faz 9 — Test/Deploy (SON — yayın öncesi)
```

---

## 💰 Maliyet Tahmini (Firebase)

| Hizmet | Free Tier | Tahmini Aylık Maliyet (10K kullanıcı) |
|--------|-----------|---------------------------------------|
| Firebase Auth | 10K auth/ay ücretsiz | $0 |
| Firestore | 50K okuma/gün ücretsiz | ~$5-15 |
| Cloud Functions | 2M çağrı/ay ücretsiz | ~$0-5 |
| FCM (Push) | Sınırsız ücretsiz | $0 |
| Storage | 5GB ücretsiz | ~$0-2 |
| OpenAI API (AI Coach) | — | ~$10-30 |
| RevenueCat | 2.5K MTR ücretsiz | $0 (başlangıçta) |
| **TOPLAM** | | **~$15-52/ay** |

> 💡 **İlk 1000 kullanıcıya kadar neredeyse tamamen ücretsiz** çalışabilirsiniz!

---

## 📁 Backend için Oluşturulacak/Güncellenecek Dosyalar

```
src/
├── services/
│   ├── firebase.ts          ← Gerçek config ile güncelle
│   ├── auth.ts              ← Gerçek auth fonksiyonları
│   ├── habits.ts            ← Gerçek Firestore CRUD
│   ├── habitLogs.ts         ← [YENİ] Log işlemleri
│   ├── timerSessions.ts     ← [YENİ] Timer kayıtları
│   ├── todos.ts             ← [YENİ] Todo CRUD
│   ├── notes.ts             ← [YENİ] Not CRUD
│   ├── reminders.ts         ← [YENİ] Hatırlatıcı CRUD
│   ├── notifications.ts     ← [YENİ] Push notification
│   ├── aiCoach.ts           ← [YENİ] AI Chat servisi
│   ├── premium.ts           ← [YENİ] RevenueCat entegrasyonu
│   └── stats.ts             ← [YENİ] İstatistik hesaplama
│
├── store/
│   ├── useAuthStore.ts      ← Firebase Auth bağla
│   ├── useHabitStore.ts     ← Firestore senkronize et
│   ├── useTodoStore.ts      ← Firestore senkronize et
│   ├── useTimerStore.ts     ← Firestore senkronize et
│   └── useNotesStore.ts     ← [YENİ]
│
└── cloud-functions/          ← [YENİ] Firebase Cloud Functions
    ├── index.ts
    ├── aiCoach.ts
    ├── notifications.ts
    ├── stats.ts
    └── webhooks.ts (RevenueCat)
```
