import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

export default function SaveButton({ product, className = '' }) {
  const [saved, setSaved] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      const user = await base44.auth.me().catch(() => null);
      if (!user || cancelled) return;
      const results = await base44.entities.Saved.filter({
        product_id: product.id,
        created_by: user.email,
      });
      if (!cancelled && results?.length > 0) {
        setSaved(true);
        setSavedId(results[0].id);
      }
    }
    check();
    return () => { cancelled = true; };
  }, [product.id]);

  const toggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    if (saved) {
      await base44.entities.Saved.delete(savedId);
      setSaved(false);
      setSavedId(null);
    } else {
      const record = await base44.entities.Saved.create({
        product_id: product.id,
        product_name: product.name,
        product_image: product.images?.[0] || '',
        product_price: product.price,
        brand_name: product.brand_name,
        brand_id: product.brand_id,
      });
      setSaved(true);
      setSavedId(record.id);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      className={cn(
        'flex items-center justify-center w-8 h-8 rounded-full transition-all',
        saved
          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
          : 'bg-black/40 text-white/70 hover:bg-black/60 hover:text-white',
        className
      )}
    >
      <Heart className={cn('w-4 h-4', saved && 'fill-current')} />
    </button>
  );
}