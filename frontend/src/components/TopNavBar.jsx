import React from 'react';
import { Search, Bell, HelpCircle, Zap } from 'lucide-react';

const TopNavBar = ({ onNewCampaign, isSidebarCollapsed }) => {
  return (
    <header className={`fixed top-0 right-0 transition-all duration-300 ${isSidebarCollapsed ? 'w-[calc(100%-80px)]' : 'w-[calc(100%-280px)]'} h-16 bg-background/40 backdrop-blur-md border-b border-white/5 flex justify-between items-center px-8 z-40`}>
      
      {/* Search Bar */}
      <div className="flex items-center flex-1 max-w-xl relative">
        <Search className="absolute left-3 text-on-surface-variant w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search insights..." 
          className="w-full bg-midnight-bg/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary transition-all"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="text-on-surface-variant hover:text-on-surface transition-opacity relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full"></span>
        </button>

        {/* Support */}
        <button className="text-on-surface-variant font-medium text-sm cursor-pointer hover:text-on-surface flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          <span>Support</span>
        </button>

        {/* New Campaign Button */}
        <button 
          onClick={onNewCampaign}
          className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          New Campaign
        </button>

        {/* Profile Avatar */}
        <div className="flex items-center gap-3 border-l border-white/10 pl-6">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/30">
            <img 
              src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop" 
              alt="User Avatar" 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>
      </div>
      
    </header>
  );
};

export default TopNavBar;
