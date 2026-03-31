import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const REVIEWS = [
  {
    brand: 'Urban Chaos',
    logo: '🔥',
    review: 'La plataforma perfecta para lanzar nuestros drops. Las ventas se triplicaron.',
    rating: 5,
  },
  {
    brand: 'Street Rebels',
    logo: '⚡',
    review: 'El sistema de notificaciones de drops es increíble. Nuestros clientes siempre están al tanto.',
    rating: 5,
  },
  {
    brand: 'Concrete Dreams',
    logo: '🌙',
    review: 'Finalmente una plataforma que entiende el streetwear peruano. 100% recomendado.',
    rating: 5,
  },
  {
    brand: 'Savage Culture',
    logo: '💀',
    review: 'La mejor inversión para nuestra marca. El dashboard es súper intuitivo.',
    rating: 5,
  },
  {
    brand: 'Neon Vibes',
    logo: '🎨',
    review: 'Pasamos de vender en Instagram a tener nuestra tienda profesional. Game changer.',
    rating: 5,
  },
  {
    brand: 'Dark Wave',
    logo: '🌊',
    review: 'El perfil verificado nos dio mucha más credibilidad. Las ventas subieron inmediatamente.',
    rating: 5,
  },
  {
    brand: 'Ghetto Luxe',
    logo: '👑',
    review: 'Los drops con cuenta regresiva generan un hype increíble. Nuestras colecciones se agotan rápido.',
    rating: 5,
  },
  {
    brand: 'Raw Energy',
    logo: '⚙️',
    review: 'Conectar con compradores directamente es lo mejor. Ya no dependemos de intermediarios.',
    rating: 5,
  },
  {
    brand: 'Alpha Squad',
    logo: '🐺',
    review: 'La comunidad de compradores es increíble. Todos buscan piezas únicas y originales.',
    rating: 5,
  },
  {
    brand: 'Midnight City',
    logo: '🌃',
    review: 'Desde que entramos a la plataforma, nuestra marca creció 400%. Totalmente recomendado.',
    rating: 5,
  },
];

export default function BrandReviewsCarousel() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prev) => prev - 0.5);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Duplicate reviews for seamless loop
  const extendedReviews = [...REVIEWS, ...REVIEWS, ...REVIEWS];

  return (
    <div className="mt-16 overflow-hidden">
      <h2 className="text-2xl font-black text-white text-center mb-8">
        Lo que dicen las marcas
      </h2>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-zinc-950 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-zinc-950 to-transparent z-10" />
        
        <motion.div
          className="flex gap-4"
          style={{
            x: offset,
          }}
        >
          {extendedReviews.map((review, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-80 bg-zinc-900 border border-zinc-800 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-2xl">
                  {review.logo}
                </div>
                <div>
                  <h3 className="font-bold text-white">{review.brand}</h3>
                  <div className="flex gap-0.5">
                    {Array(review.rating).fill(0).map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">"{review.review}"</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}