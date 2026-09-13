'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Scissors,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Star,
  Check,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  X,
  ExternalLink,
  QrCode,
  AlertCircle,
  CalendarCheck,
  CalendarX,
  RefreshCw,
  Send,
} from 'lucide-react';
import { LandingPageConfig, LandingPageServiceItem, DEFAULT_BARBER_LANDING_CONFIG } from '@/lib/landing/types';

interface SitePageProps {
  params: Promise<{ id: string }>;
}

export default function HostedBusinessSite({ params }: SitePageProps) {
  const [identifier, setIdentifier] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [assistantId, setAssistantId] = useState<string>('');
  const [landingConfig, setLandingConfig] = useState<LandingPageConfig>(DEFAULT_BARBER_LANDING_CONFIG);
  const [assistantData, setAssistantData] = useState<any>(null);

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<LandingPageServiceItem | null>(null);
  const [bookingDate, setBookingDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [bookingTime, setBookingTime] = useState<string>('10:00');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState<any>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Manage Booking Modal (via manageToken)
  const [manageToken, setManageToken] = useState<string | null>(null);
  const [managedAppointment, setManagedAppointment] = useState<any>(null);
  const [manageLoading, setManageLoading] = useState(false);
  const [manageError, setManageError] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [manageSuccessMsg, setManageSuccessMsg] = useState<string | null>(null);

  // Floating Chat Widget State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // QR Code Modal State
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  useEffect(() => {
    params.then((p) => {
      setIdentifier(p.id);
    });
  }, [params]);

  // Check for manageToken in query parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('manageToken');
      if (token) {
        setManageToken(token);
      }
    }
  }, []);

  // Fetch landing page and assistant data
  useEffect(() => {
    if (!identifier) return;

    setLoading(true);
    fetch(`/api/landing-page?slug=${encodeURIComponent(identifier)}`)
      .then((res) => {
        if (!res.ok) {
          return fetch(`/api/landing-page?assistantId=${encodeURIComponent(identifier)}`);
        }
        return res;
      })
      .then((res) => {
        if (!res.ok) throw new Error('Could not load landing page configuration');
        return res.json();
      })
      .then((data) => {
        setAssistantId(data.assistantId);
        if (data.config) {
          setLandingConfig(data.config);
        }
        // Also fetch widget assistant config
        return fetch(`/api/widget/${data.assistantId}/config`);
      })
      .then((res) => res.json())
      .then((astData) => {
        setAssistantData(astData);
        if (astData?.welcomeMessage) {
          setChatMessages([
            {
              role: 'assistant',
              content: astData.welcomeMessage,
            },
          ]);
        }
      })
      .catch((err) => {
        console.warn('Using default landing configuration:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [identifier]);

  // Fetch managed appointment if token is present
  useEffect(() => {
    if (!manageToken) return;

    setManageLoading(true);
    fetch(`/api/appointments?manageToken=${encodeURIComponent(manageToken)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Appointment not found or link expired');
        return res.json();
      })
      .then((data) => {
        setManagedAppointment(data.appointment);
        setRescheduleDate(data.appointment.date);
        setRescheduleTime(data.appointment.timeSlot);
      })
      .catch((err) => {
        setManageError(err.message);
      })
      .finally(() => {
        setManageLoading(false);
      });
  }, [manageToken]);

  // Generate available time slots based on service duration
  const availableSlots = useMemo(() => {
    const slots: string[] = [];
    const startHour = 9;
    const endHour = 19;
    for (let h = startHour; h < endHour; h++) {
      slots.push(`${h.toString().padStart(2, '0')}:00`);
      slots.push(`${h.toString().padStart(2, '0')}:40`);
    }
    return slots;
  }, []);

  const openBookingForService = (service: LandingPageServiceItem) => {
    setSelectedService(service);
    setIsBookingOpen(true);
    setBookingSuccessData(null);
    setBookingError(null);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !bookingDate || !bookingTime) {
      setBookingError('Please complete all required fields.');
      return;
    }

    setBookingSubmitting(true);
    setBookingError(null);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId: assistantId || 'demo-assistant',
          name: clientName,
          email: clientEmail,
          phone: clientPhone,
          date: bookingDate,
          timeSlot: bookingTime,
          durationMinutes: selectedService?.durationMinutes || 40,
          serviceId: selectedService?.id,
          serviceName: selectedService?.name || 'Haircut & Styling',
          price: selectedService?.price || 45,
          notes: bookingNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to confirm appointment');
      }

      setBookingSuccessData(data.appointment);
    } catch (err: any) {
      setBookingError(err.message || 'Booking failed');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleClientReschedule = async () => {
    if (!manageToken || !rescheduleDate || !rescheduleTime) return;
    setIsRescheduling(true);
    setManageError(null);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'client_reschedule',
          manageToken,
          newDate: rescheduleDate,
          newTimeSlot: rescheduleTime,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reschedule');
      setManagedAppointment(data.appointment);
      setManageSuccessMsg('Your appointment has been successfully rescheduled.');
    } catch (err: any) {
      setManageError(err.message);
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleClientCancel = async () => {
    if (!manageToken) return;
    setIsCancelling(true);
    setManageError(null);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'client_cancel',
          manageToken,
          cancellationReason: cancelReason || 'Cancelled by client',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel appointment');
      setManagedAppointment((prev: any) => ({ ...prev, status: 'cancelled' }));
      setManageSuccessMsg('Your appointment has been cancelled.');
    } catch (err: any) {
      setManageError(err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId: assistantId || 'demo-assistant',
          message: userText,
          stream: false,
        }),
      });
      const data = await res.json();
      if (res.ok && data.message) {
        setChatMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: "I'm having trouble processing that right now. Please use the booking button to schedule your appointment.",
          },
        ]);
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Unable to reach the concierge. Please use our direct appointment booking form.',
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentUrl)}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 py-2 px-4 text-center text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5" />
        <span>{landingConfig.badgeText || 'Top Rated Men’s Grooming · Precision Fades & Traditional Hot Shaves'}</span>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-white">{landingConfig.businessName}</div>
              <div className="text-xs text-slate-400 font-medium">Master Barbershop</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#services" className="hover:text-amber-400 transition-colors">Services & Pricing</a>
            <a href="#gallery" className="hover:text-amber-400 transition-colors">Shop Gallery</a>
            <a href="#about" className="hover:text-amber-400 transition-colors">Craftsmanship</a>
            <a href="#testimonials" className="hover:text-amber-400 transition-colors">Reviews</a>
            <a href="#hours" className="hover:text-amber-400 transition-colors">Hours & Location</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
              title="Countertop QR Code"
            >
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>In-Store QR</span>
            </button>

            <button
              onClick={() => openBookingForService(landingConfig.services?.[0] || {
                id: 'srv_1',
                name: 'Master Haircut & Styling',
                description: 'Precision cut and wash',
                durationMinutes: 40,
                price: 45,
              })}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm rounded-lg shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32">
        <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Master Barbers · Walk-ins & Appointments</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                {landingConfig.heroHeadline}
              </h1>

              <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
                {landingConfig.heroSubheadline}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => openBookingForService(landingConfig.services?.[0] || {
                    id: 'srv_1',
                    name: 'Master Haircut & Styling',
                    description: 'Precision cut',
                    durationMinutes: 40,
                    price: 45,
                  })}
                  className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-base shadow-xl shadow-amber-500/25 transition-all flex items-center gap-2.5 active:scale-95"
                >
                  <Calendar className="w-5 h-5" />
                  <span>{landingConfig.heroCtaText || 'Book Your Chair Now'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsChatOpen(true)}
                  className="px-6 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold rounded-xl text-base transition-all flex items-center gap-2"
                >
                  <MessageSquare className="w-5 h-5 text-amber-400" />
                  <span>Ask AI Concierge</span>
                </button>
              </div>

              <div className="pt-6 grid grid-cols-3 gap-6 border-t border-slate-800 max-w-lg">
                <div>
                  <div className="text-2xl font-bold text-white">5.0</div>
                  <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>280+ Reviews</span>
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">60s</div>
                  <div className="text-xs text-slate-400 mt-0.5">Instant AI Booking</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-xs text-slate-400 mt-0.5">Satisfaction Guarantee</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 group">
                <img
                  src={landingConfig.heroImageUrl || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80'}
                  alt={landingConfig.businessName}
                  className="w-full h-[460px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                <div className="absolute bottom-6 left-6 right-6 p-5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-white">Appointments & Reminders</div>
                      <div className="text-xs text-slate-400 mt-0.5">Automated SMS & 24h/1h confirmations</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                      Live Open
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services & Pricing Section */}
      <section id="services" className="py-20 bg-slate-900/60 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">Expert Services</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Precision Haircuts & Grooming Menu</h2>
            <p className="text-slate-400 mt-3 text-sm sm:text-base">
              Every service includes a personalized consultation, hot steam towel treatment, and precision neck shave.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(landingConfig.services || []).map((service) => (
              <div
                key={service.id}
                className={`relative rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between ${
                  service.popular
                    ? 'bg-slate-900 border-2 border-amber-500/80 shadow-xl shadow-amber-500/10'
                    : 'bg-slate-900/80 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {service.popular && (
                  <div className="absolute -top-3 right-6 px-3 py-0.5 bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-full shadow-md">
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-bold text-white leading-snug">{service.name}</h3>
                    <div className="text-2xl font-black text-amber-400 shrink-0">${service.price}</div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-2 mb-3">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{service.durationMinutes} Minutes</span>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">{service.description}</p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800">
                  <button
                    onClick={() => openBookingForService(service)}
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                      service.popular
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book This Service (${service.price})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Gallery Section */}
      <section id="gallery" className="py-20 border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">Master Craftsmanship</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Inside The Barber Shop</h2>
            <p className="text-slate-400 mt-3 text-sm sm:text-base">
              A glimpse at our precision fade work, luxury hot lather shaves, and shop atmosphere.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(landingConfig.galleryImages || []).map((img) => (
              <div
                key={img.id}
                className="group relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 aspect-square shadow-lg"
              >
                <img
                  src={img.url}
                  alt={img.caption}
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
                <div className="absolute bottom-0 inset-x-0 p-4">
                  <p className="text-xs font-medium text-slate-200">{img.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-4">
              <Scissors className="w-3.5 h-3.5" />
              <span>Our Philosophy</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 leading-snug">
              {landingConfig.aboutTitle || 'Craftsmanship & Tradition Since 2018'}
            </h2>

            <p className="text-slate-300 text-base leading-relaxed mb-8">
              {landingConfig.aboutText}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-800">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Master Artisans</div>
                  <div className="text-xs text-slate-400 mt-0.5">Licensed specialists with 10+ yrs experience.</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Hot Towel Ritual</div>
                  <div className="text-xs text-slate-400 mt-0.5">Herbal steam towels with every cut & shave.</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Automated Reminders</div>
                  <div className="text-xs text-slate-400 mt-0.5">24-hour and 1-hour updates so you never miss out.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">Client Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">What Our Regulars Say</h2>
            <p className="text-slate-400 mt-3 text-sm sm:text-base">
              Real feedback from clients who trust Crown & Blade with their grooming week in, week out.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(landingConfig.testimonials || []).map((t) => (
              <div
                key={t.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 text-sm italic leading-relaxed">
                    &ldquo;{t.comment}&rdquo;
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800">
                  <div className="text-sm font-bold text-white">{t.clientName}</div>
                  <div className="text-xs text-slate-400">{t.clientRole || 'Verified Client'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hours & Location Section */}
      <section id="hours" className="py-20 bg-slate-900/60 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">Visit The Shop</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-6">Opening Hours & Location</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3.5">
                  <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-white">Address</div>
                    <div className="text-sm text-slate-300 mt-0.5">{landingConfig.address}</div>
                    {landingConfig.googleMapsUrl && (
                      <a
                        href={landingConfig.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-amber-400 hover:underline mt-1 font-medium"
                      >
                        <span>Open in Google Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Phone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-white">Phone</div>
                    <div className="text-sm text-slate-300 mt-0.5">{landingConfig.phone}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Mail className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-white">Email</div>
                    <div className="text-sm text-slate-300 mt-0.5">{landingConfig.email}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => openBookingForService(landingConfig.services?.[0] || {
                    id: 'srv_1',
                    name: 'Master Haircut & Styling',
                    description: 'Precision cut',
                    durationMinutes: 40,
                    price: 45,
                  })}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all"
                >
                  Schedule Your Visit
                </button>

                {manageToken && (
                  <button
                    onClick={() => {}}
                    className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl text-sm border border-slate-700"
                  >
                    Manage My Booking
                  </button>
                )}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span>Weekly Schedule</span>
              </h3>

              <div className="divide-y divide-slate-800">
                {(landingConfig.workingHours || []).map((wh, idx) => (
                  <div key={idx} className="py-3.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-300">{wh.days}</span>
                    <span className="font-semibold text-amber-400">{wh.hours}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Clients with appointments take priority. Walk-ins subject to chair availability.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div className="flex items-center justify-center gap-2 text-white font-bold text-sm">
            <Scissors className="w-4 h-4 text-amber-400" />
            <span>{landingConfig.businessName}</span>
          </div>
          <p>{landingConfig.address} &bull; {landingConfig.phone}</p>
          <p className="text-slate-600">
            Powered by Kortex AI Enterprise Platform &bull; Real-time Booking, 24h/1h Reminders & Hosted Landing Pages
          </p>
        </div>
      </footer>

      {/* Booking Appointment Modal */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
            <button
              onClick={() => setIsBookingOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {!bookingSuccessData ? (
              <form onSubmit={handleBookingSubmit} className="space-y-5">
                <div>
                  <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Book Your Chair</span>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    {selectedService ? selectedService.name : 'Schedule Appointment'}
                  </h3>
                  {selectedService && (
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5">
                      <span className="text-amber-400 font-bold">${selectedService.price}</span>
                      <span>&bull;</span>
                      <span>{selectedService.durationMinutes} Minutes</span>
                    </div>
                  )}
                </div>

                {bookingError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Preferred Date</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Time Slot</label>
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      {availableSlots.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marcus Vance"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 placeholder:text-slate-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Email (For 24h/1h Reminders)</label>
                    <input
                      type="email"
                      required
                      placeholder="client@gmail.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 placeholder:text-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 019-2831"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Notes or Special Preferences</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Skin taper fade, beard sculpting, or preferred barber"
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 placeholder:text-slate-600 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={bookingSubmitting}
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {bookingSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Confirming Appointment...</span>
                    </>
                  ) : (
                    <>
                      <CalendarCheck className="w-4 h-4" />
                      <span>Confirm Appointment (${selectedService?.price || 45})</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-4 space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white">Chair Confirmed!</h3>
                  <p className="text-sm text-slate-300 mt-1">
                    We look forward to seeing you, <strong>{bookingSuccessData.name}</strong>.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Service:</span>
                    <span className="font-semibold text-white">{bookingSuccessData.serviceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date & Time:</span>
                    <span className="font-semibold text-amber-400">
                      {bookingSuccessData.date} at {bookingSuccessData.timeSlot}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Shop:</span>
                    <span className="text-slate-300">{landingConfig.businessName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Reminders:</span>
                    <span className="text-emerald-400 font-medium">Active (24h & 1h prior)</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={() => setIsBookingOpen(false)}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl text-sm transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Managed Appointment Modal (Reschedule / Cancel) */}
      {manageToken && managedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setManageToken(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Client Self-Service</span>
            <h3 className="text-2xl font-bold text-white mt-1">Manage Your Booking</h3>

            {manageSuccessMsg && (
              <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{manageSuccessMsg}</span>
              </div>
            )}

            {manageError && (
              <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{manageError}</span>
              </div>
            )}

            <div className="mt-5 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Client:</span>
                <span className="text-white font-medium">{managedAppointment.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Service:</span>
                <span className="text-white font-medium">{managedAppointment.serviceName || 'Haircut'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Slot:</span>
                <span className="text-amber-400 font-semibold">{managedAppointment.date} at {managedAppointment.timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className={`capitalize font-semibold ${managedAppointment.status === 'cancelled' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {managedAppointment.status}
                </span>
              </div>
            </div>

            {managedAppointment.status !== 'cancelled' && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Pick New Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Pick New Time</label>
                  <select
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {availableSlots.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleClientReschedule}
                    disabled={isRescheduling}
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>{isRescheduling ? 'Rescheduling...' : 'Confirm New Time'}</span>
                  </button>

                  <button
                    onClick={handleClientCancel}
                    disabled={isCancelling}
                    className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-medium rounded-xl text-xs transition-colors flex items-center gap-1.5"
                  >
                    <CalendarX className="w-4 h-4" />
                    <span>{isCancelling ? 'Cancelling...' : 'Cancel Slot'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating AI Concierge Chatbot Button & Drawer */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isChatOpen ? (
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-2.5 px-5 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-full shadow-2xl shadow-amber-500/30 transition-all hover:scale-105 active:scale-95"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-sm">Chat with Barber AI</span>
          </button>
        ) : (
          <div className="w-[360px] sm:w-[400px] h-[520px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Scissors className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{landingConfig.businessName} AI</div>
                  <div className="text-xs text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Online & Ready to Book</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/40 text-xs">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-amber-500 text-slate-950 font-medium'
                        : 'bg-slate-800 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 border border-slate-700 rounded-2xl p-3 text-slate-400 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompts */}
            <div className="px-3 py-2 bg-slate-950 border-t border-slate-800/80 flex gap-2 overflow-x-auto text-[11px]">
              <button
                onClick={() => {
                  setChatInput('What are your prices for haircut & beard?');
                }}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg whitespace-nowrap border border-slate-800"
              >
                Prices?
              </button>
              <button
                onClick={() => {
                  setChatInput('Can I book an appointment for tomorrow?');
                }}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg whitespace-nowrap border border-slate-800"
              >
                Book Tomorrow?
              </button>
              <button
                onClick={() => {
                  setChatInput('Where is your shop located?');
                }}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg whitespace-nowrap border border-slate-800"
              >
                Location?
              </button>
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChatMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask anything about haircuts or booking..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={chatLoading}
                className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* In-Store Countertop QR Code Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white text-slate-950 rounded-3xl p-8 max-w-sm w-full text-center space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-100 text-amber-600">
              <QrCode className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-xl font-bold">{landingConfig.businessName}</h3>
              <p className="text-xs text-slate-500 mt-1">Scan to Book a Chair or View Services</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center">
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-56 h-56 rounded-lg shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <button
                onClick={() => window.print()}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors"
              >
                Print Countertop Sign
              </button>
              <p className="text-[11px] text-slate-400">
                Place this QR code on your reception desk or mirror stations.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
