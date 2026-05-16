import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { auth } from '../firebaseConfig';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import { User, Mail, Lock, ChevronRight, Save } from 'lucide-react';
import './SettingsView.css';

export default function SettingsView() {
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName: name });
      setMessage({ type: 'success', text: 'Profil başarıyla güncellendi.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Hata: ' + error.message });
    }
    setLoading(false);
  };

  const handleUpdateEmail = async () => {
    setLoading(true);
    try {
      await updateEmail(auth.currentUser, email);
      setMessage({ type: 'success', text: 'E-posta başarıyla güncellendi.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Hata: ' + error.message });
    }
    setLoading(false);
  };

  const handleUpdatePassword = async () => {
    if (!password) return;
    setLoading(true);
    try {
      await updatePassword(auth.currentUser, password);
      setMessage({ type: 'success', text: 'Şifre başarıyla güncellendi.' });
      setPassword('');
    } catch (error) {
      setMessage({ type: 'error', text: 'Hata: ' + error.message });
    }
    setLoading(false);
  };

  return (
    <div className="settings-view">
      <div className="settings-section">
        <h2 className="section-title">Hesap Ayarları</h2>
        
        <div className="settings-card">
          <div className="setting-item">
            <div className="setting-icon">
              <User size={20} />
            </div>
            <div className="setting-content">
              <label>İsim Soyisim</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Adınız Soyadınız"
              />
            </div>
            <button className="save-icon-btn" onClick={handleUpdateProfile} disabled={loading}>
              <Save size={18} />
            </button>
          </div>

          <div className="setting-item">
            <div className="setting-icon">
              <Mail size={20} />
            </div>
            <div className="setting-content">
              <label>E-posta Adresi</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta"
              />
            </div>
            <button className="save-icon-btn" onClick={handleUpdateEmail} disabled={loading}>
              <Save size={18} />
            </button>
          </div>

          <div className="setting-item">
            <div className="setting-icon">
              <Lock size={20} />
            </div>
            <div className="setting-content">
              <label>Yeni Şifre</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button className="save-icon-btn" onClick={handleUpdatePassword} disabled={loading}>
              <Save size={18} />
            </button>
          </div>
        </div>

        {message.text && (
          <div className={`settings-message ${message.type}`}>
            {message.text}
          </div>
        )}
      </div>

      <div className="settings-info">
        <p>Hesap bilgileriniz NutuHabit mobil uygulaması ile senkronize edilir.</p>
      </div>
    </div>
  );
}
