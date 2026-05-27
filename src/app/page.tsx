"use client";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold text-pink-500 mb-4">
        Vyra 💖
      </h1>

      <p className="text-gray-400 mb-8">
        Private messaging space
      </p>

      <button
        onClick={() => {
          window.location.href = "/dashboard";
        }}
        className="bg-pink-500 px-6 py-3 rounded-2xl"
      >
        Start Messaging
      </button>
    </main>
  );
}
