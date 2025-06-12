'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../utils/firebaseClient';
import { nanoid } from 'nanoid';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../utils/firebaseClient';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function VideoUploader() {
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Track auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setSelectedFile(e.target.files[0]);
    setProgress(0);
    setError(null);
  };

  const handleUpload = async () => {
    if (!user) {
      setError('You must be signed in to upload a video.');
      return;
    }
    if (!selectedFile) return;
    setUploading(true);
    setError(null);
    const uniqueId = nanoid(8);
    const storageRef = ref(storage, `videos/${uniqueId}-${selectedFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(prog);
      },
      (err) => {
        console.error(err);
        setUploading(false);
        setError('Upload failed. Please try again.');
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        await setDoc(doc(db, 'videos', uniqueId), {
          id: uniqueId,
          url: downloadURL,
          name: selectedFile.name,
          uploadedAt: new Date().toISOString(),
          userId: user.uid,
        });
        setUploading(false);
        router.push(`video/${uniqueId}`);
      }
    );
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <input
        id="file-upload"
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <label
        htmlFor="file-upload"
        className={`cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded shadow transition-colors duration-200${!user || uploading ? ' opacity-50 pointer-events-none' : ''}`}
      >
        Choose Video
      </label>
      {selectedFile && (
        <>
          <span className="text-white text-sm">Selected: {selectedFile.name}</span>
          <button
            onClick={handleUpload}
            disabled={uploading || !user}
            className={`cursor-pointer bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded shadow transition-colors duration-200 disabled:opacity-50 ${!user || uploading ? ' opacity-50 pointer-events-none' : ''}`}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </>
      )}
      {progress > 0 && <p className="text-white">Upload Progress: {progress}%</p>}
      {error && <p className="text-red-400">{error}</p>}
      {!user && <p className="text-red-400">You must be signed in to upload.</p>}
    </div>
  );
}