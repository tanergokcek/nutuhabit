import { GoogleGenerativeAI } from "@google/generative-ai";

// API Key'i buraya yapıştırabilirsin veya .env dosyasından çekebilirsin
// Güvenlik için gerçek projelerde .env kullanılması önerilir.
const GEMINI_API_KEY = "AIzaSyDC74HYKlq0bG2g3H3KRjfG4Xoq8pfp1zY";

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

    const systemPrompt = isTR
      ? `Sen NutuHabit uygulamasının yapay zeka koçusun.
Kullanıcının adı: ${userName || 'Kullanıcı'}.

ÖNEMLİ KURAL: Her zaman ama HER ZAMAN Türkçe yanıt ver. Kesinlikle İngilizce kelime veya cümle kullanma. 
Kullanıcı sana İngilizce yazsa bile sen TÜRKÇE cevap ver.

Kullanıcının mevcut verileri:
- Alışkanlıklar: ${habits.map(h => h.name).join(', ') || 'Henüz yok'}
- Son Kayıtlar: ${logs.length} adet tamamlanmış aksiyon.
- Yapılacaklar: ${todos.filter(t => !t.completed).map(t => t.text).join(', ') || 'Yok'}

Görevin:
1. Kullanıcıya alışkanlıkları ve hedefleri konusunda destek ol, motive et.
2. Verilere dayalı (varsa) kısa analizler yap.
3. Samimi, enerjik ve profesyonel bir koç gibi davran.
4. Yanıtlarını çok uzun tutma, konuşma havasında olsun.`
      : `You are the AI coach of the NutuHabit app.
User's name: ${userName || 'User'}.

IMPORTANT RULE: Always respond in English. Never use any other language.
Even if the user writes in another language, you must respond in ENGLISH.

User's current data:
- Habits: ${habits.map(h => h.name).join(', ') || 'None yet'}
- Recent Logs: ${logs.length} completed actions.
- Todos: ${todos.filter(t => !t.completed).map(t => t.text).join(', ') || 'None'}

Your role:
1. Support and motivate the user about their habits and goals.
2. Provide short data-driven insights when possible.
3. Be friendly, energetic, and act as a professional coach.
4. Keep your responses concise and conversational.`;

    // Sistem talimatını model yapılandırmasına ekliyoruz (daha katı kurallar için)
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

    const prompt = `
      Aşağıdaki alışkanlık verilerini analiz et ve bana ${language === 'tr' ? 'Türkçe' : 'İngilizce'} bir rapor sun.
      Veriler:
      ${habits.map(h => {
      const hLogs = logs.filter(l => l.habitId === h.id);
      const success = hLogs.filter(l => l.status === 'done').length;
      return `- ${h.name}: ${success}/${hLogs.length} tamamlanma.`;
    }).join('\n')}

      Lütfen kısa, öz ve motive edici bir analiz yap.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini AI Analysis Error:", error);
    return null;
  }
}
