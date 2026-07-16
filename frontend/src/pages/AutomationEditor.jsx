import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Smartphone, Check, ArrowLeft, Image as ImageIcon, X } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function AutomationEditor() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const preselectPostId = location.state?.preselectPostId;

  const [posts, setPosts] = useState([]);
  const [showAllPostsModal, setShowAllPostsModal] = useState(false);
  const [formData, setFormData] = useState({
    target_post_type: preselectPostId ? 'specific' : 'any',
    target_media_id: preselectPostId || '',
    match_type: 'exact',
    trigger_keyword: '',
    response_message: '',
    opening_message: '',
    button_text: '',
    require_follow: false,
    main_button_text: '',
    main_button_url: '',
    public_reply_text: ''
  });

  useEffect(() => {
    fetchPosts();
    if (id) {
      fetchRule();
    }
  }, [id]);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/media`);
      setPosts(res.data || []);
    } catch (error) {
      console.error('Failed to fetch media', error);
    }
  };

  const fetchRule = async () => {
    try {
      const res = await axios.get(`${API_BASE}/rules`);
      const rule = res.data.find(r => r.id === parseInt(id));
      if (rule) {
        setFormData({
          target_post_type: rule.target_post_type,
          target_media_id: rule.target_media_id || '',
          match_type: rule.match_type,
          trigger_keyword: rule.trigger_keyword || '',
          response_message: rule.response_message || '',
          opening_message: rule.opening_message || '',
          button_text: rule.button_text || '',
          require_follow: rule.require_follow ? true : false,
          main_button_text: rule.main_button_text || '',
          main_button_url: rule.main_button_url || '',
          public_reply_text: rule.public_reply_text || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch rule', error);
    }
  };

  const handleSave = async () => {
    try {
      if (id) {
        await axios.put(`${API_BASE}/rules/${id}`, formData);
      } else {
        await axios.post(`${API_BASE}/rules`, formData);
      }
      navigate('/');
    } catch (error) {
      console.error('Failed to save rule', error);
    }
  };

  const togglePostSelection = (postId) => {
    // Current requirement: A single automation should be for a single post only.
    setFormData({ ...formData, target_media_id: postId });
  };

  let displayedPosts = posts.slice(0, 3);
  if (formData.target_media_id && formData.target_post_type === 'specific') {
    const isIncluded = displayedPosts.find(p => p.id === formData.target_media_id);
    if (!isIncluded) {
      const selected = posts.find(p => p.id === formData.target_media_id);
      if (selected) {
        displayedPosts = [selected, ...posts.filter(p => p.id !== formData.target_media_id)].slice(0, 3);
      }
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Topbar */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-border shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold">{id ? 'Edit Automation' : 'New Automation'}</h2>
        </div>
        <div className="flex gap-4">
          {id && (
            <button onClick={async () => {
              if(confirm('Are you sure you want to delete this automation?')) {
                await axios.delete(`${API_BASE}/rules/${id}`);
                navigate('/');
              }
            }} className="px-6 py-2 bg-red-500/20 text-red-500 font-semibold rounded-lg hover:bg-red-500/30 transition-colors">
              Delete
            </button>
          )}
          <button onClick={() => navigate('/')} className="px-6 py-2 rounded-lg font-medium hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="px-6 py-2 bg-accent text-black font-semibold rounded-lg hover:bg-accent-hover transition-colors shadow-neon">
            Save Automation
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-12 overflow-hidden">
        {/* Left: Mobile Preview */}
        <div className="hidden lg:flex w-1/2 items-center justify-center bg-gray-900/30 rounded-3xl border border-border p-8 h-full shrink-0">
          <div className="w-[320px] h-[650px] bg-black rounded-[40px] border-[8px] border-gray-800 relative overflow-hidden shadow-2xl flex flex-col">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-10"></div>
            
            {/* Header */}
            <div className="h-16 border-b border-gray-800 flex items-center px-4 pt-4 gap-3 bg-black z-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-fuchsia-600 p-[2px]">
                <div className="w-full h-full bg-black rounded-full"></div>
              </div>
              <span className="font-semibold text-sm">@bingewithshikhar</span>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto bg-black">
              <div className="flex justify-center my-2">
                <span className="text-[10px] text-gray-500 font-medium">TODAY</span>
              </div>
              
              <div className="self-end max-w-[80%]">
                <div className="bg-gray-800 text-white rounded-2xl rounded-tr-sm px-4 py-2 text-sm shadow-sm border border-gray-700">
                  {formData.trigger_keyword ? formData.trigger_keyword : '...'}
                </div>
              </div>
              
              {/* Opening Message Preview */}
              {(formData.opening_message || formData.button_text) && (
                <div className="self-start max-w-[80%] flex flex-col gap-1 w-full">
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-yellow-400 to-fuchsia-600 p-[1px] shrink-0 mt-auto">
                      <div className="w-full h-full bg-black rounded-full"></div>
                    </div>
                    <div className="bg-gray-800 text-white rounded-2xl rounded-tl-sm px-4 py-2 text-sm shadow-sm relative border border-gray-700">
                      {formData.opening_message || "..."}
                    </div>
                  </div>
                  {formData.button_text && (
                    <div className="ml-8 border border-gray-700 text-blue-400 font-semibold text-center py-2 rounded-xl text-sm mt-1 bg-gray-900/50">
                      {formData.button_text}
                    </div>
                  )}
                </div>
              )}
              
              {/* Main Response Message Preview */}
              {formData.response_message && (
                <div className="self-start max-w-[80%] flex flex-col gap-1 w-full relative pb-5">
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full p-[1px] shrink-0 mt-auto opacity-0"></div>
                    <div className="bg-accent/10 border border-accent/20 text-white rounded-2xl rounded-tl-sm px-4 py-2 text-sm shadow-sm relative w-full">
                      {formData.response_message}
                      {formData.main_button_text && formData.main_button_url && (
                        <div className="mt-3 border-t border-accent/20 pt-2 text-center text-accent font-semibold">
                          {formData.main_button_text}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-10 text-[10px] text-gray-500 whitespace-nowrap">Sent by automation</div>
                </div>
              )}
            </div>

            {/* Input bar */}
            <div className="h-16 border-t border-gray-800 flex items-center px-4 gap-3 bg-black">
              <div className="w-full h-9 bg-gray-900 rounded-full border border-gray-800 flex items-center px-4 text-xs text-gray-500">
                Message...
              </div>
            </div>
          </div>
        </div>

        {/* Right: Settings Form */}
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
      </div>

      {/* Show More Posts Modal */}
      {showAllPostsModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-panel border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center bg-gray-900/50">
              <h3 className="font-bold text-lg">Select a post</h3>
              <button onClick={() => setShowAllPostsModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
                {posts.map(post => {
                  const isSelected = formData.target_media_id === post.id;
                  return (
                    <div 
                      key={post.id}
                      onClick={() => {
                        togglePostSelection(post.id);
                        setShowAllPostsModal(false);
                      }}
                      className={`aspect-[3/4] rounded-lg overflow-hidden cursor-pointer relative border-2 ${isSelected ? 'border-accent' : 'border-transparent'}`}
                    >
                      {post.thumbnail_url || post.media_url ? (
                        <img src={post.thumbnail_url || post.media_url} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center"><ImageIcon size={20} className="text-gray-500" /></div>
                      )}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-accent rounded-full flex items-center justify-center shadow-lg">
                          <Check size={12} className="text-black" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
