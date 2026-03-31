import React, { useState, useMemo, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import ProductGrid from '../components/products/ProductGrid';
import CatalogFilters from '../components/catalog/CatalogFilters';

export default function Catalog() {
  const location = useLocation();

  const parseFiltersFromUrl = () => {
    const urlParams = new URLSearchParams(location.search);
    return {
      category: urlParams.get('category') || '',
      search: urlParams.get('search') || '',
      country: urlParams.get('country') || '',
      priceRange: [0, 500],
      brandId: '',
      sort: 'newest',
    };
  };

  const [filters, setFilters] = useState(parseFiltersFromUrl);

  useEffect(() => {
    setFilters(f => ({
      ...f,
      ...parseFiltersFromUrl(),
    }));
  }, [location.search]);

  const { data: products, isLoading } = useQuery({
    queryKey: ['catalog-products'],
    queryFn: () => base44.entities.Product.filter({ status: 'active' }),
    initialData: [],
  });

  const { data: brands } = useQuery({
    queryKey: ['catalog-brands'],
    queryFn: () => base44.entities.Brand.filter({ status: 'active' }),
    initialData: [],
  });

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.brand_name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }

    // Category
    if (filters.category) {
      result = result.filter(p => p.category === filters.category);
    }

    // Price range
    result = result.filter(p =>
      (p.price || 0) >= filters.priceRange[0] && (p.price || 0) <= filters.priceRange[1]
    );

    // Brand
    if (filters.brandId) {
      result = result.filter(p => p.brand_id === filters.brandId);
    }

    // Country (filter by brand's country)
    if (filters.country) {
      const countryBrandIds = new Set(
        brands.filter(b => b.country === filters.country).map(b => b.id)
      );
      result = result.filter(p => countryBrandIds.has(p.brand_id));
    }

    // Sort
    if (filters.sort === 'price_asc') {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (filters.sort === 'price_desc') {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else {
      result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }

    return result;
  }, [products, filters]);

  const activeFiltersCount = [
    filters.category,
    filters.brandId,
    filters.priceRange[0] > 0 || filters.priceRange[1] < 500,
    filters.sort !== 'newest',
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-white">
          {filters.category
            ? filters.category.charAt(0).toUpperCase() + filters.category.slice(1).replace('-', ' ')
            : filters.search
              ? `Resultados para "${filters.search}"`
              : 'Catálogo'}
        </h1>
        <p className="text-zinc-500 mt-1 text-sm">
          {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex gap-8">
        <CatalogFilters
          filters={filters}
          setFilters={setFilters}
          brands={brands}
          activeFiltersCount={activeFiltersCount}
        />
        <div className="flex-1 min-w-0">
          <ProductGrid products={filteredProducts} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}