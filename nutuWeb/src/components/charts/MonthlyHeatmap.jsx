import React, { useMemo } from 'react';
import { format, getDaysInMonth, startOfMonth, isToday } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function MonthlyHeatmap({ logs, filteredHabits, year, month }) {
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  const firstDay = startOfMonth(new Date(year, month - 1)).getDay(); // 0 is Sunday
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1; // Make Monday 0

  const days = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
      const dayLogs = logs ? logs.filter(l => l.date === dateStr) : [];
      
      let completed = 0;
      let isFuture = new Date(dateStr) > new Date();

      if (filteredHabits && filteredHabits.length > 0 && !isFuture) {
        for (const habit of filteredHabits) {
          const log = dayLogs.find(l => l.habitId === habit.id);
          if (!log) continue;
          if (habit.type === 'done' && log.status === 'done') completed++;
          else if (habit.type === 'time' && (log.elapsedMinutes || 0) >= (habit.goalMinutes || 0)) completed++;
          else if (habit.type === 'bad' && (log.usedMinutes || 0) <= (habit.limitMinutes || 60)) completed++;
        }
      }

      const rate = (filteredHabits && filteredHabits.length > 0 && !isFuture) ? completed / filteredHabits.length : 0;
      
      return {
        day: i + 1,
        rate,
        dateStr,
        isFuture,
        isToday: dateStr === format(new Date(), 'yyyy-MM-dd')
      };
    });
  }, [logs, filteredHabits, year, month, daysInMonth]);

  const getHeatmapColor = (rate, isFuture) => {
    if (isFuture) return 'rgba(255,255,255,0.02)';
    if (rate === 0) return 'rgba(255,255,255,0.05)';
    if (rate < 0.4) return 'rgba(124, 58, 237, 0.4)';
    if (rate < 0.7) return 'rgba(124, 58, 237, 0.7)';
    if (rate < 1) return '#7c3aed';
    return '#a855f7'; // 100%
  };

  const monthName = format(new Date(year, month - 1), 'MMMM', { locale: tr });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  return (
    <div className="chart-container" style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '24px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ textTransform: 'uppercase', fontSize: '14px', letterSpacing: '2px', color: 'rgba(255,255,255,0.5)', margin: '0 0 4px 0', fontFamily: 'serif' }}>Aylık Görünüm</h3>
        <h2 style={{ fontSize: '20px', color: 'white', margin: 0, fontWeight: '500' }}>{capitalizedMonth} {year}</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', flex: 1 }}>
        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((d, i) => (
          <div key={`header-${i}`} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>{d}</div>
        ))}
        {Array.from({ length: adjustedFirstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((d, i) => (
          <div 
            key={i} 
            style={{ 
              aspectRatio: '1',
              backgroundColor: getHeatmapColor(d.rate, d.isFuture),
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: d.isToday ? 'white' : 'rgba(255,255,255,0.7)',
              fontSize: '14px',
              fontWeight: d.isToday ? 'bold' : '500',
              boxShadow: d.isToday ? '0 0 0 2px white' : 'none',
              cursor: 'default'
            }}
            title={`${d.dateStr}: %${Math.round(d.rate * 100)}`}
          >
            {d.day}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Az</span>
        {['rgba(255,255,255,0.05)', 'rgba(124, 58, 237, 0.4)', 'rgba(124, 58, 237, 0.7)', '#7c3aed', '#a855f7'].map((color, i) => (
          <div key={`legend-${i}`} style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: color }} />
        ))}
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Tam</span>
      </div>
    </div>
  );
}
