"use client";

import { auth, provider } from "@/app/utils/firebaseClient";
import { signInWithPopup, onAuthStateChanged, User } from "firebase/auth";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen justify-center items-center p-4">
      {!user ? (
        <>
          <button
            onClick={handleLogin}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Sign in with Google
          </button>
          <h1 className="text-2xl font-bold mt-4">Welcome to Video Uploader</h1>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4">
            Welcome, {user.displayName || user.email}
          </h1>
          <div className="flex flex-col gap-2 items-center">
            <Link
              href="/upload"
              className="text-blue-500 hover:underline"
            >
              Go to Upload Page
            </Link>
            <Link
              href="/dashboard"
              className="text-blue-500 hover:underline"
            >
              Go to Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded mt-2"
            >
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
