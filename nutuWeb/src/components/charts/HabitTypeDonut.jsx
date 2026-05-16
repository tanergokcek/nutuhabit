import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function HabitTypeDonut({ logs, filteredHabits }) {
  const data = useMemo(() => {
    if (!logs || !filteredHabits || filteredHabits.length === 0) return [];

    let completed = 0;
    let failed = 0;
    let excused = 0;

    for (const habit of filteredHabits) {
      const habitLogs = logs.filter(l => l.habitId === habit.id);
      for (const log of habitLogs) {
        if (habit.type === 'done') {
          if (log.status === 'done') completed++;
          else if (log.status === 'failed') failed++;
          else if (log.status === 'excused') excused++;
        } else if (habit.type === 'time') {
          if ((log.elapsedMinutes || 0) >= (habit.goalMinutes || 0)) completed++;
          else failed++;
        } else if (habit.type === 'bad') {
          if ((log.usedMinutes || 0) <= (habit.limitMinutes || 60)) completed++;
          else failed++;
        }
      }
    }

    return [
      { name: 'Tamamlandı', value: completed, color: '#22c55e' },
      { name: 'Başarısız', value: failed, color: '#ef4444' },
      { name: 'Mazeretli', value: excused, color: '#f97316' },
    ].filter(item => item.value > 0);
  }, [logs, filteredHabits]);

  if (data.length === 0) return null;

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="chart-container" style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '24px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
      <h3 className="chart-title" style={{ textTransform: 'uppercase', fontSize: '14px', letterSpacing: '2px', color: 'rgba(255,255,255,0.5)', marginBottom: '24px', fontFamily: 'serif' }}>Pasta Grafik</h3>
      <div style={{ display: 'flex', alignItems: 'center', height: '220px' }}>
        <div style={{ flex: 1, position: 'relative', height: '100%' }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                innerRadius={65}
                outerRadius={95}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', fontFamily: 'serif' }}>{total}</span>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>toplam</span>
          </div>
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', paddingLeft: '20px' }}>
          {data.map((item, index) => {
            const percentage = Math.round((item.value / total) * 100);
            return (
              <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }}></div>
                  <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.9)', fontFamily: 'serif' }}>{item.name}</span>
                </div>
                <span style={{ fontSize: '15px', color: '#c084fc', fontWeight: '600' }}>{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
