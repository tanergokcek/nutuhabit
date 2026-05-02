import { create } from 'zustand';
import {
  addTodoToFirebase,
  fetchTodos,
  updateTodoInFirebase,
  toggleTodoInFirebase,
  deleteTodoFromFirebase,
  clearCompletedFromFirebase,
} from '@/src/services/todos';

export type TodoPriority = 'high' | 'normal' | 'low';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: TodoPriority;
  createdAt: string; // ISO
  completedAt?: string;
}

interface TodoState {
  todos: Todo[];
  isLoading: boolean;
  loadTodos: (userId: string) => Promise<void>;
  addTodo: (userId: string, text: string, priority?: TodoPriority) => Promise<void>;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  updateTodo: (id: string, text: string, priority: TodoPriority) => void;
  clearCompleted: (userId: string) => void;
  resetTodos: () => void;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  isLoading: false,

  loadTodos: async (userId: string) => {
    set({ isLoading: true });
    try {
      const todos = await fetchTodos(userId);
      set({
        todos: todos.map((t) => ({
          id: t.id,
          text: t.text,
          completed: t.completed,
          priority: t.priority,
          createdAt: t.createdAt,
          completedAt: t.completedAt,
        })),
      });
    } catch (error) {
      console.error('Error loading todos:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addTodo: async (userId: string, text: string, priority: TodoPriority = 'normal') => {
    const result = await addTodoToFirebase(userId, { text, priority });
    if (result) {
      set((state) => ({
        todos: [
          {
            id: result.id,
            text: result.text,
            completed: false,
            priority: result.priority,
            createdAt: result.createdAt,
          },
          ...state.todos,
        ],
      }));
    }
  },

  toggleTodo: (id: string) => {
    const todo = get().todos.find((t) => t.id === id);
    if (!todo) return;
    const newCompleted = !todo.completed;

    // Optimistic update
    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: newCompleted,
              completedAt: newCompleted ? new Date().toISOString() : undefined,
            }
          : t
      ),
    }));

    // Firebase'e kaydet
    toggleTodoInFirebase(id, newCompleted);
  },

  deleteTodo: (id: string) => {
    // Optimistic update
    set((state) => ({
      todos: state.todos.filter((t) => t.id !== id),
    }));

    // Firebase'den sil
    deleteTodoFromFirebase(id);
  },

  updateTodo: (id: string, text: string, priority: TodoPriority) => {
    // Optimistic update
    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === id ? { ...t, text, priority } : t
      ),
    }));

    // Firebase'e kaydet
    updateTodoInFirebase(id, { text, priority });
  },

  clearCompleted: (userId: string) => {
    // Optimistic update
    set((state) => ({
      todos: state.todos.filter((t) => !t.completed),
    }));

    // Firebase'den sil
    clearCompletedFromFirebase(userId);
  },

  resetTodos: () => set({ todos: [], isLoading: false }),
}));
