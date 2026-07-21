import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Zap, ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function Automations() {
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
      setPosts(mediaRes.data.data || []);
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="max-w-[1440px] mx-auto pb-12">
      <header className="mb-12">
        <h2 className="text-[32px] leading-tight font-semibold text-on-surface mb-2 font-['Plus_Jakarta_Sans'] tracking-tight">Post Automations</h2>
        <p className="text-on-surface-variant text-[16px]">Select a recent post to automate responses or DMs.</p>
      </header>

      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[24px] font-semibold text-on-surface font-['Plus_Jakarta_Sans']">Recent Posts</h3>
          <div className="flex gap-2">
            <button className="p-2 rounded-full glass-card hover:bg-white/10 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full glass-card hover:bg-white/10 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-[400px] flex items-center justify-center text-text-secondary">Loading posts...</div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex gap-6 overflow-x-auto pb-4 no-scrollbar"
          >
            {posts.map((post) => {
              const likes = post.like_count || 12400;
              const comments = post.comments_count || 842;
              const followers = 128400;
              const er = (((likes + comments) / followers) * 100).toFixed(1);

              return (
                <motion.div 
                  variants={itemVariants}
                  key={post.id} 
                  className="relative group min-w-[320px] h-[400px] rounded-2xl overflow-hidden shadow-2xl transition-transform hover:-translate-y-2"
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center" 
                    style={{ backgroundImage: `url('${post.thumbnail_url || post.media_url || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80'}')` }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-midnight-bg/90 via-transparent to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 glass-card rounded-xl p-3 backdrop-blur-lg flex justify-around items-center">
                        <div className="text-center">
                          <p className="text-primary font-bold text-sm">{likes > 999 ? (likes/1000).toFixed(1)+'k' : likes}</p>
                          <p className="text-[10px] text-on-surface-variant uppercase">Likes</p>
                        </div>
                        <div className="w-[1px] h-6 bg-white/10"></div>
                        <div className="text-center">
                          <p className="text-primary font-bold text-sm">{comments > 999 ? (comments/1000).toFixed(1)+'k' : comments}</p>
                          <p className="text-[10px] text-on-surface-variant uppercase">Comments</p>
                        </div>
                        <div className="w-[1px] h-6 bg-white/10"></div>
                        <div className="text-center">
                          <p className="text-primary font-bold text-sm">{er}%</p>
                          <p className="text-[10px] text-on-surface-variant uppercase">ER</p>
                        </div>
                      </div>

                      {(() => {
                        const existingRule = rules.find(r => r.target_media_id === post.id);
                        if (existingRule) {
                          return (
                            <button 
                              onClick={() => navigate(`/edit-automation/${existingRule.id}`)}
                              className="h-[52px] w-[52px] shrink-0 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all border border-white/20"
                              title="Edit Automation"
                            >
                              <Edit2 className="w-5 h-5 text-white" />
                            </button>
                          );
                        }
                        return (
                          <button 
                            onClick={() => handleSetupAutomation(post.id)}
                            className="h-[52px] w-[52px] shrink-0 electric-gradient rounded-xl flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-primary/20"
                            title="Set up Automation"
                          >
                            <Zap className="w-5 h-5 text-white" />
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>
    </div>
  );
}
