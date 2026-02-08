import React, { useState } from 'react';
import { X, Sparkles, Download, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { generateValentineImage } from '../services/geminiService';
import { ImageSize } from '../types';

interface ImageGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImageSize>('1K');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const fullPrompt = `A high quality, romantic valentine's day image: ${prompt}. Photorealistic, cinematic lighting, 8k resolution, magical atmosphere.`;
      const imageUrl = await generateValentineImage(fullPrompt, size);
      setGeneratedImage(imageUrl);
    } catch (err: any) {
      setError(err.message || "Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-rose-100 flex justify-between items-center bg-rose-50/50">
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="text-rose-500" />
              AI Valentine Gift
            </h2>
            <p className="text-sm text-slate-500">Create a unique memory with Gemini 3 Pro</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-rose-100 rounded-full transition-colors text-slate-500"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-6">
            
            {/* Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  What would you like to create?
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A cute teddy bear holding a red heart in a snowy forest..."
                  className="w-full p-4 rounded-xl border border-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all resize-none h-24 text-slate-700 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Image Resolution
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['1K', '2K', '4K'] as ImageSize[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`py-2 px-4 rounded-lg font-medium text-sm transition-all border ${
                        size === s 
                          ? 'bg-rose-500 text-white border-rose-500 shadow-md' 
                          : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                onClick={handleGenerate}
                disabled={loading || !prompt}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
                  ${loading || !prompt 
                    ? 'bg-slate-300 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-rose-500 to-purple-600 hover:shadow-xl hover:scale-[1.02]'}
                `}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" /> Generating Magic...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} /> Generate Image
                  </>
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 text-sm">
                <AlertCircle className="shrink-0 mt-0.5" size={16} />
                <p>{error}</p>
              </div>
            )}

            {/* Result Area */}
            <div className="mt-8 border-t border-slate-100 pt-8">
               {generatedImage ? (
                 <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-slate-100 group">
                      <img 
                        src={generatedImage} 
                        alt="Generated Valentine" 
                        className="w-full h-auto object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <a 
                          href={generatedImage} 
                          download={`valentine-gift-${Date.now()}.png`}
                          className="px-6 py-3 bg-white text-slate-900 rounded-full font-bold flex items-center gap-2 hover:bg-rose-50 transition-colors transform hover:scale-105"
                        >
                          <Download size={20} /> Download Gift
                        </a>
                      </div>
                    </div>
                    <p className="text-center text-sm text-slate-500 italic">
                      "A masterpiece generated just for you."
                    </p>
                 </div>
               ) : (
                 !loading && (
                   <div className="flex flex-col items-center justify-center py-12 text-slate-300 border-2 border-dashed border-slate-200 rounded-2xl">
                     <ImageIcon size={48} className="mb-4 opacity-50" />
                     <p>Your creation will appear here</p>
                   </div>
                 )
               )}
            </div>

          </div>
        </div>
        
        {/* Footer info about Auth */}
        <div className="p-4 bg-slate-50 text-xs text-center text-slate-400 border-t border-slate-200">
          Powered by Gemini 3 Pro Preview. Requires API Key selection.
        </div>
      </div>
    </div>
  );
};
