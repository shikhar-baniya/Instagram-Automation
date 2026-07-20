import React from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NewAutomationModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSelect = (type) => {
    onClose();
    navigate(`/new-automation?type=${type}`);
  };

  const templatesClick = () => {
    onClose();
    navigate('/templates');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-panel w-full max-w-4xl rounded-2xl shadow-2xl relative z-10 border border-border">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold">Start a new automation</h2>
            <p className="text-text-secondary mt-1">Choose what triggers it, or pick a ready-made template.</p>
          </div>
          <button onClick={onClose} className="text-text-secondary hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Comments Card */}
            <div 
              onClick={() => handleSelect('post_comment')}
              className="bg-[#f0f9ff]/5 border border-border rounded-xl p-6 cursor-pointer hover:border-blue-500/50 hover:bg-[#f0f9ff]/10 transition-all group flex flex-col"
            >
              <div className="h-32 bg-[#ecfcff]/10 rounded-lg mb-6 flex items-center justify-center border border-blue-500/20">
                 <div className="w-3/4 bg-white/10 rounded p-3 space-y-2">
                   <div className="h-4 bg-white/20 rounded-full w-full"></div>
                   <div className="h-4 bg-white/20 rounded-full w-5/6"></div>
                   <div className="flex gap-2 items-center pt-2">
                     <div className="w-4 h-4 rounded-full bg-white/20"></div>
                     <div className="h-2 bg-white/20 rounded-full w-1/2"></div>
                   </div>
                 </div>
              </div>
              <div className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">Comments</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">DM on post or reel</h3>
              <p className="text-sm text-text-secondary mb-6 flex-1">When someone comments a keyword</p>
              <div className="text-sm font-bold flex items-center justify-between">
                Start here <span className="text-text-secondary group-hover:text-blue-400 group-hover:translate-x-1 transition-all">→</span>
              </div>
            </div>

            {/* Stories Card */}
            <div 
              onClick={() => handleSelect('story_reply')}
              className="bg-[#f0f9ff]/5 border border-border rounded-xl p-6 cursor-pointer hover:border-blue-500/50 hover:bg-[#f0f9ff]/10 transition-all group flex flex-col"
            >
              <div className="h-32 bg-[#eff6ff]/10 rounded-lg mb-6 flex items-center justify-center border border-blue-500/20">
                 <div className="w-16 h-24 border-[3px] border-white/20 rounded-xl flex items-center justify-center relative">
                   <div className="w-8 h-8 rounded-full border-2 border-white/20 absolute -right-4 top-10 flex items-center justify-center bg-panel">
                     <div className="w-3 h-3 rounded-full bg-white/30"></div>
                   </div>
                 </div>
              </div>
              <div className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">Stories</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">DM on story</h3>
              <p className="text-sm text-text-secondary mb-6 flex-1">When someone reacts or replies</p>
              <div className="text-sm font-bold flex items-center justify-between">
                Start here <span className="text-text-secondary group-hover:text-blue-400 group-hover:translate-x-1 transition-all">→</span>
              </div>
            </div>

            {/* Keywords Card */}
            <div 
              onClick={() => handleSelect('dm_keyword')}
              className="bg-[#fdf4ff]/5 border border-border rounded-xl p-6 cursor-pointer hover:border-fuchsia-500/50 hover:bg-[#fdf4ff]/10 transition-all group flex flex-col"
            >
              <div className="h-32 bg-[#fdf4ff]/10 rounded-lg mb-6 flex items-center justify-center border border-fuchsia-500/20">
                 <div className="w-3/4 space-y-3">
                   <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-tl-sm w-3/4">
                     <div className="h-2 bg-white/20 rounded-full w-full"></div>
                   </div>
                   <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-tr-sm w-3/4 ml-auto">
                     <div className="h-2 bg-white/20 rounded-full w-full"></div>
                   </div>
                 </div>
              </div>
              <div className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">Keywords</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-fuchsia-400 transition-colors">DM on keyword</h3>
              <p className="text-sm text-text-secondary mb-6 flex-1">When someone DMs a keyword</p>
              <div className="text-sm font-bold flex items-center justify-between">
                Start here <span className="text-text-secondary group-hover:text-fuchsia-400 group-hover:translate-x-1 transition-all">→</span>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-center bg-black/20 rounded-b-2xl">
          <button 
            onClick={templatesClick}
            className="text-sm font-bold text-text-secondary hover:text-white transition-colors flex items-center gap-2"
          >
            Browse templates →
          </button>
        </div>
      </div>
    </div>
  );
}
