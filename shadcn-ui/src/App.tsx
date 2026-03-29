import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Index from './pages/Index';
import AdminDashboard from './pages/AdminDashboard';
import SellerDashboard from './pages/SellerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import ArbitratorDashboard from './pages/ArbitratorDashboard';
import NotFound from './pages/NotFound';
import PaymentCallback from './pages/PaymentCallback';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/payment/callback" element={<PaymentCallback />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller"
              element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <SellerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyer"
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <BuyerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/arbitrator"
              element={
                <ProtectedRoute allowedRoles={['arbitrator']}>
                  <ArbitratorDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
