import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Package, Plus, Link2, Unlink, Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import ProductForm from './ProductForm';

export default function DropProductsManager({ drop, brand, open, onOpenChange }) {
  const queryClient = useQueryClient();
  const [showProductForm, setShowProductForm] = useState(false);
  const [linking, setLinking] = useState(null);

  // Products already linked to this drop
  const { data: dropProducts = [], isLoading: loadingDropProducts } = useQuery({
    queryKey: ['drop-products', drop.id],
    queryFn: () => base44.entities.Product.filter({ brand_id: brand.id, drop_id: drop.id }),
    enabled: open,
  });

  // All other brand products (draft or active, not linked to this drop)
  const { data: otherProducts = [] } = useQuery({
    queryKey: ['brand-products-linkable', brand.id, drop.id],
    queryFn: () => base44.entities.Product.filter({ brand_id: brand.id }),
    enabled: open,
    select: (data) => data.filter(p => p.drop_id !== drop.id),
  });

  const isPast = new Date(drop.drop_date) <= new Date();

  const handleLink = async (product) => {
    setLinking(product.id);
    await base44.entities.Product.update(product.id, {
      drop_id: drop.id,
      status: isPast ? 'active' : 'draft',
    });
    toast.success(`"${product.name}" agregado al drop`);
    queryClient.invalidateQueries({ queryKey: ['drop-products', drop.id] });
    queryClient.invalidateQueries({ queryKey: ['brand-products-linkable', brand.id, drop.id] });
    setLinking(null);
  };

  const handleUnlink = async (product) => {
    setLinking(product.id);
    await base44.entities.Product.update(product.id, {
      drop_id: null,
      status: 'draft',
    });
    toast.success(`"${product.name}" quitado del drop`);
    queryClient.invalidateQueries({ queryKey: ['drop-products', drop.id] });
    queryClient.invalidateQueries({ queryKey: ['brand-products-linkable', brand.id, drop.id] });
    setLinking(null);
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['drop-products', drop.id] });
    queryClient.invalidateQueries({ queryKey: ['brand-products-linkable', brand.id, drop.id] });
    queryClient.invalidateQueries({ queryKey: ['my-products', brand.id] });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Prendas del drop · <span className="text-violet-400 font-normal">{drop.title}</span>
            </DialogTitle>
          </DialogHeader>

          {/* Info banner */}
          {!isPast && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 text-sm text-yellow-300 flex items-start gap-2">
              <Zap className="w-4 h-4 mt-0.5 flex-shrink-0 fill-yellow-400 text-yellow-400" />
              <span>
                Las prendas se guardan como <strong>borrador</strong> y se publicarán automáticamente cuando el drop arranque.
              </span>
            </div>
          )}

          {/* Products in this drop */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-zinc-300">
                Prendas en este drop ({dropProducts.length})
              </h3>
              <Button
                size="sm"
                onClick={() => setShowProductForm(true)}
                className="bg-violet-600 hover:bg-violet-700 text-white rounded-full text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Nueva prenda
              </Button>
            </div>

            {loadingDropProducts ? (
              <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-zinc-500" /></div>
            ) : dropProducts.length === 0 ? (
              <Card className="bg-zinc-900 border-zinc-800 border-dashed p-6 text-center">
                <Package className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                <p className="text-zinc-500 text-sm">Sin prendas aún. Crea una nueva o asigna una existente.</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {dropProducts.map(p => (
                  <Card key={p.id} className="bg-zinc-900 border-zinc-800 p-3 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                        : <Package className="w-5 h-5 text-zinc-600 m-auto mt-3" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-zinc-400">${p.price?.toLocaleString()}</span>
                        <Badge className="text-[10px] bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                          Borrador · se publica con el drop
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost" size="icon"
                      disabled={linking === p.id}
                      onClick={() => handleUnlink(p)}
                      className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 flex-shrink-0"
                    >
                      {linking === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlink className="w-4 h-4" />}
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Other products to link */}
          {otherProducts.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-zinc-300 mb-3">Asignar prenda existente</h3>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {otherProducts.map(p => (
                  <div key={p.id} className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                        : <Package className="w-4 h-4 text-zinc-600 m-auto mt-3" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{p.name}</p>
                      <span className="text-xs text-zinc-500">${p.price?.toLocaleString()} · {p.status}</span>
                    </div>
                    <Button
                      size="sm" variant="outline"
                      disabled={linking === p.id}
                      onClick={() => handleLink(p)}
                      className="border-zinc-700 text-zinc-300 hover:text-white rounded-full text-xs flex-shrink-0"
                    >
                      {linking === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Link2 className="w-3 h-3 mr-1" /> Agregar</>}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Product form for creating a new product pre-linked to this drop */}
      <ProductForm
        open={showProductForm}
        onOpenChange={setShowProductForm}
        product={{ drop_id: drop.id, status: 'draft' }}
        brand={brand}
        onSuccess={invalidateAll}
      />
    </>
  );
}