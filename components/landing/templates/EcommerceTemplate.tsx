'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  ArrowRight,
  Filter,
  Check,
  Calendar,
  MessageSquare,
  Eye,
  SlidersHorizontal,
  Plus,
  Percent,
  ChevronDown,
  CheckCheck,
  Leaf,
  Layers,
  Award,
} from 'lucide-react';
import { IndustryTemplateProps } from '../types';
import { ScrollProgress } from '../effects/ScrollProgress';
import { TiltCard } from '../effects/TiltCard';
import { KineticMarquee } from '../effects/KineticMarquee';

export const EcommerceTemplate: React.FC<IndustryTemplateProps> = ({
  config,
  isDark,
  onOpenBooking,
  onOpenChat,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'apparel' | 'accessories' | 'home'>('all');
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  const [cartCount, setCartCount] = useState<number>(2);
  const [promoCopied, setPromoCopied] = useState<boolean>(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const toggleLike = (id: string) => {
    setLikedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddToCart = () => {
    setCartCount((prev) => prev + 1);
  };

  const copyPromo = () => {
    navigator.clipboard.writeText('LUXE15');
    setPromoCopied(true);
    setTimeout(() => setPromoCopied(false), 2500);
  };

  const ethicalTicker = [
    'GOTS-CERTIFIED ORGANIC MERINO WOOL',
    'VEGETABLE-TANNED TUSCAN FULL-GRAIN LEATHER',
    '100% BELGIAN LONG-STAPLE FLAX LINEN',
    'CLOSED-LOOP BOTANICAL WATER-BASED DYES',
    'HANDCRAFTED IN FLORENCE & KYOTO ATELIERS',
    'CARBON-NEUTRAL GLOBAL EXPRESS SHIPPING',
  ];

  const products = [
    {
      id: 'p1',
      name: 'Merino Wool Structured Overshirt',
      category: 'apparel',
      price: 185,
      rating: 4.9,
      reviewsCount: 142,
      tag: 'Bestseller',
      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop',
      color: 'Charcoal / Heather Grey',
    },
    {
      id: 'p2',
      name: 'Full-Grain Italian Leather Tote',
      category: 'accessories',
      price: 260,
      rating: 5.0,
      reviewsCount: 88,
      tag: 'Handcrafted',
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop',
      color: 'Cognac Saddle',
    },
    {
      id: 'p3',
      name: 'Ceramic Matte Pour-Over Vessel',
      category: 'home',
      price: 74,
      rating: 4.8,
      reviewsCount: 65,
      tag: 'Limited Edition',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop',
      color: 'Bone White',
    },
    {
      id: 'p4',
      name: 'Organic Brushed Cotton Relaxed Trouser',
      category: 'apparel',
      price: 140,
      rating: 4.9,
      reviewsCount: 119,
      tag: 'Eco-Certified',
      image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop',
      color: 'Olive Drab',
    },
    {
      id: 'p5',
      name: 'Minimalist Titanium Chronograph',
      category: 'accessories',
      price: 320,
      rating: 5.0,
      reviewsCount: 204,
      tag: 'Swiss Movement',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
      color: 'Matte Titanium',
    },
    {
      id: 'p6',
      name: 'Linen Textured Waffle Throw Blanket',
      category: 'home',
      price: 110,
      rating: 4.7,
      reviewsCount: 93,
      tag: '100% Belgian Flax',
      image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=800&auto=format&fit=crop',
      color: 'Oatmeal',
    },
  ];

  const filteredProducts =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.category === activeCategory);

  const materials = [
    {
      name: 'Extra-Fine Merino Wool (19.5 Micron)',
      origin: 'New Zealand High Country',
      sustainability: 'ZQ-Certified Humane Shearing',
      desc: 'Naturally thermoregulating, odor-resistant, and pill-resistant for year-round architectural layering.',
    },
    {
      name: 'Vegetable-Tanned Vacchetta Leather',
      origin: 'Santa Croce sull’Arno, Tuscany',
      sustainability: '100% Chrome-Free Plant Tannins',
      desc: 'Ages into a deep golden patina with everyday use rather than deteriorating like synthetic faux leathers.',
    },
    {
      name: 'Long-Staple Organic Belgian Flax',
      origin: 'Kortrijk, Flanders',
      sustainability: 'Zero Synthetic Irrigation',
      desc: 'Harvested using traditional rain-fed dew retting, creating a breathable fabric with remarkable tensile strength.',
    },
  ];

  const faqs = [
    {
      q: 'What is your shipping timeframe and courier carrier?',
      a: 'Orders ship via DHL Express or FedEx Carbon-Neutral within 24 business hours. Transit takes 2-3 business days within the US and 3-5 days worldwide.',
    },
    {
      q: 'How does the 30-Day In-Home Trial work?',
      a: 'Try your garments in the comfort of your home. If the fit or drape is anything less than ideal, use the prepaid return label included in your parcel for a full refund.',
    },
    {
      q: 'Are custom alterations and tailoring available for purchased pieces?',
      a: 'Yes. Every apparel purchase includes complimentary consultation with our master tailors. You can book an appointment directly through our online calendar.',
    },
    {
      q: 'How do I care for my organic merino and raw linen garments?',
      a: 'We recommend gentle spot cleaning or cold water hand-washing with pH-neutral wool soap, followed by flat drying away from direct sunlight.',
    },
  ];

  return (
    <div className={`relative min-h-screen ${isDark ? 'bg-[#0E0E0E] text-neutral-100' : 'bg-[#FAFAF9] text-neutral-900'} overflow-x-hidden font-sans transition-colors duration-200`}>
      {/* 1. SCROLL PROGRESS */}
      <ScrollProgress color="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500" />

      {/* 1. TOP ANNOUNCEMENT TICKER */}
      <div className={`border-b py-2 px-4 text-center text-xs font-medium tracking-wider uppercase ${
        isDark ? 'border-amber-900/40 bg-neutral-950 text-amber-300' : 'border-neutral-200 bg-neutral-900 text-neutral-100 shadow-2xs'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
          <span className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-amber-400" />
            Complimentary Worldwide Express Shipping on Orders Over $150
          </span>
          <span className="hidden md:inline text-neutral-500">|</span>
          <span className="hidden md:inline">30-Day In-Home Trial Guarantee</span>
        </div>
      </div>

      {/* 2. HERO SECTION: EDITORIAL SHOWCASE */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-16 md:py-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase border ${
              isDark ? 'bg-amber-950/40 text-amber-400 border-amber-800' : 'bg-amber-100 text-amber-900 border-amber-300'
            }`}>
              <Sparkles className="w-3.5 h-3.5" />
              Autumn / Winter 2026 Capsule
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light tracking-tight leading-[1.1]">
              {config.heroHeadline || (
                <>
                  Elevate Everyday Living <br />
                  <span className="italic text-amber-600 dark:text-amber-400">
                    With Timeless Simplicity.
                  </span>
                </>
              )}
            </h1>

            <p className={`text-base sm:text-lg ${isDark ? 'text-neutral-400' : 'text-neutral-600'} leading-relaxed font-light max-w-xl`}>
              {config.heroSubheadline ||
                'Responsibly sourced garments, architectural home objects, and handcrafted accessories designed to endure a lifetime of thoughtful use.'}
            </p>

            {/* Promo Code Box */}
            <div className={`p-4 rounded-xl border max-w-md flex items-center justify-between ${
              isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Limited Welcome Offer</div>
                  <div className="text-sm font-bold text-neutral-900 dark:text-white">Use code <span className="text-amber-600 dark:text-amber-400 tracking-wider">LUXE15</span> for 15% off</div>
                </div>
              </div>
              <button
                onClick={copyPromo}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  promoCopied
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                }`}
              >
                {promoCopied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#catalog"
                className="px-8 py-3.5 rounded-full font-medium text-sm transition-all duration-200 flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20 active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Shop The Capsule</span>
              </a>
              <button
                onClick={() => onOpenBooking()}
                className={`px-6 py-3.5 rounded-full font-medium text-sm transition-all duration-200 flex items-center gap-2 border cursor-pointer ${
                  isDark
                    ? 'border-neutral-700 hover:border-neutral-500 bg-neutral-900 text-neutral-200'
                    : 'border-neutral-300 hover:border-neutral-400 bg-white text-neutral-800 shadow-sm'
                }`}
              >
                <Calendar className="w-4 h-4 text-amber-500" />
                <span>Book Private Styling</span>
              </button>
            </div>

            {/* Counters */}
            <div className="pt-6 grid grid-cols-3 gap-6 border-t border-neutral-200 dark:border-neutral-800">
              <div>
                <div className="text-2xl font-bold font-serif">48k+</div>
                <div className="text-xs text-neutral-500">Orders Delivered</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-serif">4.92</div>
                <div className="text-xs text-neutral-500">Verified Rating</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-serif">100%</div>
                <div className="text-xs text-neutral-500">Traceable Fibers</div>
              </div>
            </div>
          </div>

          {/* Right Hero Column: Editorial Image Collage */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden aspect-4/5 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop"
                alt="Editorial Capsule Wardrobe"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Floating Highlight Card */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl backdrop-blur-md bg-white/90 dark:bg-neutral-900/90 border border-white/20 dark:border-neutral-800 shadow-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Featured Piece</div>
                  <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Bespoke Cashmere Knit Overcoat</div>
                  <div className="text-xs text-neutral-500">$340 · Hand-stitched in Florence</div>
                </div>
                <button
                  onClick={() => onOpenBooking()}
                  className="px-3.5 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Reserve Fit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KINETIC TICKER */}
      <section className={`py-5 border-y ${
        isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-200 bg-neutral-100/70'
      }`}>
        <KineticMarquee speed={22} pauseOnHover={true}>
          {ethicalTicker.map((item, idx) => (
            <div
              key={idx}
              className={`px-5 py-1.5 rounded-full border text-xs font-mono font-bold tracking-wider whitespace-nowrap ${
                isDark ? 'border-neutral-800 bg-neutral-900 text-amber-300' : 'border-neutral-200 bg-white text-neutral-800 shadow-2xs'
              }`}
            >
              {item}
            </div>
          ))}
        </KineticMarquee>
      </section>

      {/* 4. VALUE PROPOSITIONS BAR */}
      <section className={`border-b ${isDark ? 'border-neutral-800 bg-neutral-900/30' : 'border-neutral-200 bg-white'} py-8`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">Carbon-Neutral Shipping</h4>
                <p className="text-xs text-neutral-500">Free express delivery on orders $150+</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">30-Day Guaranteed Returns</h4>
                <p className="text-xs text-neutral-500">Prepaid return label in every package</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">Lifetime Craft Warranty</h4>
                <p className="text-xs text-neutral-500">Complimentary hardware &amp; seam repairs</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">Personal Styling Concierge</h4>
                <p className="text-xs text-neutral-500">Real stylists available via live chat</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRODUCT CATALOG SHOWCASE WITH CATEGORY FILTERS */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-500 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Curated Essentials
            </div>
            <h2 className="text-3xl font-serif font-light text-neutral-900 dark:text-white">Signature Capsule Collection</h2>
            <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-600'} mt-1`}>
              Produced in limited micro-batches in Italy and Portugal to eliminate deadstock waste.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {(
              [
                { id: 'all', label: 'All Items' },
                { id: 'apparel', label: 'Apparel' },
                { id: 'accessories', label: 'Leather & Accessories' },
                { id: 'home', label: 'Living Objects' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-4 py-2 text-xs font-medium rounded-full transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === tab.id
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                    : isDark
                    ? 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => {
            const isLiked = !!likedItems[product.id];
            return (
              <div
                key={product.id}
                className={`group rounded-2xl overflow-hidden border transition-all duration-300 ${
                  isDark
                    ? 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700'
                    : 'bg-white border-neutral-200/80 hover:border-neutral-300 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Product Image */}
                <div className="relative aspect-4/5 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm text-neutral-900 dark:text-neutral-100 shadow-sm">
                    {product.tag}
                  </div>

                  <button
                    onClick={() => toggleLike(product.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:text-rose-500 transition-colors shadow-sm cursor-pointer"
                    aria-label="Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>

                {/* Info Container */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>{product.color}</span>
                    <div className="flex items-center gap-1 text-amber-500 font-medium">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{product.rating}</span>
                      <span className="text-neutral-400 font-normal">({product.reviewsCount})</span>
                    </div>
                  </div>

                  <h3 className="text-base font-medium leading-snug group-hover:text-amber-500 transition-colors text-neutral-900 dark:text-white">
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
                    <span className="text-lg font-serif font-semibold text-neutral-900 dark:text-white">${product.price}</span>
                    <button
                      onClick={handleAddToCart}
                      className="px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Bag</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. ETHICAL MATERIAL INDEX */}
      <section className={`py-20 border-t ${isDark ? 'border-neutral-800 bg-neutral-950/60' : 'border-neutral-200 bg-neutral-50/60'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">Traceability</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-light text-neutral-900 dark:text-white">Our Material Standards</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {materials.map((mat, idx) => (
              <div
                key={idx}
                className={`p-7 rounded-2xl border ${
                  isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
                }`}
              >
                <div className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold mb-1">{mat.origin}</div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2">{mat.name}</h3>
                <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-3">
                  {mat.sustainability}
                </div>
                <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'} leading-relaxed`}>{mat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. BESPOKE STYLING & CONCIERGE SERVICES (FROM CONFIG.SERVICES) */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">Atelier Services</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-light text-neutral-900 dark:text-white">
            Tailoring &amp; Styling Sessions
          </h2>
          <p className={`mt-2 text-xs sm:text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
            Schedule an in-showroom private fitting or 1-on-1 virtual styling session with our certified curators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(config.services || []).map((service) => (
            <TiltCard
              key={service.id}
              className={`p-7 rounded-2xl border flex flex-col justify-between transition-all ${
                service.popular
                  ? isDark
                    ? 'bg-neutral-900 border-amber-500/60 shadow-xl ring-1 ring-amber-500/30'
                    : 'bg-white border-amber-500 shadow-md ring-1 ring-amber-500'
                  : isDark
                  ? 'bg-neutral-900/60 border-neutral-800 shadow-xs'
                  : 'bg-white border-neutral-200/90 shadow-xs'
              }`}
            >
              <div>
                {service.popular && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 mb-3">
                    Complimentary Service
                  </span>
                )}
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{service.name}</h3>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-mono font-bold text-amber-600 dark:text-amber-400">
                    {service.price === 0 ? 'Complimentary' : `$${service.price}`}
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">/ {service.durationMinutes} min</span>
                </div>
                <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'} mt-3 leading-relaxed`}>
                  {service.description}
                </p>
              </div>

              <div className="pt-6 mt-4">
                <button
                  onClick={() => onOpenBooking(service.id)}
                  className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer ${
                    service.popular
                      ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm'
                      : isDark
                      ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Reserve Session Slot</span>
                </button>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* 8. EDITORIAL LOOKBOOK */}
      <section className={`py-20 border-t ${isDark ? 'border-neutral-800 bg-neutral-950/60' : 'border-neutral-200 bg-stone-100/60'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">Behind The Loom</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-light text-neutral-900 dark:text-white">
                Crafted With Intent, Built To Age Gracefully
              </h2>
              <p className={`text-xs sm:text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-600'} leading-relaxed`}>
                Fast fashion relies on planned obsolescence. We work in the opposite direction. Every piece begins with unbleached organic yarns, non-toxic plant dyes, and durable double-needle lockstitching designed to wear in, not out.
              </p>
              <div className="pt-2">
                <button
                  onClick={onOpenChat}
                  className="px-6 py-3 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                  <span>Chat With Wardrobe Stylist</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop"
                alt="Studio Craft"
                className="rounded-2xl object-cover aspect-square shadow-md"
              />
              <img
                src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=600&auto=format&fit=crop"
                alt="Fabric Detail"
                className="rounded-2xl object-cover aspect-square shadow-md mt-6"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 9. VERIFIED REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">Client Perspectives</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-light mt-1 text-neutral-900 dark:text-white">Recognized By Curators</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: 'The tailoring quality rivaled bespoke Savile Row overcoats costing four times as much. The virtual styling session felt truly personal.',
              name: 'Elena Rostova',
              loc: 'Verified Buyer, New York',
            },
            {
              quote: 'Unbeatable attention to detail in packaging and garment construction. The linen throw has softened remarkably after several washes.',
              name: 'Marcus Chen',
              loc: 'Architecture Lead, San Francisco',
            },
            {
              quote: 'The live chat concierge helped me pick the right size for the wool overshirt within 30 seconds. Perfect fit right out of the box.',
              name: 'Sophia Martinez',
              loc: 'Verified Buyer, Chicago',
            },
          ].map((rev, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl border ${
                isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
              }`}
            >
              <div className="flex gap-1 text-amber-500 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                ))}
              </div>
              <p className={`text-xs sm:text-sm italic ${isDark ? 'text-neutral-300' : 'text-neutral-700'} leading-relaxed`}>
                "{rev.quote}"
              </p>
              <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500">
                <span className="font-semibold text-neutral-900 dark:text-white">{rev.name}</span> · {rev.loc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">Frequently Addressed</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-light mt-1 text-neutral-900 dark:text-white">Customer Inquiries</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className={`rounded-xl border transition-colors ${
                  isDark ? 'border-neutral-800 bg-neutral-900/60' : 'border-neutral-200 bg-white shadow-2xs'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-serif font-bold text-sm text-neutral-900 dark:text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-amber-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className={`px-5 pb-4 text-xs sm:text-sm leading-relaxed ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 11. VIP REPLENISHMENT CTA */}
      <section className={`py-20 border-t ${isDark ? 'border-neutral-800 bg-neutral-950 text-neutral-100' : 'border-neutral-200 bg-neutral-50 text-neutral-900'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h3 className={`text-3xl sm:text-5xl font-serif font-light tracking-tight ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            Join The Private Capsule Registry
          </h3>
          <p className={`text-sm sm:text-base ${isDark ? 'text-neutral-400' : 'text-neutral-600'} max-w-xl mx-auto font-light`}>
            Enjoy priority 24-hour access to limited seasonal runs and complimentary bespoke tailoring invitations.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onOpenBooking()}
              className="px-8 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
            >
              Book Private Showroom Fitting
            </button>
            <button
              onClick={onOpenChat}
              className={`px-6 py-3.5 rounded-full ${isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700' : 'bg-white hover:bg-neutral-100 text-neutral-800 border-neutral-300 shadow-xs'} font-semibold text-xs tracking-wider uppercase border transition-colors flex items-center gap-2 cursor-pointer`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
              <span>Ask Styling Concierge</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
