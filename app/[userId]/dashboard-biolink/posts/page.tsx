import React from "react";

export default function PostsPage() {
  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Posts</h1>
        <p className="text-gray-600">Teile deine Gedanken und Geschichten mit deiner Community</p>
      </div>
      
      {/* Posts Content */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 flex flex-col gap-6 items-center">
        <div className="w-full flex flex-col items-center gap-2">
          <div className="w-full flex flex-col items-center gap-2 mb-4">
            <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-6 w-full flex flex-col items-center">
              <div className="text-2xl font-bold mb-2">Write your first post <span className='ml-2 text-xs bg-pink-100 text-pink-600 rounded px-2 py-0.5 align-middle font-bold'>New</span></div>
              <div className="text-gray-500 text-center mb-2">Share your thoughts, stories, and ideas with the audience visiting your Bio Link.</div>
              <button className="px-8 py-3 rounded-xl bg-blue-500 text-white font-bold text-lg shadow hover:scale-[1.04] transition-transform mt-2">Write a post</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 