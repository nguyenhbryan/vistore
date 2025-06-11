// components/VideoUploader.js
'use client';

import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../utils/firebaseClient';

export default function VideoUploader() {
  const [progress, setProgress] = useState(0);
  const [videoURL, setVideoURL] = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const storageRef = ref(storage, `videos/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(prog);
      },
      (err) => console.error(err),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(setVideoURL);
      }
    );
  };

  return (
    <div>
      <input type="file" accept="video/*" onChange={handleUpload} />
      <p>Upload Progress: {progress}%</p>
      {videoURL && <video controls src={videoURL} width="400" />}
    </div>
  );
}
