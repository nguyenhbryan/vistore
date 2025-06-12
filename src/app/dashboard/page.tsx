'use client';
import { useEffect, useState } from 'react';
import { auth } from '../utils/firebaseClient'; // Adjust the import path as necessary
import { onAuthStateChanged, User } from 'firebase/auth';

export default function Dashboard() {
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
      <h1 className="text-4xl font-bold mb-4 text-white">Dashboard</h1>
      <p className="text-lg text-gray-400">This is the dashboard page.</p>
      <div className="mt-4">
        <a
          href="/upload"
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded shadow"
        >
          Go to upload page
        </a>
      </div>
        {user ? (
            <div className="mt-4 text-green-400">
            <p>Signed in as: {user.displayName}</p>
            </div>
        ) : (
            <div className="mt-4 text-red-400">
            <p>Not signed in</p>
            </div>
        )}
    </div>
  );
}