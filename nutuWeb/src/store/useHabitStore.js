import { create } from 'zustand';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
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

  updateHabit: async (habitId, updates) => {
    try {
      await updateDoc(doc(db, 'habits', habitId), updates);
      set((state) => ({
        habits: state.habits.map((h) => (h.id === habitId ? { ...h, ...updates } : h)),
      }));
    } catch (error) {
      console.error('Error updating habit:', error);
    }
  },

  deleteLog: async (logId, type, entryIndex = undefined) => {
    try {
      let colName = 'logs_done';
      if (type === 'time') colName = 'logs_time';
      else if (type === 'bad') colName = 'logs_bad';

      const state = get();
      const log = state.logs.find(l => l.id === logId);

      if (log && log.entries && log.entries.length > 1 && entryIndex !== undefined) {
        // Remove only this entry
        const deletedMinutes = log.entries[entryIndex]?.minutes || 0;
        const newEntries = log.entries.filter((_, idx) => idx !== entryIndex);
        
        const currentDuration = type === 'time' ? (log.elapsedMinutes || 0) : (log.usedMinutes || 0);
        const newDuration = Math.max(0, currentDuration - deletedMinutes);
        
        await updateDoc(doc(db, colName, logId), { entries: newEntries, Duration: newDuration });
        
        set((state) => ({
          logs: state.logs.map((l) => {
            if (l.id === logId) {
              const updated = { ...l, entries: newEntries };
              if (type === 'time') updated.elapsedMinutes = newDuration;
              else if (type === 'bad') updated.usedMinutes = newDuration;
              return updated;
            }
            return l;
          }),
        }));
      } else {
        // Delete entire document
        await deleteDoc(doc(db, colName, logId));
        set((state) => ({
          logs: state.logs.filter((l) => l.id !== logId),
        }));
      }
    } catch (error) {
      console.error('Error deleting log:', error);
    }
  },

  updateLog: async (logId, type, updates, entryIndex = undefined) => {
    try {
      let colName = 'logs_done';
      if (type === 'time') colName = 'logs_time';
      else if (type === 'bad') colName = 'logs_bad';

      const firebaseUpdates = {};
      let diff = 0;
      
      if (type === 'done' && updates.status) {
        const reverseStatusMap = { 'done': 'yaptım', 'failed': 'Yapmadım', 'excused': 'mazeretliyim' };
        firebaseUpdates.Status = reverseStatusMap[updates.status] || 'yaptım';
      } else if ((type === 'time' || type === 'bad') && updates.elapsedMinutes !== undefined) {
        const state = get();
        const log = state.logs.find(l => l.id === logId);
        if (log && log.entries && entryIndex !== undefined) {
          const oldMinutes = log.entries[entryIndex]?.minutes || 0;
          diff = updates.elapsedMinutes - oldMinutes;
          const newEntries = [...log.entries];
          newEntries[entryIndex] = { ...newEntries[entryIndex], minutes: updates.elapsedMinutes };
          firebaseUpdates.entries = newEntries;
          
          const currentDuration = type === 'time' ? (log.elapsedMinutes || 0) : (log.usedMinutes || 0);
          firebaseUpdates.Duration = Math.max(0, currentDuration + diff);
        } else {
          firebaseUpdates.Duration = updates.elapsedMinutes;
          if (type === 'bad' && updates.status) {
            firebaseUpdates.Status = updates.status === 'failed' ? 'yaptım' : 'Yapmadım';
          }
        }
      } else if (type === 'bad' && updates.status) {
        firebaseUpdates.Status = updates.status === 'failed' ? 'yaptım' : 'Yapmadım';
      }

      await updateDoc(doc(db, colName, logId), firebaseUpdates);
      
      set((state) => ({
        logs: state.logs.map((l) => {
          if (l.id === logId) {
            const updatedLog = { ...l, ...updates };
            if (firebaseUpdates.entries) updatedLog.entries = firebaseUpdates.entries;
            if (firebaseUpdates.Duration !== undefined) {
              if (type === 'time') updatedLog.elapsedMinutes = firebaseUpdates.Duration;
              else if (type === 'bad') updatedLog.usedMinutes = firebaseUpdates.Duration;
            }
            return updatedLog;
          }
          return l;
        }),
      }));
    } catch (error) {
      console.error('Error updating log:', error);
    }
  },

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
        let type = data.type;
        if (type === 'check') type = 'done';
        else if (type === 'duration') type = 'time';
        else if (!['done', 'time', 'bad'].includes(type)) type = 'bad';
        
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
            entries: data.entries || [],
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
