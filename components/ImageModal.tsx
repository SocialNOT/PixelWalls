/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { Wallpaper } from '../types';
import { X, Download, Heart, Share2, Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Fix for framer-motion type issues in this environment
const Motion = motion as any;

interface ImageModalProps {
  wallpaper: Wallpaper | null;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
}

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2, delay: 0.1 } }
};

const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 300, mass: 0.8 } },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
};

export const ImageModal: React.FC<ImageModalProps> = ({ wallpaper, onClose, onToggleFavorite }) => {
  if (!wallpaper) return null;

  const handleDownload = async () => {
    try {
        const response = await fetch(wallpaper.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pixel-wall-${wallpaper.id}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (e) {
        console.error("Download failed", e);
    }
  };

  return (
    <Motion.div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={overlayVariants}
    >
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose} />

      <Motion.div 
        variants={modalVariants}
        className="relative w-full max-w-7xl h-[85vh] md:h-[90vh] bg-zinc-900 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-white/10 z-10"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2.5 bg-black/50 text-white rounded-full md:hidden backdrop-blur-md border border-white/10">
          <X className="w-5 h-5" />
        </button>

        {/* Image Area */}
        <div className="flex-1 bg-zinc-950 flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 to-zinc-950 opacity-50"></div>
             <Motion.img 
               layoutId={`image-${wallpaper.id}`}
               src={wallpaper.url} 
               alt={wallpaper.prompt} 
               className="max-w-full max-h-full object-contain shadow-2xl z-10"
             />
        </div>

        {/* Info Sidebar */}
        <div className="w-full md:w-[400px] bg-zinc-900 border-l border-white/5 flex flex-col h-auto md:h-full z-20">
           <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                    <Wand2 className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-white text-lg">Details</h3>
              </div>
              <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-1">
                  <X className="w-6 h-6" />
              </button>
           </div>

           <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
              <div className="space-y-8">
                 <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-3">Prompt</label>
                    <div className="p-4 rounded-2xl bg-zinc-950/50 border border-white/5 text-zinc-300 text-sm italic leading-relaxed">
                        "{wallpaper.prompt}"
                    </div>
                 </div>

                 <div className="grid grid-cols-1 gap-4">
                    <div className="bg-zinc-800/30 p-4 rounded-2xl border border-white/5">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Format</label>
                        <p className="text-lg font-semibold text-white mt-1 uppercase">{wallpaper.aspectRatio} Aspect</p>
                    </div>
                 </div>

                 <div className="pt-4 border-t border-white/5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">AI Engine</label>
                    <div className="flex items-center space-x-3 bg-zinc-800/30 px-4 py-3 rounded-xl border border-white/5">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm font-semibold text-zinc-300">Gemini 2.5 Flash Tier</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-6 border-t border-white/5 bg-zinc-900">
              <Motion.button 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleDownload}
                className="w-full flex items-center justify-center space-x-2 bg-white text-black px-4 py-4 rounded-xl font-bold hover:bg-zinc-200 transition-all mb-3"
              >
                 <Download className="w-5 h-5" />
                 <span>Download</span>
              </Motion.button>
              
              <div className="flex space-x-3">
                  <Motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onToggleFavorite(wallpaper.id)}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-4 rounded-xl font-medium border transition-all ${
                        wallpaper.favorite 
                        ? 'border-red-500/30 bg-red-500/10 text-red-400' 
                        : 'border-white/10 bg-zinc-800/50 text-zinc-300'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${wallpaper.favorite ? 'fill-current' : ''}`} />
                    <span>{wallpaper.favorite ? 'Saved' : 'Save'}</span>
                  </Motion.button>
                  <button className="px-4 py-4 rounded-xl border border-white/10 bg-zinc-800/50 text-zinc-300 hover:text-white">
                    <Share2 className="w-5 h-5" />
                  </button>
              </div>
           </div>
        </div>
      </Motion.div>
    </Motion.div>
  );
};