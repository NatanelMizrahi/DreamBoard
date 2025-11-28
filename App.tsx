import React, { useState, useEffect, useRef } from 'react';
import { MasonryGrid } from './components/MasonryGrid';
import { VisionItem, INITIAL_TOPICS, AspectRatio } from './types';
import { generateVisionImage } from './services/geminiService';

const App: React.FC = () => {
  const [items, setItems] = useState<VisionItem[]>([]);
  const [topicsInput, setTopicsInput] = useState(INITIAL_TOPICS.join(', '));
  const [generatedCount, setGeneratedCount] = useState(0);
  const [useLiteModel, setUseLiteModel] = useState(false);
  
  // Track IDs currently being processed
  const processingRef = useRef<Set<string>>(new Set());

  // Limit concurrency to prevent 429 "Resource Exhausted" errors
  const MAX_CONCURRENCY = 2;

  // Initial load
  useEffect(() => {
    syncItemsWithTopics(INITIAL_TOPICS);
  }, []);

  const getRandomAspectRatio = (): AspectRatio => {
    const ratios: AspectRatio[] = ['1:1', '3:4', '4:3', '16:9'];
    return ratios[Math.floor(Math.random() * ratios.length)];
  };

  const syncItemsWithTopics = (topics: string[]) => {
    setItems(prevItems => {
      const nextItems: VisionItem[] = [];
      const availableCurrentItems = [...prevItems];

      topics.forEach(topic => {
        const cleanTopic = topic.trim();
        if (!cleanTopic) return;

        // Try to find an existing item for this topic to preserve its state/image
        const existingIndex = availableCurrentItems.findIndex(i => i.keyword === cleanTopic);
        
        if (existingIndex !== -1) {
          nextItems.push(availableCurrentItems[existingIndex]);
          availableCurrentItems.splice(existingIndex, 1);
        } else {
          // Create new item
          nextItems.push({
            id: `item-${cleanTopic}-${Date.now()}-${Math.random()}`,
            keyword: cleanTopic,
            prompt: cleanTopic,
            status: 'pending',
            aspectRatio: getRandomAspectRatio(),
          });
        }
      });
      
      return nextItems;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopicsInput(e.target.value);
  };

  const handleInputBlur = () => {
    const topics = topicsInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
    syncItemsWithTopics(topics);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const topics = topicsInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
      syncItemsWithTopics(topics);
      e.currentTarget.blur();
    }
  };

  // Queue Processor with Concurrency Limit
  useEffect(() => {
    // If we are already processing max items, wait.
    if (processingRef.current.size >= MAX_CONCURRENCY) return;

    // Calculate how many slots are open
    const slotsAvailable = MAX_CONCURRENCY - processingRef.current.size;

    // Find items that are pending and NOT currently being processed
    const pendingItems = items
      .filter(i => i.status === 'pending' && !processingRef.current.has(i.id))
      .slice(0, slotsAvailable);

    if (pendingItems.length === 0) return;

    // Mark them as processed in ref immediately to block duplicates
    pendingItems.forEach(item => processingRef.current.add(item.id));

    // Update UI state to loading for these items
    setItems(prev => prev.map(item => 
      pendingItems.some(p => p.id === item.id) ? { ...item, status: 'loading' } : item
    ));

    const modelName = useLiteModel ? 'gemini-flash-lite-latest' : 'gemini-2.5-flash-image';
    
    // Process the batch
    pendingItems.forEach(item => {
      generateVisionImage(item.prompt, item.aspectRatio, modelName)
        .then(base64Image => {
          setItems(prev => prev.map(i => 
            i.id === item.id 
              ? { ...i, status: 'completed', imageUrl: base64Image } 
              : i
          ));
          setGeneratedCount(c => c + 1);
        })
        .catch(error => {
          console.error(`Error generating ${item.keyword}:`, error);
          setItems(prev => prev.map(i => 
            i.id === item.id 
              ? { ...i, status: 'error' } 
              : i
          ));
        })
        .finally(() => {
          // Cleanup ref
          processingRef.current.delete(item.id);
          // Force a state update to trigger the effect again if there are more pending items.
          // Note: setItems above typically triggers re-render, so the effect runs automatically.
          // If the list completes, we might need a nudge, but the .then/.catch setItems covers it.
        });
    });

  }, [items, useLiteModel]);

  const handleRetry = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'pending' } : i));
  };

  const completedCount = items.filter(i => i.status === 'completed').length;
  const totalItems = items.length;
  const progress = totalItems > 0 ? (completedCount / totalItems) * 100 : 0;

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white overflow-hidden">
      {/* Header */}
      <header className="flex-none z-40 w-full backdrop-blur-md bg-slate-900/90 border-b border-slate-800 h-16">
        <div className="max-w-full mx-auto px-4 h-full flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-2 flex-none">
             <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
             </div>
             <span className="hidden sm:inline font-bold text-lg tracking-tight">DreamBoard</span>
          </div>

          {/* Input Controls */}
          <div className="flex-1 max-w-4xl mx-auto flex items-center gap-2">
             <input 
                type="text"
                value={topicsInput}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                placeholder="Enter vision board topics, separated by commas..."
                className="w-full bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-indigo-500 rounded-full px-5 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all shadow-inner"
             />
             
             {/* Flash Lite Toggle */}
             <button
               onClick={() => setUseLiteModel(!useLiteModel)}
               className={`flex-none w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${
                 useLiteModel 
                   ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]' 
                   : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
               }`}
               title={useLiteModel ? "Using Flash Lite Model (Faster, No Aspect Ratio Control)" : "Switch to Flash Lite"}
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                 <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
               </svg>
             </button>
          </div>

          {/* Progress */}
          <div className="flex flex-col items-end w-32 flex-none">
              <div className="flex justify-between w-full text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">
                 <span>Vision Load</span>
                 <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                      className={`h-full transition-all duration-300 ease-out ${
                        useLiteModel 
                          ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500' 
                          : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
                      }`}
                      style={{ width: `${progress}%` }}
                  />
              </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative w-full overflow-y-auto overflow-x-hidden scrollbar-thin">
        <div className="min-h-full p-4">
           {items.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                  <p>Add some topics above to start dreaming.</p>
               </div>
           ) : (
               <MasonryGrid items={items} onRetry={handleRetry} />
           )}
        </div>
      </main>
    </div>
  );
};

export default App;