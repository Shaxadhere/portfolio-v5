"use client";

import React, { useState } from "react";
import { ShieldCheck, Lock, User, ArrowRight, Loader2, AlertCircle, Sparkles } from "lucide-react";

interface SuLoginProps {
  onSuccess: (username: string) => void;
}

export default function SuLogin({ onSuccess }: SuLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/su/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      onSuccess(data.username || username.trim());
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0c] text-[#f0ebe3] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#e8ff47]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#3de8ff]/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Background grid texture */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(240,235,227,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(240,235,227,0.03)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Top brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1a1a20] border border-[rgba(240,235,227,0.1)] text-[#e8ff47] text-xs font-mono tracking-widest uppercase mb-4 shadow-lg shadow-black/40">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Super User Access</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f0ebe3]">
            Resume Analytics Portal
          </h1>
          <p className="text-sm text-[#a8a29e] mt-2 font-serif italic">
            Enter authorized credentials to view live metrics & telemetry.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#121216]/90 backdrop-blur-xl border border-[rgba(240,235,227,0.12)] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#ff5c3d]/10 border border-[#ff5c3d]/30 text-[#ff8c73] text-sm animate-shake">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="username"
                className="block text-xs font-mono uppercase tracking-wider text-[#a8a29e] mb-2"
              >
                Admin Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a8a29e]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 bg-[#1a1a20]/90 border border-[rgba(240,235,227,0.12)] rounded-xl text-[#f0ebe3] placeholder-[#a8a29e]/40 text-sm focus:outline-none focus:border-[#e8ff47] focus:ring-1 focus:ring-[#e8ff47] transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-mono uppercase tracking-wider text-[#a8a29e] mb-2"
              >
                Password / Access Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a8a29e]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#1a1a20]/90 border border-[rgba(240,235,227,0.12)] rounded-xl text-[#f0ebe3] placeholder-[#a8a29e]/40 text-sm focus:outline-none focus:border-[#e8ff47] focus:ring-1 focus:ring-[#e8ff47] transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 bg-[#e8ff47] hover:bg-[#d8ef37] active:scale-[0.99] text-[#0a0a0c] font-medium text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#e8ff47]/15 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Session...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Super User</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[rgba(240,235,227,0.08)] flex items-center justify-between text-xs text-[#a8a29e]">
            <span className="flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3 h-3 text-[#e8ff47]" />
              Secure HMAC session
            </span>
            <a
              href="/"
              className="hover:text-[#e8ff47] transition-colors font-mono underline underline-offset-4"
            >
              Back to Portfolio
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
