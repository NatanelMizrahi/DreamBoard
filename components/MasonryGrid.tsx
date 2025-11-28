import React from 'react';
import { VisionItem } from '../types';
import { ImageCard } from './ImageCard';

interface MasonryGridProps {
  items: VisionItem[];
  onRetry: (id: string) => void;
}

export const MasonryGrid: React.FC<MasonryGridProps> = ({ items, onRetry }) => {
  return (
    /* 
      Increased column counts to make images smaller and fit more on screen (collage effect).
      Removed max-w-7xl to use full width.
    */
    <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-3 mx-auto w-full space-y-3 pb-8">
      {items.map((item) => (
        <ImageCard key={item.id} item={item} onRetry={onRetry} />
      ))}
    </div>
  );
};