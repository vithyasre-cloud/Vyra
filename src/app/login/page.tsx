"use client";

import { useState } from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const provider = new GoogleAuthProvider();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      window.location.href = "/dashboard";
    } catch (error) {
      console.error(error);
      alert("Google Login Failed");
    }
  };

  const handleEmailAuth = async () => {
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        alert("Account Created 🎉");
      } else {
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error(error);
      alert("Authentication Failed");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">

      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">

        <h1 className="text-4xl font-bold text-center mb-2">
          Vyra
        </h1>

        <p className="text-center text-gray-400 mb-8">
          {isSignup
            ? "Create your account"
            : "Welcome back"}
        </p>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-4 rounded-2xl bg-black border border-white/10 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-4 rounded-2xl bg-black border border-white/10 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleEmailAuth}
          className="w-full bg-pink-500 hover:bg-pink-600 transition p-4 rounded-2xl font-semibold"
        >
          {isSignup ? "Create Account" : "Login"}
        </button>

        <button
          onClick={handleGoogleLogin}
          className="w-full mt-4 border border-white/10 hover:bg-white/10 transition p-4 rounded-2xl"
        >
          Continue with Google
        </button>

        <button
          onClick={() => setIsSignup(!isSignup)}
          className="w-full mt-6 text-pink-400"
        >
          {isSignup
            ? "Already have an account? Login"
            : "Don't have an account? Sign up"}
        </button>

      </div>

    </main>
  );
}