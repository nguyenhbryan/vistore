"use client";
import React, { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "../utils/firebaseClient";
import Link from "next/link";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [dropdown, setDropdown] = useState<Boolean>(false);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);
  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 bg-gray-900 shadow">
      <div className="text-white font-bold text-xl">Vistore</div>
      <div>
        {user ? (
          <div className="flex flex-col">
            <button onClick={() => setDropdown(!dropdown)} className="text-white hover:underline">
              <span className="text-white">{user.displayName}</span>
              </button>
              {dropdown && (
                <div className="absolute bg-gray-900 right-0 mt-6 w-32 z-10">
                  <button
                  className="p-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                  onClick={async () => {
                    await auth.signOut();
                  }}
                  >
                  Sign out
                  </button>
                </div>
              )}
            
          </div>
        ) : (
          <span className="text-red-400">
            <Link href="/">Sign in</Link>
          </span>
        )}
      </div>
    </nav>
  );
}
