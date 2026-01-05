/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { Wallpaper } from '../types';
import { Heart, Maximize2, ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Fix for framer-motion type issues in this environment
const Motion = motion as any;

interface ImageGridProps {
  wallpapers: Wallpaper[];
  onSelect: (wallpaper: Wallpaper) => void;
  onToggleFavorite: (id: string) => void;
  isGenerating?: boolean;
}

const SkeletonCard = () => (
  <Motion.div 
    layout
    initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
    exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)', transition: { duration: 0.3 } }}
    className="break-inside-avoid mb-6 rounded-xl overflow-hidden bg-zinc-900 border border-white/5 relative h-[400px] shadow-lg z-10"
  >
    <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-900 animate-shimmer" style={{ backgroundSize: '200% 100%' }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
    <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
        <Motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="relative">
          <div className="absolute inset-0 blur-md bg-purple-500/30 rounded-full"></div>
          <ImageIcon className="w-10 h-10 text-purple-500 relative z-10" />
        </Motion.div>
        <span className="text-xs text-white/40 font-bold tracking-[0.2em] animate-pulse">CREATING</span>
    </div>
  </Motion.div>
);

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.8 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

export const ImageGrid: React.FC<ImageGridProps> = ({ wallpapers, onSelect, onToggleFavorite, isGenerating }) => {
  if (wallpapers.length === 0 && !isGenerating) {
    return (
      <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 text-zinc-600">
        <div className="w-24 h-24 mb-6 rounded-3xl bg-zinc-900 border border-white/5 flex items-center justify-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent"></div>
            <Maximize2 className="w-10 h-10 text-zinc-500" />
        </div>
        <p className="text-xl font-bold text-zinc-400">No Wallpapers Yet</p>
        <p className="text-zinc-600 mt-2 text-sm text-center max-w-xs">Start creating with the sidebar controls.</p>
      </Motion.div>
    );
  }

  return (
    <div className="w-full max-w-full columns-1 md:columns-2 xl:columns-3 2xl:columns-4 gap-6 space-y-6 mx-auto pb-20">
      <AnimatePresence mode="popLayout">
        {isGenerating && <SkeletonCard key="skeleton-loader" />}
        {wallpapers.map((wp) => (
          <Motion.div 
            layout
            key={wp.id}
            variants={itemVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="group relative break-inside-avoid rounded-xl overflow-hidden bg-zinc-900 shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer border border-white/5"
            onClick={() => onSelect(wp)}
            whileHover={{ y: -8, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <img src={wp.url} alt={wp.prompt} className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5">
              <p className="text-white text-sm font-medium line-clamp-2 mb-4">"{wp.prompt}"</p>
              <div className="flex justify-end">
                  <Motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.8 }}
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); onToggleFavorite(wp.id); }}
                      className={`p-2.5 rounded-full backdrop-blur-md border border-white/10 ${wp.favorite ? 'bg-red-500 text-white border-red-500' : 'bg-black/40 text-white'}`}
                  >
                      <Heart className={`w-4 h-4 ${wp.favorite ? 'fill-current' : ''}`} />
                  </Motion.button>
              </div>
            </div>
          </Motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};