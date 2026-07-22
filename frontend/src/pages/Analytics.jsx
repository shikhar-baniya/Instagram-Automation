import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Image as ImageIcon, Activity, AlertTriangle, RefreshCw, CheckCircle2, Clock, HelpCircle, XCircle, Send, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function Analytics() {
    const [data, setData] = useState(null);
    const [executions, setExecutions] = useState([]);
    const [execStats, setExecStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeStatusFilter, setActiveStatusFilter] = useState('all');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    useEffect(() => {
        fetchAllData();
    }, [currentPage, pageSize, activeStatusFilter]);

    const fetchAllData = async () => {
        try {
            setRefreshing(true);
            const [analyticsRes, executionsRes, statsRes] = await Promise.allSettled([
                axios.get(`${API_BASE}/analytics`),
                axios.get(`${API_BASE}/executions?page=${currentPage}&limit=${pageSize}&status=${activeStatusFilter}`),
                axios.get(`${API_BASE}/executions/stats`)
            ]);

            if (analyticsRes.status === 'fulfilled') setData(analyticsRes.value.data);
            if (executionsRes.status === 'fulfilled') {
                const execData = executionsRes.value.data;
                if (Array.isArray(execData)) {
                    setExecutions(execData);
                    setTotalRecords(execData.length);
                    setTotalPages(1);
                } else {
                    setExecutions(execData.executions || []);
                    setTotalRecords(execData.total || 0);
                    setTotalPages(execData.totalPages || 1);
                }
            }
            if (statsRes.status === 'fulfilled') setExecStats(statsRes.value.data);

            setLoading(false);
            setRefreshing(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
            setRefreshing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const chartData = data?.posts ? data.posts.map((post, i) => ({
        name: `Post ${i + 1}`,
        likes: post.like_count || 0,
        comments: post.comments_count || 0
    })).reverse() : [];

    const formatErrorTooltip = (msg, code) => {
        if (!msg) return "Delivery rejected by Instagram API.";
        if (msg.includes("غير صالح") || msg.toLowerCase().includes("invalid comment") || code === '100') {
            return "Instagram rejected private reply for this comment. Causes: (1) User already received a DM for a prior comment on this post, (2) User privacy settings restrict DMs, or (3) Instagram spam filter auto-hid the comment.";
        }
        if (/[^\x00-\x7F]/.test(msg)) {
            return "Instagram API Error: Private reply failed for this comment.";
        }
        return msg;
    };

    const renderTriggerBadge = (exec) => {
        const trigger = exec.trigger_type || exec.rule_trigger_type || 'post_comment';
        switch (trigger) {
            case 'story_reply':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-purple-500/10 border border-purple-500/20 text-purple-300">Story Reply ({exec.trigger_keyword || 'Story'})</span>;
            case 'dm_keyword':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-blue-500/10 border border-blue-500/20 text-blue-300">DM Keyword ({exec.trigger_keyword || 'DM'})</span>;
            case 'ice_breaker':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">Ice Breaker</span>;
            default:
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-white/5 border border-white/10 text-gray-300">{exec.trigger_keyword ? `Comment to DM (${exec.trigger_keyword})` : "Comment to DM"}</span>;
        }
    };

    const renderStatusBadge = (exec) => {
        switch (exec.status) {
            case 'accepted_by_meta':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
                        <CheckCircle2 size={12} />
                        ✓ Sent
                    </span>
                );
            case 'pending_button_click':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 shadow-sm">
                        <Clock size={12} />
                        Pending user to click button
                    </span>
                );
            case 'not_matched':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/20 shadow-sm group relative cursor-help">
                        <HelpCircle size={12} />
                        Skipped
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-black/90 border border-white/10 text-[11px] text-gray-200 rounded-lg shadow-xl z-20 font-normal leading-tight">
                            No keyword rule matched this trigger text.
                        </span>
                    </span>
                );
            case 'failed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 shadow-sm group relative cursor-help">
                        <XCircle size={12} />
                        Failed
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-2.5 bg-black/90 border border-red-500/30 text-[11px] text-red-200 rounded-lg shadow-xl z-20 font-normal leading-tight">
                            <strong>Meta Error {exec.meta_error_code ? `(Code ${exec.meta_error_code})` : ""}:</strong> {formatErrorTooltip(exec.error_message, exec.meta_error_code)}
                        </span>
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm">
                        <RefreshCw size={12} className="animate-spin" />
                        Processing...
                    </span>
                );
        }
    };

    return (
        <div className="space-y-8 pb-16">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 text-white/90">Analytics & Activity</h1>
                    <p className="text-gray-400">Track account growth, automation performance, and DM delivery verification.</p>
                </div>
                <button
                    onClick={fetchAllData}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all shadow-sm"
                >
                    <RefreshCw size={16} className={refreshing ? "animate-spin text-blue-400" : "text-gray-400"} />
                    {refreshing ? "Refreshing..." : "Refresh Logs"}
                </button>
            </div>

            {/* Troubleshooting Alert Banner */}
            <div className="macos-glass-panel p-5 rounded-3xl border border-amber-500/20 bg-amber-500/5 text-sm text-gray-300 space-y-2 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-amber-400">
                    <AlertTriangle size={18} />
                    Troubleshooting Failed DMs
                </div>
                <p className="text-xs text-gray-400">
                    Hover over a "Failed" or "Skipped" status badge in the log below to see the specific error message from Instagram. Common reasons include:
                </p>
                <ul className="list-disc pl-5 text-xs text-gray-300 space-y-1">
                    <li><strong>User doesn't follow / Privacy settings:</strong> User restricts message requests from public pages. Enable "Ask to follow" or "Public reply" in your settings.</li>
                    <li><strong>Rate limit exceeded:</strong> Instagram's 250 DMs/hour limit was hit. Remaining messages queue automatically for retries.</li>
                    <li><strong>7-day window expired:</strong> The user must engage with you again (comment/reply) to become eligible for DMs.</li>
                </ul>
            </div>

            {/* Account & DM Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="macos-glass-panel p-6 rounded-3xl border border-white/5 flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-medium">Total Followers</p>
                        <p className="text-2xl font-bold text-white/90">{data?.profile?.followers_count?.toLocaleString() || 0}</p>
                    </div>
                </div>

                <div className="macos-glass-panel p-6 rounded-3xl border border-white/5 flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
                        <Send size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-medium">DMs Attempted</p>
                        <p className="text-2xl font-bold text-white/90">{execStats?.total_attempted ?? (data?.metrics?.totalLikes || 0)}</p>
                    </div>
                </div>

                <div className="macos-glass-panel p-6 rounded-3xl border border-white/5 flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-inner">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-medium">DM Delivery Success</p>
                        <p className="text-2xl font-bold text-emerald-400">{execStats?.success_rate ? `${execStats.success_rate}%` : "100%"}</p>
                    </div>
                </div>

                <div className="macos-glass-panel p-6 rounded-3xl border border-white/5 flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
                        <MessageSquare size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-medium">Pending / Skipped</p>
                        <p className="text-2xl font-bold text-amber-300">{(execStats?.pending_clicks || 0) + (execStats?.failed_count || 0)}</p>
                    </div>
                </div>
            </div>

            {/* Recent Automation Activity Log Table */}
            <div className="macos-glass-panel p-6 rounded-3xl border border-white/5 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-white/90">Recent Automation Activity</h2>
                        <p className="text-sm text-gray-400">All automation triggers logged across Comments, DM Keywords, and Story Replies.</p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-2">
                        {['all', 'sent', 'pending', 'failed', 'skipped'].map(filterKey => (
                            <button
                                key={filterKey}
                                onClick={() => { setActiveStatusFilter(filterKey); setCurrentPage(1); }}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                    activeStatusFilter === filterKey
                                        ? 'bg-white text-black border-white shadow-sm'
                                        : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                                <th className="py-3 px-4">User & Trigger Content</th>
                                <th className="py-3 px-4">Automation</th>
                                <th className="py-3 px-4">Public Reply</th>
                                <th className="py-3 px-4">DM Status</th>
                                <th className="py-3 px-4">Date & Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {executions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-10 text-center text-gray-500 text-sm">
                                        No automation activity logged yet. Once users interact with your account, execution history will appear here.
                                    </td>
                                </tr>
                            ) : (
                                executions.map(exec => (
                                    <tr key={exec.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                                                    {(exec.sender_id || "@user").substring(1, 3).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white/90 text-sm">{exec.sender_id || "@user"}</p>
                                                    <p className="text-xs text-gray-400 italic">"{exec.comment_text || ""}"</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            {renderTriggerBadge(exec)}
                                        </td>
                                        <td className="py-4 px-4 text-xs text-gray-400">
                                            {exec.public_reply_sent ? <span className="text-emerald-400 font-medium">✓ Replied</span> : "-"}
                                        </td>
                                        <td className="py-4 px-4">
                                            {renderStatusBadge(exec)}
                                        </td>
                                        <td className="py-4 px-4 text-xs text-gray-400">
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={12} className="text-gray-500" />
                                                {exec.created_at ? new Date(exec.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Just now"}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10 text-xs text-gray-400">
                    <div className="flex items-center gap-3">
                        <span>
                            Showing {totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} activities
                        </span>
                        <select
                            value={pageSize}
                            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                            className="bg-black/40 border border-white/10 text-gray-300 rounded-lg px-2.5 py-1 focus:outline-none hover:border-white/20 transition-all cursor-pointer"
                        >
                            <option value={10}>10 per page</option>
                            <option value={25}>25 per page</option>
                            <option value={50}>50 per page</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium text-xs text-gray-300"
                        >
                            <ChevronLeft size={14} />
                            Previous
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                            .map((p, idx, arr) => {
                                const prevPage = arr[idx - 1];
                                const showEllipsis = prevPage && p - prevPage > 1;
                                return (
                                    <span key={p} className="flex items-center">
                                        {showEllipsis && <span className="px-1 text-gray-600">...</span>}
                                        <button
                                            onClick={() => setCurrentPage(p)}
                                            className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                                                currentPage === p
                                                    ? 'bg-blue-500 text-white shadow-sm'
                                                    : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    </span>
                                );
                            })}

                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage >= totalPages}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium text-xs text-gray-300"
                        >
                            Next
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Post Engagement Chart */}
            <div className="macos-glass-panel p-6 rounded-3xl border border-white/5 shadow-sm">
                <h2 className="text-lg font-bold mb-6 text-white/90">Recent Post Engagement (Likes vs Comments)</h2>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" stroke="#888" />
                            <YAxis stroke="#888" />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                            <Legend />
                            <Bar dataKey="likes" fill="#3b82f6" name="Likes" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="comments" fill="#a855f7" name="Comments" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            {/* Top Recent Posts */}
            {data?.posts && data.posts.length > 0 && (
                <div className="macos-glass-panel p-6 rounded-3xl border border-white/5 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 text-white/90">Top Recent Posts</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {data.posts.map(post => (
                            <div key={post.id} className="bg-black/30 rounded-2xl overflow-hidden border border-white/5 hover:border-white/20 transition-all shadow-sm">
                                <div className="aspect-[3/4] relative">
                                    <img src={post.thumbnail_url || post.media_url} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-3">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span className="text-blue-400">{post.like_count || 0} Likes</span>
                                        <span className="text-purple-400">{post.comments_count || 0} Cmts</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
