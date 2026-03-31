import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <footer className="bg-black border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-black tracking-tighter mb-4">
                DROP<span className="text-violet-400">STATION</span>
              </h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                El marketplace de streetwear para marcas emergentes.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-300 mb-3">Categorías</h4>
              <div className="space-y-2">
                {['Hoodies', 'T-Shirts', 'Pants', 'Sneakers'].map(c => (
                  <Link key={c} to={`/Catalog?category=${c.toLowerCase()}`} className="block text-sm text-zinc-500 hover:text-white transition-colors">
                    {c}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-300 mb-3">Marcas</h4>
              <div className="space-y-2">
                <Link to="/Brands" className="block text-sm text-zinc-500 hover:text-white transition-colors">Ver marcas</Link>
                <Link to="/BrandDashboard" className="block text-sm text-zinc-500 hover:text-white transition-colors">Vender en Drop Station</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-300 mb-3">Legal</h4>
              <div className="space-y-2 text-sm text-zinc-500">
                <p>Términos y condiciones</p>
                <p>Política de privacidad</p>
              </div>
            </div>
          </div>
          <div className="border-t border-zinc-800 mt-8 pt-8 text-center text-xs text-zinc-600">
            © 2026 Drop Station. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}