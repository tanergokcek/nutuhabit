// Habits service for Firestore implementation
import { db } from '@/src/firebaseConfig';
import { Habit, HabitLog, HabitType, LogStatus } from '@/src/types/habit';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';

export async function fetchHabits(userId: string): Promise<Habit[]> {
  try {
    const q = query(
      collection(db, 'habits'), 
      where('userId', '==', userId)
      // orderBy kaldırıldı - index hatasını önlemek için
    );
    const querySnapshot = await getDocs(q);
    const habits: Habit[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const type = data.type === 'check' ? 'done' : data.type === 'duration' ? 'time' : 'bad';
      const habit: any = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        type
      };

      // Bad habit defaults
      if (type === 'bad') {
        habit.limitType = data.limitType || 'count';
        habit.limitCount = data.limitCount !== undefined ? data.limitCount : 1;
        habit.limitMinutes = data.limitMinutes !== undefined ? data.limitMinutes : 60;
        habit.limitPeriod = data.limitPeriod || 'daily';
      }

      // Reminder data
      habit.reminderEnabled = data.reminderEnabled || false;
      habit.reminderTime = data.reminderTime || '08:00';

      habits.push(habit as Habit);
    });

    // Bellekte sıralama (descending)
    return habits.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    console.error("Error fetching habits:", error);
    return [];
  }
}

