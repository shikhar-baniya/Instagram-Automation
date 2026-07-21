import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Automations from './pages/Automations';
import AutomationEditor from './pages/AutomationEditor';
import Analytics from './pages/Analytics';
import Templates from './pages/Templates';
import VisualAutomationEditor from './pages/VisualAutomationEditor';
import NewAutomationModal from './components/NewAutomationModal';
import TopNavBar from './components/TopNavBar';
import { useState } from 'react';
import './index.css';

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    className="h-full"
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      {/* Routes setup */}
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/automations" element={<PageTransition><Automations /></PageTransition>} />
        <Route path="/new-automation" element={<PageTransition><AutomationEditor /></PageTransition>} />
        <Route path="/edit-automation/:id" element={<PageTransition><AutomationEditor /></PageTransition>} />
        <Route path="/visual-automation" element={<PageTransition><VisualAutomationEditor /></PageTransition>} />
        <Route path="/analytics" element={<PageTransition><Analytics /></PageTransition>} />
        <Route path="/templates" element={<PageTransition><Templates /></PageTransition>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <Router>
      <div className="flex min-h-screen bg-background relative overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-deep-indigo/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <TopNavBar 
          onNewCampaign={() => setIsNewModalOpen(true)} 
          isSidebarCollapsed={isSidebarCollapsed}
        />
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        />
        <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-[80px]' : 'ml-[280px]'} pt-24 px-8 pb-12 min-h-screen overflow-y-auto relative z-10`}>
          <NewAutomationModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} />
          <AnimatedRoutes />
        </main>
      </div>
    </Router>
  );
}

export default App;
