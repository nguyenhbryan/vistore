import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../utils/firebaseClient';
import { nanoid } from 'nanoid';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../utils/firebaseClient';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function VideoUploader(props: { userId: string }) {
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const router = useRouter();

  // Track auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Generate thumbnail when a file is selected
  useEffect(() => {
    if (!selectedFile) {
      setThumbnail(null);
      return;
    }

    const video = document.createElement('video');
    video.src = URL.createObjectURL(selectedFile);
    video.crossOrigin = 'anonymous';
    video.muted = true;

    // Wait for metadata to load so we know duration and dimensions
    video.addEventListener('loadedmetadata', () => {
      // Seek to 0.1 seconds to avoid black frames at 0
      video.currentTime = 0.1;
    });

    // When seeking is complete, capture the frame
    video.addEventListener('seeked', () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setThumbnail(canvas.toDataURL('image/jpeg'));
      }
      URL.revokeObjectURL(video.src);
    });

    // Clean up
    return () => {
      URL.revokeObjectURL(video.src);
    };
  }, [selectedFile]);

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

    // Upload video
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

        // Upload thumbnail if available
        let thumbnailURL = '';
        if (thumbnail) {
          const thumbBlob = await (await fetch(thumbnail)).blob();
          const thumbRef = ref(storage, `thumbnails/${uniqueId}.jpg`);
          await uploadBytesResumable(thumbRef, thumbBlob);
          thumbnailURL = await getDownloadURL(thumbRef);
        }

        // Save video and thumbnail info to Firestore
        await setDoc(doc(db, 'videos', uniqueId), {
          id: uniqueId,
          url: downloadURL,
          name: selectedFile.name,
          uploadedAt: new Date().toISOString(),
          userId: user.uid,
          thumbnail: thumbnailURL,
        });
        setUploading(false);
        router.push(`/video/${uniqueId}`);
      }
    );
  };

  return (
    <div className="flex flex-col">
      <input
        id="file-upload"
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <label
        htmlFor="file-upload"
        className={`self-center cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded shadow transition-colors duration-200${!user || uploading ? ' opacity-50 pointer-events-none' : ''}`}
      >
        Choose Video
      </label>
      {selectedFile && (
        <>
          <span className="text-white text-sm">Selected: {selectedFile.name}</span>
          {thumbnail && (
            <img
              src={thumbnail}
              alt="Video thumbnail"
              className="my-2 w-48 h-32 object-cover rounded shadow"
            />
          )}
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