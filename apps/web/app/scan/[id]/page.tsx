"use client";

import React from "react";
import { ArrowLeft, BrainCircuit, Activity, ShieldAlert, Sprout } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function DiagnosisResultPage() {
  const params = useParams();
  const id = params?.id;

  return (
    <div className="flex flex-col min-h-screen bg-[#121212] text-gray-200 font-sans">
      {/* Topbar */}
      <header className="flex items-center gap-4 p-4 bg-[#181818] sticky top-0 z-10 border-b border-[#222222]">
        <Link href="/scan" className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <span className="font-bold text-lg text-white">Diagnosis Result</span>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-8">
        {/* Image Section */}
        <div className="w-full h-64 bg-[#222] relative">
          <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&q=80&w=600')] bg-cover bg-center"></div>
          
          <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
            <h1 className="text-2xl font-bold text-white mb-1">Tomato leaf</h1>
            <span className="text-sm text-gray-300">Scan ID: {id || '12345'} • 2h ago</span>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-4 space-y-6 -mt-2 relative z-10">
          
          {/* Main Status Card */}
          <div className="bg-[#1A1A1A] rounded-[20px] p-5 border border-[#2A2A2A] shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-[#FF8A80]">
                <ShieldAlert size={20} />
                <h2 className="text-[14px] font-bold tracking-widest uppercase">Disease Detected</h2>
              </div>
              <div className="bg-[#FF8A80]/10 text-[#FF8A80] px-3 py-1 rounded-full text-xs font-bold tracking-wider">
                BLIGHT
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-[#262626] rounded-xl p-3 border border-[#333333]">
                <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Confidence</span>
                <span className="text-lg font-bold text-white">98.5%</span>
              </div>
              <div className="bg-[#262626] rounded-xl p-3 border border-[#333333]">
                <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Severity</span>
                <span className="text-lg font-bold text-[#FFB74D]">High</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-[#2E7D32]/10 rounded-xl border border-[#2E7D32]/20">
              <BrainCircuit className="text-[#81C784] mt-0.5 flex-shrink-0" size={18} />
              <p className="text-sm text-gray-300 leading-relaxed">
                <strong className="text-[#81C784] font-medium block mb-1">AI Analysis:</strong>
                Early blight is caused by the fungus Alternaria solani. It typically first appears on the older, lower leaves as dark brown to black spots with concentric rings.
              </p>
            </div>
          </div>

          {/* Actionable Advice */}
          <div className="space-y-4">
            <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest pl-1">Recommended Action Plan</h3>
            
            <div className="bg-[#1A1A1A] rounded-[16px] p-4 border border-[#2A2A2A]">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#FF8A80]/20 flex items-center justify-center flex-shrink-0 text-[#FF8A80]">
                  <span className="font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-1 text-[15px]">Immediate Remedy</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">Apply a copper-based fungicide immediately. Remove and destroy affected leaves to prevent further spread.</p>
                </div>
              </div>
              
              <div className="w-px h-6 bg-[#333] ml-4 -my-2"></div>
              
              <div className="flex items-start gap-4 mt-4">
                <div className="w-8 h-8 rounded-full bg-[#81C784]/20 flex items-center justify-center flex-shrink-0 text-[#81C784]">
                  <span className="font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-1 text-[15px]">Prevention for Future</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">Ensure proper crop rotation. Improve air circulation by spacing plants appropriately and watering at the base rather than overhead.</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