export async function createHabit(habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Habit | null> {
  try {
    const docRef = await addDoc(collection(db, 'habits'), {
      ...habit,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return {
      id: docRef.id,
      ...habit,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Habit;
  } catch (error) {
    console.error("Error creating habit:", error);
    return null;
  }
}

export async function createHabitWithId(
  habitId: string,
  habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Habit | null> {
  try {
    const habitRef = doc(db, 'habits', habitId);
    await setDoc(habitRef, {
      ...habit,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return {
      id: habitId,
      ...habit,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Habit;
  } catch (error) {
    console.error("Error creating habit with id:", error);
    return null;
  }
}

export async function updateHabitService(
  habitId: string,
  updates: Partial<Habit>
): Promise<void> {
  try {
    const habitRef = doc(db, 'habits', habitId);
    await updateDoc(habitRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating habit:", error);
  }
}

export async function deleteHabitService(habitId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'habits', habitId));
  } catch (error) {
    console.error("Error deleting habit:", error);
  }
}

export async function resetUserData(userId: string) {
  try {
    // 1. Delete habits
    const habitsQ = query(collection(db, 'habits'), where('userId', '==', userId));
    const habitsSnapshot = await getDocs(habitsQ);
    const deleteHabitPromises = habitsSnapshot.docs.map(d => deleteDoc(d.ref));
    
    // 2. Delete logs from all 3 collections
    const collections = ['logs_done', 'logs_time', 'logs_bad'];
    const deleteLogPromises: Promise<void>[] = [];
    
    for (const col of collections) {
      const q = query(collection(db, col), where('UserId', '==', userId));
      const snapshot = await getDocs(q);
      snapshot.docs.forEach(d => deleteLogPromises.push(deleteDoc(d.ref)));
    }
    
    await Promise.all([...deleteHabitPromises, ...deleteLogPromises]);
    return true;
  } catch (error) {
    console.error("Error resetting user data:", error);
    return false;
  }
}

export async function fetchLogs(
  userId: string,
  startDate: string,
  endDate: string
): Promise<HabitLog[]> {
  try {
    const collections = ['logs_done', 'logs_time', 'logs_bad'];
    const allLogs: HabitLog[] = [];

    for (const colName of collections) {
      const q = query(
        collection(db, colName),
        where('UserId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const logDate = data.Today;

        if (logDate >= startDate && logDate <= endDate) {
          // Map back to HabitLog interface
          const log: HabitLog = {
            id: doc.id,
            habitId: data.HabitID,
            date: data.Today,
            userId: data.UserId,
            status: 'done', // default
            note: data.Note || data.note || undefined,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          } as any;

          if (colName === 'logs_done') {
            const statusMap: Record<string, LogStatus> = {
              'yaptım': 'done',
              'Yapmadım': 'failed',
              'mazeretliyim': 'excused'
            };
            log.status = statusMap[data.Status] || 'done';
          } else if (colName === 'logs_time') {
            log.elapsedMinutes = data.Duration;
            log.status = 'done';
            if (data.Entries) {
              log.entries = data.Entries;
            } else if (data.HabitID === 'habit-sleep') {
              // Eskiden kaydedilen uyku verileri için sanal bir entry oluştur
              let readableNote = data.Note || data.note;
              try {
                const parsed = JSON.parse(readableNote);
                if (parsed.bedH !== undefined) {
                  readableNote = `${String(parsed.bedH).padStart(2, '0')}:${String(parsed.bedM).padStart(2, '0')} - ${String(parsed.wakeH).padStart(2, '0')}:${String(parsed.wakeM).padStart(2, '0')}`;
                }
              } catch (e) { /* JSON değilse olduğu gibi bırak */ }

              log.entries = [{
                id: `v-${doc.id}`,
                minutes: data.Duration || 0,
                createdAt: log.createdAt,
                note: readableNote
              }];
            }
          } else if (colName === 'logs_bad') {
            log.status = data.Status === 'yaptım' ? 'failed' : 'done';
            if (data.Duration !== undefined) log.usedMinutes = data.Duration;
            if (data.usedCount !== undefined) log.usedCount = data.usedCount;
            if (data.Entries) log.entries = data.Entries;
          }

          allLogs.push(log);
        }
      });
    }

    return allLogs;
  } catch (error) {
    console.error("Error fetching logs:", error);
    return [];
  }
}

export async function upsertLog(
  userId: string,
  log: Omit<HabitLog, 'id' | 'createdAt' | 'updatedAt'>,
  habitType: HabitType
): Promise<HabitLog | null> {
  try {
    let collectionName = 'logs_done';
    const data: any = {
      Today: log.date,
      HabitID: log.habitId,
      UserId: userId,
    };

    if (log.note !== undefined) {
      data.Note = log.note;
    }

    if (log.entries !== undefined) {
      data.Entries = log.entries;
    }

    if (habitType === 'time') {
      collectionName = 'logs_time';
      data.Duration = log.elapsedMinutes || 0;
    } else if (habitType === 'bad') {
      collectionName = 'logs_bad';
      data.Status = log.status === 'failed' ? 'yaptım' : 'yapmadım';
      if ((log as any).usedMinutes !== undefined) {
        data.Duration = (log as any).usedMinutes;
      }
      if ((log as any).usedCount !== undefined) {
        data.usedCount = (log as any).usedCount;
      }
    } else {
      collectionName = 'logs_done';
      const statusMap: Record<LogStatus, string> = {
        'done': 'yaptım',
        'failed': 'Yapmadım',
        'excused': 'mazeretliyim',
        'skipped': 'Yapmadım'
      };
      data.Status = statusMap[log.status] || 'yaptım';
    }

    // Check if log already exists
    const q = query(
      collection(db, collectionName),
      where('UserId', '==', userId),
      where('HabitID', '==', log.habitId),
      where('Today', '==', log.date)
    );
    const querySnapshot = await getDocs(q);
    
    let logId = "";
    const now = serverTimestamp();
    
    // Remove undefined values from data
    Object.keys(data).forEach(key => {
      if (data[key] === undefined) delete data[key];
    });

    // Sanitize Entries array if it exists
    if (data.Entries && Array.isArray(data.Entries)) {
      data.Entries = data.Entries.map((entry: any) => {
        const sanitized = { ...entry };
        Object.keys(sanitized).forEach(k => {
          if (sanitized[k] === undefined) delete sanitized[k];
        });
        return sanitized;
      });
    }

    if (!querySnapshot.empty) {
      logId = querySnapshot.docs[0].id;
      const logRef = doc(db, collectionName, logId);
      await updateDoc(logRef, {
        ...data,
        updatedAt: now,
      });
    } else {
      const logRef = doc(collection(db, collectionName));
      logId = logRef.id;
      await setDoc(logRef, {
        ...data,
        createdAt: now,
        updatedAt: now,
      });
    }

    return {
      id: logId,
      ...log,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as HabitLog;
  } catch (error) {
    console.error("Error upserting log:", error);
    return null;
  }
}
