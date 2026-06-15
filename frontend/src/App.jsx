import { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import SetupPage from './pages/SetupPage';
import DashboardPage from './pages/DashboardPage';
import ScanPage from './pages/ScanPage';

export default function App() {
  // Standalone scan pages — completely isolated from the main app
  const currentPath = window.location.pathname;
  if (currentPath === '/scan/police') return <ScanPage mode="police" />;
  if (currentPath === '/scan/medical') return <ScanPage mode="medical" />;

  const [userId, setUserId] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('userId');
    if (stored) setUserId(stored);
  }, []);

  const handleAuth = (id, newUser = false) => {
    localStorage.setItem('userId', id);
    setUserId(id);
    setIsNewUser(newUser);
  };

  const handleSetupComplete = () => setIsNewUser(false);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    setUserId(null);
    setIsNewUser(false);
  };

  if (!userId) return <AuthPage onAuth={handleAuth} />;
  if (isNewUser) return <SetupPage userId={userId} onComplete={handleSetupComplete} />;
  return <DashboardPage userId={userId} onLogout={handleLogout} />;
}
