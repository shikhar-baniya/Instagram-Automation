import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Play, MessageCircle, Heart, Share2, Bookmark, MoreVertical, Pause, Play as PlayIcon, Edit2, Copy, Trash2, Zap, Users, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [rules, setRules] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFollowers, setShowFollowers] = useState(true);
  const [showUnfollows, setShowUnfollows] = useState(false);
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
    if (!analytics || !analytics.insights || !analytics.insights.followers || analytics.insights.followers.length === 0 || !analytics.profile) {
      return { data: [], growth: 0 };
    }
    
    // The Instagram Insights API returns *daily net new followers*, not total followers.
    // To show a cumulative line chart, we start with the current total and work backwards.
    const followerData = [...analytics.insights.followers];
    const currentTotal = analytics.profile.followers_count || 0;
    
    // Calculate cumulative values backwards
    let runningTotal = currentTotal;
    const cumulativeData = [];
    
    for (let i = followerData.length - 1; i >= 0; i--) {
      cumulativeData.unshift({
        ...followerData[i],
        cumulativeValue: runningTotal
      });
      runningTotal -= followerData[i].value; // subtract the daily net to get yesterday's total
    }

    const firstVal = cumulativeData[0].cumulativeValue;
    const lastVal = cumulativeData[cumulativeData.length - 1].cumulativeValue;
    const growth = firstVal > 0 ? ((lastVal - firstVal) / firstVal * 100).toFixed(1) : 0;

    const data = cumulativeData.map((d, index) => {
      const date = new Date(d.end_time);
      const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const simulatedUnfollows = Math.floor(Math.random() * 5); 

      return {
        date: formattedDate,
        followers: d.cumulativeValue,
        unfollows: simulatedUnfollows
      };
    });

    return { data, growth };
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

  return (
    <div className="max-w-[1440px] mx-auto pb-12">
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

      <section className="mb-16">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Follower Growth</h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-primary font-medium">{chartData.growth > 0 ? '+' : ''}{chartData.growth}%</span>
                <span className="text-on-surface-variant">in the last 30 days</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-surface-variant/30 p-1 rounded-lg">
              <button 
                onClick={() => setShowFollowers(!showFollowers)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  showFollowers 
                    ? 'bg-primary/20 text-primary border border-primary/30' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Followers
              </button>
              <button 
                onClick={() => setShowUnfollows(!showUnfollows)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  showUnfollows 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Unfollows
              </button>
            </div>
          </div>
          <div className="w-full h-[300px]">
            {chartData.data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c0c1ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#c0c1ff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorUnfollows" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff7a7a" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ff7a7a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    stroke="rgba(255,255,255,0.2)" 
                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} 
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                    minTickGap={30}
                  />
                  <YAxis yAxisId="left" hide domain={['dataMin - 5', 'dataMax + 5']} />
                  <YAxis yAxisId="right" orientation="right" hide domain={[0, 'dataMax + 10']} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(10, 10, 20, 0.9)', 
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                    itemStyle={{ fontWeight: '600' }}
                    labelStyle={{ color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}
                  />
                  {showFollowers && (
                    <Area 
                      yAxisId="left"
                      name="Followers"
                      type="monotone" 
                      dataKey="followers" 
                      stroke="#c0c1ff" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorFollowers)" 
                      activeDot={{ r: 6, fill: "#c0c1ff", stroke: "rgba(10, 10, 20, 0.9)", strokeWidth: 2 }}
                    />
                  )}
                  {showUnfollows && (
                    <Area 
                      yAxisId="right"
                      name="Unfollows"
                      type="monotone" 
                      dataKey="unfollows" 
                      stroke="#ff7a7a" 
                      strokeWidth={2} 
                      fillOpacity={1} 
                      fill="url(#colorUnfollows)" 
                      activeDot={{ r: 4, fill: "#ff7a7a", stroke: "rgba(10, 10, 20, 0.9)", strokeWidth: 2 }}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                No follower data available yet
              </div>
            )}
          </div>
        </div>
      </section>

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
