"use client";
import React from "react";

export default function Hero() {
  return (
    <section className="mb-8 text-center">
      <h1 className="bg-gradient-to-r from-[#7c4dff] to-[#ff4ecd] bg-clip-text text-5xl font-extrabold leading-[1.1] tracking-tight text-transparent sm:text-6xl">
        Remove backgrounds in seconds.
      </h1>
      <p className="mx-auto mt-3 max-w-2xl text-base text-white/70">
        Upload, flip, and share a transparent PNG - no account required.
      </p>
      {/* Removed the redundant top call-to-action to keep focus on the workbench */}
    </section>
  );
}


