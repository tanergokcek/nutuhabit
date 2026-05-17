import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useHabitStore } from '../store/useHabitStore';
import { useTodoStore } from '../store/useTodoStore';
import { Sparkles, Send, Activity } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import './Views.css';
import './AICoachView.css';

// Gemini API Key (Vite env variables)
// Not: Gerçek projelerde .env dosyasında saklanmalıdır.
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.EXPO_PUBLIC_GEMINI_API_KEY || "";

export default function AICoachView() {
  const { user } = useAuthStore();
  const { habits, logs } = useHabitStore();
  const { todos } = useTodoStore();
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const getAICoachResponse = async (messageText) => {
    if (!GEMINI_API_KEY) return "Üzgünüm, şu an bağlantı kuramıyorum. Lütfen API anahtarını kontrol et.";
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      
      const logDetails = logs.slice(-30).map(l => {
        const h = habits.find(hab => hab.id === l.habitId);
        let detail = `${l.date}: ${h?.name || 'Alışkanlık'}`;
        if (l.status) detail += ` [Durum: ${l.status}]`;
        if (l.elapsedMinutes) detail += ` - Toplam Süre: ${l.elapsedMinutes}dk`;
        if (l.usedMinutes) detail += ` - Harcanan: ${l.usedMinutes}dk`;
        if (l.usedCount) detail += ` - Adet: ${l.usedCount}`;
        return detail;
      }).join('\n');

      const systemPrompt = `Sen NutuHabit uygulamasının yapay zeka koçusun.
Kullanıcının adı: ${user?.displayName || 'Kullanıcı'}.

ÖNEMLİ KURAL: Her zaman Türkçe yanıt ver. Kesinlikle İngilizce kelime veya cümle kullanma. 

Kullanıcının mevcut verileri:
- Alışkanlıklar: ${habits.map(h => `${h.name} (${h.type})`).join(', ') || 'Henüz yok'}
- Son Kayıtlar ve Seanslar:
${logDetails || 'Kayıt bulunamadı'}
- Yapılacaklar: ${todos.filter(t => !t.completed).map(t => t.text).join(', ') || 'Yok'}

Görevin:
1. Kullanıcıya alışkanlıkları ve hedefleri konusunda destek ol, motive et.
2. SANA VERİLEN KAYITLARI VE SEANSLARI DETAYLI ANALİZ ET. Kullanıcın girdiği her bir süreyi, mazereti ve notu değerlendir.
3. Uyku kayıtlarındaki verileri doğal bir dille açıkla.
4. Kullanıcı "analiz et" dediğinde, sadece genel durumu değil, hangi günlerde zorlandığını, hangi seanslarda daha verimli olduğunu detaylandır.
5. Samimi, enerjik ve profesyonel bir koç gibi davran. Yanıtların konuşma havasında olsun.`;

      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: systemPrompt
      });

      const result = await model.generateContent(messageText);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini AI Error:", error);
      return "Üzgünüm, şu an bağlantı kuramıyorum. Bir hata oluştu.";
    }
  };

  const getAIAnalysis = async () => {
    if (!GEMINI_API_KEY) return "Lütfen API anahtarını tanımlayın.";
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      
      const dataSummary = habits.map(h => {
        const hLogs = (logs || []).filter(l => l.habitId === h.id);
        const success = hLogs.filter(l => l.status === 'done').length;
        const totalDays = hLogs.length;
        const rate = totalDays > 0 ? Math.round((success / totalDays) * 100) : 0;
        let detail = `- ${h.name} (${h.type}): %${rate} başarı (${success}/${totalDays} gün).`;
        if (h.type === 'time' && totalDays > 0) {
          const totalMins = hLogs.reduce((sum, l) => sum + (l.elapsedMinutes || 0), 0);
          detail += ` Ortalama günlük süre: ${Math.round(totalMins / totalDays)}dk.`;
        }
        return detail;
      }).join('\n');

      const prompt = `Aşağıdaki alışkanlık verilerimi bir yaşam koçu gibi analiz et. 
Yanıtın çok uzun olmasın, öz ve motive edici olsun. 
Verilerdeki başarı oranlarını dikkate alarak bana samimi bir değerlendirme yap. 
Eğer performansım düşükse beni yargılamadan tavsiyeler ver. İyi gidiyorsam da enerjimi yükselt!

Veriler:
${dataSummary}

Yanıtını şu şekilde yapılandır:
- Kısa bir selamlaşma ve genel durum özeti
- Kritik gördüğün 1-2 nokta için tavsiye
- Güçlü bir motivasyon cümlesi`;

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini AI Analysis Error:", error);
      return "Analiz şu an yapılamıyor.";
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText;
    const userMsg = { id: Date.now().toString(), text: userText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    const aiReply = await getAICoachResponse(userText);

    const aiMsg = { id: (Date.now() + 1).toString(), text: aiReply, sender: 'ai' };
    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    setAnalysis(null);
    const result = await getAIAnalysis();
    if (result) {
      setAnalysis(result);
    }
    setAnalyzing(false);
  };

  return (
    <div className="view-container ai-view-wrapper animate-fade-in">
      <div className="ai-header">
        <div className="ai-avatar">
          <Sparkles size={32} color="white" />
        </div>
        <h2 className="ai-title">AI Koçunuz</h2>
        <p className="ai-subtitle">Sana özel tavsiyeler ve motivasyon.</p>
      </div>

      {analysis && (
        <div className="analysis-card">
          <div className="analysis-header">
            <Activity size={20} color="#fbbf24" />
            <span>Koçun Analizi</span>
          </div>
          <div className="analysis-text">{analysis}</div>
        </div>
      )}

      <div className="chat-section">
        <div className="messages-container">
          {!analysis && messages.length === 0 && (
            <div className="start-card">
              <p>Alışkanlıkların hakkında konuşmak, tavsiye almak veya gününü değerlendirmek için buradayım!</p>
              <button className="analyze-btn" onClick={runAnalysis} disabled={analyzing}>
                {analyzing ? 'Analiz ediliyor...' : 'Genel Analiz Yap'}
              </button>
            </div>
          )}
          
          {messages.map(m => (
            <div key={m.id} className={`msg-bubble ${m.sender === 'user' ? 'msg-user' : 'msg-ai'}`}>
              {m.text}
            </div>
          ))}
          {isTyping && (
            <div className="msg-bubble msg-ai typing-indicator">
              AI Koç yazıyor...
            </div>
          )}
        </div>

        <form className="chat-input-area" onSubmit={handleSendMessage}>
          <input
            type="text"
            className="chat-input"
            placeholder="AI koçuna bir şeyler sor..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="send-btn" disabled={!inputText.trim() || isTyping}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
