// components/VideoUploader.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import Next.js router
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../utils/firebaseClient';
import { nanoid } from 'nanoid'; // Import nanoid
import { getFirestore, doc, setDoc } from 'firebase/firestore'; // Import Firestore functions
import { db } from '../utils/firebaseClient'; // Adjust the import path as necessary

export default function VideoUploader() {
  const [progress, setProgress] = useState(0);
  const router = useRouter(); // Initialize the router

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const uniqueId = nanoid(8); // Generate a unique 8-character ID
    const storageRef = ref(storage, `videos/${uniqueId}-${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(prog);
      },
      (err) => console.error(err),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        // Save the unique ID and download URL to Firestore
        await setDoc(doc(db, 'videos', uniqueId), {
          id: uniqueId,
          url: downloadURL,
          name: file.name,
          uploadedAt: new Date().toISOString(),
        });

        // Redirect to the video page
        router.push(`/${uniqueId}`);
      }
    );
  };

  return (
    <div>
      <button className="bg-blue-500 text-white px-4 py-2 rounded">
      <input type="file" accept="video/*" onChange={handleUpload} />
      </button>
      <p>Upload Progress: {progress}%</p>
    </div>
  );
}
