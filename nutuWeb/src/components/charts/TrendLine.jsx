import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TrendLine({ data, metricType }) {
  if (!data || data.length === 0) return null;

  const isTime = metricType === 'time';
  const totalItems = data.length;
  
  let averageRate = 0;
  let completedItems = 0;
  
  if (isTime) {
    averageRate = totalItems > 0 ? Math.round(data.reduce((sum, d) => sum + d.value, 0) / totalItems) : 0;
    completedItems = data.filter(d => d.value > 0).length;
  } else {
    completedItems = data.filter(d => d.value >= 100).length; // Tamamen bitenler
    averageRate = totalItems > 0 ? Math.round(data.reduce((sum, d) => sum + d.value, 0) / totalItems) : 0;
  }

  const yTicks = isTime ? undefined : [0, 50, 100]; // Süre ise Recharts otomatik hesaplasın
  
  const formatYAxis = (val) => {
    if (isTime) return `${val}dk`;
    return `${val}%`;
  };

  const formatTooltip = (value) => {
    if (isTime) return [`${value} dk`, 'Süre'];
    return [`${value}%`, 'Tamamlama'];
  };

  return (
    <div className="chart-container" style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '24px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              contentStyle={{ backgroundColor: '#0D0626', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
              formatter={formatTooltip}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#a855f7" 
              strokeWidth={4} 
              dot={{ r: 4, fill: '#fff', strokeWidth: 0 }} 
              activeDot={{ r: 6, fill: '#fff' }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
        <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#c084fc', fontFamily: 'serif' }}>
            {averageRate}{isTime ? 'dk' : '%'}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
            {isTime ? 'Ortalama Süre' : 'Tamamlama'}
          </div>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#c084fc', fontFamily: 'serif' }}>{completedItems}/{totalItems}</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
            {isTime ? 'Gün Sayısı' : 'Tamamlanan'}
          </div>
        </div>
      </div>
    </div>
  );
}
