import { NavLink } from 'react-router-dom';
import { Home, Zap, FileJson, MessageSquare, BarChart, HelpCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function Sidebar() {
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
    { icon: Home, label: 'Home', path: '/' },
    { icon: Zap, label: 'Automations', path: '/automations' },
    { icon: FileJson, label: 'Templates', path: '/templates' },
    { icon: MessageSquare, label: 'Contacts', path: '/contacts' },
    { icon: BarChart, label: 'Analytics', path: '/analytics' },
  ];

  return (
    <div className="w-64 border-r border-border bg-panel flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tighter">
          CREATOR<span className="text-accent">FLOW</span>
        </h1>
      </div>

      <div className="px-4 mb-6">
        <NavLink 
          to="/new-automation" 
          className="w-full bg-accent hover:bg-accent-hover text-black font-semibold rounded-lg py-3 flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(202,255,0,0.2)]"
        >
          <Zap size={18} />
          <span>New Automation</span>
        </NavLink>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-white/5 text-white font-medium' 
                  : 'text-text-secondary hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border mt-auto">
        <div className="mb-4">
          <div className="flex justify-between items-end mb-1">
            <span className="text-sm text-text-secondary font-medium">DMs sent</span>
            <span className="text-sm font-bold">{stats.total_dms}/{stats.limit}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1.5">
            <div className="bg-accent h-1.5 rounded-full" style={{ width: `${Math.min((stats.total_dms / stats.limit) * 100, 100)}%` }}></div>
          </div>
        </div>

        <button className="flex items-center gap-3 px-4 py-2 w-full text-text-secondary hover:text-white transition-colors text-sm">
          <HelpCircle size={18} />
          Support
        </button>
      </div>
    </div>
  );
}
