import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { SupabaseAuthProvider } from '@/hooks/useSupabaseAuth';
import { AuthProvider } from '@/hooks/useAuth'; // Keep for backward compatibility
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Auth from '@/pages/Auth';
import InventoryList from '@/pages/InventoryList';
import AddItem from '@/pages/AddItem';
import History from '@/pages/History';
import ScanQR from '@/pages/ScanQR';
import NotFound from '@/pages/NotFound';
import './App.css';

function App() {
  return (
    <SupabaseAuthProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/inventory" element={<InventoryList />} />
              <Route path="/add-item" element={<AddItem />} />
              <Route path="/history" element={<History />} />
              <Route path="/scan" element={<ScanQR />} />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </SupabaseAuthProvider>
  );
}

export default App;