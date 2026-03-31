import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ShoppingCart, Share2, Truck, Shield, RotateCcw, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import SaveButton from '../components/products/SaveButton';
import { motion } from 'framer-motion';
import ProductGrid from '../components/products/ProductGrid';
import { useCart } from '../components/cart/CartContext';
import ChatWidget from '../components/chat/ChatWidget';
import ProductComments from '../components/products/ProductComments';
import { useCurrency } from '../components/layout/CurrencySelector';

export default function ProductDetail() {
  const { formatPrice } = useCurrency();
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const handleAddToCart = () => {
    const size = selectedSize || product?.sizes?.[0] || 'Unica';
    addItem(product, size);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => base44.entities.Product.filter({ id: productId }),
    select: (data) => data?.[0],
    enabled: !!productId,
  });

  const { data: brand } = useQuery({
    queryKey: ['brand-for-comments', product?.brand_id],
    queryFn: () => base44.entities.Brand.filter({ id: product.brand_id }),
    select: (data) => data?.[0],
    enabled: !!product?.brand_id,
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ['related-products', product?.category],
    queryFn: () => base44.entities.Product.filter({ category: product.category, status: 'active' }),
    enabled: !!product?.category,
    initialData: [],
    select: (data) => data.filter(p => p.id !== productId).slice(0, 4),
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <Skeleton className="aspect-square rounded-2xl bg-zinc-800" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-24 bg-zinc-800" />
            <Skeleton className="h-8 w-64 bg-zinc-800" />
            <Skeleton className="h-6 w-32 bg-zinc-800" />
            <Skeleton className="h-20 w-full bg-zinc-800" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-zinc-500 text-lg">Producto no encontrado</p>
        <Link to="/Catalog">
          <Button variant="outline" className="mt-4 border-zinc-700 text-zinc-300 rounded-full">
            Volver al catálogo
          </Button>
        </Link>
      </div>
    );
  }

  const images = product.images?.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&h=600&fit=crop'];

  const hasDiscount = product.compare_price && product.compare_price > product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link to="/Catalog" className="text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Catálogo
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="text-zinc-400 capitalize">{product.category?.replace('-', ' ')}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-3"
        >
          <div 
            className="aspect-square rounded-2xl overflow-hidden bg-zinc-900 relative cursor-crosshair touch-none group"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setShowZoom(true)}
            onMouseLeave={() => setShowZoom(false)}
            onTouchStart={() => setShowZoom(true)}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => setShowZoom(false)}
          >
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {showZoom && (
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `url(${images[selectedImage]})`,
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  backgroundSize: '250%',
                  backgroundRepeat: 'no-repeat',
                }}
              />
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(prev => prev === 0 ? images.length - 1 : prev - 1);
                  }}
                  onMouseEnter={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white opacity-0 md:group-hover:opacity-100 md:opacity-0 opacity-100 transition-opacity z-10 drop-shadow-lg"
                >
                  <ChevronLeft className="w-8 h-8" strokeWidth={3} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(prev => prev === images.length - 1 ? 0 : prev + 1);
                  }}
                  onMouseEnter={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white opacity-0 md:group-hover:opacity-100 md:opacity-0 opacity-100 transition-opacity z-10 drop-shadow-lg"
                >
                  <ChevronRight className="w-8 h-8" strokeWidth={3} />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    selectedImage === i ? 'border-violet-500' : 'border-zinc-800'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {product.brand_name && (
            <Link
              to={`/BrandProfile?id=${product.brand_id}`}
              className="inline-block text-violet-400 text-sm font-semibold uppercase tracking-wider hover:text-violet-300 transition-colors"
            >
              {product.brand_name}
            </Link>
          )}

          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
            {product.name}
          </h1>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-white">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <>
                <span className="text-lg text-zinc-500 line-through">{formatPrice(product.compare_price)}</span>
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                  -{Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}%
                </Badge>
              </>
            )}
          </div>

          {product.description && (
            <p className="text-zinc-400 leading-relaxed">{product.description}</p>
          )}

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-300 mb-3">Talla</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-xl text-sm font-medium transition-all ${
                      selectedSize === size
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-700 hover:border-zinc-500'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-300 mb-3">Colores disponibles</h3>
              <div className="flex gap-2">
                {product.colors.map(color => (
                  <Badge key={color} variant="outline" className="border-zinc-700 text-zinc-300">
                    {color}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              size="lg"
              onClick={handleAddToCart}
              className={`flex-1 rounded-full h-14 text-base font-semibold transition-all ${
                added ? 'bg-green-600 hover:bg-green-600' : 'bg-violet-600 hover:bg-violet-700'
              } text-white`}
            >
              {added ? <Check className="w-5 h-5 mr-2" /> : <ShoppingCart className="w-5 h-5 mr-2" />}
              {added ? '¡Agregado!' : 'Agregar al carrito'}
            </Button>
            <div className="border border-zinc-700 rounded-full h-14 w-14 flex items-center justify-center">
              <SaveButton product={product} className="w-10 h-10" />
            </div>
            <Button size="lg" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-white/5 rounded-full h-14 w-14 p-0">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
          {product.brand_id && (
            <div className="pt-2">
              <ChatWidget brand={{ id: product.brand_id, name: product.brand_name }} product={product} />
            </div>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
            <div className="text-center">
              <Truck className="w-5 h-5 mx-auto text-zinc-500 mb-1" />
              <p className="text-[11px] text-zinc-500">Envío seguro</p>
            </div>
            <div className="text-center">
              <Shield className="w-5 h-5 mx-auto text-zinc-500 mb-1" />
              <p className="text-[11px] text-zinc-500">Compra protegida</p>
            </div>
            <div className="text-center">
              <RotateCcw className="w-5 h-5 mx-auto text-zinc-500 mb-1" />
              <p className="text-[11px] text-zinc-500">Devolución gratis</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Comments */}
      <ProductComments product={product} user={currentUser} brand={brand} />

      {/* Related products */}
      {relatedProducts?.length > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl font-black text-white mb-6">También te puede gustar</h2>
          <ProductGrid products={relatedProducts} isLoading={false} />
        </div>
      )}
    </div>
  );
}