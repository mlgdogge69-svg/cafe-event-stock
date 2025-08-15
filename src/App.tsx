import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import InventoryList from "./pages/InventoryList";
import AddItem from "./pages/AddItem";
import History from "./pages/History";
import ScanQR from "./pages/ScanQR";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route Component (redirect if logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return !user ? <>{children}</> : <Navigate to="/inventory" replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={
      <PublicRoute>
        <Login />
      </PublicRoute>
    } />
    <Route path="/inventory" element={
      <ProtectedRoute>
        <InventoryList />
      </ProtectedRoute>
    } />
    <Route path="/add-item" element={
      <ProtectedRoute>
        <AddItem />
      </ProtectedRoute>
    } />
    <Route path="/history" element={
      <ProtectedRoute>
        <History />
      </ProtectedRoute>
    } />
    <Route path="/scan" element={
      <ProtectedRoute>
        <ScanQR />
      </ProtectedRoute>
    } />
    <Route path="/" element={<Navigate to="/inventory" replace />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
