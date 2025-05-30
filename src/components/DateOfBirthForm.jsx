// src/components/DateOfBirthForm.jsx
import React, { useState } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { useHistory } from "react-router-dom"; // or your router

export default function DateOfBirthForm() {
  const [birthDate, setBirthDate] = useState("");
  const auth = getAuth();
  const db   = getFirestore();
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert("Must be signed in");

    const userRef = doc(db, "users", user.uid);

    try {
      await updateDoc(userRef, {
        birthDate // stored as "YYYY-MM-DD"
      });
      // redirect to dashboard or next step
      history.push("/dashboard");
    } catch (err) {
      console.error("Error saving birthDate:", err);
      alert("Could not save date of birth");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Date of Birth:
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
        />
      </label>
      <button type="submit">Continue</button>
    </form>
  );
}
