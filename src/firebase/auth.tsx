import { auth, db } from '../firebase/FirebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  signInWithPopup,
  GoogleAuthProvider,
  UserCredential,
} from '../../node_modules/firebase/auth';
import { setDoc, doc } from 'firebase/firestore';

// Function for creating a user with email and password
export const doCreateUserWithEmailAndPassword = async (
  email: string,
  password: string,
  name: string,

): Promise<UserCredential> => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  // Add user to Firestore
  try {
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      name,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Error adding user to Firestore: ', error);
  }

  return credential;
};

// Function for signing in with email and password
export const doSignInWithEmailAndPassword = async (
  email: string,
  password: string,
): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Function for signing in with Google
export const doSignInWithGoogle = async (
  firstName: string,
  lastName: string,
  phone: string,
  address: string,
  gender: string,
  dob: Date,
  country: string,
): Promise<UserCredential> => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // Add user to Firestore
  try {
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      firstName,
      lastName,
      phone,
      address,
      gender,
      dob,
      country,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Error adding user to Firestore: ', error);
  }

  return result;
};

// Function for signing out
export const doSignOut = (): Promise<void> => {
  return auth.signOut();
};

// Function for password reset
export const doPasswordReset = (email: string): Promise<void> => {
  return sendPasswordResetEmail(auth, email);
};

// Function for changing password
export const doPasswordChange = (password: string): Promise<void> => {
  if (auth.currentUser) {
    return updatePassword(auth.currentUser, password);
  } else {
    throw new Error('No authenticated user found.');
  }
};

// Function for sending email verification
export const doSendEmailVerification = (): Promise<void> => {
  if (auth.currentUser) {
    return sendEmailVerification(auth.currentUser, {
      url: `${window.location.origin}/home`,
    });
  } else {
    throw new Error('No authenticated user found.');
  }
};

// Function for deleting user account
export const doDeleteAccount = async (): Promise<void> => {
  if (auth.currentUser) {
    try {
      await auth.currentUser.delete();
      // Optionally, delete the user document from Firestore here
    } catch (error) {
      console.error('Error deleting user account: ', error);
    }
  } else {
    throw new Error('No authenticated user found.');
  }
};
