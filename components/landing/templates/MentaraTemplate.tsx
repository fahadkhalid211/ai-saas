'use client';

import React, { useState, useEffect } from 'react';
import {
  LandingPageConfig,
  LandingPageServiceItem,
} from '@/lib/landing/types';
import {
  Calendar,
  Clock,
  Sparkles,
  Check,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Bot,
  MessageSquare,
  X,
  Play,
  Share2,
  ArrowUpRight,
  ChevronLeft,
  Star,
  ShieldCheck,
  Zap,
} from 'lucide-react';

function FacebookIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function TwitterIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.67 1.67 0 1 0 0-3.34 1.67 1.67 0 0 0 0 3.34m1.39 9.74v-8.37H5.07v8.37h2.78z" />
    </svg>
  );
}

function RollupButton({
  label,
  onClick,
  className = '',
  bgColor = '#eafe45',
  textColor = '#1e3523',
  iconBgColor = '#1e3523',
  iconColor = '#eafe45',
  size = 'md',
}: {
  label: string;
  onClick?: () => void;
  className?: string;
  bgColor?: string;
  textColor?: string;
  iconBgColor?: string;
  iconColor?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative inline-flex items-center gap-3.5 ${
        isSm ? 'pl-4 pr-1.5 py-1.5 text-xs sm:text-sm' : isLg ? 'pl-7 pr-2.5 py-2.5 text-lg sm:text-xl' : 'pl-6 pr-2 py-2 text-sm sm:text-base'
      } rounded-full font-semibold transition-all duration-300 cursor-pointer overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] ${className}`}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div className={`relative overflow-hidden ${isSm ? 'h-4' : isLg ? 'h-7' : 'h-5'} flex items-center`}>
        <span className="transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:-translate-y-full block">
          {label}
        </span>
        <span
          className="absolute inset-0 translate-y-full transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:translate-y-0 block"
          style={{ color: textColor }}
        >
          {label}
        </span>
      </div>
      <div
        className={`${
          isSm ? 'w-7 h-7' : isLg ? 'w-11 h-11' : 'w-9 h-9'
        } rounded-full flex items-center justify-center overflow-hidden relative shrink-0 transition-transform duration-300`}
        style={{ backgroundColor: iconBgColor }}
      >
        <ArrowUpRight
          className={`${isSm ? 'w-3.5 h-3.5' : isLg ? 'w-5 h-5' : 'w-4 h-4'} transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:translate-x-8 group-hover:-translate-y-8`}
          style={{ color: iconColor }}
        />
        <ArrowUpRight
          className={`${isSm ? 'w-3.5 h-3.5' : isLg ? 'w-5 h-5' : 'w-4 h-4'} absolute -translate-x-8 translate-y-8 transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:translate-x-0 group-hover:translate-y-0`}
          style={{ color: iconColor }}
        />
      </div>
    </button>
  );
}

function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  threshold = 0.1,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  threshold?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay) {
            const timer = setTimeout(() => setIsVisible(true), delay);
            observer.unobserve(el);
            return () => clearTimeout(timer);
          } else {
            setIsVisible(true);
            observer.unobserve(el);
          }
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, threshold]);

  const getTransform = () => {
    if (isVisible) return 'opacity-100 translate-x-0 translate-y-0 scale-100';
    switch (direction) {
      case 'up':
        return 'opacity-0 translate-y-8 scale-[0.99]';
      case 'down':
        return 'opacity-0 -translate-y-8 scale-[0.99]';
      case 'left':
        return 'opacity-0 translate-x-10';
      case 'right':
        return 'opacity-0 -translate-x-10';
      case 'none':
      default:
        return 'opacity-0 scale-95';
    }
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${getTransform()} ${className}`}
    >
      {children}
    </div>
  );
}

