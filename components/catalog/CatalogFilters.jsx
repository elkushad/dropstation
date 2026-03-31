import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { X, SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const CATEGORIES = [
  { value: 'hoodies', label: 'Hoodies' },
  { value: 't-shirts', label: 'T-Shirts' },
  { value: 'pants', label: 'Pants' },
  { value: 'jackets', label: 'Jackets' },
  { value: 'sneakers', label: 'Sneakers' },
  { value: 'accessories', label: 'Accesorios' },
  { value: 'caps', label: 'Caps' },
  { value: 'shorts', label: 'Shorts' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
];

function FilterContent({ filters, setFilters, brands }) {
  return (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Categoría</h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() =>
                setFilters(f => ({
                  ...f,
                  category: f.category === cat.value ? '' : cat.value,
                }))
              }
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filters.category === cat.value
                  ? 'bg-violet-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">
          Precio: ${filters.priceRange[0]} - ${filters.priceRange[1]}
        </h3>
        <Slider
          min={0}
          max={500}
          step={10}
          value={filters.priceRange}
          onValueChange={(val) => setFilters(f => ({ ...f, priceRange: val }))}
          className="mt-2"
        />
      </div>

      {/* Brands */}
      {brands?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Marca</h3>
          <div className="flex flex-wrap gap-2">
            {brands.map((brand) => (
              <button
                key={brand.id}
                onClick={() =>
                  setFilters(f => ({
                    ...f,
                    brandId: f.brandId === brand.id ? '' : brand.id,
                  }))
                }
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filters.brandId === brand.id
                    ? 'bg-violet-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                {brand.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sort */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Ordenar por</h3>
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilters(f => ({ ...f, sort: opt.value }))}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filters.sort === opt.value
                  ? 'bg-violet-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CatalogFilters({ filters, setFilters, brands, activeFiltersCount }) {
  const clearFilters = () => {
    setFilters({
      category: '',
      priceRange: [0, 500],
      brandId: '',
      sort: 'newest',
      search: '',
    });
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Filtros</h2>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-zinc-400 hover:text-white text-xs">
                <X className="w-3 h-3 mr-1" /> Limpiar
              </Button>
            )}
          </div>
          <FilterContent filters={filters} setFilters={setFilters} brands={brands} />
        </div>
      </aside>

      {/* Mobile filter sheet */}
      <div className="lg:hidden mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800 rounded-full">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 bg-violet-600 text-white border-0 text-[10px] px-1.5">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-zinc-950 border-zinc-800 rounded-t-3xl max-h-[80vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-white">Filtros</SheetTitle>
            </SheetHeader>
            <div className="mt-6 pb-8">
              <FilterContent filters={filters} setFilters={setFilters} brands={brands} />
              {activeFiltersCount > 0 && (
                <Button onClick={clearFilters} variant="outline" className="w-full mt-6 border-zinc-700 text-zinc-300 rounded-full">
                  Limpiar filtros
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}