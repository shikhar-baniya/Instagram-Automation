import React from 'react';

export default function DMKeywordForm({ formData, setFormData }) {
  return (
    <div className="flex-1 pr-4 space-y-6 overflow-y-auto h-full pb-20 custom-scrollbar">
      
      {/* Step 1 */}
      <section className="macos-glass-panel p-6 rounded-3xl relative overflow-hidden shadow-sm">
        <h3 className="font-bold mb-5 flex items-center gap-3 text-lg text-white/90">
          <span className="w-7 h-7 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center text-sm font-semibold shadow-inner">1</span>
          When someone DMs you with
        </h3>
        
        <div className="space-y-3">
          <label className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all duration-300 ${formData.match_type !== 'any' ? 'border-blue-500/50 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-white/10 hover:bg-white/5 bg-black/20'}`}>
            <span className="font-medium text-white/90">A specific keyword</span>
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${formData.match_type !== 'any' ? 'border-blue-500 bg-blue-500' : 'border-white/30'}`}>
              {formData.match_type !== 'any' && <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>
          </label>

          {formData.match_type !== 'any' && (
            <div className="mt-3 p-5 bg-black/40 rounded-2xl border border-white/5 shadow-inner space-y-4">
              <div>
                <input 
                  type="text" 
                  placeholder="Type keyword here... e.g. LINK"
                  value={formData.trigger_keyword}
                  onChange={e => setFormData({...formData, trigger_keyword: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm focus:border-blue-500 outline-none transition-all placeholder:text-gray-500"
                />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2">Suggested keywords:</p>
                <div className="flex gap-2">
                  {['link', 'shop', 'order', 'pricing'].map(kw => (
                    <button 
                      key={kw}
                      onClick={() => setFormData({...formData, trigger_keyword: kw})}
                      className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs transition-all shadow-sm"
                    >
                      {kw}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <label className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all duration-300 ${formData.match_type === 'any' ? 'border-blue-500/50 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-white/10 hover:bg-white/5 bg-black/20'}`}>
            <span className="font-medium text-white/90">Any word</span>
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${formData.match_type === 'any' ? 'border-blue-500 bg-blue-500' : 'border-white/30'}`}>
              {formData.match_type === 'any' && <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>
          </label>
        </div>
      </section>

      {/* Step 2 */}
      <section className="macos-glass-panel p-6 rounded-3xl relative overflow-hidden shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-bold flex items-center gap-3 text-lg text-white/90">
            <span className="w-7 h-7 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center text-sm font-semibold shadow-inner">2</span>
            They will get a DM with
          </h3>
          <button className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
            Use Template
          </button>
        </div>
        
        <div className="bg-black/30 rounded-2xl border border-white/5 p-5 shadow-inner">
          <textarea 
            placeholder="Write your automated DM response here..."
            value={formData.response_message}
            onChange={e => setFormData({...formData, response_message: e.target.value})}
            className="w-full bg-transparent border-none resize-none h-32 focus:outline-none text-sm placeholder:text-gray-500"
          ></textarea>
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10">
            <span className="text-xs text-gray-400">{formData.response_message.length}/1000 characters</span>
          </div>
        </div>

        <div className="mt-5 bg-black/30 rounded-2xl border border-white/5 p-5 shadow-inner">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h4 className="font-bold text-white/90">Add a custom link button</h4>
              <p className="text-sm text-gray-400">Attach a URL button below your main response</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={!!formData.main_button_text}
                onChange={(e) => setFormData({...formData, main_button_text: e.target.checked ? "Click Here" : "", main_button_url: e.target.checked ? "https://" : ""})}
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
          
          {!!formData.main_button_text && (
            <div className="mt-5 space-y-4 border-t border-white/10 pt-5">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-300">Button Text</label>
                <input 
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm focus:border-blue-500 outline-none transition-all"
                  value={formData.main_button_text}
                  onChange={(e) => setFormData({...formData, main_button_text: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-300">Button Link URL</label>
                <input 
                  type="url"
                  placeholder="https://example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm focus:border-blue-500 outline-none transition-all placeholder:text-gray-500"
                  value={formData.main_button_url}
                  onChange={(e) => setFormData({...formData, main_button_url: e.target.value})}
                />
              </div>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
