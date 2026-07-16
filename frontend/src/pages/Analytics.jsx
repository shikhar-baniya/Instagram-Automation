import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Image as ImageIcon, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function Analytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await axios.get(`${API_BASE}/analytics`);
            setData(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>;
    }

    if (!data) return <div className="text-center text-red-400 mt-10">Failed to load analytics. Please check Instagram permissions.</div>;

    const chartData = data.posts.map((post, i) => ({
        name: `Post ${i+1}`,
        likes: post.like_count || 0,
        comments: post.comments_count || 0
    })).reverse();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Analytics</h1>
                <p className="text-text-secondary">Track your account growth and meme performance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-panel p-6 rounded-2xl border border-border flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-text-secondary text-sm">Total Followers</p>
                        <p className="text-2xl font-bold">{data.profile.followers_count?.toLocaleString() || 0}</p>
                    </div>
                </div>
                
                <div className="bg-panel p-6 rounded-2xl border border-border flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                        <ImageIcon size={24} />
                    </div>
                    <div>
                        <p className="text-text-secondary text-sm">Total Posts</p>
                        <p className="text-2xl font-bold">{data.profile.media_count?.toLocaleString() || 0}</p>
                    </div>
                </div>

                <div className="bg-panel p-6 rounded-2xl border border-border flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-text-secondary text-sm">Avg. Engagement</p>
                        <p className="text-2xl font-bold">{data.metrics.avgEngagement}</p>
                    </div>
                </div>
            </div>

            <div className="bg-panel p-6 rounded-2xl border border-border">
                <h2 className="text-lg font-bold mb-6">Recent Post Engagement (Likes vs Comments)</h2>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="name" stroke="#888" />
                            <YAxis stroke="#888" />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                            <Legend />
                            <Bar dataKey="likes" fill="#caff00" name="Likes" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="comments" fill="#3b82f6" name="Comments" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <div className="bg-panel p-6 rounded-2xl border border-border">
                <h2 className="text-lg font-bold mb-4">Top Recent Posts</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {data.posts.map(post => (
                        <div key={post.id} className="bg-black/40 rounded-xl overflow-hidden border border-border">
                            <div className="aspect-[3/4] relative">
                                <img src={post.thumbnail_url || post.media_url} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-3">
                                <div className="flex justify-between text-xs font-semibold">
                                    <span className="text-accent">{post.like_count || 0} Likes</span>
                                    <span className="text-blue-400">{post.comments_count || 0} Cmts</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
