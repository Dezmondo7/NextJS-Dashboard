"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: real authentication goes here
    if (username && password) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
      {/* Optional dark mode toggle */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="absolute top-5 right-5 p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </button>

      <div className="w-full max-w-sm p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 text-center">
          AI Dashboard Login
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mt-2">
          Enter your credentials to access your dashboard
        </p>

        <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <button
            type="submit"
            className="bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-lg transition font-semibold"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}