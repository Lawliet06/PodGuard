import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { getAuth, Auth } from '../../node_modules/firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyB3eOwtrr6qrhXQKcuStqI3aGvNZOKtxIE',
  authDomain: 'podguard-c5206.firebaseapp.com',
  projectId: 'podguard-c5206',
  storageBucket: 'podguard-c5206.appspot.com',
  messagingSenderId: '50466924666',
  appId: '1:50466924666:web:1405f204eb8bf42e9733c3',
  measurementId: 'G-4P8DCN3QC9',
};

// Initialize Firebase app
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth: Auth = getAuth(app);
const analytics: Analytics = getAnalytics(app);
const db: Firestore = getFirestore(app);

export { app, auth, analytics, db };
