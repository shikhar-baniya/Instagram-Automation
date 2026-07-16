import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import AutomationEditor from './pages/AutomationEditor';
import Analytics from './pages/Analytics';
import './index.css';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-bg">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/new-automation" element={<AutomationEditor />} />
            <Route path="/edit-automation/:id" element={<AutomationEditor />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
