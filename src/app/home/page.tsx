"use client";

import VideoUploader from "../components/VideoUploader";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <h1 className="text-4xl font-bold mb-4 text-white">
        Welcome to the Home Page
      </h1>
      <p className="text-lg text-gray-700">This is a simple home page.</p>
      <div>
        <VideoUploader/>
      </div>
    </div>
  );
}
