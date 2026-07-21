import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Smartphone, Check, ArrowLeft, Image as ImageIcon, X } from 'lucide-react';
import PostCommentForm from '../components/forms/PostCommentForm';
import DMKeywordForm from '../components/forms/DMKeywordForm';
import StoryReplyForm from '../components/forms/StoryReplyForm';
import IceBreakerForm from '../components/forms/IceBreakerForm';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function AutomationEditor() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const preselectPostId = location.state?.preselectPostId;
  const template = location.state?.template;

  const searchParams = new URLSearchParams(location.search);
  const typeParam = searchParams.get('type') || 'post_comment';

  const [posts, setPosts] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showAllPostsModal, setShowAllPostsModal] = useState(false);
  const [formData, setFormData] = useState({
    trigger_type: typeParam,
    target_story_type: 'any',
    target_post_type: template?.target_post_type || (preselectPostId ? 'specific' : 'any'),
    target_media_id: preselectPostId || '',
    match_type: template?.match_type || 'exact',
    trigger_keyword: template?.trigger_keyword || '',
    response_message: template?.response_message || '',
    opening_message: template?.opening_message || '',
    button_text: template?.button_text || '',
    require_follow: template?.require_follow || false,
    main_button_text: template?.main_button_text || '',
    main_button_url: template?.main_button_url || '',
    public_reply_text: template?.public_reply_text || ''
  });

  useEffect(() => {
    fetchPosts();
    if (id) {
      fetchRule();
    }
  }, [id]);

  const fetchPosts = async (after = null) => {
    try {
      if (after) setLoadingMore(true);
      const url = after ? `${API_BASE}/media?after=${after}` : `${API_BASE}/media`;
      const res = await axios.get(url);
      
      if (after) {
        setPosts(prev => [...prev, ...(res.data.data || [])]);
      } else {
        setPosts(res.data.data || []);
      }
      
      setNextCursor(res.data.paging?.cursors?.after || null);
    } catch (error) {
      console.error('Failed to fetch media', error);
    } finally {
      if (after) setLoadingMore(false);
    }
  };

  const fetchRule = async () => {
    try {
      const res = await axios.get(`${API_BASE}/rules`);
      const rule = res.data.find(r => r.id === parseInt(id));
      if (rule) {
        setFormData({
          trigger_type: rule.trigger_type || 'post_comment',
          target_story_type: rule.target_story_type || 'any',
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
          public_reply_text: rule.public_reply_text || '',
          ice_breakers_config: rule.ice_breakers_config
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
    <div className="flex flex-col h-[calc(100vh-4rem)] relative">
      
      {/* Background Decorator for Glassmorphism */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-10 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Topbar */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10 shrink-0 relative z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-white/10 rounded-full transition-all">
            <ArrowLeft size={20} className="text-white/80" />
          </button>
          <h2 className="text-2xl font-bold tracking-tight text-white/90">{id ? 'Edit Automation' : 'New Automation'}</h2>
        </div>
        <div className="flex gap-3">
          {id && (
            <button onClick={async () => {
              if(confirm('Are you sure you want to delete this automation?')) {
                await axios.delete(`${API_BASE}/rules/${id}`);
                navigate('/');
              }
            }} className="px-5 py-2 bg-red-500/10 text-red-400 font-semibold rounded-xl hover:bg-red-500/20 transition-all border border-red-500/20">
              Delete
            </button>
          )}
          <button onClick={() => navigate('/')} className="px-5 py-2 rounded-xl font-medium hover:bg-white/10 transition-all text-white/70">
            Cancel
          </button>
          <button onClick={handleSave} className="px-5 py-2 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-all shadow-lg">
            Save Automation
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-8 overflow-hidden relative z-10">
        {/* Left: Mobile Preview */}
        <div className="hidden lg:flex w-5/12 items-center justify-center macos-glass rounded-[2rem] p-8 h-full shrink-0 relative overflow-hidden">
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none rounded-[2rem]"></div>
          
          <div className="w-[320px] h-[650px] bg-black/90 rounded-[3rem] border-[10px] border-gray-900/80 relative overflow-hidden shadow-2xl flex flex-col ring-1 ring-white/10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900/80 rounded-b-2xl z-10"></div>
            
            {/* Header */}
            <div className="h-16 border-b border-gray-800/60 flex items-center px-4 pt-4 gap-3 bg-black/40 backdrop-blur-md z-0">
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
        {formData.trigger_type === 'post_comment' && (
          <PostCommentForm 
            formData={formData} 
            setFormData={setFormData} 
            posts={posts} 
            displayedPosts={displayedPosts} 
            togglePostSelection={togglePostSelection} 
            setShowAllPostsModal={setShowAllPostsModal} 
          />
        )}
        {formData.trigger_type === 'dm_keyword' && (
          <DMKeywordForm formData={formData} setFormData={setFormData} />
        )}
        {formData.trigger_type === 'story_reply' && (
          <StoryReplyForm formData={formData} setFormData={setFormData} />
        )}
        {formData.trigger_type === 'ice_breaker' && (
          <IceBreakerForm formData={formData} setFormData={setFormData} />
        )}
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
              
              {nextCursor && (
                <div className="mt-8 flex justify-center">
                  <button 
                    onClick={() => fetchPosts(nextCursor)}
                    disabled={loadingMore}
                    className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {loadingMore ? 'Loading...' : 'Load More Posts'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
