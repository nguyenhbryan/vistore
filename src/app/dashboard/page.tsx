'use client';
import { useEffect, useState } from 'react';
import { auth, db } from '../utils/firebaseClient';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import VideoUploader from '../components/VideoUploader';
import Link from 'next/link';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<{ id: string; name: string; url: string }[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      if (!user) {
        setVideos([]);
        return;
      }
      setVideosLoading(true);
      const q = query(collection(db, 'videos'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const vids = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        url: doc.data().url,
      }));
      setVideos(vids);
      setVideosLoading(false);
    };
    fetchVideos();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <p className="text-lg text-gray-400">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full p-4 border border-gray-800 mx-auto my-12 max-w-7xl h-full max-h-7xl">
          <VideoUploader userId={user?.uid || ''} />
        </div>
        <div className="w-full p-4 border border-gray-800 mx-auto my-4 max-w-7xl h-full max-h-7xl">
          <h1 className="text-white mt-4 mb-2">Your videos:</h1>
          {videosLoading ? (
            <p className="text-gray-400">Loading your videos...</p>
          ) : videos.length === 0 ? (
            <p className="text-gray-400">No videos uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {videos.map((video) => (
                <Link
                  key={video.id}
                  href={`/video/${video.id}`}
                  className="bg-gray-900 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200 flex flex-col"
                >
                  <video
                    src={video.url}
                    className="w-full h-48 object-cover bg-black"
                    controls={false}
                    muted
                    preload="metadata"
                    poster="" // You can set a static poster if you have one
                  />
                  <div className="p-4 flex-1 flex flex-col">
                    <h2 className="text-white text-lg font-semibold mb-2 truncate">{video.name}</h2>
                    <span className="text-gray-400 text-xs break-all">{video.id}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}