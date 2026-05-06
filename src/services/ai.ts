import { GoogleGenerativeAI } from "@google/generative-ai";

// API Key'i buraya yapıştırabilirsin veya .env dosyasından çekebilirsin
// Güvenlik için gerçek projelerde .env kullanılması önerilir.
// ÖNEMLİ: Yeni bir API anahtarı alıp buraya yapıştırmalısın.
// Mevcut anahtarın "leaked" (sızıntı) olarak işaretlenmiş.
const GEMINI_API_KEY = "";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function getAICoachResponse(
  message: string,
  context: {
    habits: any[];
    logs: any[];
    todos: any[];
    language: string;
    userName?: string;
  }
) {
  const { habits, logs, todos, language, userName } = context;
  try {
    const isTR = language === 'tr';

    // Son 20 kaydı detaylıca özetle (AI'nın analiz yapabilmesi için)
    const logDetails = logs.slice(-30).map(l => {
      const h = habits.find(hab => hab.id === l.habitId);
      let detail = `${l.date}: ${h?.name || 'Alışkanlık'}`;
      if (l.status) detail += ` [Durum: ${l.status}]`;
      if (l.elapsedMinutes) detail += ` - Toplam Süre: ${l.elapsedMinutes}dk`;
      if (l.usedMinutes) detail += ` - Harcanan: ${l.usedMinutes}dk`;
      if (l.usedCount) detail += ` - Adet: ${l.usedCount}`;

      // Detaylı girişler (sessions)
      if (l.entries && l.entries.length > 0) {
        const entryStr = l.entries.map((e: any) =>
          `${e.minutes > 0 ? e.minutes + 'dk' : ''} ${e.note || ''}`.trim()
        ).join(', ');
        detail += ` (Girişler: ${entryStr})`;
      } else if (l.note) {
        detail += ` - Not: ${l.note}`;
      }
      return detail;
    }).join('\n');

    const systemPrompt = isTR
      ? `Sen NutuHabit uygulamasının yapay zeka koçusun.
Kullanıcının adı: ${userName || 'Kullanıcı'}.

ÖNEMLİ KURAL: Her zaman Türkçe yanıt ver. Kesinlikle İngilizce kelime veya cümle kullanma. 

Kullanıcının mevcut verileri:
- Alışkanlıklar: ${habits.map(h => `${h.name} (${h.type})`).join(', ') || 'Henüz yok'}
- Son Kayıtlar ve Seanslar:
${logDetails || 'Kayıt bulunamadı'}
- Yapılacaklar: ${todos.filter(t => !t.completed).map(t => t.text).join(', ') || 'Yok'}

Görevin:
1. Kullanıcıya alışkanlıkları ve hedefleri konusunda destek ol, motive et.
2. SANA VERİLEN KAYITLARI VE SEANSLARI DETAYLI ANALİZ ET. Kullanıcın girdiği her bir süreyi, mazereti ve notu değerlendir.
3. Uyku kayıtlarındaki JSON verilerini (bedH, wakeH) anlamlandırıp "Dün gece 23:00'de yatıp 07:00'de kalkmışsın" gibi doğal bir dille açıkla.
4. Kullanıcı "analiz et" dediğinde, sadece genel durumu değil, hangi günlerde zorlandığını, hangi seanslarda daha verimli olduğunu detaylandır.
5. Samimi, enerjik ve profesyonel bir koç gibi davran. Yanıtların konuşma havasında olsun.`
      : `You are the AI coach of the NutuHabit app.
User's name: ${userName || 'User'}.

IMPORTANT RULE: Always respond in English. Never use any other language.

User's current data:
- Habits: ${habits.map(h => `${h.name} (${h.type})`).join(', ') || 'None yet'}
- Recent Logs and Sessions:
${logDetails || 'No logs found'}
- Todos: ${todos.filter(t => !t.completed).map(t => t.text).join(', ') || 'None'}

Your role:
1. Support and motivate the user about their habits and goals.
2. ANALYZE THE LOGS AND SESSIONS IN DETAIL. Evaluate every duration, excuse, and note provided by the user.
3. Parse JSON sleep data (bedH, wakeH) and explain it naturally, e.g., "You went to bed at 11 PM and woke up at 7 AM."
4. When the user asks for analysis, don't just give generalities; detail which days were challenging and which sessions were most productive.
5. Be friendly, energetic, and act as a professional coach. Keep responses conversational.`;

    // Sistem talimatını model yapılandırmasına ekliyoruz
    const modelWithSystem = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt
    });

    const result = await modelWithSystem.generateContent(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return language === 'tr'
      ? "Üzgünüm, şu an bağlantı kuramıyorum. Lütfen API anahtarını kontrol et."
      : "Sorry, I can't connect right now. Please check your API key.";
  }
}

export async function getAIAnalysis(context: {
  habits: any[];
  logs: any[];
  language: string;
}) {
  const { habits, logs, language } = context;
  try {
    const isTR = language === 'tr';

    // Verileri daha detaylı özetle
    const dataSummary = habits.map(h => {
      const hLogs = (logs || []).filter(l => l.habitId === h.id);
      const success = hLogs.filter(l => l.status === 'done').length;
      const totalDays = hLogs.length;
      const rate = totalDays > 0 ? Math.round((success / totalDays) * 100) : 0;

      let detail = `- ${h.name} (${h.type}): %${rate} başarı (${success}/${totalDays} gün).`;

      // Süre alışkanlığı ise ortalama süre
      if (h.type === 'time' && totalDays > 0) {
        const totalMins = hLogs.reduce((sum, l) => sum + (l.elapsedMinutes || 0), 0);
        detail += ` Ortalama günlük süre: ${Math.round(totalMins / totalDays)}dk.`;
      }

      // Son notlar/mazeretler
      const notes = hLogs.filter(l => l.note || (l.entries && l.entries.some((e: any) => e.note)))
        .slice(-5)
        .map(l => {
          const entriesNote = l.entries?.map((e: any) => e.note).filter(Boolean).join(', ');
          return `${l.date}: ${l.note || ''} ${entriesNote ? `(${entriesNote})` : ''}`.trim();
        })
        .join('; ');

      if (notes) detail += `\n  Son Notlar: ${notes}`;

      return detail;
    }).join('\n');

    const prompt = isTR
      ? `Aşağıdaki detaylı alışkanlık verilerimi analiz et. 
Sadece istatistik verme; hangi günlerde neden aksattığımı (notlara bakarak), hangi saatlerde daha aktif olduğumu ve nasıl gelişebileceğimi yorumla. 
Çok detaylı ve profesyonel bir rapor hazırla.

Veriler:
${dataSummary}

Rapor formatı:
1. Genel Durum Özeti
2. Alışkanlık Bazlı Detaylı Analiz (Seanslar ve mazeretler dahil)
3. Gelişim Önerileri ve Motivasyon`
      : `Analyze my detailed habit data below. 
Don't just provide statistics; comment on why I missed some days (by looking at notes), when I'm most active, and how I can improve. 
Prepare a very detailed and professional report.

Data:
${dataSummary}

Report format:
1. Overall Summary
2. Detailed Analysis per Habit (Including sessions and excuses)
3. Improvement Suggestions and Motivation`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini AI Analysis Error:", error);
    return null;
  }
}
