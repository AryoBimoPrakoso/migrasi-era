import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCqiAH3I8UgpCM_uxEqG6W0b-Cok-19ny4",
  authDomain: "erabanyu-31482.firebaseapp.com",
  projectId: "erabanyu-31482",
  storageBucket: "erabanyu-31482.firebasestorage.app",
  messagingSenderId: "1008870200132",
  appId: "1:1008870200132:web:df39176e64e9ca5c973d11",
  measurementId: "G-Z9DQQ6H2X8"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };

export const uploadImage = async (file: File): Promise<string> => {
  const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};