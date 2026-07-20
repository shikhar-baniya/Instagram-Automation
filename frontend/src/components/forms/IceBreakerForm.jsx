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
    <div className="flex-1 pr-4 space-y-8 overflow-y-auto h-full pb-20">
      
      <div className="bg-panel p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 mb-6">
        <h2 className="text-xl font-bold mb-2 text-emerald-400">Ice Breaker Questions</h2>
        <p className="text-sm text-text-secondary">
          These questions appear when a user opens a DM with your page for the very first time. 
          You can add up to 4 questions.
        </p>
      </div>

      {config.map((item, index) => (
        <section key={index} className="bg-panel p-6 rounded-2xl border border-border relative overflow-hidden mb-6">
          <div className="absolute top-0 left-0 w-1 h-full bg-accent"></div>
          
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-accent text-black flex items-center justify-center text-xs">
                {index + 1}
              </span>
              Question & Response
            </h3>
            
            {config.length > 1 && (
              <button 
                onClick={() => removeQuestion(index)}
                className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                <Trash2 size={16} /> Remove
              </button>
            )}
          </div>
          
          <div className="space-y-6">
            {/* Question Input */}
            <div className="p-4 bg-black/30 rounded-xl border border-border">
              <label className="block text-sm font-medium mb-2 text-gray-300">
                When they tap this question... <span className="text-text-secondary text-xs">(Max 80 chars)</span>
              </label>
              <input 
                type="text" 
                placeholder="e.g. What are your pricing plans?"
                value={item.question || ''}
                maxLength={80}
                onChange={e => updateConfigItem(index, 'question', e.target.value)}
                className="w-full bg-gray-900 border border-border rounded-lg p-3 text-sm focus:border-accent outline-none mb-1"
              />
              <div className="text-right text-xs text-text-secondary">
                {(item.question || '').length}/80
              </div>
            </div>

            {/* Response Textarea */}
            <div className="p-4 bg-black/30 rounded-xl border border-border">
              <label className="block text-sm font-medium mb-2 text-gray-300">
                They will get this automated DM response:
              </label>
              <textarea 
                placeholder="Write your automated DM response here..."
                value={item.response || ''}
                onChange={e => updateConfigItem(index, 'response', e.target.value)}
                className="w-full bg-gray-900 border border-border rounded-lg p-3 text-sm focus:border-accent outline-none resize-none h-32"
              ></textarea>
              <div className="text-right text-xs text-text-secondary mt-1">
                {(item.response || '').length}/1000
              </div>
            </div>
          </div>
        </section>
      ))}

      {config.length < 4 && (
        <button 
          onClick={addQuestion}
          className="w-full py-4 border-2 border-dashed border-border rounded-2xl text-text-secondary hover:text-white hover:border-accent/50 hover:bg-accent/5 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Add another question ({config.length}/4)
        </button>
      )}

    </div>
  );
}
