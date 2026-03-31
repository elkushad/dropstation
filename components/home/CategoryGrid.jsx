import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const categories = [
  { name: 'Hoodies', value: 'hoodies', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=500&fit=crop', color: 'from-violet-600/80' },
  { name: 'T-Shirts', value: 't-shirts', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=500&fit=crop', color: 'from-fuchsia-600/80' },
  { name: 'Sneakers', value: 'sneakers', image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400&h=500&fit=crop', color: 'from-orange-600/80' },
  { name: 'Jackets', value: 'jackets', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop', color: 'from-emerald-600/80' },
  { name: 'Pants', value: 'pants', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=500&fit=crop', color: 'from-blue-600/80' },
  { name: 'Caps', value: 'caps', image: 'https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=400&h=500&fit=crop', color: 'from-red-600/80' },
];

export default function CategoryGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white">Categorías</h2>
          <p className="text-zinc-500 mt-1 text-sm">Encuentra tu estilo</p>
        </div>
        <Link to="/Catalog" className="text-violet-400 text-sm font-medium hover:text-violet-300 transition-colors">
          Ver todo →
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.value}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={`/Catalog?category=${cat.value}`}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden block"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} to-transparent opacity-80`} />
              <div className="absolute bottom-4 left-4">
                <h3 className="text-white font-bold text-sm">{cat.name}</h3>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}