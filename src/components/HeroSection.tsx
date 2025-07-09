'use client';

export default function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center text-center h-screen px-4">
      <div className="backdrop-blur-xl bg-white/10 p-10 rounded-3xl shadow-lg max-w-2xl">
        <h1 className="text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
          Welcome to Auto Nirman
        </h1>
        <p className="text-lg mb-6 text-gray-300">
          Your smart construction partner. Fast. Legal. Automated.
        </p>
        <div className="flex gap-4 justify-center">
          <button className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-white font-bold transition">
            Get Started
          </button>
          <button className="px-6 py-3 bg-gray-700 hover:bg-gray-800 rounded-lg text-white font-bold transition">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
}
