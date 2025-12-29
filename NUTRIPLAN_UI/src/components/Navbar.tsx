import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, UtensilsCrossed, User, LogOut, LogIn, Shield, ChefHat } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isStudent, isAdmin, isKitchenStaff, isGuest } = useAuth();

  type NavLink = { path: string; label: string };

  // Public links (for not logged in)
  const publicNavLinks: NavLink[] = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'Tentang' }
  ];

  // Authenticated user base links (guest and above)
  const authenticatedNavLinks: NavLink[] = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'Tentang' },
    { path: '/menu-planning', label: 'Jadwal Menu' },
    { path: '/allergen-detector', label: 'Deteksi Alergen' }
  ];

  const adminNavLinks: NavLink[] = [
    { path: '/admin/menu-generator', label: 'AI Menu Generator' }
  ];

  const kitchenNavLinks: NavLink[] = [
    { path: '/kitchen/dashboard', label: 'Dashboard Dapur' }
  ];

  // Determine which links to show
  const navLinks: NavLink[] = !isAuthenticated 
    ? publicNavLinks
    : isAdmin 
    ? [...authenticatedNavLinks, ...adminNavLinks] 
    : isKitchenStaff 
    ? [...authenticatedNavLinks, ...kitchenNavLinks]
    : authenticatedNavLinks;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <UtensilsCrossed className="h-8 w-8 text-green-600" />
            <span className="text-green-600">NutriPlan</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link: NavLink) => (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors ${
                  isActive(link.path)
                    ? 'text-green-600'
                    : 'text-gray-700 hover:text-green-600'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Auth Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`flex items-center gap-2 ${
                      isAdmin 
                        ? 'border-purple-300 hover:border-purple-400' 
                        : 'border-gray-300'
                    }`}
                  >
                    <User className={`h-4 w-4 ${isAdmin ? 'text-purple-600' : ''}`} />
                    <span>{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium">{user?.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          isAdmin 
                            ? 'bg-purple-100 text-purple-700' 
                            : isKitchenStaff
                            ? 'bg-orange-100 text-orange-700'
                            : user?.role === 'guest'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {isAdmin ? 'Admin' : isKitchenStaff ? 'Dapur' : user?.role === 'guest' ? 'Guest' : 'Siswa'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{user?.email || 'Guest'}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {!isGuest && (
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => {
                    logout();
                    navigate('/');
                  }} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                <Link to="/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 space-y-2">
            {navLinks.map((link: NavLink) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block py-3 px-4 rounded-lg transition-colors ${
                  isActive(link.path)
                    ? 'bg-green-50 text-green-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Mobile Auth */}
            <div className="pt-2 border-t border-gray-200 mt-2">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2 mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        isAdmin 
                          ? 'bg-purple-100 text-purple-700' 
                          : isKitchenStaff
                          ? 'bg-orange-100 text-orange-700'
                          : user?.role === 'guest'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {isAdmin ? 'Admin' : isKitchenStaff ? 'Dapur' : user?.role === 'guest' ? 'Guest' : 'Siswa'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{user?.email || 'Guest'}</p>
                  </div>
                  {!isGuest && (
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="block py-3 px-4 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      <User className="h-4 w-4 inline mr-2" />
                      Profile
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      to="/admin/menu-generator"
                      onClick={() => setIsOpen(false)}
                      className="block py-3 px-4 rounded-lg text-purple-700 hover:bg-purple-50"
                    >
                      <UtensilsCrossed className="h-4 w-4 inline mr-2" />
                      AI Menu Generator
                    </Link>
                  )}
                  {isKitchenStaff && (
                    <Link
                      to="/kitchen/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="block py-3 px-4 rounded-lg text-orange-700 hover:bg-orange-50"
                    >
                      <ChefHat className="h-4 w-4 inline mr-2" />
                      Dashboard Dapur
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                      navigate('/');
                    }}
                    className="w-full text-left py-3 px-4 rounded-lg text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 inline mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block py-3 px-4 rounded-lg bg-green-600 text-white text-center"
                >
                  <LogIn className="h-4 w-4 inline mr-2" />
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}