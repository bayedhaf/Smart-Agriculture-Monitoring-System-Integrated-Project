"use client";

import React, { useState } from "react";
import {
  Tractor,
  Camera,
  ImageIcon,
  BrainCircuit,
  ChevronDown,
  ChevronRight,
  Sprout,
  ScanLine,
  History,
  Settings,
} from "lucide-react";
import Image from "next/image";

export default function ScanPage() {
  const [cropType, setCropType] = useState("Maize");

  return (
    <div className="flex flex-col min-h-screen bg-[#121212] text-gray-200 font-sans">
      {/* Topbar */}
      <header className="flex items-center justify-between p-4 bg-[#181818] sticky top-0 z-10 border-b border-[#222222]">
        <div className="flex items-center gap-2 text-[#4CAF50]">
          <Tractor size={24} />
          <span className="font-bold text-lg">AgriSense</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center overflow-hidden">
          {/* Using a placeholder avatar to match the UI */}
          <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100')] bg-cover bg-center"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 p-4 space-y-6">
        {/* Header Title */}
        <div>
          <h1 className="text-2xl font-bold mb-2 text-white">Scan & Diagnose</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Identify crop diseases instantly using AI vision technology.
          </p>
        </div>

        {/* Scan Card */}
        <div className="bg-[#1A1A1A] rounded-[20px] p-4 border border-[#2A2A2A]">
          {/* Upload Area */}
          <div className="border border-dashed border-[#444444] rounded-[16px] h-48 flex flex-col items-center justify-center text-[#666666] mb-4 bg-[#141414]">
            <Camera size={32} className="mb-2 opacity-60" />
            <span className="text-[11px] tracking-widest font-bold opacity-80 uppercase">
              Photograph the leaf
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-5">
            <button className="flex-1 bg-[#2E7D32] text-white py-3 rounded-[12px] flex items-center justify-center gap-2 font-medium text-sm transition-opacity hover:opacity-90">
              <Camera size={18} />
              CAMERA
            </button>
            <button className="flex-1 bg-[#262626] text-gray-300 py-3 rounded-[12px] flex items-center justify-center gap-2 font-medium text-sm border border-[#333333] transition-opacity hover:opacity-90 hover:bg-[#333333]">
              <ImageIcon size={18} />
              GALLERY
            </button>
          </div>

          {/* Crop Type */}
          <div className="mb-5">
            <label className="block text-[10px] font-bold tracking-widest text-gray-400 mb-2 uppercase">
              Crop Type
            </label>
            <div className="relative">
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                className="w-full appearance-none bg-[#262626] text-gray-200 border border-[#333333] rounded-[12px] py-3.5 px-4 outline-none focus:border-[#4CAF50] focus:ring-1 focus:ring-[#4CAF50] transition-all text-sm"
              >
                <option value="Maize">Maize</option>
                <option value="Tomato">Tomato</option>
                <option value="Potato">Potato</option>
                <option value="Teff">Teff</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>

          {/* Analyse Button */}
          <button className="w-full bg-[#A5D6A7] text-[#1B5E20] py-4 rounded-[12px] flex items-center justify-center gap-2 font-bold text-[15px] transition-transform active:scale-[0.98] hover:bg-[#81C784]">
            <BrainCircuit size={20} className="text-[#1B5E20]" />
            Analyse with AI
          </button>
        </div>

        {/* Recent Scans */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-bold text-white">Recent scans</h2>
            <button className="text-[10px] font-bold tracking-widest text-[#81C784] hover:text-[#A5D6A7] transition-colors">
              VIEW ALL
            </button>
          </div>

          <div className="space-y-3">
            {/* Item 1 */}
            <div className="bg-[#1A1A1A] rounded-[16px] p-3 flex items-center gap-4 border border-[#2A2A2A] cursor-pointer hover:bg-[#222222] transition-colors">
              <div className="w-[52px] h-[52px] rounded-[12px] bg-[#222] overflow-hidden flex-shrink-0 relative">
                <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&q=80&w=200')] bg-cover bg-center"></div>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-[15px] text-gray-100 mb-1 leading-none">Tomato leaf</h3>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#FF8A80]"></div>
                  <span className="text-[10px] font-bold tracking-widest text-[#FF8A80]">BLIGHT</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[11px] text-gray-500">2h ago</span>
                <ChevronRight size={18} className="text-gray-500" />
              </div>
            </div>

            {/* Item 2 */}
            <div className="bg-[#1A1A1A] rounded-[16px] p-3 flex items-center gap-4 border border-[#2A2A2A] cursor-pointer hover:bg-[#222222] transition-colors">
              <div className="w-[52px] h-[52px] rounded-[12px] bg-[#222] overflow-hidden flex-shrink-0 relative">
                <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=200')] bg-cover bg-center"></div>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-[15px] text-gray-100 mb-1 leading-none">Maize</h3>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#81C784]"></div>
                  <span className="text-[10px] font-bold tracking-widest text-[#81C784]">HEALTHY</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[11px] text-gray-500">Yesterday</span>
                <ChevronRight size={18} className="text-gray-500" />
              </div>
            </div>

            {/* Item 3 */}
            <div className="bg-[#1A1A1A] rounded-[16px] p-3 flex items-center gap-4 border border-[#2A2A2A] cursor-pointer hover:bg-[#222222] transition-colors">
              <div className="w-[52px] h-[52px] rounded-[12px] bg-[#222] overflow-hidden flex-shrink-0 relative">
                <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1518978155253-ab021fb2b75a?auto=format&fit=crop&q=80&w=200')] bg-cover bg-center"></div>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-[15px] text-gray-100 mb-1 leading-none">Potato leaf</h3>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#FFB74D]"></div>
                  <span className="text-[10px] font-bold tracking-widest text-[#FFB74D]">RUST WARNING</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[11px] text-gray-500">Oct 24</span>
                <ChevronRight size={18} className="text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-[#181818] border-t border-[#2A2A2A] flex items-center justify-around pb-5 pt-3 px-2 z-20">
        <button className="flex flex-col items-center p-2 gap-1.5 text-gray-500 hover:text-gray-300 transition-colors">
          <Sprout size={22} />
          <span className="text-[9px] font-bold tracking-widest">FIELDS</span>
        </button>
        <button className="flex flex-col items-center p-2 gap-1.5 text-[#4CAF50] transition-colors relative">
          <ScanLine size={22} />
          <span className="text-[9px] font-bold tracking-widest">SCAN</span>
        </button>
        <button className="flex flex-col items-center p-2 gap-1.5 text-gray-500 hover:text-gray-300 transition-colors">
          <History size={22} />
          <span className="text-[9px] font-bold tracking-widest">HISTORY</span>
        </button>
        <button className="flex flex-col items-center p-2 gap-1.5 text-gray-500 hover:text-gray-300 transition-colors">
          <Settings size={22} />
          <span className="text-[9px] font-bold tracking-widest">SETTINGS</span>
        </button>
      </nav>
    </div>
  );
}
