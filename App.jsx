import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { CartProvider } from './components/cart/CartContext';
import CartDrawer from './components/cart/CartDrawer';
import { CurrencyProvider } from './components/layout/CurrencySelector';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Brands from './pages/Brands';
import BrandProfile from './pages/BrandProfile';
import BrandDashboard from './pages/BrandDashboard';
import BrandInbox from './pages/BrandInbox';
import SavedPage from './pages/Saved';
import Pricing from './pages/Pricing';
import DropsCalendar from './pages/DropsCalendar';
import Checkout from './pages/Checkout';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Catalog" element={<Catalog />} />
        <Route path="/ProductDetail" element={<ProductDetail />} />
        <Route path="/Brands" element={<Brands />} />
        <Route path="/BrandProfile" element={<BrandProfile />} />
        <Route path="/BrandDashboard" element={<BrandDashboard />} />
        <Route path="/BrandInbox" element={<BrandInbox />} />
        <Route path="/Saved" element={<SavedPage />} />
        <Route path="/Pricing" element={<Pricing />} />
        <Route path="/DropsCalendar" element={<DropsCalendar />} />
        <Route path="/finalizar_compra" element={<Checkout />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <CurrencyProvider>
          <CartProvider>
            <Router>
              <AuthenticatedApp />
              <CartDrawer />
            </Router>
            <Toaster />
          </CartProvider>
        </CurrencyProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App