import React, { useMemo, useState } from 'react';
import { useHabitStore } from '../store/useHabitStore';
import { Edit2, Trash2, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import './Views.css';

export default function RecordsView() {
  const { logs, habits, loading, updateLog, deleteLog } = useHabitStore();

  const [editingLogId, setEditingLogId] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editMinutes, setEditMinutes] = useState(0);

  const handleEditClick = (log, type, minutes, entryKey) => {
    setEditingLogId(entryKey);
    setEditStatus(log.status);
    setEditMinutes(type === 'done' ? 0 : minutes);
  };

  const handleSaveEdit = async (log, type, entryIndex) => {
    if (type === 'done') {
      await updateLog(log.id, type, { status: editStatus });
    } else {
      await updateLog(log.id, type, { elapsedMinutes: editMinutes, usedMinutes: editMinutes, status: editStatus }, entryIndex);
    }
    setEditingLogId(null);
  };

  const handleDelete = async (log, type, entryIndex) => {
    if (window.confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
      await deleteLog(log.id, type, entryIndex);
    }
  };

  const allEntries = useMemo(() => {
    const entries = [];
    logs.forEach(log => {
      const habit = habits.find(h => h.id === log.habitId) || (log.habitId === 'habit-sleep' ? { name: 'Uyku Takvimi', icon: '🌙', color: '#7C3AED', type: 'time' } : undefined);
      if (!habit) return;
      const type = habit.type;
      
      if (log.entries && Array.isArray(log.entries) && log.entries.length > 0) {
        log.entries.forEach((entry, index) => {
          entries.push({
            entry: { ...entry, entryIndex: index },
            log,
            habitName: habit.name || 'Habit',
            habitIcon: habit.icon || 'star',
            habitColor: habit.color || '#a855f7',
            type
          });
        });
      } else {
        if (log.status && log.status !== 'skipped') {
           entries.push({
             entry: { id: log.id, minutes: 0, createdAt: log.updatedAt || log.createdAt || new Date().toISOString(), note: log.note },
             log,
             habitName: habit.name || 'Habit',
             habitIcon: habit.icon || 'star',
             habitColor: habit.color || '#a855f7',
             type
           });
        }
      }
    });
    return entries.sort((a, b) => new Date(b.entry.createdAt).getTime() - new Date(a.entry.createdAt).getTime());
  }, [logs, habits]);

  const groupedEntries = useMemo(() => {
    const groups = {};
    allEntries.forEach(item => {
      const date = item.log.date;
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map(date => ({
        date,
        data: groups[date]
      }));
  }, [allEntries]);

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'd MMMM yyyy', { locale: tr });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (isoString) => {
    try {
      return format(new Date(isoString), 'HH:mm');
    } catch {
      return '';
    }
  };

  const formatMinutes = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}s ${m}d`;
    if (h > 0) return `${h}s`;
    return `${m}dk`;
  };

  const getStatusText = (status) => {
    if (status === 'done') return 'Tamamlandı';
    if (status === 'failed') return 'Başarısız';
    if (status === 'excused') return 'Mazeretli';
    return status;
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
        <h2 className="section-title">Günlük Kayıtlar</h2>
      </div>

      <div className="records-list">
        {groupedEntries.length === 0 ? (
          <div className="empty-state">Henüz hiç günlük kayıt yok.</div>
        ) : (
          groupedEntries.map(group => (
            <div key={group.date} className="record-group">
              <div className="record-date-header">
                <span className="record-date-text">{formatDate(group.date)}</span>
                <div className="record-date-line" />
              </div>
              <div className="record-items">
                {group.data.map(({ entry, log, habitName, habitIcon, habitColor, type }) => (
                  <div key={entry.id || `${log.id}-${entry.entryIndex || 0}`} className="record-card" style={{ borderLeftColor: habitColor }}>
                    <div className="record-card-inner">
                      <div className="record-info">
                        <div className="record-icon-box" style={{ backgroundColor: `${habitColor}20`, color: habitColor }}>
                          {renderIcon(habitIcon)}
                        </div>
                        <div>
                          <div className="record-habit-name">{habitName}</div>
                          <div className="record-time">{formatTime(entry.createdAt)}</div>
                        </div>
                      </div>
                      
                      <div className="record-body" style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          {editingLogId === (entry.id || `${log.id}-${entry.entryIndex || 0}`) ? (
                            <div className="edit-form" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              {type === 'done' || (type === 'bad' && !(entry.minutes > 0 || log.usedMinutes > 0)) ? (
                                <select 
                                  value={editStatus} 
                                  onChange={(e) => setEditStatus(e.target.value)}
                                  style={{ padding: '4px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none' }}
                                >
                                  {type === 'bad' ? (
                                    <>
                                      <option value="done">Uzak Durdum</option>
                                      <option value="failed">Yaptım (Başarısız)</option>
                                    </>
                                  ) : (
                                    <>
                                      <option value="done">Tamamlandı</option>
                                      <option value="failed">Başarısız</option>
                                      <option value="excused">Mazeretli</option>
                                    </>
                                  )}
                                </select>
                              ) : (
                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                  <input 
                                    type="number" 
                                    value={editMinutes} 
                                    onChange={(e) => setEditMinutes(Number(e.target.value))} 
                                    style={{ width: '60px', padding: '4px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none' }} 
                                  />
                                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>dk</span>
                                </div>
                              )}
                              <button onClick={() => handleSaveEdit(log, type, entry.entryIndex)} style={{ background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer' }}><Check size={16} /></button>
                              <button onClick={() => setEditingLogId(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={16} /></button>
                            </div>
                          ) : (
                            <>
                              <div className="record-value" style={{ fontSize: '15px', fontWeight: 'bold' }}>
                                {type === 'time' || (type === 'bad' && (entry.minutes > 0 || log.usedMinutes > 0))
                                  ? formatMinutes(entry.minutes || (type === 'time' ? log.elapsedMinutes : log.usedMinutes) || 0)
                                  : getStatusText(log.status)
                                }
                              </div>
                              {entry.note && (type === 'time' || type === 'bad') && !entry.note.startsWith('{"bedH"') && (
                                <div className="record-note">{entry.note}</div>
                              )}
                            </>
                          )}
                        </div>

                        {!editingLogId && (
                          <div className="record-actions" style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => handleEditClick(log, type, entry.minutes || (type === 'time' ? log.elapsedMinutes : log.usedMinutes) || 0, entry.id || `${log.id}-${entry.entryIndex || 0}`)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(log, type, entry.entryIndex)} style={{ background: 'none', border: 'none', color: 'rgba(239, 68, 68, 0.7)', cursor: 'pointer' }}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
