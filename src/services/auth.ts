// Auth service for Firebase implementation
import { auth } from '@/src/firebaseConfig';
import { 
  updateProfile, 
  updateEmail, 
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User as FirebaseUser
} from 'firebase/auth';
import { User } from '@/src/types/user';

export interface AuthResult {
  user: User | null;
  error: string | null;
}

export async function signInWithGoogle(): Promise<AuthResult> {
  // TODO: Implement with Firebase Auth + expo-auth-session
  return { user: null, error: 'Not implemented yet' };
}

export async function signInWithApple(): Promise<AuthResult> {
  // TODO: Implement with Firebase Auth + expo-apple-authentication
  return { user: null, error: 'Not implemented yet' };
}

export async function signOutUser(): Promise<void> {
  await auth.signOut();
}

export async function getCurrentUser(): Promise<User | null> {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return null;
  
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || '',
    photoURL: firebaseUser.photoURL || null,
    isPremium: false, // Default
    createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
    settings: {
      theme: 'system',
      notificationsEnabled: true,
      reminderTime: '09:00',
      weekStartsOn: 1,
      language: 'tr',
    },
  };
}

export async function deleteAccount(): Promise<void> {
  const user = auth.currentUser;
  if (user) {
    await user.delete();
  }
}

export async function updateUserProfile(displayName: string): Promise<void> {
  const user = auth.currentUser;
  if (user) {
    await updateProfile(user, { displayName });
  } else {
    throw new Error('User not logged in');
  }
}

export async function updateUserEmail(email: string): Promise<void> {
  const user = auth.currentUser;
  if (user) {
    await updateEmail(user, email);
  } else {
    throw new Error('User not logged in');
  }
}

export async function updateUserPassword(password: string): Promise<void> {
  const user = auth.currentUser;
  if (user) {
    await updatePassword(user, password);
  } else {
    throw new Error('User not logged in');
  }
}
