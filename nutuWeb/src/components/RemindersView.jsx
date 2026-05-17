import React, { useState } from 'react';
import { useHabitStore } from '../store/useHabitStore';
import { Bell } from 'lucide-react';
import './Views.css';

export default function RemindersView() {
  const { habits, updateHabit, loading } = useHabitStore();
  const activeHabits = habits.filter(h => !h.isArchived);

  const [editingId, setEditingId] = useState(null);
  const [timeInput, setTimeInput] = useState('');

  const handleToggle = (id, currentEnabled) => {
    updateHabit(id, { reminderEnabled: !currentEnabled });
  };

  const handleEditClick = (habit) => {
    setEditingId(habit.id);
    setTimeInput(habit.reminderTime || '08:00');
  };

  const handleSaveTime = (id) => {
    if (!timeInput) return;
    updateHabit(id, { reminderTime: timeInput });
    setEditingId(null);
  };

  const renderIcon = (icon) => {
    if (!icon) return '📝';
    if (icon.includes('-') || icon.length > 2) {
      return <ion-icon name={icon} style={{ fontSize: '20px', color: 'inherit' }}></ion-icon>;
    }
    return <span>{icon}</span>;
  };

  if (loading) return <div className="view-loading">Yükleniyor...</div>;

  return (
    <div className="view-container animate-fade-in">
      <div className="view-header">
        <h2 className="section-title">Hatırlatıcılar</h2>
      </div>

      <div className="reminders-list">
        {activeHabits.length === 0 ? (
          <div className="empty-state">Henüz hiç aktif alışkanlığınız yok.</div>
        ) : (
          activeHabits.map(habit => (
            <div key={habit.id} className="reminder-card">
              <div className="reminder-info">
                <div className="reminder-icon-box" style={{ backgroundColor: 'rgba(124, 58, 237, 0.2)', color: '#a855f7' }}>
                  {renderIcon(habit.icon || '🎯')}
                </div>
                <div className="reminder-details">
                  <span className="reminder-name">{habit.name}</span>
                  {editingId === habit.id ? (
                    <div className="reminder-edit-row">
                      <input 
                        type="time" 
                        value={timeInput} 
                        onChange={(e) => setTimeInput(e.target.value)} 
                        className="reminder-time-input"
                      />
                      <button className="reminder-save-btn" onClick={() => handleSaveTime(habit.id)}>Kaydet</button>
                    </div>
                  ) : (
                    <span className="reminder-time">
                      <Bell size={12} /> {habit.reminderTime || '08:00'}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="reminder-actions">
                {editingId !== habit.id && (
                  <button className="reminder-edit-btn" onClick={() => handleEditClick(habit)}>Düzenle</button>
                )}
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={habit.reminderEnabled || false} 
                    onChange={() => handleToggle(habit.id, habit.reminderEnabled)} 
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
