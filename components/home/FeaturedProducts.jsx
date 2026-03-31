import React from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import ProductGrid from '../products/ProductGrid';

export default function FeaturedProducts() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => base44.entities.Product.filter({ status: 'active' }, '-created_date', 8),
    initialData: [],
  });

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white">Recién llegados</h2>
          <p className="text-zinc-500 mt-1 text-sm">Las últimas piezas de marcas independientes</p>
        </div>
        <Link to="/Catalog" className="text-violet-400 text-sm font-medium hover:text-violet-300 transition-colors">
          Ver todo →
        </Link>
      </div>
      <ProductGrid products={products} isLoading={isLoading} />
    </section>
  );
}