import React from 'react';
import { VisionItem } from '../types';

interface ImageCardProps {
  item: VisionItem;
  onRetry: (id: string) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ item, onRetry }) => {
  return (
    <div className="break-inside-avoid relative rounded-lg overflow-hidden bg-slate-800 shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:z-20 group">
      {/* Loading State */}
      {item.status === 'loading' && (
        <div className={`w-full flex flex-col items-center justify-center bg-slate-800/50 animate-pulse border border-slate-700/50
          ${item.aspectRatio === '1:1' ? 'aspect-square' : ''}
          ${item.aspectRatio === '3:4' ? 'aspect-[3/4]' : ''}
          ${item.aspectRatio === '4:3' ? 'aspect-[4/3]' : ''}
          ${item.aspectRatio === '16:9' ? 'aspect-video' : ''}
        `}>
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2 opacity-70"></div>
          <span className="text-[10px] text-slate-500 font-medium px-2 text-center truncate w-full">{item.keyword}</span>
        </div>
      )}

      {/* Pending State */}
      {item.status === 'pending' && (
        <div className={`w-full flex flex-col items-center justify-center bg-slate-800 border border-slate-700/30 p-2
          ${item.aspectRatio === '1:1' ? 'aspect-square' : ''}
          ${item.aspectRatio === '3:4' ? 'aspect-[3/4]' : ''}
          ${item.aspectRatio === '4:3' ? 'aspect-[4/3]' : ''}
          ${item.aspectRatio === '16:9' ? 'aspect-video' : ''}
        `}>
           <span className="text-xs text-slate-600 font-mono">...</span>
        </div>
      )}

      {/* Error State */}
      {item.status === 'error' && (
        <div className={`w-full flex flex-col items-center justify-center bg-slate-800 border border-red-900/20 p-4 text-center
          ${item.aspectRatio === '1:1' ? 'aspect-square' : ''}
          ${item.aspectRatio === '3:4' ? 'aspect-[3/4]' : ''}
          ${item.aspectRatio === '4:3' ? 'aspect-[4/3]' : ''}
          ${item.aspectRatio === '16:9' ? 'aspect-video' : ''}
        `}>
          <button 
            onClick={() => onRetry(item.id)}
            className="text-xs text-red-400 hover:text-red-300 transition-colors underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Completed State */}
      {item.status === 'completed' && item.imageUrl && (
        <div className="relative">
          <img 
            src={item.imageUrl} 
            alt={item.prompt} 
            className="w-full h-auto object-cover block"
            loading="lazy"
          />
          {/* Subtle overlay with text on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end">
            <div className="p-3 w-full">
              <p className="text-white text-xs font-medium leading-tight line-clamp-2">{item.keyword}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};