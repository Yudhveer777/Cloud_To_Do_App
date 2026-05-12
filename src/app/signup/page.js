"use client";

import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { UserPlus } from "lucide-react";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  if (user) return null;

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err) {
      console.error("Signup error:", err);
      // Remove "Firebase: " prefix if present to make it cleaner
      const errorMsg = err.message.replace("Firebase: ", "");
      setError(errorMsg);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card card animate-fade-in">
        <h1 className="auth-title">Create Account</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSignup} className="flex-col gap-4">
          <div className="flex-col gap-2">
            <label htmlFor="email" className="text-muted">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div className="flex-col gap-2">
            <label htmlFor="password" className="text-muted">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ marginTop: "0.5rem" }}>
            <UserPlus size={18} />
            Sign Up
          </button>
        </form>
        
        <div style={{ marginTop: "1.5rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--primary)", fontWeight: "500" }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
