import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { TrendingUp, Package, DollarSign, ShoppingCart, BarChart3, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AnalyticsTab({ brand, products }) {
  // Productos por categoría
  const categoryStats = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const topCategories = Object.entries(categoryStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Productos más caros
  const topPriced = [...products]
    .sort((a, b) => (b.price || 0) - (a.price || 0))
    .slice(0, 5);

  // Productos con descuento
  const discountedProducts = products.filter(p => p.compare_price && p.compare_price > p.price);

  // Valor total del inventario
  const totalInventoryValue = products
    .filter(p => p.status === 'active')
    .reduce((sum, p) => sum + (p.price || 0) * (p.stock || 0), 0);

  // Precio promedio
  const avgPrice = products.length > 0
    ? products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length
    : 0;

  return (
    <div className="space-y-8">
      {/* KPIs principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-violet-400" />
            <p className="text-xs text-zinc-500 font-medium">Total productos</p>
          </div>
          <p className="text-2xl font-bold text-white">{products.length}</p>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <p className="text-xs text-zinc-500 font-medium">Activos</p>
          </div>
          <p className="text-2xl font-bold text-green-400">
            {products.filter(p => p.status === 'active').length}
          </p>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-yellow-400" />
            <p className="text-xs text-zinc-500 font-medium">Precio promedio</p>
          </div>
          <p className="text-2xl font-bold text-white">${avgPrice.toFixed(0)}</p>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-5">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="w-4 h-4 text-blue-400" />
            <p className="text-xs text-zinc-500 font-medium">Con descuento</p>
          </div>
          <p className="text-2xl font-bold text-blue-400">{discountedProducts.length}</p>
        </Card>
      </div>

      {/* Inventario */}
      <Card className="bg-zinc-900 border-zinc-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-violet-400" />
          <h3 className="text-lg font-bold text-white">Valor del inventario</h3>
        </div>
        <p className="text-3xl font-black text-violet-400 mb-2">
          ${totalInventoryValue.toLocaleString()}
        </p>
        <p className="text-sm text-zinc-500">
          Basado en {products.filter(p => p.status === 'active').length} productos activos
        </p>
      </Card>

      {/* Categorías más populares */}
      <Card className="bg-zinc-900 border-zinc-800 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Productos por categoría</h3>
        <div className="space-y-3">
          {topCategories.map(([category, count]) => (
            <div key={category} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-zinc-300 capitalize">
                    {category?.replace('-', ' ')}
                  </span>
                  <span className="text-sm font-bold text-white">{count}</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full"
                    style={{ width: `${(count / products.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        {topCategories.length === 0 && (
          <p className="text-zinc-500 text-sm text-center py-8">
            No hay productos para analizar
          </p>
        )}
      </Card>

      {/* Top productos por precio */}
      <Card className="bg-zinc-900 border-zinc-800 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Top 5 por precio</h3>
        <div className="space-y-3">
          {topPriced.map((product, i) => (
            <div key={product.id} className="flex items-center gap-3">
              <span className="text-lg font-bold text-zinc-600 w-6">{i + 1}</span>
              <div className="w-12 h-12 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-4 h-4 text-zinc-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{product.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-400 capitalize">
                    {product.category?.replace('-', ' ')}
                  </Badge>
                  <Badge className={`text-[10px] ${
                    product.status === 'active'
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  }`}>
                    {product.status === 'active' ? 'Activo' : 'Borrador'}
                  </Badge>
                </div>
              </div>
              <span className="text-base font-bold text-white">${product.price?.toLocaleString()}</span>
            </div>
          ))}
        </div>
        {topPriced.length === 0 && (
          <p className="text-zinc-500 text-sm text-center py-8">
            No hay productos para mostrar
          </p>
        )}
      </Card>

      {/* Stock alerts */}
      <Card className="bg-zinc-900 border-zinc-800 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Estado del stock</h3>
        <div className="space-y-3">
          {products
            .filter(p => p.stock !== undefined && p.stock <= 5)
            .map(product => (
              <div key={product.id} className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-4 h-4 text-zinc-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{product.name}</p>
                  <p className="text-xs text-zinc-400">Stock bajo</p>
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  {product.stock} unidades
                </Badge>
              </div>
            ))}
          {products.filter(p => p.stock !== undefined && p.stock <= 5).length === 0 && (
            <p className="text-zinc-500 text-sm text-center py-4">
              ✓ Stock suficiente en todos los productos
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}