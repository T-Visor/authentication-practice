"use client";

import LoginForm from "@/components/login-form";
import SignupForm from "@/components/signup-form";

const HomePage = () => (
  <div 
    className="
      h-screen w-screen overflow-auto
      flex justify-center items-center
    "
  >
    <SignupForm />
  </div>
);


export default HomePage;