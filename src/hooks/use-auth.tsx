
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  User 
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<any>;
  updateUserProfile: (displayName: string, photoFile: File) => Promise<void>;
  refreshUser: () => void;
  updateUserPhotoURL: (photoURL: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateUserProfile = async (displayName: string, photoFile: File) => {
    if (!auth.currentUser) throw new Error("Not authenticated");
    
    // Temporarily disable Firebase Storage uploads to avoid CORS issues
    // const storage = getStorage();
    // const photoRef = ref(storage, `profile_pictures/${auth.currentUser.uid}`);
    // await uploadBytes(photoRef, photoFile);
    // const photoURL = await getDownloadURL(photoRef);

    // Update profile with name only for now
    await updateProfile(auth.currentUser, { displayName });
    setUser(auth.currentUser); // Refresh user state
  };

  const signup = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      if (user) {
          try {
              // Set a default display name
              const name = email.split('@')[0];
              
              // Update profile with name only (no AI photo)
              await updateProfile(user, {
                  displayName: name,
              });
              
              // Create Firestore user document with PENDING verification status
              await setDoc(doc(db, 'users', user.uid), {
                  email: user.email,
                  displayName: name,
                  verificationStatus: 'PENDING',
                  photoVerified: false,
                  idVerified: false,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  hasPostedBefore: false
              });
              
              // Refresh the user state to include the new info
              setUser({ ...user });

          } catch (error) {
              console.error("Failed to set up initial user profile:", error);
              // Even if Firestore setup fails, we proceed with a user
              const name = email.split('@')[0];
              await updateProfile(user, { displayName: name });
              setUser({ ...user });
          }
      }
      
      return userCredential;
    } catch (error) {
      throw error;
    }
  };

  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  const refreshUser = () => {
    if (auth.currentUser) {
      // Force a refresh of the current user
      auth.currentUser.reload().then(() => {
        setUser(auth.currentUser);
      }).catch((error) => {
        console.error('Error refreshing user:', error);
      });
    }
  };

  const updateUserPhotoURL = (photoURL: string) => {
    console.log('🔍 updateUserPhotoURL called with:', photoURL);
    console.log('🔍 Current user before update:', user);
    
    if (user) {
      const updatedUser = { ...user, photoURL };
      console.log('🔍 Updated user object:', updatedUser);
      setUser(updatedUser);
      console.log('✅ User state updated with new photoURL');
    } else {
      console.log('❌ No user available to update');
    }
  };

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    updateUserProfile,
    refreshUser,
    updateUserPhotoURL,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

