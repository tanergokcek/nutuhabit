import { create } from 'zustand';

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
  addTodo: (text: string, priority?: TodoPriority) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  updateTodo: (id: string, text: string, priority: TodoPriority) => void;
  clearCompleted: () => void;
  resetTodos: () => void;
}

export const useTodoStore = create<TodoState>((set) => ({
  todos: [],

  addTodo: (text, priority = 'normal') => {
    // Firebase implementation will go here
  },

  toggleTodo: (id) => {
    // Firebase implementation will go here
  },

  deleteTodo: (id) => {
    // Firebase implementation will go here
  },

  updateTodo: (id, text, priority) => {
    // Firebase implementation will go here
  },

  clearCompleted: () => {
    // Firebase implementation will go here
  },

  resetTodos: () => set({ todos: [] }),
}));
