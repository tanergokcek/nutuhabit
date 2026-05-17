import { create } from 'zustand';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

export const useNoteStore = create((set, get) => ({
  notes: [],
  loading: false,

  fetchNotes: async (userId) => {
    if (!userId) return;
    set({ loading: true });
    try {
      const q = query(collection(db, 'notes'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const notesList = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        notesList.push({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        });
      });
      
      notesList.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
      
      set({ notes: notesList, loading: false });
    } catch (error) {
      console.error("Error fetching notes:", error);
      set({ loading: false });
    }
  },

  addNote: async (userId, data) => {
    try {
      const payload = {
        userId,
        ...data,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'notes'), payload);
      const newNote = {
        id: docRef.id,
        ...data,
        createdAt: new Date().toISOString()
      };
      set((state) => {
        const newNotes = [newNote, ...state.notes];
        newNotes.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
        return { notes: newNotes };
      });
    } catch (error) {
      console.error("Error adding note:", error);
    }
  },

  deleteNote: async (noteId) => {
    try {
      await deleteDoc(doc(db, 'notes', noteId));
      set((state) => ({ notes: state.notes.filter(n => n.id !== noteId) }));
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  }
}));
