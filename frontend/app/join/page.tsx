"use client";
import { useState } from "react";
import { FormType } from "../../types";
import api from "@/lib/api";

const validateEmail = (email: string): string | null => {
  if (!email) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return null;
};

const validatePassword = (password: string, isSignup: boolean): string | null => {
  if (!password) return "Password is required";
  if (isSignup && password.length < 8) return "Password must be at least 8 characters";
  return null;
};

export default function SignupUI() {
  const [formType, setFormType] = useState<FormType>(FormType.SIGNUP);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; terms?: string; general?: string }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;
    
    const passwordError = validatePassword(password, formType === FormType.SIGNUP);
    if (passwordError) newErrors.password = passwordError;
    
    if (formType === FormType.SIGNUP && !agreeTerms) {
      newErrors.terms = "You must agree to the terms";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      if (formType === FormType.SIGNUP) {
        const signup = await api.post(`/api/users/signup`, { email, password });
        if (signup.status === 201) {
          localStorage.setItem("token", signup.data.token);
          window.location.href = "/dashboard";
        }
      } else {
        const login = await api.post(`/api/users/signin`, { email, password });
        if (login.status === 200) {
          localStorage.setItem("token", login.data.token);
          window.location.href = "/dashboard";
        }
      }
    } catch (err: any) {
      const status = err?.response?.status as number | undefined;
      const message = (err?.response?.data?.error as string | undefined) || "Something went wrong";

      if (status === 409) {
        setErrors({ email: message });
      } else if (status === 404) {
        setErrors({ email: message });
      } else if (status === 401) {
        setErrors({ password: message });
      } else {
        setErrors({ general: message });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100svh] min-h-screen bg-black flex items-start sm:items-center justify-center relative overflow-hidden py-8 sm:py-12 px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0f] via-black to-black" />
        <div className="absolute -top-24 -right-24 w-[320px] h-[320px] sm:w-[520px] sm:h-[520px] lg:w-[600px] lg:h-[600px] bg-white/4 sm:bg-white/5 rounded-full blur-[90px] sm:blur-[150px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-[280px] h-[280px] sm:w-[440px] sm:h-[440px] lg:w-[500px] lg:h-[500px] bg-white/3 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] h-[460px] sm:w-[700px] sm:h-[700px] lg:w-[800px] lg:h-[800px] bg-blue-500/4 sm:bg-blue-500/5 rounded-full blur-[120px] sm:blur-[200px] pointer-events-none" />
      </div>
      
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-center lg:items-start gap-6 sm:gap-10 lg:gap-16 pt-6 sm:pt-8 lg:pt-0">
        {/* Mobile brand header */}
        <div className="w-full lg:hidden flex flex-col items-center text-center">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-white/10">
              <span className="text-black font-bold text-xl">C</span>
            </div>
            <div className="text-left">
              <div className="text-white font-bold text-xl leading-tight">Code Pilot</div>
              <div className="text-gray-500 text-sm">Online IDE</div>
            </div>
          </div>
          <div className="text-gray-400 text-sm max-w-sm">
            {formType === FormType.SIGNUP
              ? "Create your account to start building."
              : "Sign in to pick up where you left off."}
          </div>
        </div>

        {/* Left side - Branding (hidden on mobile) */}
        <div className="hidden lg:flex w-full lg:w-1/2 text-center lg:text-left lg:pt-8">
          <div className="flex flex-col items-center lg:items-start">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-white/10">
                <span className="text-black font-bold text-xl">C</span>
              </div>
              <div>
                <span className="text-white font-bold text-xl block leading-tight">Code Pilot</span>
                <span className="text-gray-500 text-sm">Online IDE</span>
              </div>
            </div>
            
            <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
              Code faster.<br />
              Build <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">smarter.</span>
            </h1>
            
            <p className="text-gray-400 text-lg leading-relaxed max-w-md">
              The modern online IDE that makes coding effortless. Write, run, and collaborate on projects from anywhere.
            </p>
          </div>
        </div>
        
        {/* Right side - Form Card */}
        <div className="w-full max-w-md">
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

            {errors.general && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {errors.general}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className={`w-full bg-white/5 border ${errors.email ? "border-red-500/50" : "border-white/10"} px-4 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:bg-white/10 transition`}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })); }}
                  onBlur={() => {
                    const error = validateEmail(email);
                    setErrors(prev => ({ ...prev, email: error || undefined }));
                  }}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">Password {formType === FormType.SIGNUP && <span className="text-gray-600">(min 8 characters)</span>}</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`w-full bg-white/5 border ${errors.password ? "border-red-500/50" : "border-white/10"} px-4 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:bg-white/10 transition`}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })); }}
                  onBlur={() => {
                    const error = validatePassword(password, formType === FormType.SIGNUP);
                    setErrors(prev => ({ ...prev, password: error || undefined }));
                  }}
                />
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>
            </div>

            {formType === FormType.SIGNUP && (
              <div className="flex items-center gap-2 mt-4 text-sm">
                <input 
                  type="checkbox" 
                  className="accent-white rounded cursor-pointer"
                  checked={agreeTerms}
                  onChange={(e) => { setAgreeTerms(e.target.checked); setErrors(prev => ({ ...prev, terms: undefined })); }}
                />
                <span className="text-gray-400">I agree to the <span className="text-white hover:underline cursor-pointer">terms</span></span>
              </div>
            )}
            {errors.terms && <p className="text-red-400 text-xs mt-1">{errors.terms}</p>}

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

            <div className="relative my-5 sm:my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-black/40 text-gray-500">or</span>
              </div>
            </div>

            <button className="w-full py-3 sm:py-3.5 rounded-xl border border-white/20 text-white hover:bg-white/5 transition flex items-center justify-center gap-3 text-sm sm:text-base">
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
              </svg>
              Continue with Google
            </button>

            <p className="text-sm text-gray-500 text-center mt-6">
              {formType === FormType.SIGNUP ? "Already have an account?" : "Don't have an account?"}
              <button 
                className="text-white ml-1 hover:underline" 
                onClick={() => { setFormType(formType === FormType.SIGNUP ? FormType.LOGIN : FormType.SIGNUP); setErrors({}); setAgreeTerms(false); }}
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
