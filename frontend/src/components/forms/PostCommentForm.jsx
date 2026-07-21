import React from 'react';
import { Check, Image as ImageIcon } from 'lucide-react';

export default function PostCommentForm({ formData, setFormData, posts, displayedPosts, togglePostSelection, setShowAllPostsModal }) {
  return (
    <div className="flex-1 pr-4 space-y-6 overflow-y-auto h-full pb-20 custom-scrollbar">
      
      {/* Section 1: Post Targeting */}
      <section className="macos-glass-panel p-6 rounded-3xl relative overflow-hidden shadow-sm">
        <h3 className="font-bold mb-5 flex items-center gap-3 text-lg text-white/90">
          <span className="w-7 h-7 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center text-sm font-semibold shadow-inner">1</span>
          When a user comments on
        </h3>
        
        <div className="space-y-3">
          <label className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all duration-300 ${formData.target_post_type === 'specific' ? 'border-blue-500/50 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-white/10 hover:bg-white/5 bg-black/20'}`}>
            <span className="font-medium text-white/90">A specific post or reel</span>
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${formData.target_post_type === 'specific' ? 'border-blue-500 bg-blue-500' : 'border-white/30'}`}>
              {formData.target_post_type === 'specific' && <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>
          </label>

          {formData.target_post_type === 'specific' && (
            <div className="mt-3 p-5 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
              <p className="text-sm text-text-secondary mb-3">Select the post to monitor:</p>
              <div className="grid grid-cols-3 gap-2">
                {displayedPosts.map(post => {
                  const isSelected = formData.target_media_id === post.id;
                  return (
                    <div 
                      key={post.id}
                      onClick={() => togglePostSelection(post.id)}
                      className={`aspect-[3/4] rounded-xl overflow-hidden cursor-pointer relative border-2 transition-all hover:scale-105 ${isSelected ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-transparent'}`}
                    >
                      {post.thumbnail_url || post.media_url ? (
                        <img src={post.thumbnail_url || post.media_url} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center"><ImageIcon size={20} className="text-gray-500" /></div>
                      )}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md">
                          <Check size={14} className="text-white" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              {posts.length > 3 && (
                <button 
                  onClick={() => setShowAllPostsModal(true)}
                  className="w-full mt-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors"
                >
                  Show More
                </button>
              )}
            </div>
          )}

          <label className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all duration-300 ${formData.target_post_type === 'next' ? 'border-blue-500/50 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-white/10 hover:bg-white/5 bg-black/20'}`}>
            <span className="font-medium text-white/90">Next post or reel</span>
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${formData.target_post_type === 'next' ? 'border-blue-500 bg-blue-500' : 'border-white/30'}`}>
              {formData.target_post_type === 'next' && <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>
          </label>

          <label className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all duration-300 ${formData.target_post_type === 'any' ? 'border-blue-500/50 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-white/10 hover:bg-white/5 bg-black/20'}`}>
            <span className="font-medium text-white/90">Any post or reel</span>
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${formData.target_post_type === 'any' ? 'border-blue-500 bg-blue-500' : 'border-white/30'}`}>
              {formData.target_post_type === 'any' && <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>
          </label>
        </div>
      </section>

      {/* Section 2: Keyword Targeting */}
      <section className="macos-glass-panel p-6 rounded-3xl relative overflow-hidden shadow-sm">
        <h3 className="font-bold mb-5 flex items-center gap-3 text-lg text-white/90">
          <span className="w-7 h-7 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center text-sm font-semibold shadow-inner">2</span>
          And their comment has
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
                <select 
                  value={formData.match_type} 
                  onChange={e => setFormData({...formData, match_type: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm focus:border-blue-500 focus:bg-black/60 outline-none appearance-none transition-all backdrop-blur-md"
                >
                  <option value="exact">Message is exactly</option>
                  <option value="partial">Message contains</option>
                </select>
              </div>
              <div>
                <input 
                  type="text" 
                  placeholder="Type keyword here... e.g. LINK"
                  value={formData.trigger_keyword}
                  onChange={e => setFormData({...formData, trigger_keyword: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm focus:border-blue-500 focus:bg-black/60 outline-none transition-all backdrop-blur-md placeholder:text-gray-500"
                />
              </div>
            </div>
          )}

          <label className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all duration-300 ${formData.match_type === 'any' ? 'border-blue-500/50 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-white/10 hover:bg-white/5 bg-black/20'}`}>
            <span className="font-medium text-white/90">Any word</span>
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${formData.match_type === 'any' ? 'border-blue-500 bg-blue-500' : 'border-white/30'}`}>
              {formData.match_type === 'any' && <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>
          </label>
          
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center text-center mx-auto">
                <div>
                  <p className="text-sm text-gray-400">Automatically reply to comments publicly to boost engagement</p>
                </div>
              </div>
              
              <div className="bg-black/30 rounded-2xl border border-white/5 p-5 shadow-inner">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-white/90">Public Reply</h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={!!formData.public_reply_text}
                      onChange={(e) => setFormData({...formData, public_reply_text: e.target.checked ? "Thanks for your comment! I've sent you a DM 📩" : ""})}
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>
                {!!formData.public_reply_text && (
                  <textarea 
                    placeholder="Type the public reply text here..."
                    value={formData.public_reply_text}
                    onChange={e => setFormData({...formData, public_reply_text: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm focus:border-blue-500 outline-none mt-3 h-24 resize-none transition-all placeholder:text-gray-500"
                  ></textarea>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Optional Requirements */}
      <section className="macos-glass-panel p-6 rounded-3xl relative overflow-hidden shadow-sm">
        <h3 className="font-bold mb-5 flex items-center gap-3 text-lg text-white/90">
          <span className="w-7 h-7 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center text-sm font-semibold shadow-inner">3</span>
          They will optionally get
        </h3>
        
        <div className="bg-black/30 rounded-2xl border border-white/5 p-5 mb-5 shadow-inner">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h4 className="font-bold text-white/90">An opening DM</h4>
              <p className="text-sm text-gray-400">Send an initial message before the main content</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={!!formData.opening_message}
                onChange={(e) => setFormData({...formData, opening_message: e.target.checked ? "Hey! Thanks for your comment! 😍\n\nI'm so glad you're interested!" : "", button_text: e.target.checked ? "Send me the website" : ""})}
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
          
          {(formData.opening_message !== '' && formData.opening_message !== null) && (
            <div className="mt-5 space-y-4 border-t border-white/10 pt-5">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-300">Opening Message</label>
                <textarea 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm focus:border-blue-500 outline-none h-24 resize-none transition-all"
                  value={formData.opening_message}
                  onChange={(e) => setFormData({...formData, opening_message: e.target.value})}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-300">Button text (what users tap to continue)</label>
                <input 
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm focus:border-blue-500 outline-none transition-all"
                  value={formData.button_text || ''}
                  onChange={(e) => setFormData({...formData, button_text: e.target.value})}
                />
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-xs font-bold text-gray-500 mb-5 relative">
          <span className="bg-[#12151e] px-3 relative z-10">OR</span>
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10"></div>
        </div>

        <div className="bg-black/30 rounded-2xl border border-white/5 p-5 shadow-inner">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-sm text-white/90">Require users to follow you before receiving the DM link</h4>
              <p className="text-xs text-blue-400 mt-1">Unlocked Pro Feature 🚀</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={!!formData.require_follow}
                onChange={(e) => setFormData({...formData, require_follow: e.target.checked})}
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </section>

      {/* Section 4: Main Response */}
      <section className="macos-glass-panel p-6 rounded-3xl relative overflow-hidden shadow-sm">
        <h3 className="font-bold mb-5 flex items-center gap-3 text-lg text-white/90">
          <span className="w-7 h-7 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center text-sm font-semibold shadow-inner">4</span>
          Main DM Content
        </h3>
        
        <div className="bg-black/30 rounded-2xl border border-white/5 p-5 shadow-inner">
          <textarea 
            placeholder="Write your automated DM response here... This will be sent after they tap the button (if enabled) or immediately if no opening DM is set."
            value={formData.response_message}
            onChange={e => setFormData({...formData, response_message: e.target.value})}
            className="w-full bg-transparent border-none resize-none h-32 focus:outline-none text-sm placeholder:text-gray-500"
          ></textarea>
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10">
            <span className="text-xs text-gray-400 font-medium">{formData.response_message.length}/1000 characters</span>
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm focus:border-blue-500 outline-none transition-all placeholder:text-gray-600"
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
