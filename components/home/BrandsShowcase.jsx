import React from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function BrandsShowcase() {
  const { data: brands, isLoading } = useQuery({
    queryKey: ['brands-showcase'],
    queryFn: () => base44.entities.Brand.filter({ status: 'active' }, '-created_date', 6),
    initialData: [],
  });

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white">Marcas destacadas</h2>
          <p className="text-zinc-500 mt-1 text-sm">Conoce a los creadores detrás del streetwear</p>
        </div>
        <Link to="/Brands" className="text-violet-400 text-sm font-medium hover:text-violet-300 transition-colors flex items-center gap-1">
          Todas las marcas <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="text-center space-y-3">
              <Skeleton className="w-20 h-20 rounded-full mx-auto bg-zinc-800" />
              <Skeleton className="h-4 w-24 mx-auto bg-zinc-800" />
            </div>
          ))}
        </div>
      ) : brands.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {brands.map((brand, i) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/BrandProfile?id=${brand.id}`} className="group text-center block">
                <div className="w-20 h-20 mx-auto rounded-full bg-zinc-800 overflow-hidden border-2 border-zinc-700 group-hover:border-violet-500 transition-colors">
                  {brand.logo_url ? (
                    <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-black text-zinc-500">
                      {brand.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <h3 className="mt-3 text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">
                  {brand.name}
                </h3>
                {brand.city && (
                  <p className="text-xs text-zinc-600 mt-0.5">{brand.city}</p>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-zinc-600 text-sm">
          Aún no hay marcas registradas
        </div>
      )}
    </section>
  );
}