function ProcessCardsStack({
  steps,
}: {
  steps: Array<{
    number: string;
    title: string;
    text: string;
    image: string;
  }>;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scales, setScales] = useState<number[]>([1, 1, 1]);
  const [opacities, setOpacities] = useState<number[]>([1, 1, 1]);

  useEffect(() => {
    let rafId: number | null = null;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const cards = containerRef.current.querySelectorAll<HTMLDivElement>('.process-interactive-card');
      if (!cards || cards.length < 3) return;

      const newScales = [1, 1, 1];
      const newOpacities = [1, 1, 1];

      const rect1 = cards[1].getBoundingClientRect();
      const rect2 = cards[2].getBoundingClientRect();

      const stickyTop1 = 145;
      const stickyTop2 = 180;

      // When Card 1 approaches sticky point, Card 0 smoothly scales down & dims
      if (rect1.top <= stickyTop1 + 350) {
        const progress1 = Math.max(0, Math.min(1, (stickyTop1 + 350 - rect1.top) / 350));
        newScales[0] = 1 - progress1 * 0.06; // 1.0 -> 0.94
        newOpacities[0] = 1 - progress1 * 0.15; // 1.0 -> 0.85
      }

      // When Card 2 approaches sticky point, Card 1 scales down & Card 0 scales down further
      if (rect2.top <= stickyTop2 + 350) {
        const progress2 = Math.max(0, Math.min(1, (stickyTop2 + 350 - rect2.top) / 350));
        newScales[1] = 1 - progress2 * 0.06; // 1.0 -> 0.94
        newOpacities[1] = 1 - progress2 * 0.15; // 1.0 -> 0.85

        newScales[0] = 0.94 - progress2 * 0.06; // 0.94 -> 0.88
        newOpacities[0] = 0.85 - progress2 * 0.20; // 0.85 -> 0.65
      }

      setScales(newScales);
      setOpacities(newOpacities);
    };

    const onScroll = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col gap-14 sm:gap-20 relative pb-28">
      {steps.map((step, idx) => {
        const topOffsets = ['top-[100px] sm:top-[115px]', 'top-[130px] sm:top-[150px]', 'top-[160px] sm:top-[185px]'];
        const zIndexes = ['z-10', 'z-20', 'z-30'];
        return (
          <div
            key={idx}
            style={{
              transform: `scale(${scales[idx]})`,
              opacity: opacities[idx],
              transformOrigin: 'top center',
            }}
            className={`process-interactive-card sticky ${topOffsets[idx]} ${zIndexes[idx]} rounded-[24px] border border-[#48614b] bg-[#35503a] p-8 sm:p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] transition-all duration-300 hover:border-[#eafe45]/60 hover:-translate-y-1 flex flex-col justify-between group will-change-transform`}
          >
            <div className="mb-6">
              <span className="text-sm sm:text-base font-bold tracking-wider text-[#eafe45] block mb-3">
                {step.number}
              </span>
              <h3 className="text-2xl sm:text-3xl font-medium text-[#eff3df] leading-tight mb-3">
                {step.title}
              </h3>
              <p className="text-base text-[#b0bca7] leading-relaxed">
                {step.text}
              </p>
            </div>
            <div className="rounded-[18px] sm:rounded-[20px] overflow-hidden w-full aspect-[16/10] bg-[#1e3523] border border-[#48614b]/40">
              <img
                src={step.image}
                alt={step.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface MentaraTemplateProps {
  config: LandingPageConfig;
  onOpenBooking: (service?: LandingPageServiceItem) => void;
  onOpenChat: () => void;
}

export function MentaraTemplate({
  config,
  onOpenBooking,
  onOpenChat,
}: MentaraTemplateProps) {
  // Mobile navigation drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Video lightbox state
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // FAQ Accordion State (open question index)
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Testimonials Tab state
  const [activeTestimonialTab, setActiveTestimonialTab] = useState(0);

  // Projects Slider state
  const [projectSlideIndex, setProjectSlideIndex] = useState(0);

  // Blog Slider state
  const [blogSlideIndex, setBlogSlideIndex] = useState(0);

  // Annual vs Monthly Pricing toggle
  const [isAnnualBilling, setIsAnnualBilling] = useState(false);

  // Hero entrance animation state
  const [heroMounted, setHeroMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setHeroMounted(true), 60);
    return () => clearTimeout(timer);
  }, []);

  // Accent color customization
  const themeColor = config.themeColor || 'lime';
  const getThemeHex = (colorName: string) => {
    switch (colorName) {
      case 'amber':
        return '#f59e0b';
      case 'rose':
        return '#f43f5e';
      case 'emerald':
        return '#10b981';
      case 'purple':
        return '#a855f7';
      case 'blue':
        return '#3b82f6';
      case 'slate':
        return '#94a3b8';
      case 'sky':
        return '#0284c7';
      case 'indigo':
        return '#6366f1';
      case 'fuchsia':
        return '#d946ef';
      case 'teal':
        return '#14b8a6';
      case 'lime':
      default:
        return '#eafe45'; // Signature Mentara Chartreuse Yellow
    }
  };
  const sunnyYellow = getThemeHex(themeColor);

  // Default Assets for Mentara
  const defaultLogo = 'https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/68281b130900fb3df0e730d4_Main%20Logo.png';
  const defaultFooterLogo = 'https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/6828602ff6ea2287d90867e0_Footer%20Logo.png';
  const starIcon = 'https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/6829e93a52f601287f31dc39_Star.png';
  const vectorLineOne = 'https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682bf4092b10661a713741ad_Vector%20Line%20One.png';
  const sectionLine01 = 'https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/68285fe3c0d9d12577a2eaf6_Section%20Line%2001.png';
  const sectionLine02 = 'https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/68285fe3a406b7094b5235e4_Section%20Line%2002.png';
  const heroElementBg = 'https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682c0dee02e077c1bdc95ec4_Hero%20Element.png';
  const heroMainImage = config.heroImageUrl || 'https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682c1fadbeff220d70632d8e_Hero%20Main%20Image.png';

  // Projects Dataset
  const projects = [
    {
      id: 'proj_1',
      title: 'Mindful Living Project',
      desc: 'The Mindful Living Project promotes mental wellness by providing inclusive resources and support, ensuring everyone can thrive in a nurturing community focused on holistic health.',
      duration: '05 Hour 20 Min',
      image: 'https://cdn.prod.website-files.com/682982f2b42d35f376f2394e/6829cb0d2e614eeb7f4c582b_Thumbnail01%20Image.png',
    },
    {
      id: 'proj_2',
      title: 'Emotional Wellness Initiative',
      desc: 'The Emotional Wellness Initiative aims to provide inclusive mental health resources, ensuring that everyone, regardless of their background, can access the support they need.',
      duration: '04 Hour 30 Min',
      image: 'https://cdn.prod.website-files.com/682982f2b42d35f376f2394e/6829cd714ef21e7653e0581f_Thumbnail02%20Image.png',
    },
    {
      id: 'proj_3',
      title: 'Mental Resilience Program',
      desc: 'The Mental Resilience Program empowers individuals from diverse backgrounds, providing essential tools and support to enhance mental well-being and foster community connections.',
      duration: '05 Hour 20 Min',
      image: 'https://cdn.prod.website-files.com/682982f2b42d35f376f2394e/6829cd6139ea6ea59896f47a_Thumbnail03%20Image.png',
    },
    {
      id: 'proj_4',
      title: 'Creative Expression Workshop',
      desc: 'The Creative Expression Workshop invites participants to explore various artistic mediums, encouraging self-expression and emotional healing through creativity and collaboration.',
      duration: '02 Hour 15 Min',
      image: 'https://cdn.prod.website-files.com/682982f2b42d35f376f2394e/6829ce9a9aa73fececc1e9dd_Thumbnail04%20Image.png',
    },
  ];

  // Testimonials Dataset
  const testimonials = [
    {
      id: 'tab_1',
      name: 'Clara Jensen',
      role: 'Mental health',
      avatar: 'https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682c8a340ce824cfd0377ff6_User%20Image%2004.png',
      featuredImage: 'https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682eae4f26668179d5e66ff3_Testimonial%20Image%2003.png',
      rating: '4.8 Review',
      quote:
        '“I used to feel overwhelmed by stress and anxiety, and it was affecting every part of my life. With the support I received, I gained valuable tools to manage my emotions and find inner peace. I feel stronger, more focused, and capable of handling life’s challenges!”',
      logo: 'https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682eadddf7dfdbc88bd391b5_Testimonials%20Logo%2003.png',
    },
    {
      id: 'tab_2',
      name: 'Marcus Lee',
      role: 'Physical fitness',
      avatar: 'https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682c8a34840e4794151185ff_User%20Image%2003.png',
      featuredImage: 'https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682eae94fe202a14915f870e_Testimonial%20Image%2004.png',
      rating: '4.9 Review',
      quote:
        '“This experience was life-changing! The insights I gained revealed thought patterns that limited me. Now, I feel empowered to face challenges directly and I’m genuinely excited about what lies ahead. The support I received has truly set me on a path toward lasting wellness!”',
      logo: 'https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682d4e18e2b092d66294fd89_Testimonials%20User%20Lgoo.png',
    },
    {
      id: 'tab_3',
      name: 'Sofia Patel',
      role: 'Nutrition',
      avatar: 'https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682c8a3401a4f3d261732d68_User%20Image%2002.png',
      featuredImage: 'https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682eae50dfa456d015ea553a_Testimonial%20Image%2001.png',
      rating: '4.8 Review',
      quote:
        '“This journey has been transformative! I discovered new perspectives that helped me break free from my limitations. I now approach obstacles with confidence and excitement for the future. The care I received has truly guided me on my new path!”',
      logo: 'https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682eadddeb425ddeb7c329e9_5eca47797a60968cddf67016c14af0e7_Testimonials%20Logo%2002.png',
    },
    {
      id: 'tab_4',
      name: 'Ethan Kim',
      role: 'Mindfulness',
      avatar: 'https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682c8a34fd096e013e8ff417_User%20Image%2001.png',
      featuredImage: 'https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682eae5087c1d2381742189c_Testimonial%20Image%2002.png',
      rating: '5.0 Review',
      quote:
        '“Joining this program was a turning point for me. I used to feel overwhelmed and lost, but the support & strategies I learned have completely changed my perspective. I now tackle daily life with renewed sense of purpose and resilience!”',
      logo: 'https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682eadddcc87da8d85415985_Testimonials%20Logo%2001.png',
    },
  ];

  // Team Therapists Dataset with 3D Flip Card details
  const teamMembers = [
    {
      name: 'Dr. Thomas White',
      experience: 'Trauma-informed care',
      image: 'https://cdn.prod.website-files.com/682982f2b42d35f376f2394e/682bfecdd92cab03beffca89_Team%20Member%2006.png',
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      twitter: 'https://x.com',
      linkedin: 'https://linkedin.com',
    },
    {
      name: 'Dr. Michael Johnson',
      experience: 'Mindfulness Coach Specialist',
      image: 'https://cdn.prod.website-files.com/682982f2b42d35f376f2394e/6829ab5670093a50cc6c146a_Team%20Member%2003.png',
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      twitter: 'https://x.com',
      linkedin: 'https://linkedin.com',
    },
    {
      name: 'Dr. Emily Roberts',
      experience: '12 years in person-centered care',
      image: 'https://cdn.prod.website-files.com/682982f2b42d35f376f2394e/6829a9de92753bf25250f312_Team%20Member%2001.png',
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      twitter: 'https://x.com',
      linkedin: 'https://linkedin.com',
    },
    {
      name: 'Dr. Sarah Williams',
      experience: 'Emotional Wellness Advisor',
      image: 'https://cdn.prod.website-files.com/682982f2b42d35f376f2394e/6829ac96ac8c8f2756fd1e05_Team%20Member%2002.png',
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      twitter: 'https://x.com',
      linkedin: 'https://linkedin.com',
    },
    {
      name: 'Dr. David Lee',
      experience: 'Cognitive Behavior Therapist',
      image: 'https://cdn.prod.website-files.com/682982f2b42d35f376f2394e/6829ad2b1c50d160398a4616_Team%20Member%2004.png',
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      twitter: 'https://x.com',
      linkedin: 'https://linkedin.com',
    },
    {
      name: 'Dr. Rachel Green',
      experience: 'Trauma Recovery Expert',
      image: 'https://cdn.prod.website-files.com/682982f2b42d35f376f2394e/6829ad44da7dd9ac7ee00360_Team%20Member%2005.png',
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      twitter: 'https://x.com',
      linkedin: 'https://linkedin.com',
    },
  ];

  // Blog Dataset
  const blogs = [
    {
      title: 'Mindfulness Practices',
      desc: 'Incorporate mindfulness practices into daily routine to reduce stress and improve mental clarity, connection with yourself.',
      image: 'https://cdn.prod.website-files.com/682982f2b42d35f376f2394e/6829ba900e08bc3186da3dc6_Blog%20Card%20Image%2003.png',
    },
    {
      title: 'Mind Matters Today',
      desc: 'Mind Matters Today champions mental health accessibility, for diverse communities everywhere.',
      image: 'https://cdn.prod.website-files.com/682982f2b42d35f376f2394e/6829b799315fe0e5d79afc2d_Blog%20Card%20Image%2006.png',
    },
    {
      title: 'Thriving Minds Unite',
      desc: 'Thriving Minds Unite fosters inclusive mental health support, empowering diverse communities wellness.',
      image: 'https://cdn.prod.website-files.com/682982f2b42d35f376f2394e/6829b8aa5e374f01d8ab75a6_Blog%20Card%20Image%2005.png',
    },
    {
      title: 'Mental Health Insights',
      desc: 'Mental Health Insights empower diverse communities, ensuring everyone has access to for well-being.',
      image: 'https://cdn.prod.website-files.com/682982f2b42d35f376f2394e/6829b94d16632e09b8a8ee92_Blog%20Card%20Image%2004.png',
    },
    {
      title: 'Embrace Mental Strength',
      desc: 'Embrace your mental strength by seeking and understanding, yourself and others to thrive together.',
      image: 'https://cdn.prod.website-files.com/682982f2b42d35f376f2394e/6829b9c5760cfcbf66133c63_Blog%20Card%20Image%2002.png',
    },
    {
      title: 'Boost Your Mental',
      desc: 'Enhance your mental wellness with accessible support tailored, empowering everyone to thrive.',
      image: 'https://cdn.prod.website-files.com/682982f2b42d35f376f2394e/6829ba26661a89f886fd95c6_Blog%20Card%20Image%2001.png',
    },
  ];

  // FAQs Dataset
  const faqs = config.faqs && config.faqs.length > 0 ? config.faqs : [
    {
      id: 'faq_1',
      question: 'What is mental health and why it matters?',
      answer:
        'Mental health encompasses emotional, psychological, and social well-being. It affects how we think, feel, and act. Prioritizing mental health is crucial for overall happiness, productivity, and maintaining healthy relationships.',
    },
    {
      id: 'faq_2',
      question: 'How can I improve my mental health?',
      answer:
        'To enhance your mental health, practice mindfulness, engage in regular exercise, maintain a balanced diet, connect with loved ones, and seek professional support when needed.',
    },
    {
      id: 'faq_3',
      question: 'What are signs of mental health issues?',
      answer:
        'Signs of mental health issues include persistent sadness, withdrawal from social activities, changes in appetite, difficulty concentrating, and mood swings that disrupt daily life.',
    },
    {
      id: 'faq_4',
      question: 'How to find a therapist near me?',
      answer:
        'Finding a therapist nearby can be simple. Start by searching online directories, asking for recommendations from friends, or scheduling an appointment directly through our online booking calendar.',
    },
    {
      id: 'faq_5',
      question: 'Mental wellness resources include therapy.',
      answer:
        'Mental wellness resources, such as therapy, provide essential support for emotional and psychological health, fostering resilience and enhancing overall quality of life.',
    },
    {
      id: 'faq_6',
      question: 'How can I support a friend’s mental health?',
      answer:
        'To support a friend’s mental health, listen actively, offer encouragement, check in regularly, and suggest professional help if needed. Your presence matters.',
    },
  ];

  // Partner logos
  const partnerLogos = [
    'https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682c46e932c4950bd16f3af4_Partner%20Logo%2007.svg',
    'https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682c46e934b8df9c006dccc4_Partner%20Logo%2006.svg',
    'https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682c46e93fa68d2a09e5bb62_Partner%20Logo%2005.svg',
    'https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682c46e8e54f1ebad79c0f08_Partner%20Logo%2004.svg',
    'https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682c46e80b42c5c99daba634_Partner%20Logo%2003.svg',
    'https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682c46e849e27b3388dd67b8_Partner%20Logo%2002.svg',
    'https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682c46e932c4950bd16f3af4_Partner%20Logo%2007.svg',
  ];

  // Services list
  const services: LandingPageServiceItem[] = config.services && config.services.length > 0 ? config.services : [
    {
      id: 'srv_1',
      name: 'Mind Wellness Therapy',
      description: 'Mind Wellness Therapy provides personalized mental health services, for individuals to heal and grow together.',
      durationMinutes: 50,
      price: 150,
      imageUrl: 'https://cdn.prod.website-files.com/682982f2b42d35f376f2394e/6829d494c23b89be6dbf2a48_Thumbnail%20Image%2001.png',
    },
    {
      id: 'srv_2',
      name: 'Couple Therapy',
      description: 'Couple therapy provides a safe space for communicate, strengthen their emotional connection.',
      durationMinutes: 60,
      price: 180,
      imageUrl: 'https://cdn.prod.website-files.com/682982f2b42d35f376f2394e/6829d4f4e5e6bd02aa04821c_Thumbnail%20Image%2002.png',
    },
    {
      id: 'srv_3',
      name: 'Family Therapy',
      description: 'Family therapy fosters open communication, families challenges together for a healthier dynamic.',
      durationMinutes: 75,
      price: 220,
      imageUrl: 'https://cdn.prod.website-files.com/682982f2b42d35f376f2394e/6829dc34760cfcbf662544d3_Thumbnail%20Image%2003.png',
    },
    {
      id: 'srv_4',
      name: 'Calm Mind Help',
      description: 'Calm Mind Help provides accessible mental wellness tools, to embrace their mental health journey.',
      durationMinutes: 45,
      price: 120,
      imageUrl: 'https://cdn.prod.website-files.com/682982f2b42d35f376f2394e/6829de9798479e4f371f8138_Thumbnail%20Image%2004.png',
    },
    {
      id: 'srv_5',
      name: 'Care For Families',
      description: 'Care For Families provides essential support & resources, families navigating challenges together.',
      durationMinutes: 60,
      price: 190,
      imageUrl: 'https://cdn.prod.website-files.com/682982f2b42d35f376f2394e/6829e088c8bbccc8ee8588f8_Thumbnail%20Image%2005.png',
    },
    {
      id: 'srv_6',
      name: 'Home Heart Healing',
      description: 'Heart Healing provides nurturing mental health support, & foster emotional resilience every day.',
      durationMinutes: 50,
      price: 160,
      imageUrl: 'https://cdn.prod.website-files.com/682982f2b42d35f376f2394e/6829e0b9031b903cf4242e00_Thumbnail%20Image%2006.png',
    },
  ];

  return (
    <div
      className="mentara-theme min-h-screen text-[#eff3df] selection:bg-[#eafe45] selection:text-[#1e3523]"
      style={{
        backgroundColor: '#1e3523',
        fontFamily: "'Instrument Sans', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* 1. Global Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#1e3523]/90 border-b border-[#48614b]/40 transition-all">
        <div className="max-w-[1240px] mx-auto px-5 py-5 flex items-center justify-between">
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-3">
            {config.logoUrl ? (
              <img
                src={config.logoUrl}
                alt={config.businessName}
                className="h-10 sm:h-11 w-auto object-contain"
              />
            ) : (
              <img
                src={defaultLogo}
                alt="Mentara Logo"
                className="h-9 sm:h-10 w-auto object-contain"
              />
            )}
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {[
              { label: 'Home', href: '#home' },
              { label: 'About', href: '#about' },
              { label: 'Services', href: '#services' },
              { label: 'Process', href: '#process' },
              { label: 'Projects', href: '#projects' },
              { label: 'Therapists', href: '#team' },
              { label: 'FAQs', href: '#faq' },
            ].map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                className="group relative text-base font-medium text-[#b0bca7] hover:text-[#eff3df] transition-colors py-1 overflow-hidden"
              >
                <div className="transition-transform duration-300 group-hover:-translate-y-full">
                  <span>{link.label}</span>
                </div>
                <div className="absolute inset-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0 text-[#eafe45] font-semibold">
                  <span>{link.label}</span>
                </div>
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#eafe45] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-5">
            {config.phone && (
              <a
                href={`tel:${config.phone.replace(/[^0-9+]/g, '')}`}
                className="flex items-center gap-2 text-sm font-semibold text-[#eff3df] hover:text-[#eafe45] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#2b4731] border border-[#48614b] flex items-center justify-center">
                  <Phone className="w-3.5 h-3.5 text-[#eafe45]" />
                </div>
                <span>Call Us</span>
              </a>
            )}

            {/* Signature Mentara Roll-up CTA Button */}
            <RollupButton
              label="Let’s Talk"
              onClick={() => onOpenBooking()}
              bgColor={sunnyYellow}
              textColor="#1e3523"
              iconBgColor="#1e3523"
              iconColor={sunnyYellow}
              size="md"
            />
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-[#2b4731] border border-[#48614b] text-[#eff3df] hover:text-[#eafe45]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <div className="space-y-1.5 w-6"><div className="h-0.5 bg-current w-full" /><div className="h-0.5 bg-current w-4/5" /><div className="h-0.5 bg-current w-full" /></div>}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#1e3523] border-b border-[#48614b] px-6 py-6 space-y-4">
            <nav className="flex flex-col gap-3">
              {[
                { label: 'Home', href: '#home' },
                { label: 'About', href: '#about' },
                { label: 'Services', href: '#services' },
                { label: 'Process', href: '#process' },
                { label: 'Projects', href: '#projects' },
                { label: 'Therapists', href: '#team' },
                { label: 'FAQs', href: '#faq' },
              ].map((link, idx) => (
                <a
                  key={idx}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-medium text-[#b0bca7] hover:text-[#eafe45] py-1 border-b border-[#48614b]/30"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="pt-2 flex flex-col gap-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking();
                }}
                className="w-full py-3.5 rounded-full font-bold text-center flex items-center justify-center gap-2"
                style={{ backgroundColor: sunnyYellow, color: '#1e3523' }}
              >
                <span>Schedule An Appointment</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenChat();
                }}
                className="w-full py-3 rounded-full border border-[#48614b] bg-[#2b4731] text-[#eff3df] font-medium flex items-center justify-center gap-2"
              >
                <Bot className="w-4 h-4 text-[#eafe45]" />
                <span>Ask AI Knowledge Base</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section id="home" className="pt-14 sm:pt-20 pb-24 sm:pb-36 overflow-hidden relative">
        <div className="max-w-[1240px] mx-auto px-5">
          {/* Hero Top Wrapper */}
          <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
            {/* 500+ Trusted Patients Badge */}
            <div
              className={`inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full border border-[#48614b] bg-[#2b4731]/60 shadow-xs transition-all duration-700 ease-out delay-100 ${
                heroMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <img
                src="https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682c0d28f4b16c2adf20cf26_5e48f2db85349ba0dcce1015cc0ffc8d_User%20Image.svg"
                alt="Patients"
                className="h-6 w-auto"
              />
              <span className="text-sm font-medium text-[#eff3df]">
                <strong className="font-bold text-[#eafe45]">500+</strong> {config.badgeText || 'Trusted Patients'}
              </span>
            </div>

            {/* Hero Main Headline */}
            <h1
              className={`text-4xl sm:text-6xl md:text-7xl lg:text-[80px] font-semibold text-[#eff3df] leading-[1.08] tracking-tight transition-all duration-700 ease-out delay-200 ${
                heroMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              {config.heroHeadline || 'Empower your mental health journey!'}
            </h1>

            {/* Hero Subheadline */}
            <p
              className={`text-lg sm:text-xl text-[#b0bca7] max-w-2xl font-normal leading-relaxed transition-all duration-700 ease-out delay-300 ${
                heroMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              {config.heroSubheadline ||
                'Personalized, compassionate therapy and mental health support designed to help you regain clarity, balance, and peace of mind.'}
            </p>

            {/* Timezone Indicator & Instant Booking CTA */}
            <div
              className={`pt-2 flex flex-wrap items-center justify-center gap-4 transition-all duration-700 ease-out delay-400 ${
                heroMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <RollupButton
                label={config.heroCtaText || 'Schedule An Appointment'}
                onClick={() => onOpenBooking()}
                bgColor={sunnyYellow}
                textColor="#1e3523"
                iconBgColor="#1e3523"
                iconColor={sunnyYellow}
                size="lg"
              />

              <button
                onClick={() => onOpenChat()}
                className="px-6 py-3.5 rounded-full border border-[#48614b] bg-[#2b4731]/80 hover:bg-[#2b4731] hover:border-[#eafe45]/40 text-[#eff3df] font-semibold text-sm sm:text-base flex items-center gap-2.5 transition-all duration-300 cursor-pointer shadow-md hover:shadow-xl"
              >
                <Bot className="w-5 h-5 text-[#eafe45]" />
                <span>Ask AI Concierge (24/7)</span>
              </button>
            </div>

            <div
              className={`text-xs text-[#b0bca7] flex items-center gap-2 pt-1 transition-all duration-700 ease-out delay-500 ${
                heroMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-[#eafe45]" />
              <span>Calendar Timezone: <strong className="text-[#eff3df] font-semibold">{config.timezone || 'America/New_York'}</strong></span>
            </div>
          </div>

          {/* Hero Bottom Wrapper: Main Image + Curved Backing + Floating Pill Tags */}
          <div
            className={`mt-16 sm:mt-24 relative max-w-[1070px] mx-auto flex items-end justify-center transition-all duration-1000 ease-out delay-300 ${
              heroMounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-[0.97]'
            }`}
          >
            {/* Background Arch Graphic */}
            <div className="relative w-full max-w-[960px] aspect-[16/10] flex items-end justify-center">
              <img
                src={heroElementBg}
                alt="Mentara Hero Element"
                className="w-full h-auto object-contain pointer-events-none"
              />

              {/* Main Subject Photo */}
              <div className="absolute inset-x-0 bottom-0 flex justify-center items-end">
                <img
                  src={heroMainImage}
                  alt={config.businessName || 'Mentara'}
                  className="max-h-[380px] sm:max-h-[520px] md:max-h-[600px] w-auto object-contain drop-shadow-2xl"
                />
              </div>

              {/* Tag 1: Personalized Care (Bottom Left) */}
              <div
                className={`absolute left-2 sm:left-6 bottom-[26%] sm:bottom-[30%] z-20 flex items-center gap-2.5 px-3.5 py-2 rounded-full border border-[#eff3df]/20 bg-[#eff3df]/10 backdrop-blur-md text-[#eff3df] text-xs sm:text-sm font-medium shadow-lg transition-all duration-700 ease-out delay-700 ${
                  heroMounted ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-4'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-[#eff3df] flex items-center justify-center text-[#1e3523]">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>Personalized Care</span>
              </div>

              {/* Tag 2: Online Consult (Top Left) */}
              <div
                className={`absolute left-4 sm:left-14 top-[15%] sm:top-[20%] z-20 flex items-center gap-2.5 px-3.5 py-2 rounded-full border border-[#eff3df]/20 bg-[#eff3df]/10 backdrop-blur-md text-[#eff3df] text-xs sm:text-sm font-medium shadow-lg transition-all duration-700 ease-out delay-850 ${
                  heroMounted ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-4'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-[#eff3df] flex items-center justify-center text-[#1e3523]">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <span>Online Consult</span>
              </div>

              {/* Tag 3: Expert Therapists (Top Right) */}
              <div
                className={`absolute right-4 sm:right-16 top-[20%] sm:top-[26%] z-20 flex items-center gap-2.5 px-3.5 py-2 rounded-full border border-[#eff3df]/20 bg-[#eff3df]/10 backdrop-blur-md text-[#eff3df] text-xs sm:text-sm font-medium shadow-lg transition-all duration-700 ease-out delay-1000 ${
                  heroMounted ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-4'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-[#eff3df] flex items-center justify-center text-[#1e3523]">
                  <Sparkles className="w-3.5 h-3.5 text-[#1e3523]" />
                </div>
                <span>Expert Therapists</span>
              </div>

              {/* Tag 4: Flexible Scheduling (Bottom Right) */}
              <div
                className={`absolute right-2 sm:right-8 bottom-[14%] sm:bottom-[18%] z-20 flex items-center gap-2.5 px-3.5 py-2 rounded-full border border-[#eff3df]/20 bg-[#eff3df]/10 backdrop-blur-md text-[#eff3df] text-xs sm:text-sm font-medium shadow-lg transition-all duration-700 ease-out delay-1150 ${
                  heroMounted ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-4'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-[#eff3df] flex items-center justify-center text-[#1e3523]">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <span>Flexible Scheduling</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. About Section ("Strong minds, thriving hearts unite.") */}
      <section id="about" className="py-24 sm:py-[132px] bg-[#2b4731] border-t border-[#48614b]/40">
        <div className="max-w-[1240px] mx-auto px-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* About Left Image */}
            <div className="lg:col-span-5">
              <ScrollReveal direction="right" delay={100}>
                <div className="relative rounded-[24px] overflow-hidden border border-[#48614b] shadow-2xl aspect-[4/5] bg-[#1e3523] group">
                  <img
                    src={config.aboutImageUrl || 'https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682c4043b56a8fc5bf42cacc_About%20Image.png'}
                    alt={config.aboutTitle || 'About Mentara'}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
              </ScrollReveal>
            </div>

            {/* About Right Content */}
            <div className="lg:col-span-7 space-y-6">
              <ScrollReveal direction="left" delay={150}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#48614b] bg-[#35503a] text-xs font-semibold uppercase tracking-wider text-[#eafe45] mb-4">
                  <img src={starIcon} alt="" className="w-3.5 h-3.5" />
                  <span>{config.aboutTitle ? 'About Us' : 'About Mentara'}</span>
                </div>

                <h2 className="text-3xl sm:text-5xl font-semibold text-[#eff3df] leading-tight mb-4">
                  {config.aboutSubtitle || 'Strong minds, thriving hearts unite.'}
                </h2>

                <p className="text-base sm:text-lg text-[#b0bca7] leading-relaxed mb-6">
                  {config.aboutText ||
                    'Strong minds and thriving hearts come together to create a supportive community. Together, we can uplift each other, fostering resilience & joy on our journey towards mental wellness.'}
                </p>

                {/* Action Button */}
                <div className="pt-2">
                  <RollupButton
                    label="Know Us More"
                    onClick={() => onOpenBooking()}
                    bgColor={sunnyYellow}
                    textColor="#1e3523"
                    iconBgColor="#1e3523"
                    iconColor={sunnyYellow}
                    size="md"
                  />
                </div>
              </ScrollReveal>

              {/* 3 Highlight Item Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                {[
                  {
                    title: 'Confidentiality',
                    text: 'Your privacy matters; we keep all therapy and consultation records safe.',
                    icon: 'https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682c42ab1692e987a0368e7a_About%20Item%20Icon%2003.svg',
                  },
                  {
                    title: 'Inclusivity',
                    text: 'Custom programs tailored to support diverse communities and life stages.',
                    icon: 'https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682c42abe6ee2bd77914a7a4_About%20Item%20Icon%2002.svg',
                  },
                  {
                    title: 'Affordability',
                    text: 'Transparent tiered plans and sliding services that remain budget-friendly.',
                    icon: 'https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682c42ab7ce5a6d303113900_About%20Item%20Icon%2001.svg',
                  },
                ].map((item, idx) => (
                  <ScrollReveal key={idx} direction="up" delay={200 + idx * 100}>
                    <div className="p-5 rounded-[20px] border border-[#48614b] bg-[#35503a] space-y-3 hover:-translate-y-2 hover:border-[#eafe45]/60 hover:shadow-xl transition-all duration-300 h-full">
                      <div className="w-12 h-12 rounded-full bg-[#eff3df] flex items-center justify-center p-2.5">
                        <img src={item.icon} alt="" className="w-full h-full object-contain" />
                      </div>
                      <h3 className="text-lg font-medium text-[#eff3df]">{item.title}</h3>
                      <p className="text-xs text-[#b0bca7] leading-relaxed">{item.text}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>

          {/* Partner / Trust Logos Bar */}
          <ScrollReveal direction="up" delay={250}>
            <div className="mt-20 border-t border-[#48614b] pt-12">
              <p className="text-center text-xs font-semibold uppercase tracking-wider text-[#b0bca7] mb-8">
                Trusted By Health Networks & Leading Wellness Organizations
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-6 items-center justify-center opacity-85">
                {partnerLogos.map((logo, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-center py-4 px-3 border border-[#48614b]/60 rounded-xl bg-[#1e3523]/40 hover:-translate-y-1 hover:border-[#eafe45]/60 hover:bg-[#2b4731] transition-all duration-300 shadow-xs"
                  >
                    <img src={logo} alt={`Partner ${idx + 1}`} className="h-7 w-auto object-contain filter brightness-110" />
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 4. Services Catalog Section */}
      <section id="services" className="py-24 sm:py-[132px]">
        <div className="max-w-[1240px] mx-auto px-5">
          {/* Header */}
          <ScrollReveal direction="up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#48614b] bg-[#2b4731] text-xs font-semibold uppercase tracking-wider text-[#eafe45]">
                  <img src={starIcon} alt="" className="w-3.5 h-3.5" />
                  <span>{config.servicesTitle || 'Our Services'}</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-semibold text-[#eff3df]">
                  {config.servicesSubtitle || 'Strong minds, thriving hearts unite.'}
                </h2>
              </div>
              <RollupButton
                label="All Services"
                onClick={() => onOpenBooking()}
                bgColor={sunnyYellow}
                textColor="#1e3523"
                iconBgColor="#1e3523"
                iconColor={sunnyYellow}
                size="md"
                className="self-start md:self-auto"
              />
            </div>
          </ScrollReveal>

          {/* Wavy Divider */}
          <div className="mb-12">
            <img src={sectionLine01} alt="" className="w-full h-auto object-contain opacity-70" />
          </div>

          {/* Services 3x2 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, sIdx) => (
              <ScrollReveal key={service.id || sIdx} direction="up" delay={sIdx * 80}>
                <div className="group p-5 rounded-[24px] border border-[#48614b] bg-[#35503a] hover:border-[#eafe45]/70 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between h-full">
                  <div className="space-y-4">
                    {/* Thumbnail */}
                    <div className="rounded-[18px] overflow-hidden aspect-[16/10] bg-[#1e3523] border border-[#48614b]/40">
                      <img
                        src={service.imageUrl || 'https://cdn.prod.website-files.com/682982f2b42d35f376f2394e/6829d494c23b89be6dbf2a48_Thumbnail%20Image%2001.png'}
                        alt={service.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    </div>

                    {/* Title & Price */}
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-xl font-medium text-[#eff3df] group-hover:text-[#eafe45] transition-colors">
                        {service.name}
                      </h3>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#1e3523] text-[#eafe45] border border-[#48614b]">
                        ${service.price}
                      </span>
                    </div>

                    <p className="text-sm text-[#b0bca7] leading-relaxed line-clamp-2">
                      {service.description}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-[#48614b]/60 flex items-center justify-between mt-6">
                    <div className="text-xs text-[#b0bca7] flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#eafe45]" />
                      <span>{service.durationMinutes} min</span>
                    </div>

                    <button
                      onClick={() => onOpenBooking(service)}
                      className="group/btn inline-flex items-center gap-2 text-sm font-semibold text-[#eff3df] hover:text-[#eafe45] transition-colors cursor-pointer"
                    >
                      <span>Book Session</span>
                      <div className="w-7 h-7 rounded-full bg-[#2b4731] border border-[#48614b] flex items-center justify-center group-hover/btn:bg-[#eafe45] group-hover/btn:text-[#1e3523] group-hover/btn:border-[#eafe45] transition-all duration-300">
                        <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                      </div>
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Process Section ("Our Process - Mental Wellness Journey") with Sticky Stacked Cards */}
      <section id="process" className="py-24 sm:py-[132px] bg-[#2b4731] border-t border-[#48614b]/40 relative">
        <div className="max-w-[1240px] mx-auto px-5">
          <ScrollReveal direction="up">
            <div className="flex flex-col items-center text-center space-y-3 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#48614b] bg-[#35503a] text-xs font-semibold uppercase tracking-wider text-[#eafe45]">
                <img src={starIcon} alt="" className="w-3.5 h-3.5" />
                <span>Our Process</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-semibold text-[#eff3df]">
                Mental Wellness Journey
              </h2>
            </div>
          </ScrollReveal>

          <div className="mb-12 max-w-4xl mx-auto">
            <img src={vectorLineOne} alt="" className="w-full h-auto object-contain opacity-70" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative">
            {/* Sticky Process Featured Image (Pinned Left) */}
            <div className="lg:col-span-5 relative">
              <div className="sticky top-[100px] sm:top-[120px] self-start w-full">
                <ScrollReveal direction="right" delay={100}>
                  <div className="rounded-[20px] sm:rounded-[24px] overflow-hidden border border-[#48614b] shadow-2xl aspect-[4/5] sm:max-h-[640px] bg-[#1e3523]">
                    <img
                      src="https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682c6530d9caf9f6917cbfec_Process.png"
                      alt="Process Overview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </ScrollReveal>
              </div>
            </div>

            {/* Right Numbered Process Stacked Cards with dynamic scroll scale */}
            <div className="lg:col-span-7 relative">
              <ProcessCardsStack
                steps={[
                  {
                    number: '/001',
                    title: 'Your Mental Health',
                    text: 'Mental health support should be accessible to individuals from all backgrounds and communities everywhere. We start with a comprehensive personal assessment.',
                    image: 'https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682c65ff7461c9577a815b82_Process%20Card%20Image.png',
                  },
                  {
                    number: '/002',
                    title: 'Moments of Mental Stillness',
                    text: 'Access to mental health support must be ensured for individuals across all communities and walks of life, focusing on mindfulness and tailored coping techniques.',
                    image: 'https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682eb512766878e8aae8b737_Process%20Item%20Image.png',
                  },
                  {
                    number: '/003',
                    title: 'Mental Calm Time',
                    text: 'Taking time for mental calm is essential. It allows individuals to recharge, reflect, and find balance in their busy everyday lives.',
                    image: 'https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682eb5125d011d38dd48d69e_Process%20Item%20Image-1.png',
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6. Project Showcase Carousel Section */}
      <section id="projects" className="py-24 sm:py-[132px]">
        <div className="max-w-[1240px] mx-auto px-5">
          <ScrollReveal direction="up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#48614b] bg-[#2b4731] text-xs font-semibold uppercase tracking-wider text-[#eafe45]">
                  <img src={starIcon} alt="" className="w-3.5 h-3.5" />
                  <span>Project Showcase</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-semibold text-[#eff3df]">
                  Strong Mind, Calm Heart Project.
                </h2>
              </div>

              {/* Slider Navigation Arrows */}
              <div className="flex items-center gap-3 self-start md:self-auto">
                <button
                  onClick={() =>
                    setProjectSlideIndex((prev) => (prev > 0 ? prev - 1 : projects.length - 1))
                  }
                  className="w-11 h-11 rounded-full bg-[#eff3df] text-[#1e3523] hover:bg-[#eafe45] flex items-center justify-center transition-all duration-300 cursor-pointer shadow-md hover:scale-105"
                  aria-label="Previous Project"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setProjectSlideIndex((prev) => (prev < projects.length - 1 ? prev + 1 : 0))
                  }
                  className="w-11 h-11 rounded-full bg-[#eff3df] text-[#1e3523] hover:bg-[#eafe45] flex items-center justify-center transition-all duration-300 cursor-pointer shadow-md hover:scale-105"
                  aria-label="Next Project"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </ScrollReveal>

          <div className="mb-12">
            <img src={sectionLine01} alt="" className="w-full h-auto object-contain opacity-70" />
          </div>

          {/* Project Carousel Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {projects
              .slice(projectSlideIndex, projectSlideIndex + 2)
              .concat(
                projects.slice(
                  0,
                  Math.max(0, projectSlideIndex + 2 - projects.length)
                )
              )
              .map((proj, idx) => (
                <ScrollReveal key={proj.id} direction="up" delay={idx * 150}>
                  <div
                    className="group rounded-[28px] border border-[#48614b] bg-[#2b4731] p-6 space-y-5 hover:border-[#eafe45]/70 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 h-full flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="rounded-[20px] overflow-hidden aspect-[16/10] bg-[#1e3523] border border-[#48614b]/40">
                        <img
                          src={proj.image}
                          alt={proj.title}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                      </div>

                      <h3 className="text-2xl font-medium text-[#eff3df] group-hover:text-[#eafe45] transition-colors">{proj.title}</h3>
                      <p className="text-sm text-[#b0bca7] leading-relaxed">{proj.desc}</p>
                    </div>

                    <div className="pt-4 border-t border-[#48614b]/60 flex items-center justify-between mt-4">
                      <button
                        onClick={() => onOpenBooking()}
                        className="px-5 py-2.5 rounded-full border border-[#eafe45] bg-[#eafe45] text-[#1e3523] font-semibold text-xs transition-all duration-300 hover:bg-transparent hover:text-[#eff3df] cursor-pointer shadow-sm"
                      >
                        Read More
                      </button>
                      <span className="text-xs font-semibold text-[#eafe45] bg-[#1e3523] px-3 py-1 rounded-full border border-[#48614b]">
                        {proj.duration}
                      </span>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
          </div>
        </div>
      </section>

      {/* 7. Testimonials Section ("Real People Feedback") */}
      <section id="testimonials" className="py-24 sm:py-[132px] bg-[#2b4731] border-t border-[#48614b]/40">
        <div className="max-w-[1240px] mx-auto px-5">
          <ScrollReveal direction="up">
            <div className="flex flex-col items-center text-center space-y-3 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#48614b] bg-[#35503a] text-xs font-semibold uppercase tracking-wider text-[#eafe45]">
                <img src={starIcon} alt="" className="w-3.5 h-3.5" />
                <span>Testimonials</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-semibold text-[#eff3df]">
                Real People Feedback.
              </h2>
            </div>
          </ScrollReveal>

          <div className="mb-12 max-w-4xl mx-auto">
            <img src={vectorLineOne} alt="" className="w-full h-auto object-contain opacity-70" />
          </div>

          {/* Testimonial Tabs Navigation + Active Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Tabs List on Left/Top */}
            <div className="lg:col-span-4">
              <ScrollReveal direction="right" delay={100}>
                <div className="flex flex-row lg:flex-col gap-3 overflow-x-auto pb-2 lg:pb-0">
                  {testimonials.map((t, idx) => {
                    const isActive = activeTestimonialTab === idx;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setActiveTestimonialTab(idx)}
                        className={`flex items-center gap-4 p-3.5 rounded-[16px] transition-all duration-300 cursor-pointer text-left shrink-0 lg:shrink w-[220px] lg:w-full border ${
                          isActive
                            ? 'bg-[#eff3df] text-[#1e3523] border-[#eff3df] shadow-lg scale-[1.02]'
                            : 'bg-[#1e3523]/60 text-[#eff3df] border-[#48614b]/60 hover:border-[#eafe45]/40 hover:bg-[#35503a]'
                        }`}
                      >
                        <img
                          src={t.avatar}
                          alt={t.name}
                          className="w-12 h-12 rounded-full object-cover border border-[#48614b]/40 shrink-0"
                        />
                        <div>
                          <div className="font-semibold text-sm leading-tight">{t.name}</div>
                          <div className={`text-xs ${isActive ? 'text-[#35503a]' : 'text-[#b0bca7]'}`}>
                            {t.role}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollReveal>
            </div>

            {/* Active Testimonial Card Display */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-stretch">
                {/* Large Featured Photo */}
                <div className="sm:col-span-5">
                  <ScrollReveal direction="right" delay={150}>
                    <div className="rounded-[24px] overflow-hidden aspect-[4/5] bg-[#1e3523] border border-[#48614b] shadow-xl">
                      <img
                        src={testimonials[activeTestimonialTab].featuredImage}
                        alt={testimonials[activeTestimonialTab].name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </ScrollReveal>
                </div>

                {/* Quote Card in Ecru White */}
                <div className="sm:col-span-7">
                  <ScrollReveal direction="left" delay={200}>
                    <div className="bg-[#eff3df] text-[#1e3523] rounded-[24px] p-8 flex flex-col justify-between shadow-2xl h-full">
                      <div className="flex items-center justify-between pb-4 border-b border-[#1e3523]/15">
                        <img
                          src="https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682d4ce0ced67090ed189722_quote%20icon.png"
                          alt="Quote"
                          className="h-7 w-auto object-contain"
                        />
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e3523] text-[#eff3df] text-xs font-semibold">
                          <Star className="w-3.5 h-3.5 fill-[#eafe45] text-[#eafe45]" />
                          <span>{testimonials[activeTestimonialTab].rating}</span>
                        </div>
                      </div>

                      <p className="py-6 text-base sm:text-lg font-medium leading-relaxed italic text-[#1e3523]">
                        {testimonials[activeTestimonialTab].quote}
                      </p>

                      <div className="pt-4 border-t border-[#1e3523]/15 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-base text-[#1e3523]">
                            {testimonials[activeTestimonialTab].name}
                          </div>
                          <div className="text-xs text-[#48614b] font-medium">
                            {testimonials[activeTestimonialTab].role}
                          </div>
                        </div>
                        <img
                          src={testimonials[activeTestimonialTab].logo}
                          alt="Verified"
                          className="h-6 w-auto object-contain opacity-80"
                        />
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Team Members Section ("People Behind The Healing Work") with 3D Flip Cards */}
      <section id="team" className="py-24 sm:py-[132px]">
        <div className="max-w-[1240px] mx-auto px-5">
          <ScrollReveal direction="up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#48614b] bg-[#2b4731] text-xs font-semibold uppercase tracking-wider text-[#eafe45]">
                  <img src={starIcon} alt="" className="w-3.5 h-3.5" />
                  <span>Team Member</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-semibold text-[#eff3df]">
                  People Behind The Healing Work.
                </h2>
              </div>
              <RollupButton
                label="Our Therapists"
                onClick={() => onOpenBooking()}
                bgColor={sunnyYellow}
                textColor="#1e3523"
                iconBgColor="#1e3523"
                iconColor={sunnyYellow}
                size="md"
                className="self-start md:self-auto"
              />
            </div>
          </ScrollReveal>

          <div className="mb-12">
            <img src={sectionLine01} alt="" className="w-full h-auto object-contain opacity-70" />
          </div>

          {/* 3D Flip Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member, mIdx) => (
              <ScrollReveal key={mIdx} direction="up" delay={mIdx * 100}>
                <div
                  className="group [perspective:1000px] h-[460px] cursor-pointer"
                >
                  <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] rounded-[24px]">
                    {/* Front Card */}
                    <div className="absolute inset-0 [backface-visibility:hidden] rounded-[24px] overflow-hidden border border-[#48614b] bg-[#35503a] shadow-xl group-hover:border-[#eafe45]/60 transition-colors">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-[#1e3523] via-[#1e3523]/80 to-transparent">
                        <h4 className="text-xl font-bold text-[#eff3df]">{member.name}</h4>
                        <p className="text-xs text-[#eafe45] font-semibold">{member.experience}</p>
                      </div>
                    </div>

                    {/* Back Card (Flipped) */}
                    <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[24px] p-6 border border-[#eafe45]/60 bg-[#2b4731] flex flex-col justify-between shadow-2xl">
                      <div className="space-y-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#eafe45] bg-[#1e3523]">
                          <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-2xl font-bold text-[#eff3df]">{member.name}</h4>
                          <div className="text-xs text-[#eafe45] font-semibold mt-1">Specialist Experience</div>
                          <p className="text-sm text-[#b0bca7] mt-1">{member.experience}</p>
                        </div>
                        <p className="text-xs text-[#b0bca7] leading-relaxed">
                          Dedicated practitioner providing evidence-based compassionate therapy, confidential patient guidance, and personalized care strategies.
                        </p>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-[#48614b]">
                        <div className="flex items-center gap-2">
                          <a href={member.facebook} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full border border-[#48614b] flex items-center justify-center text-[#eff3df] hover:bg-[#eafe45] hover:text-[#1e3523] transition-colors">
                            <FacebookIcon className="w-3.5 h-3.5" />
                          </a>
                          <a href={member.instagram} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full border border-[#48614b] flex items-center justify-center text-[#eff3df] hover:bg-[#eafe45] hover:text-[#1e3523] transition-colors">
                            <InstagramIcon className="w-3.5 h-3.5" />
                          </a>
                          <a href={member.twitter} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full border border-[#48614b] flex items-center justify-center text-[#eff3df] hover:bg-[#eafe45] hover:text-[#1e3523] transition-colors">
                            <TwitterIcon className="w-3.5 h-3.5" />
                          </a>
                          <a href={member.linkedin} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full border border-[#48614b] flex items-center justify-center text-[#eff3df] hover:bg-[#eafe45] hover:text-[#1e3523] transition-colors">
                            <LinkedinIcon className="w-3.5 h-3.5" />
                          </a>
                        </div>

                        <button
                          onClick={() => onOpenBooking()}
                          className="w-full py-2.5 rounded-full font-bold text-xs text-center cursor-pointer transition-all hover:scale-[1.02]"
                          style={{ backgroundColor: sunnyYellow, color: '#1e3523' }}
                        >
                          Book With {member.name.split(' ')[1] || 'Doctor'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Blog & News Updates Carousel */}
      <section id="blog" className="py-24 sm:py-[132px] bg-[#2b4731] border-t border-[#48614b]/40">
        <div className="max-w-[1240px] mx-auto px-5">
          <ScrollReveal direction="up">
            <div className="flex flex-col items-center text-center space-y-3 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#48614b] bg-[#35503a] text-xs font-semibold uppercase tracking-wider text-[#eafe45]">
                <img src={starIcon} alt="" className="w-3.5 h-3.5" />
                <span>Blog &amp; News</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-semibold text-[#eff3df]">
                Wellness Blog Updates
              </h2>
            </div>
          </ScrollReveal>

          <div className="mb-12 max-w-4xl mx-auto">
            <img src={vectorLineOne} alt="" className="w-full h-auto object-contain opacity-70" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((b, idx) => (
              <ScrollReveal key={idx} direction="up" delay={idx * 120}>
                <div
                  className="group p-5 rounded-[24px] border border-[#48614b] bg-[#35503a] flex flex-col justify-between hover:border-[#eafe45]/70 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 h-full"
                >
                  <div className="space-y-4">
                    <div className="rounded-[18px] overflow-hidden aspect-[16/10] bg-[#1e3523]">
                      <img src={b.image} alt={b.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                    </div>
                    <h3 className="text-xl font-medium text-[#eff3df] group-hover:text-[#eafe45] transition-colors">{b.title}</h3>
                    <p className="text-xs text-[#b0bca7] leading-relaxed line-clamp-2">{b.desc}</p>
                  </div>

                  <div className="pt-5 border-t border-[#48614b]/60 flex items-center justify-between mt-4">
                    <a
                      href="#blog"
                      className="inline-flex items-center gap-2 text-xs font-bold text-[#eafe45] group-hover:underline"
                    >
                      <span>Read Article</span>
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Toggleable Pricing Plans Section */}
      {config.showPricing !== false && (
        <section id="pricing" className="py-24 sm:py-[132px] border-t border-[#48614b]/40">
          <div className="max-w-[1240px] mx-auto px-5 text-center space-y-12">
            <ScrollReveal direction="up">
              <div className="max-w-2xl mx-auto space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#48614b] bg-[#2b4731] text-xs font-semibold uppercase tracking-wider text-[#eafe45]">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Transparent Plans</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-semibold text-[#eff3df]">
                  {config.pricingTitle || 'Simple, Flexible Pricing Plans'}
                </h2>
                <p className="text-base text-[#b0bca7] leading-relaxed">
                  {config.pricingSubtitle ||
                    'Choose the level of engagement that fits your personal journey. Upgrade, reschedule, or cancel anytime.'}
                </p>

                {/* Monthly vs Annual Toggle */}
                <div className="pt-4 flex items-center justify-center gap-3">
                  <span className={`text-sm font-semibold ${!isAnnualBilling ? 'text-[#eff3df]' : 'text-[#b0bca7]'}`}>
                    Per Session / Monthly
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAnnualBilling(!isAnnualBilling)}
                    className="w-12 h-6 rounded-full p-1 transition-colors relative flex items-center cursor-pointer"
                    style={{ backgroundColor: isAnnualBilling ? sunnyYellow : '#35503a' }}
                    aria-label="Toggle annual billing"
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-[#1e3523] transition-transform ${
                        isAnnualBilling ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className={`text-sm font-semibold flex items-center gap-1.5 ${isAnnualBilling ? 'text-[#eff3df]' : 'text-[#b0bca7]'}`}>
                    Quarterly / Annual
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#eafe45] text-[#1e3523]">
                      Save 20%
                    </span>
                  </span>
                </div>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch text-left">
              {(config.pricingPlans && config.pricingPlans.length > 0 ? config.pricingPlans : [
                {
                  id: 'plan_starter',
                  name: 'Essential Consultation',
                  price: 99,
                  period: '/ session',
                  description: 'Perfect for individuals starting their mental wellness exploration with focused guidance.',
                  features: [
                    'Single 50-minute personal consultation',
                    'Diagnostic wellness report & next steps',
                    'Private messaging support for 7 days',
                    'Access to mindfulness toolkit',
                  ],
                  popular: false,
                  ctaText: 'Book Essential',
                },
                {
                  id: 'plan_growth',
                  name: 'Growth Partnership',
                  price: 299,
                  period: '/ month',
                  description: 'Our most popular tier for ongoing emotional resilience, regular sessions, and high-touch support.',
                  features: [
                    'Up to 4 therapy sessions per month',
                    'Dedicated therapist assignment',
                    'Priority calendar booking slots',
                    '24/7 AI Knowledge Base Concierge',
                    'Personalized self-care worksheets',
                  ],
                  popular: true,
                  badge: 'Most Popular',
                  ctaText: 'Start Growth Tier',
                },
                {
                  id: 'plan_enterprise',
                  name: 'Comprehensive Care',
                  price: 599,
                  period: '/ month',
                  description: 'Holistic care for families or individuals seeking weekly multi-disciplinary therapeutic support.',
                  features: [
                    'Unlimited guided check-ins',
                    'Couples or family sessions included',
                    'Custom mental wellness blueprint',
                    'Guaranteed same-day response SLA',
                    'Emergency therapist contact hotline',
                  ],
                  popular: false,
                  ctaText: 'Contact Care Team',
                },
              ]).map((plan, pIdx) => {
                const isHighlight = plan.popular || plan.isPopular;
                const priceNum = typeof plan.price === 'number' ? plan.price : parseFloat(String(plan.price).replace(/[^0-9.]/g, '')) || 99;
                const finalPrice = isAnnualBilling ? Math.round(priceNum * 0.8) : priceNum;

                return (
                  <ScrollReveal key={plan.id || pIdx} direction="up" delay={pIdx * 120}>
                    <div
                      className={`rounded-[28px] p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl relative h-full ${
                        isHighlight
                          ? 'border-2 border-[#eafe45] bg-[#35503a] shadow-2xl scale-102'
                          : 'border border-[#48614b] bg-[#2b4731]'
                      }`}
                    >
                      {isHighlight && (
                        <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full text-xs font-bold bg-[#eafe45] text-[#1e3523] uppercase tracking-wider shadow-md">
                          {plan.badge || 'Most Popular'}
                        </div>
                      )}

                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl font-bold text-[#eff3df]">{plan.name}</h3>
                          <p className="text-xs text-[#b0bca7] mt-1">{plan.description}</p>
                        </div>

                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl sm:text-5xl font-extrabold text-[#eff3df]">
                            ${finalPrice}
                          </span>
                          <span className="text-sm font-semibold text-[#b0bca7]">
                            {plan.period || '/ month'}
                          </span>
                        </div>

                        <ul className="space-y-3 pt-4 border-t border-[#48614b]">
                          {(plan.features || []).map((feat, fIdx) => (
                            <li key={fIdx} className="flex items-center gap-3 text-sm text-[#eff3df]">
                              <div className="w-5 h-5 rounded-full bg-[#1e3523] flex items-center justify-center shrink-0">
                                <Check className="w-3.5 h-3.5 text-[#eafe45]" />
                              </div>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-8 mt-4">
                        <button
                          onClick={() => onOpenBooking()}
                          className="w-full py-3.5 rounded-full font-bold text-sm text-center transition-all duration-300 cursor-pointer shadow-md hover:scale-[1.02]"
                          style={{
                            backgroundColor: isHighlight ? sunnyYellow : '#eff3df',
                            color: '#1e3523',
                          }}
                        >
                          {plan.ctaText || 'Get Started'}
                        </button>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 11. High-Impact CTA Section ("Book Your Mental Health Session!") */}
      <section className="py-20 sm:py-[120px]">
        <div className="max-w-[1240px] mx-auto px-5">
          <ScrollReveal direction="up">
            <div
              className="rounded-[28px] overflow-hidden p-8 sm:p-14 lg:p-16 border border-[#48614b] shadow-2xl relative"
              style={{
                backgroundImage:
                  'url(https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682ab86c54dca6d6afb46a63_CTA%20BG.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                {/* Left Content */}
                <div className="lg:col-span-7 space-y-8 text-left">
                  <div className="space-y-3">
                    <h2 className="text-3xl sm:text-5xl lg:text-6xl font-semibold text-[#eff3df] leading-tight">
                      {config.ctaHeadline || 'Book Your Mental Health Session!'}
                    </h2>
                    <p className="text-base sm:text-lg text-[#b0bca7]">
                      {config.ctaSubheadline ||
                        'Take the first step towards emotional resilience and well-being. Our licensed therapists are ready to support you.'}
                    </p>
                  </div>

                  {/* 99% Mental Check-up Card */}
                  <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-4 rounded-[20px] border border-[#48614b] bg-[#35503a] shadow-lg">
                    <img
                      src="https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682ac2ca5a97800b4ae09cdf_CTA%20Card%20Image.png"
                      alt=""
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div>
                      <div className="text-lg font-bold text-[#eff3df]">99% Mental Check-up!</div>
                      <div className="text-xs text-[#b0bca7]">Verified confidential scheduling</div>
                    </div>
                    <RollupButton
                      label="Appointment!"
                      onClick={() => onOpenBooking()}
                      bgColor={sunnyYellow}
                      textColor="#1e3523"
                      iconBgColor="#1e3523"
                      iconColor={sunnyYellow}
                      size="sm"
                      className="sm:ml-auto"
                    />
                  </div>
                </div>

                {/* Right Cutout Image */}
                <div className="lg:col-span-5 flex justify-center lg:justify-end">
                  <img
                    src="https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682ab89babff5ba0661f06d5_CTA%20Main%20Image.png"
                    alt="Doctor"
                    className="max-h-[360px] sm:max-h-[460px] w-auto object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 12. FAQ Section with Video Lightbox */}
      <section id="faq" className="py-24 sm:py-[132px] bg-[#2b4731] border-t border-[#48614b]/40">
        <div className="max-w-[1240px] mx-auto px-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left: Headline & Video Thumbnail */}
            <div className="lg:col-span-5 space-y-6">
              <ScrollReveal direction="right" delay={100}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#48614b] bg-[#35503a] text-xs font-semibold uppercase tracking-wider text-[#eafe45] mb-3">
                  <img src={starIcon} alt="" className="w-3.5 h-3.5" />
                  <span>FAQ’s</span>
                </div>

                <h2 className="text-3xl sm:text-5xl font-semibold text-[#eff3df] leading-tight mb-4">
                  Frequently Asked Questions?
                </h2>

                <p className="text-sm text-[#b0bca7] mb-6">
                  Watch our short orientation video to discover our mental wellness approach and answers to common patient questions.
                </p>

                {/* Video Lightbox Play Trigger */}
                <div
                  onClick={() => setIsVideoOpen(true)}
                  className="relative rounded-[20px] overflow-hidden aspect-[16/9] border border-[#48614b] group cursor-pointer shadow-xl hover:border-[#eafe45]/60 transition-all duration-300"
                  style={{
                    backgroundImage:
                      'url(https://cdn.prod.website-files.com/6825c2925e24e79e2bf4a9ed/682d75fdaec86986603c7ea1_Video%20Image.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="absolute inset-0 bg-[#1e3523]/30 group-hover:bg-[#1e3523]/10 transition-colors flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-[#eff3df]/40 backdrop-blur-md border border-[#eff3df]/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-[#eafe45] text-[#eafe45] ml-0.5" />
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Right: Accordion Items with Rotating + / - */}
            <div className="lg:col-span-7 space-y-4">
              {faqs.map((faq, fIdx) => {
                const isOpen = activeFaq === fIdx;
                return (
                  <ScrollReveal key={faq.id || fIdx} direction="left" delay={fIdx * 70}>
                    <div
                      className="border-b border-[#48614b] pb-5 transition-all"
                    >
                      <button
                        onClick={() => setActiveFaq(isOpen ? null : fIdx)}
                        className="w-full flex items-center justify-between text-left gap-4 py-2 cursor-pointer group"
                      >
                        <h3 className="text-lg sm:text-xl font-medium text-[#eff3df] group-hover:text-[#eafe45] transition-colors">
                          {faq.question}
                        </h3>
                        <div className="w-8 h-8 rounded-full border border-[#48614b] bg-[#1e3523] flex items-center justify-center shrink-0">
                          <div
                            className={`w-3.5 h-0.5 bg-[#eafe45] transition-transform duration-300 ${
                              isOpen ? 'rotate-180' : 'rotate-0'
                            }`}
                          />
                        </div>
                      </button>

                      {isOpen && (
                        <div className="pt-2 pb-1 text-sm sm:text-base text-[#b0bca7] leading-relaxed animate-in fade-in duration-200">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 13. AI Concierge Knowledge Base Section */}
      <section className="py-20 sm:py-[120px] border-t border-[#48614b]/40 bg-[#1e3523]">
        <div className="max-w-[1240px] mx-auto px-5">
          <ScrollReveal direction="up">
            <div className="rounded-[28px] border border-[#eafe45]/40 bg-[#2b4731] p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
              <div className="space-y-3 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e3523] border border-[#eafe45]/40 text-xs font-semibold text-[#eafe45]">
                  <Bot className="w-3.5 h-3.5" />
                  <span>Grounded AI Knowledge Base</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#eff3df]">
                  Have Questions Right Now? Ask Our 24/7 AI Concierge
                </h3>
                <p className="text-sm text-[#b0bca7] max-w-xl">
                  Trained directly on our therapy methodologies, practitioner credentials, and booking policies to provide instant, confidential answers.
                </p>
              </div>
              <button
                onClick={() => onOpenChat()}
                className="px-8 py-4 rounded-full font-bold text-sm shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2.5 shrink-0 cursor-pointer"
                style={{ backgroundColor: sunnyYellow, color: '#1e3523' }}
              >
                <MessageSquare className="w-4 h-4 text-[#1e3523]" />
                <span>Start Live Chat</span>
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 14. Footer Section */}
      <footer className="pt-24 sm:pt-[132px] pb-12 sm:pb-16 bg-[#2b4731] border-t border-[#48614b]/60">
        <div className="max-w-[1240px] mx-auto px-5">
          {/* Footer Top Logo & Wavy Divider */}
          <div className="flex flex-col items-center mb-16">
            <a href="#" className="mb-8">
              {config.logoUrl ? (
                <img src={config.logoUrl} alt={config.businessName} className="h-10 w-auto object-contain" />
              ) : (
                <img src={defaultFooterLogo} alt="Mentara Footer Logo" className="h-10 w-auto object-contain" />
              )}
            </a>
            <img src={sectionLine01} alt="" className="w-full h-auto object-contain opacity-70" />
          </div>

          {/* Footer 3-Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-16">
            {/* Left Column: Navigation Links */}
            <div className="md:col-span-3 space-y-4">
              <h4 className="text-lg font-semibold text-[#eff3df]">Main Pages</h4>
              <ul className="space-y-2.5 text-sm text-[#b0bca7]">
                <li><a href="#about" className="hover:text-[#eafe45] transition-colors">About Us</a></li>
                <li><a href="#services" className="hover:text-[#eafe45] transition-colors">Therapy Services</a></li>
                <li><a href="#projects" className="hover:text-[#eafe45] transition-colors">Projects &amp; Workshops</a></li>
                <li><a href="#team" className="hover:text-[#eafe45] transition-colors">Our Therapists</a></li>
                <li><a href="#faq" className="hover:text-[#eafe45] transition-colors">Frequently Asked Questions</a></li>
                <li><a href="#pricing" className="hover:text-[#eafe45] transition-colors">Pricing &amp; Retainers</a></li>
              </ul>
            </div>

            {/* Middle Column: Central Quote + Buttons + Social Pills */}
            <div className="md:col-span-6 text-center space-y-6">
              <h3 className="text-2xl sm:text-3xl font-medium text-[#eff3df] leading-snug">
                “Heal Your Mind, Change Your Life – Start Your Journey Today!”
              </h3>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <RollupButton
                  label="Get Started"
                  onClick={() => onOpenBooking()}
                  bgColor={sunnyYellow}
                  textColor="#1e3523"
                  iconBgColor="#1e3523"
                  iconColor={sunnyYellow}
                  size="sm"
                />
                <button
                  onClick={() => onOpenChat()}
                  className="px-6 py-2.5 rounded-full border border-[#48614b] bg-[#1e3523] text-[#eff3df] font-semibold text-xs hover:border-[#eafe45]/40 hover:bg-[#35503a] transition-all duration-300 cursor-pointer shadow-sm"
                >
                  Online Consultation
                </button>
              </div>

              {/* Social Link Pills */}
              <div className="flex items-center justify-center gap-3 pt-2">
                {[
                  { icon: FacebookIcon, href: 'https://facebook.com' },
                  { icon: InstagramIcon, href: 'https://instagram.com' },
                  { icon: TwitterIcon, href: 'https://x.com' },
                  { icon: LinkedinIcon, href: 'https://linkedin.com' },
                ].map((s, idx) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={idx}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="w-12 h-9 rounded-full border border-[#48614b] bg-[#2b4731] hover:bg-[#1e3523] hover:border-[#eafe45]/40 flex items-center justify-center text-[#eff3df] hover:text-[#eafe45] transition-all duration-300"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Contact & Location */}
            <div className="md:col-span-3 space-y-4 md:text-right">
              <h4 className="text-lg font-semibold text-[#eff3df]">Contact &amp; Hours</h4>
              <div className="space-y-2 text-xs text-[#b0bca7]">
                {config.address && <p>{config.address}</p>}
                {config.phone && <p>Tel: {config.phone}</p>}
                {config.email && <p>Email: {config.email}</p>}
                <p className="text-[#eafe45] font-semibold pt-1">Timezone: {config.timezone || 'America/New_York'}</p>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Bottom Wavy Line */}
          <div className="border-t border-[#48614b] pt-8 text-center text-xs text-[#b0bca7] space-y-4">
            <img src={sectionLine02} alt="" className="w-full h-auto object-contain opacity-70 mb-4" />
            <p>
              {config.footerText || '© 2026 Mentara Mental Health & Therapy. All rights reserved.'}
            </p>
          </div>
        </div>
      </footer>

      {/* Video Lightbox Modal */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-3xl bg-[#1e3523] rounded-2xl overflow-hidden border border-[#48614b] shadow-2xl">
            <button
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-[#2b4731] border border-[#48614b] text-[#eff3df] hover:text-[#eafe45] flex items-center justify-center"
              aria-label="Close video"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-video w-full">
              <iframe
                src="https://www.youtube.com/embed/G0zJGDokyWQ?autoplay=1"
                title="Mentara Video Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
