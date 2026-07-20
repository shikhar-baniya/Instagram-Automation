import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import AutomationEditor from './pages/AutomationEditor';
import Analytics from './pages/Analytics';
import Templates from './pages/Templates';
import NewAutomationModal from './components/NewAutomationModal';
import { useState } from 'react';
import './index.css';

function App() {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  return (
    <Router>
      <div className="flex min-h-screen bg-bg">
        <Sidebar onOpenNewModal={() => setIsNewModalOpen(true)} />
        <main className="flex-1 ml-64 p-8 overflow-y-auto relative">
          <NewAutomationModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/new-automation" element={<AutomationEditor />} />
            <Route path="/edit-automation/:id" element={<AutomationEditor />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
