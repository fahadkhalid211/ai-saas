'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Star,
  Check,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
  ExternalLink,
  Bot,
  Zap,
  Globe,
  Award,
  Users,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { IndustryTemplateProps } from '../types';

export const UniversalTemplate: React.FC<IndustryTemplateProps> = ({
  config,
  isDark,
  currentTheme,
  onOpenBooking,
  onOpenChat,
  chatMessagesCount = 0,
}) => {
  // Mobile Nav Drawer State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hero Carousel State
  const defaultSlides = [
    {
      id: 'slide_1',
      imageUrl: config.heroImageUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
      badge: config.badgeText || 'Universal Business Excellence',
      headline: config.heroHeadline || 'Elevate Your Business With Next-Generation Services',
      subheadline: config.heroSubheadline || 'We deliver tailored consulting, high-impact implementation, and 24/7 client care. Schedule your appointment or ask our AI concierge anything.',
      ctaText: config.heroCtaText || 'Book An Appointment',
      ctaLink: '#services',
    },
    {
      id: 'slide_2',
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
      badge: 'Transparent Delivery & Precision',
      headline: 'Dedicated Team. Proven Results. Zero Compromises.',
      subheadline: 'From tailored strategy audits to daily operational support, our dedicated specialists deliver excellence at every step.',
      ctaText: 'Explore Service Menu',
      ctaLink: '#services',
    },
    {
      id: 'slide_3',
      imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80',
      badge: '24/7 Verified Support & AI Concierge',
      headline: 'Instant Answers & Frictionless Online Booking',
      subheadline: 'Never wait on hold again. Our verified AI assistant answers your questions in real time and syncs appointments directly into your calendar.',
      ctaText: 'Book A Meeting Slot',
      ctaLink: '#services',
    },
  ];

  const slides = config.heroCarouselSlides && config.heroCarouselSlides.length > 0
    ? config.heroCarouselSlides
    : defaultSlides;

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  // Auto-advance carousel every 6 seconds unless hovered
  useEffect(() => {
    if (slides.length <= 1 || isCarouselHovered) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length, isCarouselHovered]);

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNextSlide();
      else handlePrevSlide();
    }
    touchStartXRef.current = null;
  };

  // FAQ Expand/Collapse State
  const [expandedFaq, setExpandedFaq] = useState<Record<string, boolean>>({ faq_0: true });
  const toggleFaq = (key: string) => {
    setExpandedFaq((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Pricing Billing Cadence (Monthly vs Annual with 20% discount badge)
  const [isAnnualBilling, setIsAnnualBilling] = useState(false);

  // Image load error fallbacks
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const handleImageError = (key: string) => {
    setImageErrors((prev) => ({ ...prev, [key]: true }));
  };

  // Active theme variables
  const themeHex = config.themeColor || '#2563eb';
  const businessName = config.businessName || 'Business Solutions';
  const timezone = config.timezone || 'America/New_York';
  const showPricing = config.showPricing !== false;

  const activeSlide = slides[currentSlideIndex] || slides[0];

  // Navigation Items
  const navLinks = config.menuItems && config.menuItems.length > 0
    ? config.menuItems
    : [
        { label: 'Services', href: '#services' },
        { label: 'Features', href: '#features' },
        { label: 'About', href: '#about' },
        ...(showPricing ? [{ label: 'Pricing', href: '#pricing' }] : []),
        { label: 'Reviews', href: '#testimonials' },
        { label: 'FAQ', href: '#faq' },
        { label: 'Contact', href: '#contact' },
      ];

  return (
    <div
      className={`min-h-screen ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      } font-sans transition-colors duration-200 selection:bg-blue-600 selection:text-white`}
      style={{ '--primary-accent': themeHex } as React.CSSProperties}
    >
      {/* 1. Header / Navbar */}
      <header
        className={`sticky top-0 z-40 w-full backdrop-blur-md border-b ${
          isDark
            ? 'bg-slate-950/85 border-slate-800/80'
            : 'bg-white/85 border-slate-200/80'
        } transition-all`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo & Brand Name */}
          <a href="#" className="flex items-center gap-3.5 group focus:outline-none">
            {config.logoUrl && !imageErrors['brand_logo'] ? (
              <img decoding="async"
                src={config.logoUrl}
                alt={businessName}
                onError={() => handleImageError('brand_logo')}
                className="h-10 w-auto max-w-[160px] object-contain rounded-md"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md text-base tracking-tight shrink-0 transition-transform group-hover:scale-105"
                style={{ backgroundColor: themeHex }}
              >
                {businessName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col">
              <span className={`font-bold text-lg sm:text-xl tracking-tight ${isDark ? 'text-white' : 'text-slate-900'} leading-tight`}>
                {businessName}
              </span>
              {config.tagline && (
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} line-clamp-1 font-normal`}>
                  {config.tagline}
                </span>
              )}
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop Right CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => onOpenChat()}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                isDark
                  ? 'border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                  : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Bot className="w-4 h-4 text-blue-500" />
              <span>Ask AI</span>
            </button>

            <button
              onClick={() => onOpenBooking()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md hover:brightness-110 active:scale-98 transition cursor-pointer"
              style={{ backgroundColor: themeHex }}
            >
              <Calendar className="w-4 h-4" />
              <span>{config.heroCtaText || 'Book Appointment'}</span>
            </button>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden p-2 rounded-xl border ${
              isDark ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-700'
            }`}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            className={`lg:hidden border-b px-4 pt-3 pb-6 space-y-3 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <nav className="flex flex-col space-y-2">
              {navLinks.map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isDark ? 'text-slate-300 hover:bg-slate-900' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking();
                }}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white shadow-md flex items-center justify-center gap-2"
                style={{ backgroundColor: themeHex }}
              >
                <Calendar className="w-4 h-4" />
                <span>{config.heroCtaText || 'Book Appointment'}</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenChat();
                }}
                className={`w-full py-2.5 rounded-xl text-sm font-medium border flex items-center justify-center gap-2 ${
                  isDark
                    ? 'border-slate-800 bg-slate-900 text-slate-300'
                    : 'border-slate-200 bg-slate-100 text-slate-700'
                }`}
              >
                <Bot className="w-4 h-4 text-blue-500" />
                <span>Ask AI Concierge</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section with Interactive Carousel */}
      <section
        className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24"
        onMouseEnter={() => setIsCarouselHovered(true)}
        onMouseLeave={() => setIsCarouselHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold tracking-wide uppercase transition-all shadow-xs"
                style={{
                  borderColor: `${themeHex}40`,
                  backgroundColor: `${themeHex}14`,
                  color: themeHex,
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{activeSlide.badge || config.badgeText || 'Verified Excellence'}</span>
              </div>

              {/* Main Headline */}
              <h1 className={`text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight ${
                isDark ? 'text-white' : 'text-slate-950'
              } leading-[1.12]`}>
                {activeSlide.headline}
              </h1>

              {/* Subheadline */}
              <p className={`text-base sm:text-lg lg:text-xl font-normal leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              } max-w-2xl`}>
                {activeSlide.subheadline}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onOpenBooking()}
                  className="px-6 py-3.5 rounded-xl text-white font-semibold text-sm sm:text-base shadow-lg hover:brightness-110 active:scale-98 transition flex items-center gap-2.5 cursor-pointer"
                  style={{ backgroundColor: themeHex }}
                >
                  <Calendar className="w-5 h-5" />
                  <span>{activeSlide.ctaText || config.heroCtaText || 'Schedule An Appointment'}</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </button>

                <button
                  onClick={() => onOpenChat()}
                  className={`px-5 py-3.5 rounded-xl border text-sm sm:text-base font-semibold transition flex items-center gap-2 cursor-pointer ${
                    isDark
                      ? 'border-slate-800 bg-slate-900/90 text-slate-200 hover:bg-slate-800 hover:text-white'
                      : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100 shadow-xs'
                  }`}
                >
                  <Bot className="w-5 h-5 text-blue-500" />
                  <span>{config.secondaryHeroCtaText || 'Ask AI Concierge'}</span>
                </button>
              </div>

              {/* Timezone & Security Guarantee Footnote */}
              <div className="pt-2 flex flex-wrap items-center gap-5 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  Calendar Timezone: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{timezone}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Instant Calendar Invite & 1-Click Reschedule
                </span>
              </div>
            </div>

            {/* Right Media Column / Carousel Display */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-900 aspect-4/3 sm:aspect-16/11 group">
                <img decoding="async"
                  key={activeSlide.id}
                  src={activeSlide.imageUrl}
                  alt={activeSlide.headline}
                  onError={() => handleImageError(`carousel_${activeSlide.id}`)}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                />

                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

                {/* Carousel Controls Overlay */}
                {slides.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevSlide}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition cursor-pointer"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextSlide}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition cursor-pointer"
                      aria-label="Next slide"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Pagination Indicator Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 px-3 py-1.5 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/10">
                      {slides.map((s, idx) => (
                        <button
                          key={s.id}
                          onClick={() => setCurrentSlideIndex(idx)}
                          className={`h-2 rounded-full transition-all cursor-pointer ${
                            idx === currentSlideIndex
                              ? 'w-6 bg-white'
                              : 'w-2 bg-white/40 hover:bg-white/70'
                          }`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Slide Counter Overlay */}
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-lg bg-slate-950/70 text-white text-xs font-mono font-medium backdrop-blur-md border border-white/15">
                  {currentSlideIndex + 1} / {slides.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Trust Bar / Metrics Ticker */}
      <section className={`border-y ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-100/70 border-slate-200'} py-8`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {(config.stats && config.stats.length > 0 ? config.stats : [
              { id: '1', value: '99.8%', label: 'Client Satisfaction' },
              { id: '2', value: '15,000+', label: 'Appointments Booked' },
              { id: '3', value: '< 60s', label: 'Average Response Time' },
              { id: '4', value: '24/7', label: 'Knowledge Concierge' },
            ]).map((stat) => (
              <div key={stat.id} className="space-y-1">
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: themeHex }}>
                  {stat.value}
                </div>
                <div className={`text-xs sm:text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Services Catalog & Real-Time Booking with Timezone */}
      <section id="services" className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: themeHex }}>
              <Calendar className="w-4 h-4" />
              <span>Service Catalog</span>
            </div>
            <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
              {config.servicesTitle || 'Our Professional Services'}
            </h2>
            <p className={`text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
              {config.servicesSubtitle || 'Select a service below to schedule an appointment directly into our verified team calendar.'}
            </p>
          </div>

          {/* Timezone Indicator Badge */}
          <div className={`self-start md:self-auto px-4 py-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-xs'
          }`}>
            <Clock className="w-4 h-4 text-blue-500 shrink-0" />
            <span>Operating Timezone: <strong className="font-semibold text-slate-900 dark:text-white">{timezone}</strong></span>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {(config.services && config.services.length > 0 ? config.services : [
            {
              id: 'def_1',
              name: 'Consultation & Strategy Session',
              description: 'A 45-minute focused discovery meeting to evaluate goals, requirements, and provide actionable advice.',
              durationMinutes: 45,
              price: 75,
              popular: true,
              imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80',
            },
            {
              id: 'def_2',
              name: 'Comprehensive Implementation Sprint',
              description: 'Dedicated execution session with senior specialists to configure workflows and deploy solutions.',
              durationMinutes: 90,
              price: 195,
              popular: false,
              imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
            },
            {
              id: 'def_3',
              name: 'Executive Review & Ongoing Care',
              description: 'Follow-up consultation, KPI monitoring, and system optimization for continuing clients.',
              durationMinutes: 30,
              price: 50,
              popular: false,
              imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
            },
          ]).map((service) => (
            <div
              key={service.id}
              className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden group hover:shadow-xl ${
                service.popular
                  ? isDark
                    ? 'border-blue-500/50 bg-slate-900/90 ring-1 ring-blue-500/30'
                    : 'border-blue-500/40 bg-white ring-1 ring-blue-500/20'
                  : isDark
                  ? 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                {/* Service Image (if available) */}
                {service.imageUrl && !imageErrors[`srv_${service.id}`] ? (
                  <div className="relative aspect-16/9 w-full overflow-hidden bg-slate-800">
                    <img loading="lazy" decoding="async"
                      src={service.imageUrl}
                      alt={service.name}
                      onError={() => handleImageError(`srv_${service.id}`)}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {service.popular && (
                      <span
                        className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-md uppercase tracking-wider"
                        style={{ backgroundColor: themeHex }}
                      >
                        Popular
                      </span>
                    )}
                  </div>
                ) : (
                  service.popular && (
                    <div className="pt-4 px-6 flex justify-end">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white uppercase tracking-wider"
                        style={{ backgroundColor: themeHex }}
                      >
                        Popular
                      </span>
                    </div>
                  )
                )}

                <div className="p-6 space-y-3 text-left">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-950'} leading-snug`}>
                      {service.name}
                    </h3>
                  </div>

                  <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed line-clamp-3`}>
                    {service.description}
                  </p>
                </div>
              </div>

              {/* Card Footer: Duration, Price, and Booking Button */}
              <div className={`p-6 pt-4 border-t ${isDark ? 'border-slate-800/80 bg-slate-950/30' : 'border-slate-100 bg-slate-50/50'} space-y-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{service.durationMinutes} minutes</span>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      {service.price === 0 ? 'Free' : `$${service.price}`}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenBooking(service.id)}
                  className="w-full py-2.5 rounded-xl font-semibold text-sm text-white shadow-xs transition hover:brightness-110 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  style={{ backgroundColor: themeHex }}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book This Service</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Features / Value Propositions */}
      <section id="features" className={`py-20 lg:py-28 border-t ${isDark ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-100/50 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: themeHex }}>
              <Award className="w-4 h-4" />
              <span>Core Advantages</span>
            </div>
            <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
              {config.featuresTitle || 'Why Organizations Choose Us'}
            </h2>
            <p className={`text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
              {config.featuresSubtitle || 'Built on the principles of speed, uncompromising craft, and client-first communication.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {(config.features && config.features.length > 0 ? config.features : [
              {
                title: 'Real-Time Calendar Booking',
                description: 'Book appointments in the chat with timezone intelligence, automated calendar invitations, and every booking checked before it is confirmed.',
                badge: 'Frictionless',
              },
              {
                title: 'Knowledge-Grounded AI Concierge',
                description: 'Our automated assistant is trained on verified company documentation to give accurate, reliable answers at any hour.',
                badge: '24/7 Available',
              },
              {
                title: 'Transparent Flat-Rate Pricing',
                description: 'No hidden surcharges, surprise retainers, or fine print. You always know exactly what you are paying for upfront.',
                badge: 'Honest Terms',
              },
              {
                title: 'Enterprise Data Security',
                description: 'Strict confidentiality protocols and privacy controls keep your business data and consultation notes safe.',
                badge: 'Certified',
              },
            ]).map((feat, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white mb-4"
                  style={{ backgroundColor: themeHex }}
                >
                  <Check className="w-5 h-5" />
                </div>
                <h3 className={`text-base font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  {feat.title}
                </h3>
                <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. About Section */}
      <section id="about" className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* About Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 aspect-4/3 sm:aspect-1/1 bg-slate-900">
              <img loading="lazy" decoding="async"
                src={config.aboutImageUrl || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80'}
                alt={config.aboutTitle || 'About Us'}
                onError={() => handleImageError('about_img')}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* About Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: themeHex }}>
              <Users className="w-4 h-4" />
              <span>About Us</span>
            </div>

            <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
              {config.aboutTitle || 'Our Mission & Commitment'}
            </h2>

            {config.aboutSubtitle && (
              <p className="text-base font-medium" style={{ color: themeHex }}>
                {config.aboutSubtitle}
              </p>
            )}

            <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {config.aboutText ||
                'Founded with a clear conviction that clients deserve honest, prompt, and dedicated service, our team combines senior industry experience with modern convenience. We focus on actionable solutions, continuous communication, and verified results.'}
            </p>

            {/* Operating Hours & Contact Quick Info */}
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-3`}>
              <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Operating Schedule & Availability
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {(config.workingHours && config.workingHours.length > 0 ? config.workingHours : [
                  { days: 'Monday – Friday', hours: '8:30 AM – 6:30 PM' },
                  { days: 'Saturday', hours: '10:00 AM – 3:00 PM' },
                ]).map((wh, idx) => (
                  <div key={idx} className="flex justify-between border-b pb-1.5 dark:border-slate-800 border-slate-200">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{wh.days}</span>
                    <span className="text-slate-500 dark:text-slate-400">{wh.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onOpenBooking()}
                className="px-6 py-3 rounded-xl font-semibold text-sm text-white shadow-md transition hover:brightness-110 flex items-center gap-2 cursor-pointer"
                style={{ backgroundColor: themeHex }}
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule An Appointment</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Pricing Plans Section (Toggleable) */}
      {showPricing && (
        <section id="pricing" className={`py-20 lg:py-28 border-t ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-100/60 border-slate-200'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
            <div className="max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: themeHex }}>
                <Zap className="w-4 h-4" />
                <span>Simple Pricing</span>
              </div>
              <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
                {config.pricingTitle || 'Simple, Flexible Pricing Plans'}
              </h2>
              <p className={`text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                {config.pricingSubtitle || 'Choose the level of engagement that fits your business stage. Upgrade, downgrade, or cancel anytime.'}
              </p>

              {/* Monthly vs Annual Toggle */}
              <div className="pt-4 flex items-center justify-center gap-3">
                <span className={`text-xs sm:text-sm font-semibold ${!isAnnualBilling ? (isDark ? 'text-white' : 'text-slate-900') : 'text-slate-400'}`}>
                  Monthly Billing
                </span>
                <button
                  type="button"
                  onClick={() => setIsAnnualBilling(!isAnnualBilling)}
                  className={`w-12 h-6 rounded-full transition-colors p-1 relative flex items-center ${
                    isAnnualBilling ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  aria-label="Toggle annual billing"
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      isAnnualBilling ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className={`text-xs sm:text-sm font-semibold flex items-center gap-1.5 ${isAnnualBilling ? (isDark ? 'text-white' : 'text-slate-900') : 'text-slate-400'}`}>
                  Annual Billing
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                    Save 20%
                  </span>
                </span>
              </div>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch text-left">
              {(config.pricingPlans && config.pricingPlans.length > 0 ? config.pricingPlans : [
                {
                  id: 'plan_starter',
                  name: 'Essential Consultation',
                  price: 99,
                  period: '/ session',
                  description: 'Perfect for small businesses or individuals needing focused advisory on specific challenges.',
                  features: [
                    'Single 45-minute advisory appointment',
                    'Written diagnostic report & next steps',
                    'Email follow-up support for 7 days',
                    'Access to standard resource library',
                  ],
                  popular: false,
                  ctaText: 'Book Essential',
                },
                {
                  id: 'plan_growth',
                  name: 'Growth Partnership',
                  price: 299,
                  period: '/ month',
                  description: 'Our most popular tier for growing companies requiring regular strategic advisory and execution guidance.',
                  features: [
                    'Up to 4 appointments per month',
                    'Dedicated senior advisor assignment',
                    'Priority booking calendar slots',
                    'Direct 24/7 AI knowledgebase concierge',
                    'Slack / WhatsApp private channel',
                  ],
                  popular: true,
                  ctaText: 'Start Growth Tier',
                },
                {
                  id: 'plan_enterprise',
                  name: 'Enterprise Advisory',
                  price: 799,
                  period: '/ month',
                  description: 'Comprehensive, high-touch support designed for established organizations and scaling teams.',
                  features: [
                    'Unlimited strategic check-ins',
                    'Executive committee quarterly presentations',
                    'Custom workflow implementation sprint',
                    'Guaranteed 1-hour response SLA',
                    'Custom NDAs & master service agreements',
                  ],
                  popular: false,
                  ctaText: 'Contact Enterprise',
                },
              ]).map((plan) => {
                const numericPrice = typeof plan.price === 'number' ? plan.price : parseFloat(plan.price);
                const displayPrice = isAnnualBilling && !isNaN(numericPrice)
                  ? Math.round(numericPrice * 0.8)
                  : plan.price;

                return (
                  <div
                    key={plan.id}
                    className={`rounded-2xl p-7 border transition-all duration-200 flex flex-col justify-between relative ${
                      plan.popular
                        ? isDark
                          ? 'border-blue-500 bg-slate-900 shadow-2xl ring-2 ring-blue-500/30'
                          : 'border-blue-500 bg-white shadow-xl ring-2 ring-blue-500/20'
                        : isDark
                        ? 'border-slate-800 bg-slate-900/60'
                        : 'border-slate-200 bg-white shadow-xs'
                    }`}
                  >
                    {plan.popular && (
                      <span
                        className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white shadow-md uppercase tracking-wider"
                        style={{ backgroundColor: themeHex }}
                      >
                        Most Popular
                      </span>
                    )}

                    <div className="space-y-4">
                      <div>
                        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                          {plan.name}
                        </h3>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
                          {plan.description}
                        </p>
                      </div>

                      <div className="pt-2 pb-2">
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            ${displayPrice}
                          </span>
                          {plan.period && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {plan.period}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Features List */}
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          What is included:
                        </span>
                        {plan.features.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        onClick={() => onOpenBooking()}
                        className={`w-full py-3 rounded-xl font-semibold text-sm transition cursor-pointer shadow-sm ${
                          plan.popular
                            ? 'text-white hover:brightness-110'
                            : isDark
                            ? 'border border-slate-700 bg-slate-800 text-white hover:bg-slate-700'
                            : 'border border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200'
                        }`}
                        style={plan.popular ? { backgroundColor: themeHex } : {}}
                      >
                        {plan.ctaText || 'Get Started'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 8. Testimonials Section */}
      <section id="testimonials" className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: themeHex }}>
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>Client Feedback</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
            {config.testimonialsTitle || 'Trusted by Industry Leaders'}
          </h2>
          <p className={`text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
            {config.testimonialsSubtitle || 'See what verified clients have to say about working with our dedicated team.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 text-left">
          {(config.testimonials && config.testimonials.length > 0 ? config.testimonials : [
            {
              id: 'test_1',
              clientName: 'Sarah Jenkins',
              clientRole: 'Managing Director, Horizon Retail',
              rating: 5,
              comment: 'Booking a consultation was effortless, and the team provided practical, game-changing recommendations within our first 45 minutes.',
            },
            {
              id: 'test_2',
              clientName: 'Marcus Vance',
              clientRole: 'Founder, Vance Logistics',
              rating: 5,
              comment: 'Their AI concierge answered all my late-night questions accurately, and the meeting calendar integration prevented any back-and-forth emails.',
            },
            {
              id: 'test_3',
              clientName: 'Elena Rostova',
              clientRole: 'Operations Lead, Apex Health',
              rating: 5,
              comment: 'The level of professionalism and prompt communication is unmatched. The pricing is 100% transparent and the results exceeded our expectations.',
            },
          ]).map((item) => (
            <div
              key={item.id}
              className={`p-7 rounded-2xl border flex flex-col justify-between space-y-4 ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < item.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-slate-300 text-slate-300 dark:fill-slate-700 dark:text-slate-700'
                      }`}
                    />
                  ))}
                </div>

                <p className={`text-xs sm:text-sm italic leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  &ldquo;{item.comment}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0"
                  style={{ backgroundColor: themeHex }}
                >
                  {item.clientName.charAt(0)}
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {item.clientName}
                  </h4>
                  {item.clientRole && (
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {item.clientRole}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. FAQ Section */}
      <section id="faq" className={`py-20 lg:py-28 border-t ${isDark ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-100/50 border-slate-200'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
              {config.faqsTitle || 'Frequently Asked Questions'}
            </h2>
            <p className={`text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {config.faqsSubtitle || 'Everything you need to know about our services, booking process, and policies.'}
            </p>
          </div>

          <div className="space-y-3 text-left">
            {(config.faqs && config.faqs.length > 0 ? config.faqs : [
              {
                id: 'faq_1',
                question: 'How do appointment bookings work?',
                answer: 'Simply choose a service from our menu, select an available date and time slot that fits your schedule, and provide your contact information. You will receive an instant calendar invite and email confirmation.',
              },
              {
                id: 'faq_2',
                question: 'Can I reschedule or cancel my appointment?',
                answer: 'Yes! Every confirmation email includes a direct management link allowing you to reschedule or cancel your appointment anytime up to 2 hours prior to the scheduled time.',
              },
              {
                id: 'faq_3',
                question: 'What timezone are the appointments booked in?',
                answer: `Appointments are scheduled in our official business timezone (${timezone}), and our scheduler automatically indicates the corresponding time so you never miss an appointment.`,
              },
              {
                id: 'faq_4',
                question: 'How does the AI Concierge work?',
                answer: 'Our AI Concierge is directly linked to our verified company knowledgebase. It can answer questions about our service catalog, pricing, policies, and availability 24 hours a day, 7 days a week.',
              },
              {
                id: 'faq_5',
                question: 'Do you offer custom engagements not listed in the pricing table?',
                answer: 'Yes. If your organization has unique requirements or needs custom service agreements, please book an Initial Discovery call or message our team directly.',
              },
            ]).map((faq, idx) => {
              const isExpanded = expandedFaq[`faq_${idx}`];
              return (
                <div
                  key={faq.id || idx}
                  className={`rounded-2xl border transition-colors overflow-hidden ${
                    isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(`faq_${idx}`)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base cursor-pointer focus:outline-none"
                  >
                    <span className={isDark ? 'text-white' : 'text-slate-900'}>{faq.question}</span>
                    <span className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </span>
                  </button>
                  {isExpanded && (
                    <div className={`px-5 pb-5 pt-1 text-xs sm:text-sm leading-relaxed border-t ${
                      isDark ? 'border-slate-800/80 text-slate-300' : 'border-slate-100 text-slate-600'
                    }`}>
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10. Direct AI Concierge Knowledgebase Callout Banner */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`p-8 sm:p-10 rounded-3xl border relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 ${
          isDark
            ? 'bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 border-slate-800'
            : 'bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/80 border-blue-200/80 shadow-md'
        }`}>
          <div className="space-y-2 text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{ backgroundColor: `${themeHex}20`, color: themeHex }}>
              <Bot className="w-3.5 h-3.5" />
              <span>Grounded on Verified Company Knowledge</span>
            </div>
            <h3 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
              Have a Question Right Now? Ask Our AI Concierge
            </h3>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
              Trained on our complete document library, policies, and calendar availability. Get immediate answers 24/7 without waiting on hold.
            </p>
          </div>

          <button
            onClick={() => onOpenChat()}
            className="px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base text-white shadow-lg transition hover:brightness-110 flex items-center gap-2 shrink-0 cursor-pointer"
            style={{ backgroundColor: themeHex }}
          >
            <Bot className="w-5 h-5" />
            <span>Open AI Chat Window</span>
          </button>
        </div>
      </section>

      {/* 11. Final Call To Action Banner */}
      <section className={`py-16 sm:py-20 border-t ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-900 text-white'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {config.ctaHeadline || 'Ready to Elevate Your Business?'}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {config.ctaSubheadline || 'Schedule an appointment online in seconds or message our 24/7 AI concierge for instant assistance.'}
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onOpenBooking()}
              className="px-7 py-3.5 rounded-xl font-bold text-sm sm:text-base text-white shadow-xl transition hover:brightness-110 flex items-center gap-2 cursor-pointer"
              style={{ backgroundColor: themeHex }}
            >
              <Calendar className="w-5 h-5" />
              <span>{config.ctaButtonText || 'Book Service Now'}</span>
            </button>
            <button
              onClick={() => onOpenChat()}
              className="px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base border border-slate-700 bg-slate-800 text-white hover:bg-slate-700 transition flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span>Ask A Question</span>
            </button>
          </div>
        </div>
      </section>

      {/* 12. Footer */}
      <footer className={`border-t py-14 ${isDark ? 'bg-slate-950 border-slate-800/80 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b dark:border-slate-800 border-slate-200 text-left">
            {/* Col 1: Brand Info */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm"
                  style={{ backgroundColor: themeHex }}
                >
                  {businessName.charAt(0)}
                </div>
                <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {businessName}
                </span>
              </div>
              <p className="text-xs leading-relaxed max-w-sm">
                {config.tagline || 'Modern strategy, execution, and client growth solutions. Verified calendar scheduling and 24/7 client care.'}
              </p>
              {config.footerText && (
                <p className="text-xs text-slate-500 pt-1">{config.footerText}</p>
              )}
            </div>

            {/* Col 2: Navigation Links */}
            <div className="space-y-2">
              <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Navigation
              </h4>
              <ul className="space-y-1.5 text-xs">
                {navLinks.map((item, idx) => (
                  <li key={idx}>
                    <a href={item.href} className="hover:underline">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Contact & Timezone */}
            <div className="space-y-2">
              <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Contact & Timezone
              </h4>
              <ul className="space-y-1.5 text-xs">
                {config.address && (
                  <li className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <span>{config.address}</span>
                  </li>
                )}
                {config.phone && (
                  <li className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <a href={`tel:${config.phone}`} className="hover:underline">{config.phone}</a>
                  </li>
                )}
                {config.email && (
                  <li className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <a href={`mailto:${config.email}`} className="hover:underline">{config.email}</a>
                  </li>
                )}
                <li className="flex items-center gap-1.5 pt-1 text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Timezone: <strong>{timezone}</strong></span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div>
              &copy; {new Date().getFullYear()} {businessName}. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => onOpenBooking()}
                className="hover:underline cursor-pointer"
              >
                Book Appointment
              </button>
              <button
                onClick={() => onOpenChat()}
                className="hover:underline cursor-pointer flex items-center gap-1"
              >
                <Bot className="w-3.5 h-3.5 text-blue-500" />
                <span>AI Support</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
