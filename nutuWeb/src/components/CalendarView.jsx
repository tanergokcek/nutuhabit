import React, { useMemo, useState } from 'react';
import { useHabitStore } from '../store/useHabitStore';
import { format, addDays, startOfWeek, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CheckCircle2, XCircle, AlertCircle, Clock, Ban, ChevronLeft, ChevronRight } from 'lucide-react';
import './CalendarView.css';

export default function CalendarView() {
  const { habits, logs, selectedDate, setSelectedDate } = useHabitStore();
  const [viewType, setViewType] = useState('week'); // 'week', 'month', 'year'

  const weekDays = useMemo(() => {
    const start = startOfWeek(new Date(selectedDate), { weekStartsOn: 1 });
    return eachDayOfInterval({
      start: start,
      end: addDays(start, 6)
    });
  }, [selectedDate]);

  const monthDays = useMemo(() => {
    const date = new Date(selectedDate);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    // Takvimi Pazartesi'den başlatmak için boşlukları hesapla
    const firstDay = start.getDay();
    const prefixDays = firstDay === 0 ? 6 : firstDay - 1;
    
    return {
      days: eachDayOfInterval({ start, end }),
      prefixDays
    };
  }, [selectedDate]);

  const yearMonths = useMemo(() => {
    const year = new Date(selectedDate).getFullYear();
    return Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
  }, [selectedDate]);

  const habitsForSelectedDate = useMemo(() => {
    return habits.filter(h => !h.isArchived).map(habit => {
      const log = logs.find(l => l.habitId === habit.id && l.date === selectedDate);
      return { ...habit, log };
    });
  }, [habits, logs, selectedDate]);

  const getStatusIcon = (habit, log) => {
    if (!log) return <div className="status-placeholder" />;
    
    if (habit.type === 'done') {
      if (log.status === 'done') return <CheckCircle2 className="status-icon done" />;
      if (log.status === 'failed') return <XCircle className="status-icon failed" />;
      if (log.status === 'excused') return <AlertCircle className="status-icon excused" />;
    } else if (habit.type === 'time') {
      const isDone = (log.elapsedMinutes || 0) >= (habit.goalMinutes || 0);
      return (
        <div className={`status-badge ${isDone ? 'done' : 'pending'}`}>
          <Clock size={14} />
          <span>{log.elapsedMinutes || 0}/{habit.goalMinutes} dk</span>
        </div>
      );
    } else if (habit.type === 'bad') {
      const isLimitExceeded = (log.usedMinutes || 0) > (habit.limitMinutes || 60);
      return (
        <div className={`status-badge ${isLimitExceeded ? 'failed' : 'done'}`}>
          <Ban size={14} />
          <span>{log.usedMinutes || 0}/{habit.limitMinutes} dk</span>
        </div>
      );
    }
    return null;
  };

  const renderHabitIcon = (icon) => {
    if (!icon) return '📝';
    // Eğer ikon ismi '-' içeriyorsa veya bilinen bir ionicon ismiyse (örn: barbell-outline)
    if (icon.includes('-') || icon.length > 2) {
      return <ion-icon name={icon} style={{ fontSize: '24px', color: 'rgba(255,255,255,0.9)' }}></ion-icon>;
    }
    return <span style={{ fontSize: '24px' }}>{icon}</span>; // Emoji
  };

  const getDayCompletion = (dateStr) => {
    const dayLogs = logs.filter(l => l.date === dateStr);
    const activeHabits = habits.filter(h => !h.isArchived);
    if (activeHabits.length === 0) return 0;
    
    let completed = 0;
    for (const habit of activeHabits) {
      const log = dayLogs.find(l => l.habitId === habit.id);
      if (!log) continue;
      if (habit.type === 'done' && log.status === 'done') completed++;
      else if (habit.type === 'time' && (log.elapsedMinutes || 0) >= (habit.goalMinutes || 0)) completed++;
      else if (habit.type === 'bad' && (log.usedMinutes || 0) <= (habit.limitMinutes || 60)) completed++;
    }
    return completed / activeHabits.length;
  };

  const navigateDate = (amount, unit) => {
    const date = new Date(selectedDate);
    if (unit === 'month') date.setMonth(date.getMonth() + amount);
    if (unit === 'year') date.setFullYear(date.getFullYear() + amount);
    if (unit === 'week') date.setDate(date.getDate() + (amount * 7));
    setSelectedDate(format(date, 'yyyy-MM-dd'));
  };

  return (
    <div className="calendar-view">
      <div className="calendar-controls">
        <div className="view-switcher">
          <button className={`view-btn ${viewType === 'week' ? 'active' : ''}`} onClick={() => setViewType('week')}>Hafta</button>
          <button className={`view-btn ${viewType === 'month' ? 'active' : ''}`} onClick={() => setViewType('month')}>Ay</button>
          <button className={`view-btn ${viewType === 'year' ? 'active' : ''}`} onClick={() => setViewType('year')}>Yıl</button>
        </div>

        <div className="date-nav">
          <button className="nav-arrow" onClick={() => navigateDate(-1, viewType === 'week' ? 'week' : viewType)}>
            <ChevronLeft size={20} />
          </button>
          <span className="current-date-label">
            {viewType === 'year' ? format(new Date(selectedDate), 'yyyy') : format(new Date(selectedDate), 'MMMM yyyy', { locale: tr })}
          </span>
          <button className="nav-arrow" onClick={() => navigateDate(1, viewType === 'week' ? 'week' : viewType)}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {viewType === 'week' && (
        <div className="week-strip animate-fade-in">
          {weekDays.map((day, idx) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isSelected = dateStr === selectedDate;
            const isToday = isSameDay(day, new Date());
            return (
              <button 
                key={idx} 
                className={`day-item ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                onClick={() => setSelectedDate(dateStr)}
              >
                <span className="day-label">{format(day, 'EEE', { locale: tr })}</span>
                <span className="day-num">{format(day, 'd')}</span>
                {isSelected && <div className="selected-dot" />}
              </button>
            );
          })}
        </div>
      )}

      {viewType === 'month' && (
        <div className="month-grid-container animate-fade-in">
          <div className="month-grid-header">
            {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map(d => <div key={d} className="grid-header-cell">{d}</div>)}
          </div>
          <div className="month-grid">
            {Array.from({ length: monthDays.prefixDays }).map((_, i) => <div key={`prefix-${i}`} className="grid-cell empty" />)}
            {monthDays.days.map((day, i) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const rate = getDayCompletion(dateStr);
              const isSelected = dateStr === selectedDate;
              return (
                <button 
                  key={i} 
                  className={`grid-cell ${isSelected ? 'selected' : ''}`} 
                  onClick={() => setSelectedDate(dateStr)}
                  style={{ '--completion': rate }}
                >
                  <span className="cell-num">{format(day, 'd')}</span>
                  {rate > 0 && <div className="cell-progress" style={{ opacity: rate }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {viewType === 'year' && (
        <div className="year-grid animate-fade-in">
          {yearMonths.map((m, i) => {
            const monthLabel = format(m, 'MMMM', { locale: tr });
            return (
              <button key={i} className="year-month-card" onClick={() => {
                setSelectedDate(format(m, 'yyyy-MM-dd'));
                setViewType('month');
              }}>
                <span className="month-card-label">{monthLabel}</span>
                <div className="mini-heatmap">
                   {/* Mini heatmap logic can go here or just a summary */}
                   <div className="month-summary-dot" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="habit-list-section">
        <div className="habit-list-header">
          <h2>{format(new Date(selectedDate), 'd MMMM yyyy', { locale: tr })}</h2>
        </div>

        <div className="habit-items-grid">
          {habitsForSelectedDate.length > 0 ? (
            habitsForSelectedDate.map(habit => (
              <div key={habit.id} className="habit-item-card">
                <div className="habit-info">
                  <div className="habit-icon-web">
                    {renderHabitIcon(habit.icon)}
                  </div>
                  <div className="habit-text">
                    <span className="habit-name">{habit.name}</span>
                    <span className="habit-type">{habit.type === 'done' ? 'Alışkanlık' : habit.type === 'time' ? 'Süreli' : 'Kaçınma'}</span>
                  </div>
                </div>
                <div className="habit-status">
                  {getStatusIcon(habit, habit.log)}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">Bu tarih için alışkanlık bulunamadı.</div>
          )}
        </div>
      </div>
    </div>
  );
}
