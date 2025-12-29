import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MenuProvider } from './contexts/MenuContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { MenuPlanningPage } from './pages/MenuPlanningPage';
import { AllergenDetectorPage } from './pages/AllergenDetectorPage';
import { MenuDetailPage } from './pages/MenuDetailPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminMenuGeneratorPage } from './pages/AdminMenuGeneratorPage';
import { KitchenDashboardPage } from './pages/KitchenDashboardPage';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <AuthProvider>
      <MenuProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/login" element={<LoginPage />} />
                
                {/* Protected Routes - Require Login */}
                <Route 
                  path="/menu-planning" 
                  element={
                    <ProtectedRoute>
                      <MenuPlanningPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/allergen-detector" 
                  element={
                    <ProtectedRoute>
                      <AllergenDetectorPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/menu/:id" 
                  element={
                    <ProtectedRoute>
                      <MenuDetailPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/menu-generator" 
                  element={
                    <ProtectedRoute>
                      <AdminMenuGeneratorPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/kitchen/dashboard" 
                  element={
                    <ProtectedRoute>
                      <KitchenDashboardPage />
                    </ProtectedRoute>
                  } 
                />
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            <Toaster position="top-center" />
          </div>
        </Router>
      </MenuProvider>
    </AuthProvider>
  );
}