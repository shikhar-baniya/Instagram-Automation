import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, BarChart3, LayoutTemplate, Settings, Zap, ChevronLeft, ChevronRight, GitMerge } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function Sidebar({ isCollapsed, onToggleCollapse }) {
  const [stats, setStats] = useState({ total_dms: 0, limit: 500 });

  useEffect(() => {
    const fetchStats = () => {
      axios.get(`${API_BASE}/stats`).then(res => {
        setStats(res.data);
      }).catch(err => console.error("Failed to load stats", err));
    };
    
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: MessageSquare, label: 'Automations', path: '/automations' },
    { icon: GitMerge, label: 'Visual Builder', path: '/visual-automation' },
    { icon: LayoutTemplate, label: 'Templates', path: '/templates' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className={`fixed left-0 top-0 h-screen transition-all duration-300 ${isCollapsed ? 'w-[80px]' : 'w-[280px]'} bg-surface-container/60 backdrop-blur-xl border-r border-white/10 shadow-xl flex flex-col py-8 z-50`}>
      
      {/* Brand Header */}
      <div className={`px-6 mb-10 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <div>
            <h1 className="text-2xl font-bold text-primary tracking-tight font-['Plus_Jakarta_Sans']">
              Engagr<span className="text-deep-indigo text-3xl leading-none">.</span>
            </h1>
            <p className="text-on-surface-variant text-[12px] uppercase tracking-widest mt-1 font-semibold">Premium SaaS</p>
          </div>
        )}
        <button onClick={onToggleCollapse} className="text-on-surface-variant hover:text-white transition-colors p-1">
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `${isCollapsed ? 'px-0 justify-center' : 'px-4'} py-3 flex items-center gap-3 transition-all active:scale-95 ${
                isActive
                  ? 'bg-primary-container/20 text-primary border-l-4 border-primary'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5 border-l-4 border-transparent'
              }`
            }
            title={isCollapsed ? item.label : ""}
          >
            <item.icon size={20} />
            {!isCollapsed && <span className="font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Widget */}
      <div className="px-6 mt-auto">
        {!isCollapsed && (
          <div className="glass-card p-4 rounded-xl mb-6">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-on-surface-variant tracking-wider uppercase">Total DMs Sent</span>
              <span className="text-[14px] font-semibold text-primary">{stats.total_dms}</span>
            </div>
          </div>
        )}
        
        <button className={`w-full electric-gradient py-3 rounded-lg text-sm font-medium text-white transition-all flex justify-center items-center ${isCollapsed ? 'px-0' : 'px-4'}`} title="Upgrade Plan">
          {isCollapsed ? <Zap size={18} /> : 'Upgrade Plan'}
        </button>
      </div>
    </aside>
  );
}
