import React, { useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function IceBreakerForm({ formData, setFormData }) {
  
  useEffect(() => {
    // Initialize config if it doesn't exist
    if (!formData.ice_breakers_config || (Array.isArray(formData.ice_breakers_config) && formData.ice_breakers_config.length === 0)) {
      setFormData(prev => ({ 
        ...prev, 
        match_type: 'exact',
        ice_breakers_config: [{ question: '', response: '' }] 
      }));
    } else if (typeof formData.ice_breakers_config === 'string') {
        try {
            setFormData(prev => ({
                ...prev,
                ice_breakers_config: JSON.parse(formData.ice_breakers_config)
            }));
        } catch (e) {}
    }
  }, []);

  const config = Array.isArray(formData.ice_breakers_config) ? formData.ice_breakers_config : [];

  const updateConfigItem = (index, field, value) => {
    const newConfig = [...config];
    newConfig[index][field] = value;
    setFormData({ ...formData, ice_breakers_config: newConfig });
  };

  const addQuestion = () => {
    if (config.length < 4) {
      setFormData({ 
        ...formData, 
        ice_breakers_config: [...config, { question: '', response: '' }] 
      });
    }
  };

  const removeQuestion = (index) => {
    const newConfig = config.filter((_, i) => i !== index);
    // If we removed the last one, just leave an empty one
    if (newConfig.length === 0) {
      newConfig.push({ question: '', response: '' });
    }
    setFormData({ ...formData, ice_breakers_config: newConfig });
  };

  return (
    <div className="flex-1 pr-4 space-y-6 overflow-y-auto h-full pb-20 custom-scrollbar">
      
      <div className="macos-glass-panel p-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 mb-6 shadow-sm">
        <h2 className="text-xl font-bold mb-2 text-emerald-400">Ice Breaker Questions</h2>
        <p className="text-sm text-gray-300">
          These questions appear when a user opens a DM with your page for the very first time. 
          You can add up to 4 questions.
        </p>
      </div>

      {config.map((item, index) => (
        <section key={index} className="macos-glass-panel p-6 rounded-3xl relative overflow-hidden mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-bold flex items-center gap-3 text-lg text-white/90">
              <span className="w-7 h-7 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center text-sm font-semibold shadow-inner">
                {index + 1}
              </span>
              Question & Response
            </h3>
            
            {config.length > 1 && (
              <button 
                onClick={() => removeQuestion(index)}
                className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-xl transition-colors flex items-center gap-2 text-sm shadow-sm"
              >
                <Trash2 size={16} /> Remove
              </button>
            )}
          </div>
          
          <div className="space-y-5">
            {/* Question Input */}
            <div className="p-5 bg-black/30 rounded-2xl border border-white/5 shadow-inner">
              <label className="block text-sm font-medium mb-2 text-gray-300">
                When they tap this question... <span className="text-gray-500 text-xs">(Max 80 chars)</span>
              </label>
              <input 
                type="text" 
                placeholder="e.g. What are your pricing plans?"
                value={item.question || ''}
                maxLength={80}
                onChange={e => updateConfigItem(index, 'question', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm focus:border-blue-500 outline-none transition-all placeholder:text-gray-500 mb-1"
              />
              <div className="text-right text-xs text-gray-500">
                {(item.question || '').length}/80
              </div>
            </div>

            {/* Response Textarea */}
            <div className="p-5 bg-black/30 rounded-2xl border border-white/5 shadow-inner">
              <label className="block text-sm font-medium mb-2 text-gray-300">
                They will get this automated DM response:
              </label>
              <textarea 
                placeholder="Write your automated DM response here..."
                value={item.response || ''}
                onChange={e => updateConfigItem(index, 'response', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm focus:border-blue-500 outline-none transition-all resize-none h-32 placeholder:text-gray-500"
              ></textarea>
              <div className="text-right text-xs text-gray-500 mt-1">
                {(item.response || '').length}/1000
              </div>
            </div>
          </div>
        </section>
      ))}

      {config.length < 4 && (
        <button 
          onClick={addQuestion}
          className="w-full py-4 border-2 border-dashed border-white/20 rounded-3xl text-gray-400 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center gap-2 macos-glass-panel"
        >
          <Plus size={20} />
          Add another question ({config.length}/4)
        </button>
      )}

    </div>
  );
}
