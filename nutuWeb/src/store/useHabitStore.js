import { create } from 'zustand';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';

export const useHabitStore = create((set, get) => ({
  habits: [],
  logs: [],
  loading: false,
  selectedDate: format(new Date(), 'yyyy-MM-dd'),

  setSelectedDate: (date) => set({ selectedDate: date }),
  setHabits: (habits) => set({ habits }),
  setLogs: (logs) => set({ logs }),
  setLoading: (loading) => set({ loading }),

  fetchData: async (userId) => {
    if (!userId) return;
    set({ loading: true });
    try {
      // Fetch Habits
      const habitsQ = query(collection(db, 'habits'), where('userId', '==', userId));
      const habitsSnapshot = await getDocs(habitsQ);
      const habitsList = [];
      habitsSnapshot.forEach((doc) => {
        const data = doc.data();
        const type = data.type === 'check' ? 'done' : data.type === 'duration' ? 'time' : 'bad';
        habitsList.push({ id: doc.id, ...data, type });
      });

      // Fetch Logs
      const logsList = [];
      const collections = ['logs_done', 'logs_time', 'logs_bad'];
      
      for (const colName of collections) {
        const logsQ = query(collection(db, colName), where('UserId', '==', userId));
        const logsSnapshot = await getDocs(logsQ);
        logsSnapshot.forEach((doc) => {
          const data = doc.data();
          const log = {
            id: doc.id,
            habitId: data.HabitID,
            date: data.Today,
            userId: data.UserId,
            status: 'done',
            note: data.Note || data.note || '',
          };
          
          if (colName === 'logs_done') {
            const statusMap = { 'yaptım': 'done', 'Yapmadım': 'failed', 'mazeretliyim': 'excused' };
            log.status = statusMap[data.Status] || 'done';
          } else if (colName === 'logs_time') {
            log.elapsedMinutes = data.Duration || 0;
            log.status = 'done';
          } else if (colName === 'logs_bad') {
            log.status = data.Status === 'yaptım' ? 'failed' : 'done';
            log.usedMinutes = data.Duration || 0;
          }
          logsList.push(log);
        });
      }

      set({ habits: habitsList, logs: logsList, loading: false });
    } catch (error) {
      console.error("Error fetching data:", error);
      set({ loading: false });
    }
  }
}));
