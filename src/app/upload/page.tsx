"use client";

import { useEffect, useState } from "react";
import { auth } from "../utils/firebaseClient";
import { onAuthStateChanged, User } from "firebase/auth";
import VideoUploader from "../components/VideoUploader";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <p className="text-lg text-gray-400">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <h1 className="text-4xl font-bold mb-4 text-white">
        Upload video here
      </h1>
      {user ? (
        <>
          <p className="text-lg text-green-400">Signed in as {user.displayName}</p>
          <div>
            <VideoUploader userId={user.uid} />
          </div>
        </>
      ) : (
        <p className="text-lg text-red-400">Not signed in</p>
      )}
    </div>
  );
}
