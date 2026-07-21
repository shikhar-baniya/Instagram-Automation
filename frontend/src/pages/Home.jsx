import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Play, MessageCircle, Heart, Share2, Bookmark, MoreVertical, Pause, Play as PlayIcon, Edit2, Copy, Trash2, Zap, Users, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [rules, setRules] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    const interval = setInterval(pollRules, 5000);
    return () => clearInterval(interval);
  }, []);

  const pollRules = async () => {
    try {
      const rulesRes = await axios.get(`${API_BASE}/rules`);
      setRules(rulesRes.data || []);
    } catch (error) {
      console.error('Failed to poll rules', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mediaRes, rulesRes, analyticsRes] = await Promise.all([
        axios.get(`${API_BASE}/media`),
        axios.get(`${API_BASE}/rules`),
        axios.get(`${API_BASE}/analytics`)
      ]);
      setPosts(mediaRes.data.data || []);
      setRules(rulesRes.data || []);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString();
  };

  const generateChartData = () => {
    const defaultData = { path: 'M0 250 L 1000 250', points: [], growth: 0 };
    if (!analytics || !analytics.insights || !analytics.insights.followers || analytics.insights.followers.length === 0) return defaultData;
    
    const followerData = analytics.insights.followers;
    const values = followerData.map(d => d.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;
    
    const width = 1000;
    const height = 180; // height for the curve
    const paddingY = 60; // top padding
    const bottomY = 300;

    const points = values.map((val, i) => {
      const x = followerData.length > 1 ? (i / (followerData.length - 1)) * width : width / 2;
      const y = paddingY + height - ((val - minVal) / range) * height;
      return { x, y, val };
    });

    const pathString = points.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      // Smooth curve using a simple bezier to the next point
      const prev = points[i - 1];
      const cp1x = prev.x + (pt.x - prev.x) / 2;
      const cp1y = prev.y;
      const cp2x = prev.x + (pt.x - prev.x) / 2;
      const cp2y = pt.y;
      return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pt.x} ${pt.y}`;
    }, '');

    const firstVal = values[0];
    const lastVal = values[values.length - 1];
    const growth = firstVal > 0 ? ((lastVal - firstVal) / firstVal * 100).toFixed(1) : 0;

    return { pathString, points, growth };
  };

  const chartData = generateChartData();
  const totalViews = analytics?.insights?.reach ? analytics.insights.reach.reduce((sum, d) => sum + d.value, 0) : 0;

  const handleSetupAutomation = (postId) => {
    navigate('/new-automation', { state: { preselectPostId: postId } });
  };

  const handleToggleRule = async (rule, e) => {
    e.stopPropagation();
    try {
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, is_active: !rule.is_active } : r));
      await axios.put(`${API_BASE}/rules/${rule.id}`, { is_active: !rule.is_active });
    } catch (error) {
      console.error('Failed to toggle rule', error);
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, is_active: rule.is_active } : r));
    }
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
      {/* Welcome Header & Stats */}
      <header className="mb-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-[32px] leading-tight font-semibold text-on-surface mb-2 font-['Plus_Jakarta_Sans'] tracking-tight">Welcome {analytics?.profile?.username ? `@${analytics.profile.username}` : 'back'}!</h2>
            <p className="text-on-surface-variant text-[16px]">Here is how your automation hub is performing.</p>
          </div>
          <div className="flex gap-4">
            <div className="glass-card px-6 py-3 rounded-xl flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="text-primary w-6 h-6" />
              </div>
              <div>
                <p className="text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant">Followers</p>
                <p className="text-[24px] font-semibold leading-none">{formatNumber(analytics?.profile?.followers_count)}</p>
              </div>
            </div>
            <div className="glass-card px-6 py-3 rounded-xl flex items-center gap-4">
              <div className="p-2 bg-deep-indigo/10 rounded-lg">
                <Heart className="text-deep-indigo w-6 h-6" />
              </div>
              <div>
                <p className="text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant">Avg. Engagement</p>
                <p className="text-[24px] font-semibold leading-none">{formatNumber(analytics?.metrics?.avgEngagement)}</p>
              </div>
            </div>
            <div className="glass-card px-6 py-3 rounded-xl flex items-center gap-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Eye className="text-emerald-400 w-6 h-6" />
              </div>
              <div>
                <p className="text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant">Total Views (30d)</p>
                <p className="text-[24px] font-semibold leading-none">{formatNumber(totalViews)}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Follower Growth Chart */}
      <section className="mb-16">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[20px] font-semibold text-on-surface font-['Plus_Jakarta_Sans']">Follower Growth (30 Days)</h3>
            <span className="text-primary text-sm font-semibold bg-primary/10 px-3 py-1 rounded-full">{chartData.growth > 0 ? '+' : ''}{chartData.growth}%</span>
          </div>
          <div className="w-full h-64 relative overflow-hidden">
            <svg className="w-full h-full chart-glow" preserveAspectRatio="none" viewBox="0 0 1000 300">
              <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#c0c1ff" stopOpacity="0.3"></stop>
                  <stop offset="100%" stopColor="#c0c1ff" stopOpacity="0"></stop>
                </linearGradient>
              </defs>
              <g stroke="rgba(255,255,255,0.03)" strokeWidth="1">
                <line x1="0" x2="1000" y1="60" y2="60"></line>
                <line x1="0" x2="1000" y1="120" y2="120"></line>
                <line x1="0" x2="1000" y1="180" y2="180"></line>
                <line x1="0" x2="1000" y1="240" y2="240"></line>
              </g>
              <path d={`${chartData.pathString} L 1000 300 L 0 300 Z`} fill="url(#chartGradient)"></path>
              <path d={chartData.pathString} fill="none" stroke="#c0c1ff" strokeLinecap="round" strokeWidth="3"></path>
              {chartData.points.map((pt, i) => (
                <circle key={i} className="animate-pulse" cx={pt.x} cy={pt.y} fill="#c0c1ff" r="4"></circle>
              ))}
            </svg>
          </div>
        </div>
      </section>



      {/* Section 2: Active Automations */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[24px] font-semibold text-on-surface font-['Plus_Jakarta_Sans']">Active Automations</h3>
          <button className="text-primary hover:underline text-[14px] font-medium">View all logs</button>
        </div>

        <div className="glass-card rounded-xl overflow-hidden border border-white/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5">
                <th className="px-6 py-4 text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider text-center">DMs</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider text-center">Clicks</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider text-center">CTR</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rules.map((rule, idx) => {
                let title = "Comments ➝ DM";
                let iconContent = <MessageCircle className="text-primary w-5 h-5" />;
                let iconBg = "bg-primary/10";

                if (rule.trigger_type === 'dm_keyword') {
                  title = "Keywords ➝ DM";
                  iconContent = <MessageCircle className="text-emerald-400 w-5 h-5" />;
                  iconBg = "bg-emerald-500/10";
                } else if (rule.trigger_type === 'story_reply') {
                  title = "Stories ➝ DM";
                  iconContent = <Play className="text-fuchsia-400 w-5 h-5" />;
                  iconBg = "bg-fuchsia-500/10";
                }

                return (
                  <motion.tr 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={rule.id} 
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => navigate(`/edit-automation/${rule.id}`)}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 ${iconBg} rounded-lg`}>
                          {iconContent}
                        </div>
                        <span className="text-[16px] font-medium">{title} - {rule.trigger_keyword || 'Any'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center font-semibold">{rule.dms_sent || 0}</td>
                    <td className="px-6 py-5 text-center font-semibold">{rule.clicks || 0}</td>
                    <td className="px-6 py-5 text-center font-semibold">
                      {rule.dms_sent ? ((rule.clicks || 0) / rule.dms_sent * 100).toFixed(1) : 0}%
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[12px] font-semibold border ${rule.is_active ? 'bg-primary/10 text-primary border-primary/20' : 'bg-gray-800/50 text-gray-400 border-gray-700'}`}>
                        {rule.is_active ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={(e) => handleToggleRule(rule, e)}
                          className="text-on-surface-variant hover:text-white transition-colors"
                          title={rule.is_active ? "Pause" : "Start"}
                        >
                          {rule.is_active ? <Pause className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/edit-automation/${rule.id}`); }} className="text-on-surface-variant hover:text-white transition-colors">
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button onClick={async (e) => { 
                          e.stopPropagation();
                          if(confirm('Are you sure you want to delete this automation?')) {
                            await axios.delete(`${API_BASE}/rules/${rule.id}`);
                            setRules(prev => prev.filter(r => r.id !== rule.id));
                          }
                        }} className="text-on-surface-variant hover:text-error transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              
              {rules.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-text-secondary">
                    No active automations.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.section>
    </div>
  );
}
