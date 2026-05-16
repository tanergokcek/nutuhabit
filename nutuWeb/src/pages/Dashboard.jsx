import React, { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useHabitStore } from '../store/useHabitStore';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { LogOut, BarChart3, Calendar as CalendarIcon, Menu, X, Settings as SettingsIcon, User, Mail, Lock, ChevronDown } from 'lucide-react';
import WeeklyChart from '../components/charts/WeeklyChart';
import TrendLine from '../components/charts/TrendLine';
import HabitTypeDonut from '../components/charts/HabitTypeDonut';
import TopHabitsBar from '../components/charts/TopHabitsBar';
import MonthlyHeatmap from '../components/charts/MonthlyHeatmap';
import logoIcon from '../assets/brand/favicon.png';
import CalendarView from '../components/CalendarView';
import SettingsView from '../components/SettingsView';
import './Dashboard.css';

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const { habits, logs, loading, fetchData } = useHabitStore();
  const [activeTab, setActiveTab] = useState('charts'); // 'charts' or 'calendar'
  const [timeRange, setTimeRange] = useState('week'); // 'day', 'week', 'month', 'year'
  const [habitType, setHabitType] = useState('all'); // 'all', 'done', 'time', 'bad'
  const [selectedHabitId, setSelectedHabitId] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchData(user.id);
    }
  }, [user?.id, fetchData]);

  const handleLogout = async () => {
    await signOut(auth);
    logout();
  };

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  // Filtrelenmiş Alışkanlıklar
  const filteredHabits = useMemo(() => {
    let result = habits.filter(h => !h.isArchived);
    if (habitType !== 'all') {
      result = result.filter(h => h.type === habitType);
    }
    if (selectedHabitId !== 'all') {
      result = result.filter(h => h.id === selectedHabitId);
    }
    return result;
  }, [habits, habitType, selectedHabitId]);

  // Zaman Aralığına Göre Tarihler
  const chartDates = useMemo(() => {
    if (timeRange === 'day') return [todayStr];
    if (timeRange === 'week') {
      return eachDayOfInterval({ start: subDays(today, 6), end: today }).map(d => format(d, 'yyyy-MM-dd'));
    }
    if (timeRange === 'month') {
      return eachDayOfInterval({ start: subDays(today, 29), end: today }).map(d => format(d, 'yyyy-MM-dd'));
    }
    if (timeRange === 'year') {
      // Son 12 ayın başlangıç tarihlerini döndürelim (Basitleştirme için)
      return Array.from({ length: 12 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (11 - i));
        return format(d, 'yyyy-MM');
      });
    }
    return [];
  }, [timeRange, todayStr]);

  const chartData = useMemo(() => {
    if (timeRange === 'year') {
      return chartDates.map(monthStr => {
        const monthLogs = logs.filter(l => l.date.startsWith(monthStr));
        if (filteredHabits.length === 0) return { label: monthStr, completionRate: 0 };
        
        let totalPossible = filteredHabits.length * 30; // Yaklaşık
        let completed = 0;
        // Basit hesap: o ayki tüm loglardaki başarı oranı
        for (const habit of filteredHabits) {
          const habitLogs = monthLogs.filter(l => l.habitId === habit.id);
          for (const log of habitLogs) {
            if (habit.type === 'done' && log.status === 'done') completed++;
            else if (habit.type === 'time' && (log.elapsedMinutes || 0) >= (habit.goalMinutes || 0)) completed++;
            else if (habit.type === 'bad' && (log.usedMinutes || 0) <= (habit.limitMinutes || 60)) completed++;
          }
        }
        const rate = monthLogs.length > 0 ? completed / monthLogs.length : 0;
        return { label: monthStr, completionRate: rate };
      });
    }

    return chartDates.map((date) => {
      const dayLogs = logs.filter(l => l.date === date);
      if (filteredHabits.length === 0) return { label: date.substring(5), completionRate: 0, totalMinutes: 0 };

      let completed = 0;
      let totalMinutes = 0;
      for (const habit of filteredHabits) {
        const log = dayLogs.find(l => l.habitId === habit.id);
        if (!log) continue;
        if (habit.type === 'done' && log.status === 'done') completed++;
        else if (habit.type === 'time') {
          totalMinutes += (log.elapsedMinutes || 0);
          if ((log.elapsedMinutes || 0) >= (habit.goalMinutes || 0)) completed++;
        } else if (habit.type === 'bad') {
          totalMinutes += (log.usedMinutes || 0);
          if ((log.usedMinutes || 0) <= (habit.limitMinutes || 60)) completed++;
        }
      }
      return { 
        label: date.substring(5), 
        completionRate: completed / filteredHabits.length,
        totalMinutes 
      };
    });
  }, [chartDates, logs, filteredHabits, timeRange]);

  const currentMetric = selectedHabitId !== 'all' ? habits.find(h => h.id === selectedHabitId)?.type : habitType;

  const trendData = useMemo(() => {
    return chartData.map(d => ({
      label: d.label,
      value: currentMetric === 'time' ? d.totalMinutes : Math.round(d.completionRate * 100),
      originalData: d
    }));
  }, [chartData, currentMetric]);

  const monthlyHeatmapData = useMemo(() => {
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const activeHabits = habits.filter(h => !h.isArchived);
    
    return logs.filter(l => {
      const [y, m] = l.date.split('-').map(Number);
      return y === year && m === month;
    }).reduce((acc, log) => {
      // Günlük oranı hesapla
      const date = log.date;
      if (!acc[date]) {
        const dayLogs = logs.filter(l => l.date === date);
        let completed = 0;
        for (const habit of activeHabits) {
          const l = dayLogs.find(dl => dl.habitId === habit.id);
          if (!l) continue;
          if (habit.type === 'done' && l.status === 'done') completed++;
          else if (habit.type === 'time' && (l.elapsedMinutes || 0) >= (habit.goalMinutes || 0)) completed++;
          else if (habit.type === 'bad' && (l.usedMinutes || 0) <= (habit.limitMinutes || 60)) completed++;
        }
        acc[date] = { date, completionRate: activeHabits.length > 0 ? completed / activeHabits.length : 0 };
      }
      return acc;
    }, {});
  }, [habits, logs, today]);

  const todayCompletionRate = chartData.find(d => d.label === todayStr.substring(5))?.completionRate || 0;
  
  const topHabitsData = useMemo(() => {
    return filteredHabits.map((habit) => {
      const habitLogs = logs.filter(l => l.habitId === habit.id);
      if (habitLogs.length === 0) return { id: habit.id, name: habit.name, icon: habit.icon, rate: 0, type: habit.type };
      
      let completed = 0;
      for (const log of habitLogs) {
        if (habit.type === 'done' && log.status === 'done') completed++;
        else if (habit.type === 'time') {
          if ((log.elapsedMinutes || 0) >= (habit.goalMinutes || 0)) completed++;
        } else if (habit.type === 'bad') {
          if ((log.usedMinutes || 0) <= (habit.limitMinutes || 60)) completed++;
        }
      }
      return { id: habit.id, name: habit.name, icon: habit.icon, rate: completed / habitLogs.length, type: habit.type };
    });
  }, [filteredHabits, logs]);

  const overallRate = useMemo(() => {
    const activeHabits = habits.filter(h => !h.isArchived);
    if (activeHabits.length === 0 || logs.length === 0) return 0;
    
    let completed = 0;
    for (const log of logs) {
      const habit = habits.find(h => h.id === log.habitId);
      if (!habit) continue;
      if (habit.type === 'done' && log.status === 'done') completed++;
      else if (habit.type === 'time' && (log.elapsedMinutes || 0) >= (habit.goalMinutes || 0)) completed++;
      else if (habit.type === 'bad' && (log.usedMinutes || 0) <= (habit.limitMinutes || 60)) completed++;
    }
    return completed / logs.length;
  }, [logs, habits]);

  if (loading) {
    return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',color:'white'}}>Veriler yükleniyor...</div>;
  }

  const doneCount = habits.filter(h => !h.isArchived && h.type === 'done').length;
  const timeCount = habits.filter(h => !h.isArchived && h.type === 'time').length;
  const badCount = habits.filter(h => !h.isArchived && h.type === 'bad').length;

  return (
    <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-section">
            <img src={logoIcon} alt="NutuHabit Logo" width="24" height="24" style={{ borderRadius: '6px' }} />
            <span className="logo-text brand-font">NutuHabit</span>
          </div>
          <button className="sidebar-toggle-inner" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'charts' ? 'active' : ''}`}
            onClick={() => setActiveTab('charts')}
          >
            <BarChart3 size={20} />
            <span>Grafikler</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            <CalendarIcon size={20} />
            <span>Takvim</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <SettingsIcon size={20} />
            <span>Ayarlar</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">{user?.displayName?.charAt(0)}</div>
            <div className="user-info">
              <span className="user-name">{user?.displayName}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="content-header">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu size={24} />
          </button>
          <div className="header-titles">
            <h1 className="content-title brand-font">
              {activeTab === 'charts' ? 'İstatistikler' : activeTab === 'calendar' ? 'Alışkanlık Takvimi' : 'Hesap Ayarları'}
            </h1>
          </div>
        </header>

        <div className="scrollable-content">
          {activeTab === 'charts' ? (
            <div className="charts-view animate-fade-in">
              <div className="type-segmented-control-wrapper">
                <div className="type-segmented-control">
                  {[
                    { id: 'all', label: 'Hepsi' },
                    { id: 'done', label: 'Yapıldı' },
                    { id: 'time', label: 'Süre' },
                    { id: 'bad', label: 'Kötü' }
                  ].map(type => (
                    <button 
                      key={type.id} 
                      className={`type-segment ${habitType === type.id ? 'active' : ''}`}
                      onClick={() => setHabitType(type.id)}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="summary-grid">
                <div className="summary-card">
                  <span className="summary-emoji">📊</span>
                  <span className="summary-value">{Math.round(todayCompletionRate * 100)}%</span>
                  <span className="summary-label">Bugün</span>
                </div>
                <div className="summary-card">
                  <span className="summary-emoji">🎯</span>
                  <span className="summary-value">{Math.round(overallRate * 100)}%</span>
                  <span className="summary-label">Genel Başarı</span>
                </div>
                <div className="summary-card">
                  <span className="summary-emoji">✅</span>
                  <span className="summary-value">{habits.filter(h => !h.isArchived).length}</span>
                  <span className="summary-label">Aktif Alışkanlık</span>
                </div>
              </div>

              <div className="filter-row">
                <div className="filter-group">
                  <span className="filter-label">Zaman Aralığı</span>
                  <div className="filter-pills">
                    {[
                      { id: 'day', label: 'Gün' },
                      { id: 'week', label: 'Hafta' },
                      { id: 'month', label: 'Ay' },
                      { id: 'year', label: 'Yıl' }
                    ].map(range => (
                      <button 
                        key={range.id} 
                        className={`filter-pill ${timeRange === range.id ? 'active' : ''}`}
                        onClick={() => setTimeRange(range.id)}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-group">
                  <span className="filter-label">Alışkanlık Seçimi</span>
                  <div className="habit-select-wrapper">
                    <select 
                      className="habit-select"
                      value={selectedHabitId}
                      onChange={(e) => setSelectedHabitId(e.target.value)}
                    >
                      <option value="all">Tüm Alışkanlıklar</option>
                      {habits.filter(h => !h.isArchived && (habitType === 'all' || h.type === habitType)).map(h => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="habit-select-arrow" />
                  </div>
                </div>
              </div>

              <div className="charts-grid">
                <WeeklyChart 
                  data={trendData} 
                  metricType={currentMetric}
                  title={timeRange === 'day' ? 'Bugün' : timeRange === 'week' ? 'Haftalık Oran' : timeRange === 'month' ? 'Aylık Oran' : 'Yıllık Oran'} 
                />
                <TrendLine data={trendData} metricType={currentMetric} />
                <MonthlyHeatmap logs={logs} filteredHabits={filteredHabits} year={today.getFullYear()} month={today.getMonth() + 1} />
                <HabitTypeDonut logs={logs} filteredHabits={filteredHabits} />
                <TopHabitsBar data={topHabitsData} />
              </div>
            </div>
          ) : activeTab === 'calendar' ? (
            <div className="calendar-view-container animate-fade-in">
              <CalendarView />
            </div>
          ) : (
            <div className="settings-view-container animate-fade-in">
              <SettingsView />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
