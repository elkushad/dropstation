import React from 'react';
import HeroSection from '../components/home/HeroSection';
import CategoryGrid from '../components/home/CategoryGrid';
import FeaturedProducts from '../components/home/FeaturedProducts';
import BrandsShowcase from '../components/home/BrandsShowcase';
import DropsCountdown from '../components/home/DropsCountdown';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <DropsCountdown />
      <CategoryGrid />
      <FeaturedProducts />
      <BrandsShowcase />
    </div>
  );
}