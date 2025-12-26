import React, { useState, useRef, useEffect } from 'react';
import { UrlInputList } from './components/UrlInputList';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { generateTravelGuide } from './services/geminiService';
import { LoadingState, TravelGuideResponse, BudgetLevel, TravelSeason, CompanionType } from './types';

const App: React.FC = () => {
  const [urls, setUrls] = useState<string[]>(['', '', '']);
  const [notes, setNotes] = useState<string>('');
  
  // Preference States
  const [budget, setBudget] = useState<BudgetLevel>('');
  const [season, setSeason] = useState<TravelSeason>('');
  const [companion, setCompanion] = useState<CompanionType>('');

  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [result, setResult] = useState<TravelGuideResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    // Basic validation
    const filledUrls = urls.filter(u => u.trim().length > 0);
    if (filledUrls.length === 0) {
      setError("Please enter at least one URL to analyze.");
      return;
    }

    setStatus(LoadingState.ANALYZING);
    setError(null);
    setResult(null);

    try {
      // Small artificial delay to show state changes if API is too fast (UX)
      setTimeout(() => {
        if(status === LoadingState.ANALYZING) setStatus(LoadingState.SYNTHESIZING);
      }, 2000);

      const response = await generateTravelGuide(filledUrls, {
        budget,
        season,
        companion,
        additionalNotes: notes
      });
      
      setResult(response);
      setStatus(LoadingState.COMPLETE);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setStatus(LoadingState.ERROR);
    }
  };

  // Scroll to result on complete
  useEffect(() => {
    if (status === LoadingState.COMPLETE && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [status]);

  const isLoading = status === LoadingState.ANALYZING || status === LoadingState.SYNTHESIZING;

  // Helper for select styles
  const selectStyle = "w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:bg-slate-50 disabled:text-slate-400";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      
      {/* Hero Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-serif font-bold text-lg">
              T
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">TravelSynthesizer AI</h1>
          </div>
          <div className="hidden sm:block text-sm text-slate-500">
            Powered by Gemini
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Create Your Guide</h2>
              
              <div className="mb-6">
                <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                  Paste 3-5 links to travel blogs, articles, or location pages. AI will read them and merge them into one master itinerary.
                </p>
                <UrlInputList 
                  urls={urls} 
                  onChange={setUrls} 
                  disabled={isLoading} 
                />
              </div>

              <div className="mb-6 border-t border-slate-100 pt-6">
                 <h3 className="text-sm font-semibold text-slate-700 mb-3">Trip Preferences</h3>
                 <div className="space-y-3">
                    {/* Budget */}
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Budget Style</label>
                      <select 
                        value={budget} 
                        onChange={(e) => setBudget(e.target.value as BudgetLevel)}
                        disabled={isLoading}
                        className={selectStyle}
                      >
                        <option value="">Any / Mixed</option>
                        <option value="Economy">Economy (Budget-friendly)</option>
                        <option value="Comfort">Comfort (Standard)</option>
                        <option value="Luxury">Luxury (High-end)</option>
                      </select>
                    </div>

                    {/* Companion */}
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Who is traveling?</label>
                      <select 
                        value={companion} 
                        onChange={(e) => setCompanion(e.target.value as CompanionType)}
                        disabled={isLoading}
                        className={selectStyle}
                      >
                        <option value="">General</option>
                        <option value="Solo">Solo Traveler</option>
                        <option value="Couple">Couple / Romantic</option>
                        <option value="Family">Family with Kids</option>
                        <option value="Friends">Group of Friends</option>
                      </select>
                    </div>

                    {/* Season */}
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">When are you going?</label>
                      <select 
                        value={season} 
                        onChange={(e) => setSeason(e.target.value as TravelSeason)}
                        disabled={isLoading}
                        className={selectStyle}
                      >
                        <option value="">Not decided yet</option>
                        <option value="Off-peak">Off-peak (Fewer crowds)</option>
                        <option value="Shoulder">Shoulder Season</option>
                        <option value="Peak">Peak Season (Best weather)</option>
                      </select>
                    </div>
                 </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Additional Notes <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isLoading}
                  placeholder="e.g., specific dietary needs, focus on museums, etc."
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 min-h-[80px] resize-none disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-md transition-all transform active:scale-[0.98]
                  ${isLoading 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-brand-600 hover:bg-brand-700 hover:shadow-lg'}`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {status === LoadingState.ANALYZING ? 'Reading Links...' : 'Synthesizing Guide...'}
                  </span>
                ) : (
                  'Generate Travel Guide'
                )}
              </button>
            </div>

            {/* Helper Tips */}
            {!result && (
              <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                <h3 className="text-sm font-bold text-blue-900 mb-2">Pro Tips:</h3>
                <ul className="text-sm text-blue-800 space-y-2 list-disc pl-4">
                  <li>Use specific blog posts (e.g., "3 Days in Tokyo").</li>
                  <li>Mix different types of sources (e.g., a food blog + a museum guide).</li>
                  <li>Select your travel style above to get tailored recommendations.</li>
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-8">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-700 mb-8 animate-fade-in">
                 <p className="font-semibold">{error}</p>
                 <button onClick={() => setError(null)} className="text-sm underline mt-2">Dismiss</button>
              </div>
            )}

            {/* Empty State */}
            {status === LoadingState.IDLE && !result && !error && (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 min-h-[400px]">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7m0 0L9 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Ready to plan your trip?</h3>
                <p className="text-slate-500 max-w-md">
                  Add a few URLs on the left and set your preferences. We will build a custom comprehensive guide tailored to you.
                </p>
              </div>
            )}

            {/* Loading Skeleton */}
            {isLoading && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 space-y-6 animate-pulse">
                <div className="h-8 bg-slate-100 rounded-md w-3/4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-slate-100 rounded w-full"></div>
                  <div className="h-4 bg-slate-100 rounded w-full"></div>
                  <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                </div>
                <div className="h-64 bg-slate-100 rounded-xl w-full"></div>
              </div>
            )}

            {/* Result Display */}
            {status === LoadingState.COMPLETE && result && (
              <div ref={resultRef} className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden animate-fade-in-up">
                
                {/* Result Header */}
                <div className="bg-brand-600 p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-10 transform translate-x-1/3 -translate-y-1/3">
                    <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M2.002 9.63c-.023.411.207.794.581.966l7.504 3.442 3.442 7.504c.172.374.555.604.966.581.411-.023.75-.325.833-.728l3-14.5c.092-.444-.222-.862-.685-.914-.029-.003-.058-.003-.087-.003-.385 0-.726.243-.865.608l-3.328 12.333-3.05-6.65-6.65-3.05L16.05 6.32 2.73 9.63z" /></svg>
                  </div>
                  <h2 className="text-3xl font-serif font-bold relative z-10">Your Custom Guide</h2>
                  <div className="flex flex-wrap gap-2 mt-3 relative z-10">
                    <span className="inline-block px-2 py-1 bg-white/20 rounded text-xs backdrop-blur-sm">
                      {urls.filter(u => u).length} Sources
                    </span>
                    {budget && <span className="inline-block px-2 py-1 bg-white/20 rounded text-xs backdrop-blur-sm">{budget}</span>}
                    {companion && <span className="inline-block px-2 py-1 bg-white/20 rounded text-xs backdrop-blur-sm">{companion}</span>}
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 lg:p-12">
                  <MarkdownRenderer content={result.markdownContent} />
                  
                  {/* Sources Footer */}
                  {result.sources.length > 0 && (
                     <div className="mt-12 pt-8 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Cited Sources & Grounding</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {result.sources.map((source, idx) => (
                          <a 
                            key={idx} 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs group-hover:bg-white group-hover:shadow-sm">
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-700 truncate group-hover:text-brand-600">{source.title}</p>
                              <p className="text-xs text-slate-400 truncate">{new URL(source.uri).hostname}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;