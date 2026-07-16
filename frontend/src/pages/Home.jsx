import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Play, MessageCircle, Heart, Share2, Bookmark, MoreVertical, Pause, Play as PlayIcon, Edit2, Copy, Trash2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mediaRes, rulesRes] = await Promise.all([
        axios.get(`${API_BASE}/media`),
        axios.get(`${API_BASE}/rules`)
      ]);
      setPosts(mediaRes.data || []);
      setRules(rulesRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupAutomation = (postId) => {
    navigate('/new-automation', { state: { preselectPostId: postId } });
  };

  const handleToggleRule = async (rule) => {
    try {
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, is_active: !rule.is_active } : r));
      await axios.put(`${API_BASE}/rules/${rule.id}`, { is_active: !rule.is_active });
    } catch (error) {
      console.error('Failed to toggle rule', error);
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, is_active: rule.is_active } : r));
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Welcome @bingewithshikhar!</h1>
        <p className="text-text-secondary">Let's automate your engagement.</p>
      </div>

      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">Recent Posts</h2>
            <p className="text-sm text-text-secondary mt-1">Select a post to set up automation</p>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-text-secondary">Loading posts...</div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-6 snap-x items-stretch">
            {posts.map((post) => (
              <div key={post.id} className="w-72 shrink-0 bg-panel border border-border rounded-xl overflow-hidden snap-start relative group flex flex-col">
                <div className="h-80 bg-gray-900 relative overflow-hidden shrink-0">
                  {post.thumbnail_url || post.media_url ? (
                    <img 
                      src={post.thumbnail_url || post.media_url} 
                      alt="Post" 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">No Image</div>
                  )}
                  {post.media_type === 'VIDEO' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Play fill="white" size={24} />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                    <p className="text-sm text-white line-clamp-2 overflow-hidden text-ellipsis" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {post.caption || "Instagram Post"}
                    </p>
                  </div>
                </div>
                
                <div className="p-4 bg-panel flex-1 flex items-end">
                  {(() => {
                    const existingRule = rules.find(r => r.target_media_id === post.id);
                    if (existingRule) {
                      return (
                        <button 
                          onClick={() => navigate(`/edit-automation/${existingRule.id}`)}
                          className="w-full py-2.5 bg-accent/20 text-accent font-semibold rounded-full hover:bg-accent/30 transition-colors"
                        >
                          View Automation
                        </button>
                      );
                    }
                    return (
                      <button 
                        onClick={() => handleSetupAutomation(post.id)}
                        className="w-full py-2.5 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors"
                      >
                        Set up Automation
                      </button>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold">Active Automations ({rules.length})</h2>
            <p className="text-sm text-text-secondary">Running 24/7 to collect contacts</p>
          </div>
          <button className="px-4 py-2 border border-border rounded-full hover:bg-white/5 font-semibold text-sm transition-colors">
            View All →
          </button>
        </div>

        <div className="bg-panel rounded-2xl border border-border overflow-x-auto pb-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-text-secondary">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold text-center">DMs</th>
                <th className="p-4 font-semibold text-center">Clicks</th>
                <th className="p-4 font-semibold text-center">CTR</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rules.map(rule => {
                const post = posts.find(p => p.id === rule.target_media_id);
                const thumb = post?.thumbnail_url || post?.media_url;
                
                return (
                  <tr key={rule.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => navigate(`/edit-automation/${rule.id}`)}>
                    <td className="p-4 flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-800 shrink-0 border border-gray-700">
                        {thumb ? <img src={thumb} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs">Any</div>}
                      </div>
                      <div>
                        <div className="font-bold text-sm mb-1">Comments ➝ DM</div>
                        <div className="text-xs text-text-secondary truncate max-w-md flex items-center gap-1">
                          User comments on {rule.target_post_type === 'any' ? 'Any Post' : 'Post'} 
                          {rule.target_post_type === 'specific' && thumb && <div className="w-4 h-4 rounded overflow-hidden mx-1 inline-block"><img src={thumb} className="w-full h-full object-cover" /></div>}
                          • {rule.match_type === 'any' ? 'any keyword' : rule.trigger_keyword} • {rule.opening_message ? 'Opening Message •' : ''} DM: '{rule.response_message.substring(0, 30)}...'
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center font-bold">{rule.dms_sent || 0}</td>
                    <td className="p-4 text-center font-bold">{rule.clicks || 0}</td>
                    <td className="p-4 text-center">
                      <div className="inline-block px-2 py-1 rounded bg-green-500/20 text-green-400 font-medium text-xs">
                        {rule.dms_sent ? ((rule.clicks || 0) / rule.dms_sent * 100).toFixed(1) : 0}%
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${rule.is_active ? 'bg-accent/20 text-accent' : 'bg-gray-800 text-gray-400'}`}>
                        {rule.is_active ? 'Live' : 'Paused'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => handleToggleRule(rule)}
                          className={`px-4 py-1.5 rounded-full border text-sm font-bold flex items-center gap-2 transition-colors shrink-0 ${rule.is_active ? 'border-orange-500/50 text-orange-400 hover:bg-orange-500/10' : 'border-accent/50 text-accent hover:bg-accent/10'}`}
                        >
                          {rule.is_active ? <Pause size={14} /> : <PlayIcon size={14} />} {rule.is_active ? 'Pause' : 'Start'}
                        </button>
                        <div className="flex items-center gap-1 border-l border-border pl-3 ml-1 shrink-0">
                          <button onClick={() => navigate(`/edit-automation/${rule.id}`)} className="p-2 hover:bg-white/10 rounded-full transition-colors group" title="Edit">
                            <Edit2 size={16} className="text-text-secondary group-hover:text-white" />
                          </button>
                          <button onClick={async () => { await axios.post(`${API_BASE}/rules/${rule.id}/copy`); fetchData(); }} className="p-2 hover:bg-white/10 rounded-full transition-colors group" title="Duplicate">
                            <Copy size={16} className="text-text-secondary group-hover:text-white" />
                          </button>
                          <button onClick={async () => { 
                            if(confirm('Are you sure you want to delete this automation?')) {
                              await axios.delete(`${API_BASE}/rules/${rule.id}`);
                              setRules(prev => prev.filter(r => r.id !== rule.id));
                            }
                          }} className="p-2 hover:bg-red-500/10 rounded-full transition-colors group" title="Delete">
                            <Trash2 size={16} className="text-text-secondary group-hover:text-red-500" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {rules.length === 0 && (
            <div className="p-8 text-center text-text-secondary">No automations found. Set one up above!</div>
          )}
        </div>
      </div>
    </div>
  );
}
