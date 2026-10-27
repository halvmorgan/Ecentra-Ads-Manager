import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as fbSignOut,
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test Firestore connection on boot per skill instructions
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'system', 'connection_test'));
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline or awaiting network configuration.');
    }
  }
}
testFirestoreConnection();

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export const ADMIN_EMAIL = 'halvmorgan@gmail.com';

/**
 * Sign in with Google (restricted to halvmorgan@gmail.com for admin)
 */
export async function signInAdminWithGoogle(): Promise<{ success: boolean; user: User | null; error?: string }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    if (user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      await fbSignOut(auth);
      return {
        success: false,
        user: null,
        error: `Access denied. Only ${ADMIN_EMAIL} is authorized to manage ads, budgets, and tokens.`,
      };
    }

    return { success: true, user };
  } catch (err: any) {
    return {
      success: false,
      user: null,
      error: err.message || 'Google sign-in failed',
    };
  }
}

/**
 * Sign out
 */
export async function logoutUser() {
  await fbSignOut(auth);
}

export const signOutAdmin = logoutUser;

/**
 * Auth state change listener
 */
export function onAuthStateChangedListener(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Get current ID token for backend Authorization headers
 */
export async function getCurrentIdToken(): Promise<string | null> {
  if (!auth.currentUser) return null;
  try {
    return await auth.currentUser.getIdToken();
  } catch {
    return null;
  }
}
