// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore'
import { app } from '../firebase'  

// Initialize Firebase Auth and Firestore
const auth = getAuth(app)
const db   = getFirestore(app)
const googleProvider = new GoogleAuthProvider()

// Create a context for authentication
const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)            // Firebase Auth user object
  const [userProfile, setUserProfile] = useState(null) // Firestore “users/{uid}” document data
  const [loading, setLoading] = useState(true)

  // Listen for auth state changes & load Firestore profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)

        // Fetch the Firestore profile for this UID
        const userRef = doc(db, 'users', firebaseUser.uid)
        const snap    = await getDoc(userRef)

        if (!snap.exists()) {
          // If no profile exists, create a minimal one (default to patient role)
          // You can also prompt your UI to ask for more details if you prefer
          const fallbackProfile = {
            email:   firebaseUser.email || '',
            role:    'patient',                // default new users to "patient"
            name:    firebaseUser.displayName || '',
            created: new Date().toISOString()
          }
          await setDoc(userRef, fallbackProfile)
          setUserProfile(fallbackProfile)
        } else {
          setUserProfile(snap.data())
        }
      } else {
        setUser(null)
        setUserProfile(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  // -------------------------------
  // ROLE‐BASED SIGNUP FUNCTIONS
  // -------------------------------

  /**
   * Sign up as a Patient.
   * Call this from your “Patient Signup” form, passing name, email, password, birthDate.
   * Persists to Firestore under 'users/{uid}' with role="patient".
   */
  const signupPatient = async (name, email, password, birthDate) => {
    // 1) Create the Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const newUser = userCredential.user

    // 2) Update the Auth displayName
    await updateProfile(newUser, { displayName: name })

    // 3) Create Firestore profile with role="patient"
    const userRef = doc(db, 'users', newUser.uid)
    const profileData = {
      name,
      email,
      birthDate,            // e.g. "1990-05-23"
      role: 'patient',
      created: new Date().toISOString()
    }
    await setDoc(userRef, profileData)

    // 4) Update the local state so components can immediately see the new profile
    setUserProfile(profileData)
    return newUser
  }

  /**
   * Sign up as a Health Professional (Doctor/Admin).
   * Call this from your “Professional Signup” form, passing name, email, password.
   * Persists to Firestore under 'users/{uid}' with role="professional".
   */
  const signupProfessional = async (name, email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const newUser = userCredential.user

    // Update the Auth displayName
    await updateProfile(newUser, { displayName: name })

    // Create Firestore profile with role="professional"
    const userRef = doc(db, 'users', newUser.uid)
    const profileData = {
      name,
      email,
      role: 'professional',
      created: new Date().toISOString()
    }
    await setDoc(userRef, profileData)

    // Immediately update local state
    setUserProfile(profileData)
    return newUser
  }

  // -------------------------------
  // SIGNIN / LOGOUT FUNCTIONS
  // -------------------------------

  /**
   * Sign in a user (patient or professional) with email/password.
   */
  const login = (email, pw) => {
    return signInWithEmailAndPassword(auth, email, pw)
  }

  /**
   * Sign in via Google and ensure Firestore profile exists.
   * By default, we assign role="patient" for Google‐signed users. You can detect
   * admins/professionals by checking email domains or by manually editing Firestore later.
   */
  const googleSignIn = async () => {
    const credential = await signInWithPopup(auth, googleProvider)
    const firebaseUser = credential.user

    // After Google auth, check Firestore for existing profile
    const userRef = doc(db, 'users', firebaseUser.uid)
    const snap = await getDoc(userRef)

    if (!snap.exists()) {
      // If no profile exists, auto-create with default role="patient"
      const profileData = {
        name:    firebaseUser.displayName,
        email:   firebaseUser.email,
        role:    'patient',
        created: new Date().toISOString()
      }
      await setDoc(userRef, profileData)
      setUserProfile(profileData)
    } else {
      setUserProfile(snap.data())
    }

    return firebaseUser
  }

  /**
   * Log out the current user.
   */
  const logout = () => {
    return signOut(auth)
  }

  // Provider value: expose user, userProfile (including .role), loading, and all auth methods
  const value = {
    user,
    userProfile,
    loading,
    login,
    signupPatient,
    signupProfessional,
    googleSignIn,
    logout,
    setUserProfile   // Exposed in case you want to update profile elsewhere
  }

  return (
    <AuthContext.Provider value={value}>
      {loading ? <p>Loading…</p> : children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
