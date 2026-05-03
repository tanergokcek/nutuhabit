// Notes service for Firestore
import { db } from '@/src/firebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';

export type NoteStatus = 'habit' | 'personal';

export interface FirebaseNote {
  id: string;
  userId: string;
  text: string;
  status: NoteStatus;
  date: string; // YYYY-MM-DD
  habitId?: string;
  habitName?: string;
  habitIcon?: string;
  createdAt: string;
}

/**
 * Firestore'a yeni not ekle
 */
export async function addNote(
  userId: string,
  data: {
    text: string;
    status: NoteStatus;
    date: string;
    habitId?: string;
    habitName?: string;
    habitIcon?: string;
  }
): Promise<FirebaseNote | null> {
  try {
    const payload: any = {
      userId,
      text: data.text,
      status: data.status,
      date: data.date,
      createdAt: serverTimestamp(),
    };

    if (data.habitId) payload.habitId = data.habitId;
    if (data.habitName) payload.habitName = data.habitName;
    if (data.habitIcon) payload.habitIcon = data.habitIcon;

    const docRef = await addDoc(collection(db, 'notes'), payload);

    return {
      id: docRef.id,
      userId,
      text: data.text,
      status: data.status,
      date: data.date,
      habitId: data.habitId,
      habitName: data.habitName,
      habitIcon: data.habitIcon,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error adding note:', error);
    return null;
  }
}

/**
 * Kullanıcının tüm notlarını çek
 */
export async function fetchNotes(userId: string): Promise<FirebaseNote[]> {
  try {
    const q = query(
      collection(db, 'notes'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const notes: FirebaseNote[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      notes.push({
        id: docSnap.id,
        userId: data.userId,
        text: data.text,
        status: data.status || 'personal',
        date: data.date,
        habitId: data.habitId || undefined,
        habitName: data.habitName || undefined,
        habitIcon: data.habitIcon || undefined,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      });
    });

    // Tarihe göre sırala (yeniden eskiye)
    return notes.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    console.error('Error fetching notes:', error);
    return [];
  }
}

/**
 * Not sil
 */
export async function deleteNote(noteId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'notes', noteId));
  } catch (error) {
    console.error('Error deleting note:', error);
  }
}

/**
 * Kullanıcının tüm notlarını sil
 */
export async function resetAllNotes(userId: string): Promise<void> {
  try {
    const q = query(
      collection(db, 'notes'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map((docSnap) =>
      deleteDoc(docSnap.ref)
    );
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error resetting all notes:', error);
  }
}
