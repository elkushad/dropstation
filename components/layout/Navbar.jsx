import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, User, ShoppingCart, Heart, ChevronDown, LogIn, LogOut, Store } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { useCart } from '../cart/CartContext';
import { base44 } from '@/api/base44Client';
import CurrencySelector from './CurrencySelector';

const COUNTRIES = [
  { code: '', label: 'Todo', flag: '🌎' },
  { code: 'PE', label: 'Perú', flag: '🇵🇪' },
  { code: 'MX', label: 'México', flag: '🇲🇽' },
  { code: 'AR', label: 'Argentina', flag: '🇦🇷' },
  { code: 'CO', label: 'Colombia', flag: '🇨🇴' },
  { code: 'CL', label: 'Chile', flag: '🇨🇱' },
  { code: 'BR', label: 'Brasil', flag: '🇧🇷' },
  { code: 'US', label: 'USA', flag: '🇺🇸' },
];

const categories = [
  { label: 'Hoodies', path: '/Catalog?category=hoodies' },
  { label: 'T-Shirts', path: '/Catalog?category=t-shirts' },
  { label: 'Pants', path: '/Catalog?category=pants' },
  { label: 'Jackets', path: '/Catalog?category=jackets' },
  { label: 'Sneakers', path: '/Catalog?category=sneakers' },
  { label: 'Accesorios', path: '/Catalog?category=accessories' },
  { label: 'Caps', path: '/Catalog?category=caps' },
];

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCountryMenu, setShowCountryMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState(null);
  const countryMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  const { itemCount, setIsOpen } = useCart();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (countryMenuRef.current && !countryMenuRef.current.contains(e.target)) {
        setShowCountryMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const urlParams = new URLSearchParams(window.location.search);
  const selectedCountry = COUNTRIES.find(c => c.code === urlParams.get('country')) || COUNTRIES[0];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const country = urlParams.get('country') || '';
      const countryParam = country ? `&country=${country}` : '';
      window.location.href = `/Catalog?search=${encodeURIComponent(searchQuery.trim())}${countryParam}`;
    }
  };

  const handleCountrySelect = (country) => {
    setShowCountryMenu(false);
    const params = new URLSearchParams(window.location.search);
    if (country.code) {
      params.set('country', country.code);
    } else {
      params.delete('country');
    }
    // Navigate to Catalog with country filter
    window.location.href = `/Catalog${params.toString() ? '?' + params.toString() : ''}`;
  };

  return (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/Home" className="flex-shrink-0">
            <h1 className="text-xl md:text-2xl font-black tracking-tighter text-white">
              DROP<span className="text-violet-400">STATION</span>
            </h1>
          </Link>

          {/* Search bar - desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl">
            <div className="relative w-full flex items-center bg-zinc-900 border border-zinc-700 rounded-full h-10 focus-within:border-violet-500">
              {/* Country selector */}
              <div className="relative flex-shrink-0" ref={countryMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowCountryMenu(v => !v)}
                  className="flex items-center gap-1.5 px-3 h-10 text-sm text-zinc-300 hover:text-white border-r border-zinc-700 whitespace-nowrap transition-colors rounded-l-full"
                >
                  <span>{selectedCountry.flag}</span>
                  <span className="hidden lg:inline text-xs font-medium">{selectedCountry.label}</span>
                  <ChevronDown className="w-3 h-3 text-zinc-500" />
                </button>
                {showCountryMenu && (
                  <div className="absolute top-full left-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-[100] min-w-36 overflow-hidden">
                    {COUNTRIES.map(c => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => handleCountrySelect(c)}
                        className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-zinc-800 ${selectedCountry.code === c.code ? 'text-violet-400 font-semibold' : 'text-zinc-300'}`}
                      >
                        <span>{c.flag}</span>
                        <span>{c.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative flex-1 flex items-center overflow-hidden rounded-r-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                <Input
                  placeholder="Buscar streetwear..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-transparent border-0 text-white placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:outline-none h-10 shadow-none"
                />
              </div>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <CurrencySelector />
            <Link to="/BrandDashboard">
              <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-white hover:bg-white/10 hidden md:flex">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Vender
              </Button>
            </Link>
            
            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-300 hover:text-white hover:bg-white/10"
                onClick={() => setShowUserMenu(v => !v)}
              >
                <User className="w-5 h-5" />
              </Button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-[100] overflow-hidden">
                  {user ? (
                    <>
                      <div className="px-4 py-3 border-b border-zinc-800">
                        <p className="text-xs text-zinc-500">Conectado como</p>
                        <p className="text-sm font-semibold text-white truncate">{user.full_name || user.email}</p>
                      </div>
                      <Link
                        to="/BrandDashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                      >
                        <Store className="w-4 h-4" /> Mi Dashboard
                      </Link>
                      <Link
                        to="/Saved"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                      >
                        <Heart className="w-4 h-4" /> Favoritos
                      </Link>
                      <button
                        onClick={() => base44.auth.logout('/')}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-zinc-800 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Cerrar sesión
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => base44.auth.redirectToLogin()}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                      <LogIn className="w-4 h-4" /> Iniciar sesión
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Cart button */}
            <button
              onClick={() => setIsOpen(true)}
              className="relative flex items-center justify-center w-9 h-9 rounded-md text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

          </div>
        </div>

        {/* Categories bar - desktop */}
        <nav className="hidden md:flex items-center gap-1 pb-2 overflow-x-auto scrollbar-hide">
          <Link
            to="/Catalog"
            className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors whitespace-nowrap"
          >
            Todo
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.label}
              to={cat.path}
              className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors whitespace-nowrap"
            >
              {cat.label}
            </Link>
          ))}
          <Link
            to="/Brands"
            className="px-3 py-1.5 text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors whitespace-nowrap"
          >
            Marcas
          </Link>
          <Link
            to="/DropsCalendar"
            className="px-3 py-1.5 text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors whitespace-nowrap flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
            Drops
          </Link>
          <Link
            to="/Pricing"
            className="px-3 py-1.5 text-xs font-medium text-yellow-400 hover:text-yellow-300 transition-colors whitespace-nowrap"
          >
            Planes
          </Link>
        </nav>
      </div>
    </header>
  );
}