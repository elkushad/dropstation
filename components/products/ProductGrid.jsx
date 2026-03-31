import React from 'react';
import ProductCard from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductGrid({ products, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array(8).fill(0).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[3/4] rounded-2xl bg-zinc-800" />
            <Skeleton className="h-3 w-16 bg-zinc-800" />
            <Skeleton className="h-4 w-32 bg-zinc-800" />
            <Skeleton className="h-4 w-20 bg-zinc-800" />
          </div>
        ))}
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500 text-lg">No se encontraron productos</p>
        <p className="text-zinc-600 text-sm mt-1">Intenta con otros filtros</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
}