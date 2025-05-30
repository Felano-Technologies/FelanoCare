import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore'
import { app } from '../firebase'  

const auth = getAuth(app)
const db   = getFirestore(app)

const AuthContext = createContext()
const googleProvider = new GoogleAuthProvider()

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u)
        // ensure users/{uid} exists
        const userRef = doc(db, 'users', u.uid)
        const snap    = await getDoc(userRef)
        if (!snap.exists()) {
          await setDoc(userRef, {
            email:   u.email,
            created: new Date().toISOString()
          })
          setUserProfile({ email: u.email, created: new Date().toISOString() })
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

  const login  = (email, pw) => signInWithEmailAndPassword(auth, email, pw)
  const signup = (email, pw) => createUserWithEmailAndPassword(auth, email, pw)
  const googleSignIn = () => signInWithPopup(auth, googleProvider)
  const logout = ()           => signOut(auth)

  return (
    <AuthContext.Provider value={{    
        user,
        userProfile,
        setUserProfile, 
        loading, 
        login, 
        signup,
        googleSignIn, 
        logout }}>
      {loading ? <p>Loading…</p> : children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
