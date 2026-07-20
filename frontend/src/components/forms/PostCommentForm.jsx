import React from 'react';
import { Check, Image as ImageIcon } from 'lucide-react';

export default function PostCommentForm({ formData, setFormData, posts, displayedPosts, togglePostSelection, setShowAllPostsModal }) {
  return (
    <div className="flex-1 pr-4 space-y-8 overflow-y-auto h-full pb-20">
      
      {/* Section 1: Post Targeting */}
      <section className="bg-panel p-6 rounded-2xl border border-border relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-accent"></div>
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-accent text-black flex items-center justify-center text-xs">1</span>
          When a user comments on
        </h3>
        
        <div className="space-y-3">
          <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors ${formData.target_post_type === 'specific' ? 'border-accent bg-accent/5' : 'border-border hover:bg-white/5'}`}>
            <span className="font-medium">A specific post or reel</span>
            <input 
              type="radio" 
              name="post_type" 
              checked={formData.target_post_type === 'specific'}
              onChange={() => setFormData({...formData, target_post_type: 'specific'})}
              className="w-4 h-4 accent-accent"
            />
          </label>

          {formData.target_post_type === 'specific' && (
            <div className="mt-4 p-4 bg-black/30 rounded-xl border border-border">
              <p className="text-sm text-text-secondary mb-3">Select the post to monitor:</p>
              <div className="grid grid-cols-3 gap-2">
                {displayedPosts.map(post => {
                  const isSelected = formData.target_media_id === post.id;
                  return (
                    <div 
                      key={post.id}
                      onClick={() => togglePostSelection(post.id)}
                      className={`aspect-[3/4] rounded-lg overflow-hidden cursor-pointer relative border-2 ${isSelected ? 'border-accent' : 'border-transparent'}`}
                    >
                      {post.thumbnail_url || post.media_url ? (
                        <img src={post.thumbnail_url || post.media_url} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center"><ImageIcon size={20} className="text-gray-500" /></div>
                      )}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                          <Check size={12} className="text-black" />
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

          <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors ${formData.target_post_type === 'next' ? 'border-accent bg-accent/5' : 'border-border hover:bg-white/5'}`}>
            <span className="font-medium">Next post or reel</span>
            <input 
              type="radio" 
              name="post_type" 
              checked={formData.target_post_type === 'next'}
              onChange={() => setFormData({...formData, target_post_type: 'next', target_media_id: ''})}
              className="w-4 h-4 accent-accent"
            />
          </label>

          <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors ${formData.target_post_type === 'any' ? 'border-accent bg-accent/5' : 'border-border hover:bg-white/5'}`}>
            <span className="font-medium">Any post or reel</span>
            <input 
              type="radio" 
              name="post_type" 
              checked={formData.target_post_type === 'any'}
              onChange={() => setFormData({...formData, target_post_type: 'any', target_media_id: ''})}
              className="w-4 h-4 accent-accent"
            />
          </label>
        </div>
      </section>

      {/* Section 2: Keyword Targeting */}
      <section className="bg-panel p-6 rounded-2xl border border-border relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-accent"></div>
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-accent text-black flex items-center justify-center text-xs">2</span>
          And their comment has
        </h3>
        
        <div className="space-y-3">
          <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors ${formData.match_type !== 'any' ? 'border-accent bg-accent/5' : 'border-border hover:bg-white/5'}`}>
            <span className="font-medium">A specific keyword</span>
            <input 
              type="radio" 
              name="match_type_group" 
              checked={formData.match_type !== 'any'}
              onChange={() => setFormData({...formData, match_type: 'exact'})}
              className="w-4 h-4 accent-accent"
            />
          </label>

          {formData.match_type !== 'any' && (
            <div className="mt-4 p-4 bg-black/30 rounded-xl border border-border space-y-4">
              <div>
                <select 
                  value={formData.match_type} 
                  onChange={e => setFormData({...formData, match_type: e.target.value})}
                  className="w-full bg-gray-900 border border-border rounded-lg p-3 text-sm focus:border-accent outline-none appearance-none"
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
                  className="w-full bg-gray-900 border border-border rounded-lg p-3 text-sm focus:border-accent outline-none"
                />
              </div>
            </div>
          )}

          <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors ${formData.match_type === 'any' ? 'border-accent bg-accent/5' : 'border-border hover:bg-white/5'}`}>
            <span className="font-medium">Any word</span>
            <input 
              type="radio" 
              name="match_type_group" 
              checked={formData.match_type === 'any'}
              onChange={() => setFormData({...formData, match_type: 'any', trigger_keyword: ''})}
              className="w-4 h-4 accent-accent"
            />
          </label>
          
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center text-center mx-auto">
                <div>
                  <p className="text-sm text-text-secondary">Automatically reply to comments publicly to boost engagement</p>
                </div>
              </div>
              
              <div className="bg-black/30 rounded-xl border border-border p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold">Public Reply</h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={!!formData.public_reply_text}
                      onChange={(e) => setFormData({...formData, public_reply_text: e.target.checked ? "Thanks for your comment! I've sent you a DM 📩" : ""})}
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                  </label>
                </div>
                {!!formData.public_reply_text && (
                  <textarea 
                    placeholder="Type the public reply text here..."
                    value={formData.public_reply_text}
                    onChange={e => setFormData({...formData, public_reply_text: e.target.value})}
                    className="w-full bg-gray-900 border border-border rounded-lg p-3 text-sm focus:border-accent outline-none mt-2 h-20 resize-none"
                  ></textarea>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Optional Requirements */}
      <section className="bg-panel p-6 rounded-2xl border border-border relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-accent"></div>
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-accent text-black flex items-center justify-center text-xs font-bold">3</span>
          They will optionally get
        </h3>
        
        <div className="bg-black/30 rounded-xl border border-border p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h4 className="font-bold">an opening DM</h4>
              <p className="text-sm text-text-secondary">Send an initial message before the main content</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={!!formData.opening_message}
                onChange={(e) => setFormData({...formData, opening_message: e.target.checked ? "Hey! Thanks for your comment! 😍\n\nI'm so glad you're interested!" : "", button_text: e.target.checked ? "Send me the website" : ""})}
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>
          
          {(formData.opening_message !== '' && formData.opening_message !== null) && (
            <div className="mt-4 space-y-4 border-t border-gray-800 pt-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Opening Message</label>
                <textarea 
                  className="w-full bg-gray-900 border border-border rounded-lg p-3 text-sm focus:border-accent outline-none h-24 resize-none"
                  value={formData.opening_message}
                  onChange={(e) => setFormData({...formData, opening_message: e.target.value})}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Button text (what users tap to continue)</label>
                <input 
                  type="text"
                  className="w-full bg-gray-900 border border-border rounded-lg p-3 text-sm focus:border-accent outline-none"
                  value={formData.button_text || ''}
                  onChange={(e) => setFormData({...formData, button_text: e.target.value})}
                />
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-xs font-bold text-gray-500 mb-4">OR</div>

        <div className="bg-black/30 rounded-xl border border-border p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-sm">Require users to follow you before receiving the DM link</h4>
              <p className="text-xs text-accent mt-1">Unlocked Pro Feature 🚀</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={!!formData.require_follow}
                onChange={(e) => setFormData({...formData, require_follow: e.target.checked})}
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>
        </div>
      </section>

      {/* Section 4: Main Response */}
      <section className="bg-panel p-6 rounded-2xl border border-border relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-accent"></div>
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-accent text-black flex items-center justify-center text-xs font-bold">4</span>
          Main DM Content
        </h3>
        
        <div className="bg-black/30 rounded-xl border border-border p-4">
          <textarea 
            placeholder="Write your automated DM response here... This will be sent after they tap the button (if enabled) or immediately if no opening DM is set."
            value={formData.response_message}
            onChange={e => setFormData({...formData, response_message: e.target.value})}
            className="w-full bg-transparent border-none resize-none h-32 focus:outline-none text-sm"
          ></textarea>
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
            <span className="text-xs text-text-secondary">{formData.response_message.length}/1000 characters</span>
          </div>
        </div>

        <div className="mt-4 bg-black/30 rounded-xl border border-border p-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h4 className="font-bold">Add a custom link button</h4>
              <p className="text-sm text-text-secondary">Attach a URL button below your main response</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={!!formData.main_button_text}
                onChange={(e) => setFormData({...formData, main_button_text: e.target.checked ? "Click Here" : "", main_button_url: e.target.checked ? "https://" : ""})}
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>
          
          {!!formData.main_button_text && (
            <div className="mt-4 space-y-4 border-t border-gray-800 pt-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Button Text</label>
                <input 
                  type="text"
                  className="w-full bg-gray-900 border border-border rounded-lg p-3 text-sm focus:border-accent outline-none"
                  value={formData.main_button_text}
                  onChange={(e) => setFormData({...formData, main_button_text: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Button Link URL</label>
                <input 
                  type="url"
                  placeholder="https://example.com"
                  className="w-full bg-gray-900 border border-border rounded-lg p-3 text-sm focus:border-accent outline-none"
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
