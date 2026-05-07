"use client";
import { useState } from "react";
import { FormType } from "../../types";
import axios from "axios";

export default function SignupUI() {
  const [formType, setFormType] = useState<FormType>(FormType.SIGNUP);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    
    try {
      if (formType === FormType.SIGNUP) {
        const signup = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/signup`, { email, password });
        if (signup.status === 201) {
          localStorage.setItem("token", signup.data.token);
          window.location.href = "/dashboard";
        }
      } else {
        const login = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/login`, { email, password });
        if (login.status === 200) {
          localStorage.setItem("token", login.data.token);
          window.location.href = "/dashboard";
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden py-12 px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0f] via-black to-black" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/3 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[200px] pointer-events-none" />
      </div>
      
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-16 pt-8 lg:pt-0">
        {/* Left side - Branding */}
        <div className="w-full lg:w-1/2 text-center lg:text-left lg:pt-8">
          <div className="flex items-center gap-3 mb-6 justify-center lg:justify-start">
            <div className="w-10 h-10 sm:w-12 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-white/10">
              <span className="text-black font-bold text-lg sm:text-xl">C</span>
            </div>
            <div>
              <span className="text-white font-bold text-lg sm:text-xl block leading-tight">Code Pilot</span>
              <span className="text-gray-500 text-xs sm:text-sm">Online IDE</span>
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Code faster.<br />
            Build <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">smarter.</span>
          </h1>
          
          <p className="text-gray-400 text-sm sm:text-base lg:text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
            The modern online IDE that makes coding effortless. Write, run, and collaborate on projects from anywhere.
          </p>
        </div>

        {/* Right side - Form Card */}
        <div className="w-full sm:max-w-md lg:w-1/2">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/50">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                {formType === FormType.SIGNUP ? "Create account" : "Welcome back"}
              </h2>
              <p className="text-gray-500 text-sm">
                {formType === FormType.SIGNUP 
                  ? "Start your coding journey today" 
                  : "Ready to code again?"}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:bg-white/10 transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:bg-white/10 transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {formType === FormType.SIGNUP && (
              <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                <input type="checkbox" className="accent-white rounded" />
                <span>I agree to the <span className="text-white hover:underline cursor-pointer">terms</span></span>
              </div>
            )}

            <button 
              onClick={handleSubmit} 
              disabled={loading}
              className="w-full mt-6 bg-white text-black py-3 sm:py-3.5 rounded-xl font-semibold hover:bg-gray-100 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                formType === FormType.SIGNUP ? "Create account" : "Sign in"
              )}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-black/40 text-gray-500">or</span>
              </div>
            </div>

            <button className="w-full py-3 rounded-xl border border-white/20 text-white hover:bg-white/5 transition flex items-center justify-center gap-3 text-sm sm:text-base">
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
              </svg>
              Continue with Google
            </button>

            <p className="text-sm text-gray-500 text-center mt-6">
              {formType === FormType.SIGNUP ? "Already have an account?" : "Don't have an account?"}
              <button 
                className="text-white ml-1 hover:underline" 
                onClick={() => { setFormType(formType === FormType.SIGNUP ? FormType.LOGIN : FormType.SIGNUP); setError(""); }}
              >
                {formType === FormType.SIGNUP ? "Sign in" : "Sign up"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
