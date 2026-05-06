"use client";
import Image from "next/image";
import { useState } from "react";
import { FormType } from "../../types";
import axios from "axios";

export default function SignupUI() {

  const [formType, setFormType] = useState<FormType>(FormType.SIGNUP);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  async function handleSubmit(e:any) {
    e.preventDefault();
    if (formType === FormType.SIGNUP) {

      const signup = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/signup`, { email, password });
      if (signup.status === 201) {
        console.log("Signup successful:", signup.data);
        localStorage.setItem("token", signup.data.token);
        // Redirect or /dashboard
        window.location.href = "/dashboard";
      }

    }
  }

  return (
    <div className="h-screen bg-[#283232] flex items-center justify-center ">
      
      <div className="w-full h-full flex justify-center ">
        
        {/* Left */}
        <div className="md:w-2/4 text-white py-12 px-6 sm:px-12 lg:px-24 flex flex-col justify-center">
          
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold mb-2 ">
              {
              formType === FormType.SIGNUP ? "Create an account" : "Log in to your account"}
            </h2>
            <p className="text-gray-400 text-sm">
              {
              formType === FormType.SIGNUP ? "Sign up now and unlock exclusive access!" : "Log in to access your account."
              }
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="email"
              placeholder="mohit@gmail.com"
              className="w-full bg-[#2B3A37] px-4 py-3 rounded-md text-sm focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="*************"
              className="w-full bg-[#2B3A37] px-4 py-3 rounded-md text-sm focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
            <input type="checkbox" />
            <span>
              I agree to the <span className="text-lime-400">terms of service</span>
            </span>
          </div>

          <button onClick={handleSubmit} className="mt-6 bg-lime-400 text-black py-3 rounded-md font-semibold hover:scale-[1.02] transition">
            {formType === FormType.SIGNUP ? "Sign up" : "Log in"}
          </button>

          <p className="text-xs text-gray-400 text-center mt-4">
{
            formType === FormType.SIGNUP ? "Already have an account?" : "Don't have an account?"}
            <span className="text-lime-400 cursor-pointer ml-1" onClick={() => setFormType(formType === FormType.SIGNUP ? FormType.LOGIN : FormType.SIGNUP)}>
              {formType === FormType.SIGNUP ? "Login" : "Sign up"}
            </span>
          </p>
        </div>
{/* Right */}
        <div className="md:w-3/5 hidden md:inline-block p-5 ">
        <div className="relative overflow-hidden w-full h-full rounded-2xl ">
          <Image
            src="/signup/signup.svg"
            alt="Tree"
            fill
            className="object-cover"
            priority
            />
        </div>
        </div>
      </div>
    </div>
  );
}