import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import SaveButton from './SaveButton';
import { useCurrency } from '../layout/CurrencySelector';

export default function ProductCard({ product, index = 0 }) {
  const { formatPrice } = useCurrency();
  const hasDiscount = product.compare_price && product.compare_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&h=500&fit=crop';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link to={`/ProductDetail?id=${product.id}`} className="group block">
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Save button */}
          <div className="absolute top-3 right-3 z-10">
            <SaveButton product={product} />
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {hasDiscount && (
              <Badge className="bg-red-500 text-white border-0 text-xs font-bold px-2">
                -{discountPercent}%
              </Badge>
            )}
            {product.featured && (
              <Badge className="bg-violet-600 text-white border-0 text-xs font-medium px-2">
                Destacado
              </Badge>
            )}
          </div>

          {/* Quick info on hover */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {product.sizes?.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {product.sizes.map(size => (
                  <span key={size} className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded text-[10px] font-medium text-white">
                    {size}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <p className="text-[11px] font-medium text-violet-400 uppercase tracking-wider">
            {product.brand_name || 'Marca'}
          </p>
          <h3 className="text-sm font-semibold text-white truncate group-hover:text-violet-300 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-white">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-zinc-500 line-through">
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}