"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation"; // For dynamic route parameters
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../utils/firebaseClient"; // Adjust the import path as necessary

export default function VideoPage() {
  const { id } = useParams<{ id: string }>(); // Get the dynamic route parameter
  const [videoURL, setVideoURL] = useState("");

  useEffect(() => {
    if (!id) {
      console.error("No id in params");
      return;
    }
    const fetchVideo = async () => {
      const docRef = doc(db, "videos", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setVideoURL(docSnap.data().url);
      } else {
        console.error("No such video!");
      }
    };

    fetchVideo();
  }, [id]);

  return (
    <div>
      <div className="flex justify-end p-4">
        <a
          href="/"
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded shadow"
        >
          Back to Home
        </a>
      </div>
      {videoURL ? (
        <div className="flex justify-center min-h-screen">
          <video controls src={videoURL} width="300" />
        </div>
      ) : (
        <p>Loading video...</p>
      )}
    </div>
  );
}