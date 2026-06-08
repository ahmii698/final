import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { cartCount, wishlistCount } = useCart();
  const { isAuthenticated, user, logout } = useAuth();

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.add('light-mode');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    logout();
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Shop', path: '/shop' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
    { name: 'Track Order', path: '/track-order' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isDarkMode 
        ? 'bg-black/95 backdrop-blur-sm border-b border-white/10' 
        : 'bg-white border-b border-gray-200 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo with Image - Bada Size */}
          <Link to="/" className="flex items-center gap-2">
            <img 
              src={logo} 
              alt="LUXE Logo" 
              className="h-12 w-auto object-contain"  // 👈 h-8 se badal kar h-12 kiya
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`transition-colors duration-300 text-sm uppercase tracking-wider ${
                  isDarkMode 
                    ? 'text-white/70 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            {/* Night/Light Mode Button */}
            <button
              onClick={toggleTheme}
              className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-white/10 hover:bg-white/20 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* User Section - Login/Logout */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
                  Hi, {user?.name?.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/auth" className="relative">
                <svg className={`w-6 h-6 transition-colors duration-300 ${
                  isDarkMode ? 'text-white/70 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}

            {/* Heart/Wishlist Icon with Count */}
            <Link to="/wishlist" className="relative">
              <svg className={`w-6 h-6 transition-colors duration-300 ${
                isDarkMode ? 'text-white/70 hover:text-white' : 'text-gray-700 hover:text-gray-900'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && (
                <span className={`absolute -top-2 -right-2 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                  isDarkMode ? 'bg-white text-black' : 'bg-black text-white'
                } shadow-sm`}>
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon with Count */}
            <Link to="/cart" className="relative">
              <svg className={`w-6 h-6 transition-colors duration-300 ${
                isDarkMode ? 'text-white/70 hover:text-white' : 'text-gray-700 hover:text-gray-900'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 15v6" />
              </svg>
              {cartCount > 0 && (
                <span className={`absolute -top-2 -right-2 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                  isDarkMode ? 'bg-white text-black' : 'bg-black text-white'
                } shadow-sm`}>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`md:hidden transition-colors duration-300 ${
                isDarkMode ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className={`md:hidden py-4 border-t ${
            isDarkMode ? 'border-white/10' : 'border-gray-200'
          }`}>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block py-2 transition-colors duration-300 ${
                  isDarkMode 
                    ? 'text-white/70 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {/* Mobile menu auth links */}
            {isAuthenticated ? (
              <>
                <div className={`pt-2 mt-2 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                  <span className={`block py-2 text-sm ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
                    Hi, {user?.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className={`block py-2 w-full text-left transition-colors duration-300 ${
                      isDarkMode ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={() => setIsOpen(false)}
                className={`block py-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Login / Sign Up
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;