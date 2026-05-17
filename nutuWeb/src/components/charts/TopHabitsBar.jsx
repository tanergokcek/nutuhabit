import React from 'react';

export default function TopHabitsBar({ data, metricType }) {
  if (!data || data.length === 0) return null;

  const isTime = metricType === 'time' || metricType === 'bad';
  const sortedData = [...data]
    .sort((a, b) => isTime ? (b.totalMinutes - a.totalMinutes) : (b.rate - a.rate))
    .slice(0, 5);

  const maxMinutes = Math.max(...sortedData.map(d => d.totalMinutes || 0), 1);

  const renderIcon = (icon) => {
    if (!icon) return '📝';
    if (icon.includes('-') || icon.length > 2) {
      return <ion-icon name={icon} style={{ fontSize: '20px', color: 'rgba(255,255,255,0.7)' }}></ion-icon>;
    }
    return <span style={{ fontSize: '20px' }}>{icon}</span>;
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0dk';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}sa ${m}dk`;
    if (h > 0) return `${h}sa`;
    return `${m}dk`;
  };

  return (
    <div className="chart-container" style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '24px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
      <h3 className="chart-title" style={{ textTransform: 'uppercase', fontSize: '14px', letterSpacing: '2px', color: 'rgba(255,255,255,0.5)', marginBottom: '24px', fontFamily: 'serif' }}>Alışkanlık Bazlı</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {sortedData.map((habit) => {
          const rate = isTime 
            ? Math.round(((habit.totalMinutes || 0) / maxMinutes) * 100) 
            : Math.round(habit.rate * 100);
            
          const color = habit.type === 'bad' ? '#ef4444' : '#22c55e';
          const displayValue = isTime ? formatDuration(habit.totalMinutes) : `${Math.round(habit.rate * 100)}%`;
          
          return (
            <div key={habit.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {renderIcon(habit.icon)}
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '1px' }}>{habit.name}</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'rgba(255,255,255,0.9)', fontFamily: 'serif' }}>{displayValue}</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${rate}%`, background: color, borderRadius: '4px' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
