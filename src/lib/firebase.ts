import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const configs = import.meta.glob('../../firebase-applet-config.json', { eager: true });
const configModule = configs['../../firebase-applet-config.json'] as any;
const firebaseConfig = configModule ? configModule.default : {};

const isValidConfig = firebaseConfig && firebaseConfig.apiKey;

export const app = isValidConfig ? initializeApp(firebaseConfig) : null;
export const db = isValidConfig ? getFirestore(app, firebaseConfig.firestoreDatabaseId) : null;
export const auth = isValidConfig ? getAuth(app) : null;
if (auth) { setPersistence(auth, browserLocalPersistence).catch(console.error); }
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const loginWithGoogle = async () => {
  if (!auth) {
    alert("Авторизация недоступна.\nПриложение собрано в автономном режиме без подключения к облаку.");
    return null;
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Error signing in with Google", error);
    alert("Ошибка входа Google: " + (error.message || String(error)));
    throw error;
  }
};

export const logout = async () => {
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};
