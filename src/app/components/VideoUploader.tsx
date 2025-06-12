'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../utils/firebaseClient';
import { nanoid } from 'nanoid';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../utils/firebaseClient';

export default function VideoUploader() {
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setSelectedFile(e.target.files[0]);
    setProgress(0);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
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
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        await setDoc(doc(db, 'videos', uniqueId), {
          id: uniqueId,
          url: downloadURL,
          name: selectedFile.name,
          uploadedAt: new Date().toISOString(),
        });
        setUploading(false);
        router.push(`/${uniqueId}`);
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
        className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded shadow transition-colors duration-200"
      >
        Choose Video
      </label>
      {selectedFile && (
        <>
          <span className="text-white text-sm">Selected: {selectedFile.name}</span>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="cursor-pointer bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded shadow transition-colors duration-200 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </>
      )}
      {progress > 0 && <p className="text-white">Upload Progress: {progress}%</p>}
    </div>
  );
}