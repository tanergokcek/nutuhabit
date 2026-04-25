# Firebase vs Supabase — NutuHabit Backend Karşılaştırması

---

## 🔥 Firebase — Avantajları

| Avantaj | Açıklama |
|---------|----------|
| **Real-time sync** | Firestore `onSnapshot` ile veri değiştiğinde anında UI'a yansır. Habit log'ları, streak'ler anlık güncellenir |
| **Expo uyumluluğu** | React Native / Expo ekosisteminde en çok kullanılan backend. Dokümantasyon ve community devasa |
| **Offline-first** | Firestore otomatik offline persistence sağlar. İnternet yokken de uygulama çalışır, bağlanınca sync olur |
| **Auth kolay** | Google / Apple / Email auth 10 satır kodla çalışır |
| **Push notification** | FCM zaten Firebase'in parçası, ekstra servis gerekmez |
| **NoSQL esneklik** | Habit tiplerin farklı (done/time/bad) — NoSQL'de her biri farklı field'larla rahat saklanır |
| **Free tier cömert** | 50K okuma/gün, 20K yazma/gün, 10K auth — başlangıç için yeterli |

### 🔥 Firebase — Dezavantajları

| Dezavantaj | Açıklama |
|------------|----------|
| **Vendor lock-in** | Google'a bağımlısın. Migrate etmek zor |
| **Karmaşık sorgular** | "Son 30 günde en çok tamamlanan 5 alışkanlık" gibi sorgular Firestore'da **zor**. Composite index lazım |
| **Maliyet kontrolü** | Okuma/yazma bazlı fiyatlandırma — kötü tasarım yapılırsa fatura şişer |
| **SQL yok** | İstatistik hesaplamaları için Cloud Function yazman gerekir, DB seviyesinde aggregate yok |

---

## ⚡ Supabase — Avantajları

| Avantaj | Açıklama |
|---------|----------|
| **PostgreSQL** | Gerçek SQL! İstatistik hesaplamaları (`AVG`, `COUNT`, `GROUP BY`) doğrudan DB'de yapılır |
| **Open-source** | İstersen kendi sunucuna deploy edersin. Vendor lock-in yok |
| **Dashboard** | Verini SQL ile sorgulayabilirsin. Debug çok kolay |
| **Row Level Security** | Güvenlik kuralları SQL ile yazılır — Firebase rules'dan daha anlaşılır |
| **Edge Functions** | Deno-based serverless functions, Cloud Functions'a alternatif |
| **Real-time** | PostgreSQL LISTEN/NOTIFY ile real-time destekler (ama Firebase kadar seamless değil) |
| **Storage + Auth** | Firebase ile aynı şekilde auth ve storage var |

### ⚡ Supabase — Dezavantajları

| Dezavantaj | Açıklama |
|------------|----------|
| **React Native desteği** | Çalışır ama Firebase kadar mature değil. Expo ile daha az döküman var |
| **Offline desteği YOK** | ❌ Supabase'de built-in offline persistence **yok**. Kendin implemente etmen gerekir |
| **Real-time daha zayıf** | Firebase'in `onSnapshot`'ı kadar sağlam değil |
| **Daha genç ekosistem** | Community küçük, Stack Overflow'da daha az cevap |
| **Push notification** | Built-in yok, ayrıca FCM veya OneSignal entegrasyonu lazım |

---

## 🎯 NutuHabit İçin Kritik Karşılaştırma

| Özellik | Firebase | Supabase | Kazanan |
|---------|----------|----------|---------|
| **Habit CRUD** | ✅ Kolay | ✅ Kolay | 🤝 Berabere |
| **İstatistik sorguları** | ❌ Cloud Function gerekir | ✅ SQL ile direkt | ⚡ **Supabase** |
| **Offline çalışma** | ✅ Built-in | ❌ Yok | 🔥 **Firebase** |
| **Real-time sync** | ✅ Mükemmel | ⚠️ Orta | 🔥 **Firebase** |
| **Auth** | ✅ Google/Apple kolay | ✅ Google/Apple kolay | 🤝 Berabere |
| **Push notification** | ✅ FCM dahil | ❌ Harici servis lazım | 🔥 **Firebase** |
| **AI Coach backend** | ✅ Cloud Functions | ✅ Edge Functions | 🤝 Berabere |
| **Expo uyumu** | ✅ Çok iyi | ⚠️ Gelişiyor | 🔥 **Firebase** |
| **Maliyet şeffaflığı** | ⚠️ Okuma bazlı | ✅ Sabit paket fiyatı | ⚡ **Supabase** |
| **Veri migration** | ❌ Zor | ✅ SQL dump kolay | ⚡ **Supabase** |

---

## 💡 Sonuç ve Öneri

**Bu proje için Firebase önerilir.** Sebepleri:

1. **Offline desteği kritik** — Alışkanlık takip uygulaması günlük kullanılır. Metro, asansör, uçak modunda bile çalışmalı. Supabase'de bunu sıfırdan yazmak **en az 1 hafta ekstra iş**
2. **Push notification zaten lazım** — Hatırlatıcılar uygulamanın önemli parçası. Firebase'de FCM bedava ve entegre
3. **Expo + Firebase mature** — Çok fazla kaynak, tutorial, community var
4. **İstatistik dezavantajı çözülebilir** — Cloud Functions ile hesapla, Firestore'da cache'le. Biraz ekstra iş ama çözülemez değil

### Ne zaman Supabase seçilirdi?
- Eğer çok **karmaşık raporlama/analiz** paneli olsaydı (admin dashboard)
- Eğer **web versiyonu** ağırlıklı olsaydı
- Eğer **vendor lock-in** hiç istenmeseydi
- Eğer offline desteğe ihtiyaç **olmasaydı**
