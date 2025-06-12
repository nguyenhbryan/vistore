"use client";

import { auth, provider } from "@/app/utils/firebaseClient";
import { signInWithPopup, User } from "firebase/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setUser(user);
      console.log("Signed in:", user);
      redirect("/home");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="flex flex-col justify-center align-items-center p-4">
      <div>
      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        
        Sign in with Google
      </button>
      </div>
      <h1 className="text-2xl font-bold mt-4">Welcome to Video Uploader</h1>
      <Link href="/home" className="text-blue-500 hover:underline">
        Go to Upload Page
      </Link>

      {user && (
        <div className="mt-4">
          <p>Welcome, {user.displayName}</p>
        </div>
      )}
    </div>
  );
}
