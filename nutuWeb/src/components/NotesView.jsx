import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNoteStore } from '../store/useNoteStore';
import { Plus, Trash2, Calendar as CalendarIcon, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import './Views.css';

export default function NotesView() {
  const { user } = useAuthStore();
  const { notes, fetchNotes, addNote, deleteNote, loading } = useNoteStore();
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    if (user?.id) fetchNotes(user.id);
  }, [user?.id, fetchNotes]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newNote.trim() || !user?.id) return;
    
    const today = format(new Date(), 'yyyy-MM-dd');
    addNote(user.id, {
      text: newNote.trim(),
      status: 'personal',
      date: today
    });
    setNewNote('');
  };

  const formatDate = (dateStr) => {
    try {
      return format(new Date(dateStr), 'd MMMM yyyy', { locale: tr });
    } catch {
      return dateStr;
    }
  };

  const renderIcon = (icon) => {
    if (!icon) return '📝';
    if (icon.includes('-') || icon.length > 2) {
      return <ion-icon name={icon} style={{ fontSize: '14px', color: 'inherit', verticalAlign: 'middle' }}></ion-icon>;
    }
    return <span>{icon}</span>;
  };

  if (loading) return <div className="view-loading">Yükleniyor...</div>;

  return (
    <div className="view-container animate-fade-in">
      <div className="view-header">
        <h2 className="section-title">Notlar</h2>
      </div>

      <form className="add-form note-form" onSubmit={handleAdd}>
        <textarea 
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Aklınızdakileri yazın..."
          className="add-input note-input"
          rows="3"
        />
        <button type="submit" className="add-btn note-btn" disabled={!newNote.trim()}>
          <Plus size={20} /> Ekle
        </button>
      </form>

      <div className="notes-grid">
        {notes.length === 0 ? (
          <div className="empty-state">Henüz not eklenmemiş.</div>
        ) : (
          notes.map(note => (
            <div key={note.id} className="note-card">
              <div className="note-header">
                <span className="note-date">
                  <CalendarIcon size={14} /> {formatDate(note.date)}
                </span>
                <button className="delete-btn" onClick={() => deleteNote(note.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="note-text">{note.text}</div>
              {note.habitName && (
                <div className="note-footer">
                  <span className="note-tag">
                    <Tag size={12} /> {renderIcon(note.habitIcon)} {note.habitName}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
