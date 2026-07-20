import React from 'react';

export default function StoryReplyForm({ formData, setFormData }) {
  return (
    <div className="flex-1 pr-4 space-y-8 overflow-y-auto h-full pb-20">
      
      {/* Step 1 */}
      <section className="bg-panel p-6 rounded-2xl border border-border relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-accent"></div>
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-accent text-black flex items-center justify-center text-xs">1</span>
          When a user replies to
        </h3>
        
        <div className="space-y-3">
          <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors ${formData.target_story_type === 'specific' ? 'border-accent bg-accent/5' : 'border-border hover:bg-white/5'}`}>
            <span className="font-medium">A specific story</span>
            <input 
              type="radio" 
              name="story_type" 
              checked={formData.target_story_type === 'specific'}
              onChange={() => setFormData({...formData, target_story_type: 'specific'})}
              className="w-4 h-4 accent-accent"
            />
          </label>
          {formData.target_story_type === 'specific' && (
            <div className="mt-2 p-4 bg-black/30 rounded-xl border border-border flex justify-center">
              <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors">
                Show More (Select Story)
              </button>
            </div>
          )}

          <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors ${formData.target_story_type === 'next' ? 'border-accent bg-accent/5' : 'border-border hover:bg-white/5'}`}>
            <span className="font-medium">Next story</span>
            <input 
              type="radio" 
              name="story_type" 
              checked={formData.target_story_type === 'next'}
              onChange={() => setFormData({...formData, target_story_type: 'next'})}
              className="w-4 h-4 accent-accent"
            />
          </label>

          <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors ${formData.target_story_type === 'any' ? 'border-accent bg-accent/5' : 'border-border hover:bg-white/5'}`}>
            <span className="font-medium">Any story</span>
            <input 
              type="radio" 
              name="story_type" 
              checked={formData.target_story_type === 'any'}
              onChange={() => setFormData({...formData, target_story_type: 'any'})}
              className="w-4 h-4 accent-accent"
            />
          </label>
        </div>
      </section>

      {/* Step 2 */}
      <section className="bg-panel p-6 rounded-2xl border border-border relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-accent"></div>
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-accent text-black flex items-center justify-center text-xs">2</span>
          And his/her reply contains
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
        </div>
      </section>

      {/* Step 3 */}
      <section className="bg-panel p-6 rounded-2xl border border-border relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-accent"></div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-accent text-black flex items-center justify-center text-xs font-bold">3</span>
            They will get a DM with
          </h3>
        </div>
        
        <div className="bg-black/30 rounded-xl border border-border p-4">
          <textarea 
            placeholder="Write your automated DM response here..."
            value={formData.response_message}
            onChange={e => setFormData({...formData, response_message: e.target.value})}
            className="w-full bg-transparent border-none resize-none h-32 focus:outline-none text-sm"
          ></textarea>
        </div>

        <div className="mt-4 bg-black/30 rounded-xl border border-border p-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h4 className="font-bold">Add a custom link button</h4>
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
