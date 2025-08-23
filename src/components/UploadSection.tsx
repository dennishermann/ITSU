"use client";
import React from "react";
import UploadCard from "./UploadCard";

export default function UploadSection() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111217] p-4 shadow-sm text-white">
      <h2 className="mb-2 text-lg font-semibold">Upload</h2>
      <UploadCard />
    </div>
  );
}


