import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function WeeklyChart({ data, metricType }) {
  if (!data || data.length === 0) return null;

  const isTime = metricType === 'time' || metricType === 'bad';
  const yTicks = isTime ? undefined : [0, 50, 100];

  const formatYAxis = (val) => {
    if (isTime) return `${val}dk`;
    return `${val}%`;
  };

  const formatTooltip = (value) => {
    if (isTime) return [`${value} dk`, 'Süre'];
    return [`${value}%`, 'Oran'];
  };

  return (
    <div className="chart-container" style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '24px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
      <h3 className="chart-title" style={{ textTransform: 'uppercase', fontSize: '14px', letterSpacing: '2px', color: 'rgba(255,255,255,0.5)', marginBottom: '24px', fontFamily: 'serif' }}>Çubuk Grafik</h3>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={36}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="label" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
              ticks={yTicks}
              tickFormatter={formatYAxis}
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }} 
              contentStyle={{ backgroundColor: '#0D0626', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
              formatter={formatTooltip}
            />
            <Bar 
              dataKey="value" 
              radius={[8, 8, 8, 8]}
              background={{ fill: 'rgba(255,255,255,0.05)', radius: 8 }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="#a855f7" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
