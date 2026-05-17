import { create } from 'zustand';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

export const useTodoStore = create((set, get) => ({
  todos: [],
  loading: false,

  fetchTodos: async (userId) => {
    if (!userId) return;
    set({ loading: true });
    try {
      const q = query(collection(db, 'todos'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const todosList = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        todosList.push({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        });
      });
      
      todosList.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return b.createdAt.localeCompare(a.createdAt);
      });
      
      set({ todos: todosList, loading: false });
    } catch (error) {
      console.error("Error fetching todos:", error);
      set({ loading: false });
    }
  },

  addTodo: async (userId, text, priority = 'normal') => {
    try {
      const payload = {
        userId,
        text,
        priority,
        completed: false,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'todos'), payload);
      const newTodo = {
        id: docRef.id,
        ...payload,
        createdAt: new Date().toISOString()
      };
      set((state) => ({ todos: [newTodo, ...state.todos].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return b.createdAt.localeCompare(a.createdAt);
      })}));
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  },

  toggleTodo: async (todoId, completed) => {
    try {
      const updates = { completed };
      if (completed) updates.completedAt = serverTimestamp();
      else updates.completedAt = null;
      
      await updateDoc(doc(db, 'todos', todoId), updates);
      
      set((state) => {
        const newTodos = state.todos.map(t => t.id === todoId ? { ...t, completed } : t);
        newTodos.sort((a, b) => {
          if (a.completed !== b.completed) return a.completed ? 1 : -1;
          return b.createdAt.localeCompare(a.createdAt);
        });
        return { todos: newTodos };
      });
    } catch (error) {
      console.error("Error toggling todo:", error);
    }
  },

  deleteTodo: async (todoId) => {
    try {
      await deleteDoc(doc(db, 'todos', todoId));
      set((state) => ({ todos: state.todos.filter(t => t.id !== todoId) }));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  }
}));
