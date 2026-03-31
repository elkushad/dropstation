import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Pencil, Trash2, Plus, Loader2 } from 'lucide-react';
import SubscriptionBanner from './SubscriptionBanner';
import DropsPanel from './DropsPanel';
import DiscountCodesPanel from './DiscountCodesPanel';

export default function MainTab({
  brand,
  products,
  activeSub,
  loadingProducts,
  onEditProduct,
  onDeleteProduct,
  onCreateProduct,
}) {
  return (
    <div className="space-y-10">
      {/* Subscription banner */}
      <SubscriptionBanner brandId={brand.id} productCount={products.filter(p => p.status === 'active').length} />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900 border-zinc-800 p-5">
          <p className="text-sm text-zinc-500">Productos</p>
          <p className="text-2xl font-bold text-white mt-1">{products.length}</p>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800 p-5">
          <p className="text-sm text-zinc-500">Activos</p>
          <p className="text-2xl font-bold text-green-400 mt-1">
            {products.filter(p => p.status === 'active').length}
          </p>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800 p-5 col-span-2 md:col-span-1">
          <p className="text-sm text-zinc-500">Borradores</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">
            {products.filter(p => p.status === 'draft').length}
          </p>
        </Card>
      </div>

      {/* Products list */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-zinc-400" /> Mis productos
        </h2>

        {loadingProducts ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
          </div>
        ) : products.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800 p-12 text-center">
            <Package className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500">No tienes productos aún</p>
            <Button
              onClick={onCreateProduct}
              className="mt-4 bg-violet-600 hover:bg-violet-700 text-white rounded-full"
            >
              <Plus className="w-4 h-4 mr-1" /> Crear primer producto
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {products.map(product => (
              <Card key={product.id} className="bg-zinc-900 border-zinc-800 p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-zinc-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-white">${product.price?.toLocaleString()}</span>
                    <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-400 capitalize">
                      {product.category?.replace('-', ' ')}
                    </Badge>
                    <Badge className={`text-[10px] ${product.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
                      {product.status === 'active' ? 'Activo' : 'Borrador'}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditProduct(product)}
                    className="text-zinc-400 hover:text-white hover:bg-white/10"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteProduct(product.id)}
                    className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Drops */}
      <DropsPanel brand={brand} />

      {/* Discount codes */}
      <DiscountCodesPanel brand={brand} />
    </div>
  );
}