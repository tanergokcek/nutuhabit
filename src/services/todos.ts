// Todos service for Firestore
import { db } from '@/src/firebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

export type TodoPriority = 'high' | 'normal' | 'low';

export interface FirebaseTodo {
  id: string;
  userId: string;
  text: string;
  completed: boolean;
  priority: TodoPriority;
  createdAt: string; // ISO
  completedAt?: string;
}

/**
 * Firestore'a yeni todo ekle
 */
export async function addTodoToFirebase(
  userId: string,
  data: { text: string; priority: TodoPriority }
): Promise<FirebaseTodo | null> {
  try {
    const payload: any = {
      userId,
      text: data.text,
      priority: data.priority,
      completed: false,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'todos'), payload);

    return {
      id: docRef.id,
      userId,
      text: data.text,
      priority: data.priority,
      completed: false,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error adding todo:', error);
    return null;
  }
}

/**
 * Kullanıcının tüm todolarını çek
 */
export async function fetchTodos(userId: string): Promise<FirebaseTodo[]> {
  try {
    const q = query(
      collection(db, 'todos'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const todos: FirebaseTodo[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      todos.push({
        id: docSnap.id,
        userId: data.userId,
        text: data.text,
        completed: data.completed ?? false,
        priority: data.priority || 'normal',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        completedAt: data.completedAt?.toDate?.()?.toISOString() || undefined,
      });
    });

    // Tamamlanmayanlar önce, sonra tarihe göre yeniden eskiye
    return todos.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return b.createdAt.localeCompare(a.createdAt);
    });
  } catch (error) {
    console.error('Error fetching todos:', error);
    return [];
  }
}

/**
 * Todo güncelle (metin + öncelik)
 */
export async function updateTodoInFirebase(
  todoId: string,
  data: { text: string; priority: TodoPriority }
): Promise<void> {
  try {
    await updateDoc(doc(db, 'todos', todoId), {
      text: data.text,
      priority: data.priority,
    });
  } catch (error) {
    console.error('Error updating todo:', error);
  }
}

/**
 * Todo tamamlama durumunu değiştir
 */
export async function toggleTodoInFirebase(
  todoId: string,
  completed: boolean
): Promise<void> {
  try {
    const updates: any = { completed };
    if (completed) {
      updates.completedAt = serverTimestamp();
    } else {
      updates.completedAt = null;
    }
    await updateDoc(doc(db, 'todos', todoId), updates);
  } catch (error) {
    console.error('Error toggling todo:', error);
  }
}

/**
 * Todo sil
 */
export async function deleteTodoFromFirebase(todoId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'todos', todoId));
  } catch (error) {
    console.error('Error deleting todo:', error);
  }
}

/**
 * Tamamlanmış tüm todoları sil
 */
export async function clearCompletedFromFirebase(userId: string): Promise<void> {
  try {
    const q = query(
      collection(db, 'todos'),
      where('userId', '==', userId),
      where('completed', '==', true)
    );
    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map((docSnap) =>
      deleteDoc(doc(db, 'todos', docSnap.id))
    );
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error clearing completed todos:', error);
  }
}
