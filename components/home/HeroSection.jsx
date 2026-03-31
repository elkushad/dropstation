import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const SLIDES = [
  {
    badge: "Marcas independientes · Streetwear auténtico",
    title: ["El futuro del", "streetwear", "está aquí"],
    description: "Descubre marcas emergentes, piezas únicas y el estilo que define a tu generación.",
    image: "https://fv5-7.files.fm/thumb_show.php?i=yf5t84wxeb&view&v=1&PHPSESSID=0fd779ec7faf2724b53247e5ab534bc0b28057dd"
  },
  {
    badge: "Ediciones limitadas · Drops exclusivos",
    title: ["Viste lo que", "nadie más", "tiene"],
    description: "Accede a colecciones únicas de marcas peruanas que están revolucionando la moda urbana.",
    image: "https://fv5-5.files.fm/thumb_show.php?i=nkkr2eubet&view&v=1&PHPSESSID=0fd779ec7faf2724b53247e5ab534bc0b28057dd"
  },
  {
    badge: "Diseños Radicales · Estilo global",
    title: ["Lo mejor del", "STREETWEAR", "en un solo lugar"],
    description: "Sé parte del movimiento que está redefiniendo el streetwear latinoamericano.",
    image: "https://fv5-7.files.fm/thumb_show.php?i=ggrsusfqna&view&v=1&PHPSESSID=0fd779ec7faf2724b53247e5ab534bc0b28057dd"
  },
  {
    badge: "Directo del diseñador · Sin intermediarios",
    title: ["Conecta con", "creadores", "reales"],
    description: "Compra directamente a las mentes creativas detrás de cada prenda. Calidad garantizada.",
    image: "https://fv5-7.files.fm/thumb_show.php?i=ka9m694mc2&view&v=1&PHPSESSID=0fd779ec7faf2724b53247e5ab534bc0b28057dd"
  }
];

export default function HeroSection() {
  const [count, setCount] = useState(113);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + Math.floor(Math.random() * 5) - 2);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentSlide(s => (s + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const slide = SLIDES[currentSlide];

  return (
    <section className="relative overflow-hidden">
      {/* Background with transition */}
      <div className="absolute inset-0">
        {SLIDES.map((s, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{ opacity: i === currentSlide ? 1 : 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <img
              src={s.image}
              alt="Streetwear"
              className="w-full h-full object-cover object-[70%] md:object-center"
            />
          </motion.div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 lg:py-44 overflow-x-hidden">
        <div className="max-w-2xl">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-violet-300 text-xs font-medium">{slide.badge}</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[0.95]">
              {slide.title[0]}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                {slide.title[1]}
              </span>
              <br />
              {slide.title[2]}
            </h1>
            
            <p className="mt-6 text-lg text-zinc-400 max-w-lg leading-relaxed">
              {slide.description}
            </p>
          </motion.div>

          <div className="inline-flex items-center gap-2 mt-4 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-300 text-sm font-medium">
              <span className="font-bold text-green-200">{count}</span> personas conectadas buscando su próximo outfit
            </span>
          </div>

          <div className="flex flex-wrap gap-3 mt-8">
            <Link to="/Catalog">
              <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white rounded-full px-8 font-semibold h-12">
                Explorar catálogo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/Brands">
              <Button size="lg" variant="outline" className="border-zinc-600 text-white hover:bg-white/10 rounded-full px-8 font-semibold h-12">
                Ver marcas
              </Button>
            </Link>
          </div>

          {/* Slide indicators */}
          <div className="flex gap-2 mt-8">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1 rounded-full transition-all ${
                  i === currentSlide ? 'w-8 bg-violet-400' : 'w-1.5 bg-zinc-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}