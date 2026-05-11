"use client";
import { useState } from "react";
import { FormType } from "../../types";
import axios from "axios";

const features = [
  { icon: "⌨️", title: "Monaco Editor", desc: "VS Code-grade editing experience" },
  { icon: "🖥️", title: "Integrated Terminal", desc: "Run code directly in the browser" },
  { icon: "📁", title: "Project Management", desc: "Organize and manage your code" },
  { icon: "🌙", title: "Dark Theme", desc: "Designed for focused coding" },
];

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
        const login = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/signin`, { email, password });
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
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-neutral-950 to-black" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-[180px]" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-white/3 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-white/5 rounded-full blur-[250px]" />
      </div>
      
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16 px-6">
        {/* Left side - Branding */}
        <div className="w-full lg:w-1/2 text-center lg:text-left lg:pt-4">
          <div className="flex items-center gap-3 mb-8 justify-center lg:justify-start">
            <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-200 rounded-xl flex items-center justify-center shadow-lg shadow-white/10">
              <span className="text-black font-bold text-2xl">C</span>
            </div>
            <div>
              <span className="text-white font-bold text-xl block leading-tight">CodePilot</span>
              <span className="text-gray-500 text-sm">Modern Online IDE</span>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
            Code smarter.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-gray-500">Build faster.</span>
          </h1>
          
          <p className="text-gray-400 text-base lg:text-lg leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0">
            A modern online IDE with an integrated terminal, Monaco editor, and seamless project management. Code from anywhere.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-xl">{f.icon}</span>
                <div>
                  <span className="text-white text-sm font-medium block">{f.title}</span>
                  <span className="text-gray-500 text-xs">{f.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Form Card */}
        <div className="w-full sm:max-w-md lg:w-[480px]">
          <div className="bg-neutral-950/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-2">
                {formType === FormType.SIGNUP ? "Create account" : "Welcome back"}
              </h2>
              <p className="text-gray-500 text-sm">
                {formType === FormType.SIGNUP 
                  ? "Start building your projects today" 
                  : "Continue coding your projects"}
              </p>
            </div>

            {error && (
              <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx={12} cy={12} r={10} /><line x1={12} y1={8} x2={12} y2={12} /><line x1={12} y1={16} x2={12.01} y2={16} />
                </svg>
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-gray-400 text-sm mb-2 font-medium">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 px-4 py-3.5 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:bg-white/10 transition backdrop-blur"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2 font-medium">Password</label>
                <input
                  type="password"
                  placeholder="Min 8 characters"
                  className="w-full bg-white/5 border border-white/10 px-4 py-3.5 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:bg-white/10 transition backdrop-blur"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              onClick={handleSubmit} 
              disabled={loading}
              className="w-full mt-6 bg-white text-black py-3.5 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-white/5"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                formType === FormType.SIGNUP ? "Create account" : "Sign in"
              )}
            </button>

            <p className="text-sm text-gray-500 text-center mt-6">
              {formType === FormType.SIGNUP ? "Already have an account?" : "Don't have an account?"}
              <button 
                className="text-white ml-1 hover:text-gray-300 transition font-medium" 
                onClick={() => { setFormType(formType === FormType.SIGNUP ? FormType.LOGIN : FormType.SIGNUP); setError(""); }}
              >
                {formType === FormType.SIGNUP ? "Sign in" : "Sign up"}
              </button>
            </p>
          </div>

          <p className="text-xs text-gray-600 text-center mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}