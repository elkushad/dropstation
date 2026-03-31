import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import DropCountdownCard from '../drops/DropCountdownCard';

export default function DropsCountdown() {
  const [idx, setIdx] = useState(0);

  const { data: drops = [] } = useQuery({
    queryKey: ['drops-active'],
    queryFn: () => base44.entities.Drop.filter({ active: true }, 'drop_date', 5),
  });

  if (!drops.length) return null;

  const current = drops[idx];

  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <Link to={`/BrandProfile?id=${current.brand_id}`}>
              <DropCountdownCard drop={current} />
            </Link>
          </motion.div>
        </AnimatePresence>

        {drops.length > 1 && (
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={e => { e.preventDefault(); setIdx(i => (i - 1 + drops.length) % drops.length); }}
              className="w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={e => { e.preventDefault(); setIdx(i => (i + 1) % drops.length); }}
              className="w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}