import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Auth Functions
export const loginAnonymously = async () => {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error('Error signing in anonymously:', error);
    throw error;
  }
};

export const loginWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Error signing in with email:', error);
    throw error;
  }
};

export const registerWithEmail = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Error registering:', error);
    throw error;
  }
};

// Firestore Functions
export const addPlant = async (userId, plantData) => {
  try {
    const plantsRef = collection(db, `users/${userId}/plants`);
    const docRef = await addDoc(plantsRef, {
      ...plantData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding plant:', error);
    throw error;
  }
};

export const getPlants = async (userId) => {
  try {
    const plantsRef = collection(db, `users/${userId}/plants`);
    const q = query(plantsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting plants:', error);
    throw error;
  }
};

export const updatePlant = async (userId, plantId, updates) => {
  try {
    const plantRef = doc(db, `users/${userId}/plants`, plantId);
    await updateDoc(plantRef, updates);
  } catch (error) {
    console.error('Error updating plant:', error);
    throw error;
  }
};

export const removePlant = async (userId, plantId) => {
  try {
    const plantRef = doc(db, `users/${userId}/plants`, plantId);
    await deleteDoc(plantRef);
  } catch (error) {
    console.error('Error deleting plant:', error);
    throw error;
  }
};

// Storage Functions
export const uploadPlantImage = async (file, userId) => {
  try {
    const storageRef = ref(storage, `plants/${userId}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
