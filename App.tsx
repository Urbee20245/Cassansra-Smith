import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { HeartPulse, FileHeart, Users, CheckCircle, ArrowRight, Calendar, Star, Shield, Phone, Mail, MapPin, ChevronDown, ChevronUp, Umbrella, Home as HomeIcon, TrendingUp, Coins, Landmark, Briefcase, Stethoscope, Eye, Building2, PiggyBank, Scale, Timer, AlertCircle, Thermometer, X, ExternalLink, Clock, Send, UserPlus } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import { Event, AdminLink, AdminSettings, EventRegistration } from './types';

// Always call Hostinger directly so PHP works from any origin (AI Studio, etc.)
const API_BASE = 'https://gapbridgecs.com';

// Define the external URL for Cassandra's photo
const CASSANDRA_PHOTO_URL = "https://medicarefor65.s3.amazonaws.com/2026/01/25145552/cshsphoto.png";


// --- Components ---

const AccordionItem = ({ title, children }: { title: string, children?: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-4 bg-transparent text-left group focus:outline-none"
      >
        <span className={`font-semibold text-lg transition-colors ${isOpen ? 'text-primary-600' : 'text-slate-900 group-hover:text-primary-600'}`}>{title}</span>
        {isOpen ? <ChevronUp size={20} className="text-primary-600" /> : <ChevronDown size={20} className="text-slate-400 group-hover:text-primary-600" />}
      </button>
      {isOpen && (
        <div className="pb-6 text-slate-600 leading-relaxed text-base animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};

// --- Countdown Timer ---

const CountdownTimer: React.FC<{ eventDate: string }> = ({ eventDate }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, past: false });

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(eventDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, past: true }); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        past: false,
      });
    };
    calculate();
    const id = setInterval(calculate, 1000);
    return () => clearInterval(id);
  }, [eventDate]);

  if (timeLeft.past) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-slate-400 bg-slate-100 rounded-lg px-3 py-1.5 font-medium">
        <Clock size={14} /> Event concluded
      </span>
    );
  }

  const units = [
    { label: 'Days', val: timeLeft.days },
    { label: 'Hrs',  val: timeLeft.hours },
    { label: 'Min',  val: timeLeft.minutes },
    { label: 'Sec',  val: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center gap-1.5">
      {units.map((u, i) => (
        <React.Fragment key={u.label}>
          <div className="flex flex-col items-center bg-slate-900 text-white rounded-lg px-2.5 py-2 min-w-[50px]">
            <span className="text-xl font-black tabular-nums leading-none">{String(u.val).padStart(2, '0')}</span>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 mt-1">{u.label}</span>
          </div>
          {i < 3 && <span className="text-slate-500 font-bold text-lg">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

// --- Event Registration Modal ---

const EventRegistrationModal: React.FC<{
  event: Event;
  onClose: () => void;
  onSubmitted: (reg: EventRegistration) => void;
}> = ({ event, onClose, onSubmitted }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = (): boolean => {
    const errs: string[] = [];
    if (!firstName.trim()) errs.push('First name is required.');
    if (!lastName.trim()) errs.push('Last name is required.');
    if (!email.trim() && !phone.trim()) errs.push('Email or phone number is required.');
    if (!consent) errs.push('Please accept the consent checkbox to continue.');
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const reg: EventRegistration = {
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      eventId: event.id,
      eventTitle: event.title,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      message: message.trim(),
      registeredAt: new Date().toISOString(),
    };

    // Non-blocking: send to backend for email notification
    try {
      await fetch(`${API_BASE}/api/submit-lead.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: reg.firstName, lastName: reg.lastName,
          email: reg.email, phone: reg.phone,
          topic: 'Event Registration',
          message: `Registering for event: ${event.title}${message ? `\n\nNote: ${message}` : ''}`,
          source: 'event-registration',
          pageUrl: window.location.href,
        }),
      });
    } catch { /* still record locally */ }

    setLoading(false);
    setSuccess(true);
    onSubmitted(reg);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in my-auto">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 rounded-t-2xl flex items-start justify-between">
          <div>
            <p className="text-secondary-400 text-xs font-bold uppercase tracking-wider mb-1">Register for Event</p>
            <h2 className="text-white font-bold text-lg leading-tight">{event.title}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition ml-4 shrink-0 mt-1"><X size={20} /></button>
        </div>

        {success ? (
          <div className="px-8 py-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">You're Registered!</h3>
            <p className="text-slate-500 text-sm mb-6">
              Thank you, <strong>{firstName}</strong>! Your registration for <strong>{event.title}</strong> has been received. We'll be in touch soon.
            </p>
            <button onClick={onClose} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">First Name *</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition" placeholder="Jane" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Last Name *</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition" placeholder="Smith" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition" placeholder="jane@example.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition" placeholder="(555) 000-0000" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Message (optional)</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2}
                placeholder="Any questions or special requirements?"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition resize-none" />
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary-600" />
              <span className="text-xs text-slate-500 leading-relaxed">
                I consent to being contacted via email and/or phone regarding this event and related services. My information will not be shared with third parties.
              </span>
            </label>
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 space-y-1">
                {errors.map((err) => (
                  <p key={err} className="text-red-700 text-xs flex items-center gap-1.5">
                    <AlertCircle size={12} className="shrink-0" /> {err}
                  </p>
                ))}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full bg-secondary-500 hover:bg-secondary-600 disabled:bg-slate-300 text-slate-900 py-3.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-sm">
              {loading
                ? <><span className="w-4 h-4 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin"></span> Submitting…</>
                : <><Send size={15} /> Submit Registration</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// --- Event Card ---

const EventCard: React.FC<{ event: Event; onRegister: () => void }> = ({ event, onRegister }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
    {event.imageUrl ? (
      <div className="h-52 overflow-hidden shrink-0">
        <img src={event.imageUrl} alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { (e.target as HTMLImageElement).parentElement!.className = 'h-52 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shrink-0'; }} />
      </div>
    ) : (
      <div className="h-52 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shrink-0">
        <Calendar size={44} className="text-secondary-400" />
      </div>
    )}
    <div className="p-6 flex flex-col flex-1">
      <p className="text-secondary-600 font-bold text-xs uppercase tracking-wider mb-2">{event.heading}</p>
      <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight">{event.title}</h3>
      <p className="text-slate-600 text-sm mb-4 leading-relaxed line-clamp-3 flex-1">{event.description}</p>
      {event.location && (
        <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-4">
          <MapPin size={13} /> {event.location}
        </div>
      )}
      <div className="mb-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Starts in</p>
        <CountdownTimer eventDate={event.eventDate} />
      </div>
      <button onClick={onRegister}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 mt-auto">
        <UserPlus size={16} /> Register for This Event
      </button>
    </div>
  </div>
);

// --- Events Section (fetches from MySQL API, shown on Home) ---

const EventsSection: React.FC = () => {
  const [eventsEnabled, setEventsEnabled] = useState(false);
  const [events, setEvents]               = useState<Event[]>([]);
  const [registerEvent, setRegisterEvent] = useState<Event | null>(null);
  const [ready, setReady]                 = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/settings.php`)
      .then((r) => r.json())
      .then((s: AdminSettings) => {
        if (s.eventsEnabled) {
          setEventsEnabled(true);
          return fetch(`${API_BASE}/api/events.php`).then((r) => r.json()).then(setEvents);
        }
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  if (!ready || !eventsEnabled || events.length === 0) return null;

  const handleRegistered = async (reg: EventRegistration) => {
    try {
      await fetch(`${API_BASE}/api/registrations.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reg),
      });
    } catch { /* non-blocking */ }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-secondary-600 font-bold tracking-widest text-sm uppercase mb-4 block">Stay Connected</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Upcoming Events</h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Join our workshops and seminars designed to help you take control of your financial future. Space is limited — register today.
          </p>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {events.map((ev) => (
            <EventCard key={ev.id} event={ev} onRegister={() => setRegisterEvent(ev)} />
          ))}
        </div>
      </div>
      {registerEvent && (
        <EventRegistrationModal
          event={registerEvent}
          onClose={() => setRegisterEvent(null)}
          onSubmitted={handleRegistered}
        />
      )}
    </section>
  );
};

// --- Links Section (fetches from MySQL API, shown on Home above footer) ---

const LinksSection: React.FC = () => {
  const [linksEnabled, setLinksEnabled] = useState(false);
  const [links, setLinks]               = useState<AdminLink[]>([]);
  const [ready, setReady]               = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/settings.php`)
      .then((r) => r.json())
      .then((s: AdminSettings) => {
        if (s.linksEnabled) {
          setLinksEnabled(true);
          return fetch(`${API_BASE}/api/links.php`).then((r) => r.json()).then(setLinks);
        }
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  if (!ready || !linksEnabled || links.length === 0) return null;

  return (
    <section className="py-20 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-secondary-600 font-bold tracking-widest text-sm uppercase mb-4 block">Resources</span>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Helpful Links & Resources</h2>
          <p className="mt-3 text-slate-500 max-w-xl mx-auto text-base">
            Trusted resources curated to help you make informed decisions about your health and financial future.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {links.map((link) => (
            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
              className="group flex items-start gap-3 bg-slate-50 hover:bg-primary-50 border border-slate-200 hover:border-primary-300 rounded-2xl p-5 transition-all hover:shadow-md">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:shadow-md transition border border-slate-100">
                <ExternalLink size={16} className="text-primary-600" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 text-sm group-hover:text-primary-700 transition truncate flex items-center gap-1">
                  {link.label}
                  <ExternalLink size={10} className="text-slate-400 shrink-0 opacity-0 group-hover:opacity-100 transition" />
                </p>
                {link.description && (
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed line-clamp-2">{link.description}</p>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Heatmap Qualifying Contact Form ---

type FormStep = 'inquiry' | 'urgency' | 'priority' | 'final_form' | 'future_calendar';

const ContactForm = () => {
  const [step, setStep] = useState<FormStep>('inquiry');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    topic: 'IUL & Life Insurance Planning',
    timeline: '', // ASAP, Next week, Next month, Just browsing
    priorityScore: 0, // 1-10
    futureDate: '',
    message: '',
    permissionGranted: false, // Added permission state
  });

  const isHighIntent = useMemo(() => {
    return formData.timeline === 'ASAP / Within 48 Hours' && formData.priorityScore >= 7;
  }, [formData.timeline, formData.priorityScore]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      setFormData(prev => ({ ...prev, [name]: e.target.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const setTimeline = (val: string) => {
    setFormData(prev => ({ ...prev, timeline: val }));
    setStep('priority');
  };

  const setPriority = (val: number) => {
    setFormData(prev => ({ ...prev, priorityScore: val }));
    // Determine the next step based on the heatmap logic
    const urgent = formData.timeline === 'ASAP / Within 48 Hours' && val >= 7;
    if (urgent) {
      setStep('final_form');
    } else {
      setStep('future_calendar');
    }
  };

  // INSERT: Server endpoint path (no secrets in client)
  const EMAIL_ENDPOINT = `${API_BASE}/api/submit-lead.php`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.permissionGranted) {
        alert("Please check the permission box to proceed.");
        return;
    }

    setStatus('submitting');

    try {
      // Support both submit flows
      const hasName = !!(formData.firstName && formData.lastName);
      const hasContact = !!(formData.email || formData.phone);

      if (hasName && hasContact) {
        const source = step === 'final_form' ? 'secure-strategy-session' : 'future-consultation';

        const payload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email || '',
          phone: formData.phone || '',
          topic: formData.topic || '',
          timeline: formData.timeline || '',
          priorityScore: formData.priorityScore ?? null,
          futureDate: formData.futureDate || '',
          message: formData.message || '',
          page_url: window.location.href,
          source,
        };

        try {
          const res = await fetch(EMAIL_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (res.status === 201) {
            setStatus('success');
          } else {
            const errorText = await res.text().catch(() => 'Unknown error');
            console.error("Submit endpoint non-201:", res.status, errorText);
            alert(`Unable to submit your request. Status: ${res.status}. Please try calling us directly at 1 (706) 705-7603.`);
            setStatus('idle');
          }
        } catch (err) {
          console.error("Submit endpoint error:", err);
          alert("Network error: Unable to submit your request. Please check your connection or call us directly at 1 (706) 705-7603.");
          setStatus('idle');
        }
      } else {
        console.log("Validation failed: name and either email or phone required.");
        alert("Please provide your name and either an email or phone number.");
        setStatus('idle');
      }
    } catch (err) {
      console.error("Submit hook exception:", err);
      alert("An unexpected error occurred. Please try again or call us directly at 1 (706) 705-7603.");
      setStatus('idle');
    }
  };

  const stepsInfo = {
    inquiry: { title: "What can I help you with?", progress: 25 },
    urgency: { title: "When do you need coverage?", progress: 50 },
    priority: { title: "How important is this?", progress: 75 },
    final_form: { title: "Urgent Strategy Session", progress: 100 },
    future_calendar: { title: "Plan for the Future", progress: 100 }
  };

  if (status === 'success') {
    return (
      <div className="bg-white p-8 rounded-2xl text-center animate-fade-in border border-slate-100 shadow-xl">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Request Ready!</h3>
        <p className="text-slate-600 mb-6">Your message has been prepared for Cassandra. Your email app should open automatically.</p>
        <p className="text-sm text-slate-500 mb-8 italic">"I'll be reviewing your goals and reaching out soon." — Cassandra"</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stepsInfo[step].title}</span>
          <span className="text-xs font-bold text-slate-900">{stepsInfo[step].progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-secondary-500 transition-all duration-500 ease-out" 
            style={{ width: `${stepsInfo[step].progress}%` }}
          ></div>
        </div>
      </div>

      {step === 'inquiry' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 gap-3">
            {[
              { id: 'IUL & Life Insurance Planning', icon: <Landmark className="w-5 h-5" /> },
              { id: 'Retirement & Annuities', icon: <PiggyBank className="w-5 h-5" /> },
              { id: 'Medicare Solutions', icon: <HeartPulse className="w-5 h-5" /> },
              { id: 'ACA / Health Marketplace', icon: <FileHeart className="w-5 h-5" /> },
              { id: 'General Question', icon: <Users className="w-5 h-5" /> }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => { setFormData({ ...formData, topic: opt.id }); setStep('urgency'); }}
                className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-secondary-400 hover:bg-secondary-50 transition-all text-left group"
              >
                <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-secondary-100 group-hover:text-secondary-600 transition-colors">
                  {opt.icon}
                </div>
                <span className="font-bold text-slate-800">{opt.id}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'urgency' && (
        <div className="space-y-6 animate-fade-in">
          <p className="text-slate-600 mb-6">To better assist you, how soon do you need to finalize your coverage?</p>
          <div className="grid grid-cols-1 gap-3">
            {[
              { val: 'ASAP / Within 48 Hours', desc: 'Urgent need, ready to start now', color: 'border-red-200 hover:bg-red-50' },
              { val: 'Within the next week', desc: 'Active searching, making decisions soon', color: 'border-orange-200 hover:bg-orange-50' },
              { val: 'In the next 30 days', desc: 'Planning ahead, reviewing options', color: 'border-blue-200 hover:bg-blue-50' },
              { val: 'Just browsing / Education', desc: 'No immediate rush, just curious', color: 'border-slate-200 hover:bg-slate-50' }
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => setTimeline(opt.val)}
                className={`p-5 rounded-xl border-2 ${opt.color} transition-all text-left flex justify-between items-center group`}
              >
                <div>
                  <div className="font-bold text-slate-900">{opt.val}</div>
                  <div className="text-sm text-slate-500">{opt.desc}</div>
                </div>
                <ArrowRight size={20} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
          <button onClick={() => setStep('inquiry')} className="text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors">← Back</button>
        </div>
      )}

      {step === 'priority' && (
        <div className="space-y-8 animate-fade-in text-center">
          <div className="flex justify-center mb-6">
            <Thermometer className={`w-16 h-16 ${formData.timeline.includes('ASAP') ? 'text-red-500' : 'text-blue-500'}`} />
          </div>
          <p className="text-slate-600 text-lg">On a scale of 1-10, how important is securing this coverage to you right now?</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                key={num}
                onClick={() => setPriority(num)}
                className={`w-12 h-12 rounded-full font-bold transition-all border-2 ${num >= 7 ? 'hover:bg-red-500 hover:border-red-500' : 'hover:bg-secondary-500 hover:border-secondary-500'} hover:text-white flex items-center justify-center border-slate-200 text-slate-700`}
              >
                {num}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest px-4">
            <span>Browsing</span>
            <span>Priority</span>
          </div>
          <button onClick={() => setStep('urgency')} className="text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors block mx-auto">← Back</button>
        </div>
      )}

      {step === 'final_form' && (
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
          <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex gap-3 mb-6">
            <AlertCircle className="text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-900">High Urgency Request</p>
              <p className="text-xs text-red-700">Cassandra prioritizes urgent consultations. Complete the info below for immediate follow-up.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input required placeholder="First Name" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-secondary-500 transition" />
            <input required placeholder="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-secondary-500 transition" />
          </div>
          <input required type="email" placeholder="Email Address" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-secondary-500 transition" />
          <input required type="tel" placeholder="Phone Number" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-secondary-500 transition" />
          <textarea required rows={4} placeholder="Briefly describe your situation..." name="message" value={formData.message} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-secondary-500 transition"></textarea>
          
          {/* Disclaimer Checkbox for Urgent Form */}
          <div className="flex items-start gap-3 pt-2">
            <input 
              required 
              type="checkbox" 
              id="permissionGrantedFinal" 
              name="permissionGranted" 
              checked={formData.permissionGranted} 
              onChange={handleChange} 
              className="mt-1.5 w-4 h-4 text-secondary-600 bg-gray-100 border-gray-300 rounded focus:ring-secondary-500"
            />
            <label htmlFor="permissionGrantedFinal" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
              I give permission for Cassandra Smith to contact me via phone, SMS, or email regarding my interest in financial services and insurance products. I understand I can unsubscribe from SMS at any time by replying STOP.
            </label>
          </div>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-xl hover:bg-slate-800 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'submitting' ? (
              <>
                <Timer className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Secure My Strategy Session <ArrowRight size={18} />
              </>
            )}
          </button>
          <button type="button" onClick={() => setStep('priority')} className="text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors block mx-auto pt-2">← Back</button>
        </form>
      )}

      {step === 'future_calendar' && (
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-center mb-6">
            <Calendar className="w-10 h-10 text-blue-500 mx-auto mb-3" />
            <h3 className="font-bold text-blue-900">Future Planning</h3>
            <p className="text-sm text-blue-700">Since you're not in a rush, please select a date for Cassandra to reach out and follow up on your {formData.topic} interest.</p>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Requested Follow-up Date</label>
            <input 
              required 
              type="date" 
              name="futureDate" 
              value={formData.futureDate} 
              onChange={handleChange} 
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary-500 transition bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input required placeholder="First Name" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary-500 transition" />
            <input required placeholder="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary-500 transition" />
          </div>
          <input required type="email" placeholder="Email Address" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary-500 transition" />
          <textarea placeholder="Anything specific you'd like to discuss then?" name="message" value={formData.message} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary-500 transition"></textarea>

          {/* Disclaimer Checkbox for Future Planning Form */}
          <div className="flex items-start gap-3 pt-2">
            <input 
              required 
              type="checkbox" 
              id="permissionGrantedFuture" 
              name="permissionGranted" 
              checked={formData.permissionGranted} 
              onChange={handleChange} 
              className="mt-1.5 w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="permissionGrantedFuture" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
              I give permission for Cassandra Smith to contact me via phone, SMS, or email regarding my interest in financial services and insurance products. I understand I can unsubscribe from SMS at any time by replying STOP.
            </label>
          </div>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full bg-primary-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-primary-700 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'submitting' ? (
              <>
                <Timer className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Schedule Future Consultation <ArrowRight size={18} />
              </>
            )}
          </button>
          <button type="button" onClick={() => setStep('priority')} className="text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors block mx-auto pt-2">← Back</button>
        </form>
      )}
    </div>
  );
}

// --- Pages ---

const Home: React.FC = () => {
// ... (rest of Home component remains unchanged)
  const navigate = useNavigate();

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-40">
          <div className="lg:w-3/5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-900/50 border border-secondary-500/30 text-secondary-300 text-xs font-semibold uppercase tracking-wider mb-6">
              <Star className="w-3 h-3 text-secondary-400 fill-secondary-400" /> Wealth Preservation Specialist
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 leading-[1.1]">
              Secure Your <span className="text-secondary-400">Legacy</span>. Grow Your <span className="text-primary-400">Wealth</span>.
            </h1>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed">
              Specializing in Indexed Universal Life (IUL) and comprehensive insurance strategies designed to protect your family and optimize your financial future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => navigate('/services')} className="bg-secondary-500 hover:bg-secondary-600 text-slate-900 px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2">
                Explore IUL Strategies <ArrowRight size={20} />
              </button>
              <button onClick={() => navigate('/contact')} className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm px-8 py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center border border-white/20">
                Book Consultation
              </button>
            </div>
            <div className="mt-8 flex items-center gap-6 text-slate-400 text-sm">
              <span className="flex items-center gap-2"><CheckCircle size={16} className="text-secondary-500" /> Tax-Advantaged Growth</span>
              <span className="flex items-center gap-2"><CheckCircle size={16} className="text-secondary-500" /> Living Benefits</span>
              <span className="flex items-center gap-2"><CheckCircle size={16} className="text-secondary-500" /> Wealth Protection</span>
            </div>
          </div>
        </div>
      </section>

      {/* Primary Focus: IUL & Life Insurance */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50 -z-10 translate-x-1/2 rounded-full blur-3xl opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <span className="text-secondary-600 font-bold tracking-widest text-sm uppercase mb-4 block">Core Expertise</span>
              <h2 className="text-4xl font-extrabold text-slate-900 mb-6">The Power of Indexed Universal Life (IUL)</h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Most people view life insurance only as a death benefit. I help you see it as a powerful financial tool. An IUL provides permanent protection while allowing you to build cash value linked to a market index—offering growth potential with a 0% floor against market loss.
              </p>
              <div className="grid sm:grid-cols-2 gap-6 mb-10">
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center text-secondary-600">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Upside Potential</h4>
                    <p className="text-sm text-slate-600">Benefit from market gains without direct exposure.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center text-secondary-600">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Downside Protection</h4>
                    <p className="text-sm text-slate-600">Your principal is protected by a 0% floor.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center text-secondary-600">
                    <PiggyBank size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Tax-Free Income</h4>
                    <p className="text-sm text-slate-600">Access your cash value tax-free during retirement.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center text-secondary-600">
                    <Users size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Generational Wealth</h4>
                    <p className="text-sm text-slate-600">Leave a substantial, tax-free legacy for heirs.</p>
                  </div>
                </div>
              </div>
              <button onClick={() => navigate('/services')} className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2">
                Learn How IUL Works <ArrowRight size={18} />
              </button>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=800" 
                  alt="Financial growth and planning" 
                  className="w-full h-[500px] object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl z-20 border border-slate-100">
                <div className="text-3xl font-bold text-secondary-600">10+ Years</div>
                <div className="text-slate-500 text-sm font-medium uppercase tracking-wider">Financial Expertise</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Focus: Healthcare */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Comprehensive Health Coverage</h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">Protecting your wealth also means protecting your health. I provide expert guidance for seniors and families.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-100 hover:shadow-md transition-all group">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                <HeartPulse className="text-blue-600 w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Medicare Excellence</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Retire with confidence. I simplify Medicare Parts A, B, C, and D, helping you find the right Advantage or Supplement plan to fit your lifestyle and budget.
              </p>
              <button onClick={() => navigate('/services')} className="text-primary-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                Medicare Options <ArrowRight size={18} />
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-100 hover:shadow-md transition-all group">
              <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-teal-100 transition-colors">
                <FileHeart className="text-teal-600 w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">ACA / Marketplace Plans</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Reliable healthcare for individuals and families. I'll help you navigate subsidies and plan options to ensure you get the best coverage at the lowest cost.
              </p>
              <button onClick={() => navigate('/services')} className="text-teal-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                ACA Solutions <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Teaser */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2 relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-secondary-100 rounded-full z-0"></div>
              <img 
                src={CASSANDRA_PHOTO_URL} 
                alt="Cassandra Smith" 
                className="relative z-10 rounded-2xl shadow-xl w-full object-cover h-[550px]"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Meet Cassandra Smith</h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                With over <span className="font-semibold text-secondary-600">10 years in the financial services industry</span>, I specialize in bridging the gap between insurance protection and wealth accumulation.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                My mission is to help clients understand that insurance is more than just a policy—it's a foundation for financial freedom. I specialize in <span className="font-semibold text-slate-900">Indexed Universal Life (IUL)</span> strategies that work as hard as you do.
              </p>
              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-secondary-100 text-secondary-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <p className="text-slate-700 font-medium">Unbiased Independent Advice</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-secondary-100 text-secondary-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <p className="text-slate-700 font-medium">Holistic Wealth & Health Planning</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-secondary-100 text-secondary-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <p className="text-slate-700 font-medium">Dedicated Lifetime Support</p>
                </div>
              </div>
              <button onClick={() => navigate('/about')} className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-4 rounded-xl font-bold transition-all shadow-lg">
                Read My Story
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Upcoming Events (admin-toggled) */}
      <EventsSection />

      {/* CTA */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to Build Your Financial Fortress?</h2>
          <p className="text-xl text-slate-400 mb-12">
            Whether you're looking for tax-advantaged growth or the best Medicare supplement, I'm here to guide you every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
             <button onClick={() => navigate('/contact')} className="bg-secondary-500 text-slate-900 hover:bg-secondary-600 px-10 py-4 rounded-xl font-bold text-lg shadow-xl transition-all transform hover:-translate-y-1">
                Start My Free Assessment
              </button>
              <button onClick={() => navigate('/contact')} className="bg-transparent border-2 border-slate-700 hover:border-slate-500 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all">
                Call 1 (706) 705-7603
              </button>
          </div>
        </div>
      </section>

      {/* Resource Links (admin-toggled, above footer) */}
      <LinksSection />
    </div>
  );
};

const About: React.FC = () => {
// ... (rest of About component remains unchanged)
  return (
    <div className="bg-white">
      <div className="bg-slate-900 py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-extrabold mb-4">About Cassandra</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">Expertise in Insurance, Excellence in Financial Strategy.</p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row gap-16 items-start">
          <div className="w-full md:w-2/5 flex-shrink-0">
             <img 
              src={CASSANDRA_PHOTO_URL} 
              alt="Cassandra Smith" 
              className="w-full rounded-3xl shadow-2xl object-cover aspect-[3/4]"
            />
          </div>
          <div className="prose prose-lg text-slate-600 w-full md:w-3/5">
            <h2 className="text-3xl font-bold text-slate-900">Your Trusted Independent Broker</h2>
            <p className="lead text-xl text-slate-800 font-medium">
              I don't just sell insurance; I architect financial security.
            </p>
            <p>
              With over <strong>10 years of experience in the financial services industry</strong>, I've seen firsthand how the right insurance product can change a family's trajectory. I started my agency because I wanted to offer more than just "off-the-shelf" plans. I wanted to offer strategies.
            </p>
            <h3>The Independent Advantage</h3>
            <p>
              Because I am independent, I work for <strong>you</strong>, not the insurance companies. I have the freedom to shop the entire market to find the IUL, Life, or Health plan that offers the absolute best value and performance for your specific goals.
            </p>
            <h3>My Philosophy</h3>
            <div className="bg-slate-50 p-8 rounded-2xl border-l-4 border-secondary-500 mb-8">
              <p className="italic text-slate-800 mb-0">"True wealth isn't just about what you earn—it's about what you keep and how you protect it for those you love. My job is to ensure your foundation is unbreakable."</p>
            </div>
            <ul className="list-none pl-0 space-y-4">
              <li className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-secondary-100 text-secondary-600 rounded-full shrink-0 flex items-center justify-center font-bold">1</div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Education First</h4>
                  <p>I empower you with knowledge so you can make confident decisions.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-secondary-100 text-secondary-600 rounded-full shrink-0 flex items-center justify-center font-bold">2</div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Custom Strategies</h4>
                  <p>Every IUL or Medicare plan is tailored to your unique financial footprint.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-secondary-100 text-secondary-600 rounded-full shrink-0 flex items-center justify-center font-bold">3</div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Long-term Advocacy</h4>
                  <p>I'm your partner through every life transition, from career changes to retirement.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const Services: React.FC = () => {
// ... (rest of Services component remains unchanged)
  const navigate = useNavigate();
  return (
    <div className="bg-white">
      {/* Services Hero */}
      <div className="relative bg-slate-900 py-32 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-primary-900 z-0 opacity-80"></div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"></div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <span className="inline-block py-1 px-3 rounded-full bg-secondary-900 text-secondary-400 text-sm font-semibold tracking-wider mb-6 border border-secondary-700">PREMIUM FINANCIAL PROTECTION</span>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight leading-tight">Strategies for <span className="text-secondary-400">Wealth</span> & <span className="text-primary-400">Wellness</span></h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            From tax-advantaged wealth building through IULs to comprehensive healthcare coverage, we secure every aspect of your life.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-24 space-y-40">
        
        {/* Section 1: Life & IUL (Primary) */}
        <div id="life-iul" className="grid md:grid-cols-2 gap-16 items-start">
          <div className="sticky top-28">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-secondary-100 text-secondary-600 p-3 rounded-xl"><Scale className="w-6 h-6" /></span>
              <span className="text-sm font-bold tracking-wider text-secondary-600 uppercase">Primary Focus</span>
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-6 leading-tight">Legacy & Wealth Strategies</h2>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed">
              We specialize in advanced life insurance solutions that go beyond simple protection. Our strategies are designed to provide liquidity, growth, and security.
            </p>
            
            <div className="space-y-6">
              <AccordionItem title="Indexed Universal Life (IUL)">
                <p className="mb-4">The ultimate financial multi-tool. An IUL provides a tax-free death benefit for your heirs while building a cash value account that grows based on a stock market index.</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Market Growth:</strong> Participate in market gains without the risk of loss.</li>
                  <li><strong>The 0% Floor:</strong> Your account will never lose value due to market performance.</li>
                  <li><strong>Tax-Free Policy Loans:</strong> Access your money tax-free at any age for any reason.</li>
                </ul>
              </AccordionItem>
              <AccordionItem title="Term & Whole Life Options">
                <p>Traditional coverage designed for specific needs. Term life offers affordable, temporary protection, while Whole Life provides permanent coverage with a guaranteed cash value component.</p>
              </AccordionItem>
              <AccordionItem title="Annuities & Retirement Income">
                <p>Convert your savings into a guaranteed paycheck for life. We offer Fixed and Indexed Annuities that protect your principal from market volatility while ensuring you never outlive your money.</p>
              </AccordionItem>
            </div>

            <div className="mt-12">
               <button onClick={() => navigate('/contact')} className="bg-secondary-500 hover:bg-secondary-600 text-slate-900 px-10 py-5 rounded-2xl font-bold text-lg shadow-xl hover:shadow-secondary-200 transition-all transform hover:-translate-y-1">
                 Request Wealth Strategy Call
               </button>
            </div>
          </div>
          <div className="grid gap-6">
             <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
               <Umbrella className="w-10 h-10 text-secondary-600 mb-6" />
               <h3 className="text-2xl font-bold mb-4">Living Benefits</h3>
               <p className="text-slate-600">Access your death benefit while you're still alive if you're diagnosed with a chronic, critical, or terminal illness. Don't just plan for the end—plan for the journey.</p>
             </div>
             <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
               <TrendingUp className="w-10 h-10 text-secondary-600 mb-6" />
               <h3 className="text-2xl font-bold mb-4">Tax-Advantage Growth</h3>
               <p className="text-slate-600">IUL cash value grows tax-deferred and can be accessed tax-free. It's one of the few remaining tax-favored wealth accumulation vehicles in the US tax code.</p>
             </div>
             <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
               <Shield className="w-10 h-10 text-secondary-600 mb-6" />
               <h3 className="text-2xl font-bold mb-4">Mortgage Protection</h3>
               <p className="text-slate-600">Ensure your home stays in the family. Our policies can be structured to pay off your mortgage balance automatically in the event of death or disability.</p>
             </div>
          </div>
        </div>

        {/* Section 2: Healthcare (Secondary) */}
        <div id="health" className="pt-24 border-t border-slate-100">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="text-primary-600 font-bold tracking-widest text-sm uppercase mb-4 block">Health Solutions</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-6">Expert Healthcare Navigation</h2>
            <p className="text-lg text-slate-600">Comprehensive support for Medicare and ACA plans, ensuring your physical wellbeing is as secure as your financial future.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
             <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                <HeartPulse className="w-12 h-12 text-blue-600 mb-6" />
                <h3 className="text-3xl font-bold mb-6">Medicare Solutions</h3>
                <p className="text-slate-600 text-lg mb-8">Turning 65 or looking for a better plan? We specialize in explaining the difference between Medicare Advantage and Supplements.</p>
                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-3"><CheckCircle className="text-blue-500 w-5 h-5" /> Medicare Advantage (Part C)</div>
                  <div className="flex items-center gap-3"><CheckCircle className="text-blue-500 w-5 h-5" /> Medicare Supplements (Medigap)</div>
                  <div className="flex items-center gap-3"><CheckCircle className="text-blue-500 w-5 h-5" /> Prescription Drug Plans (Part D)</div>
                </div>
                <button onClick={() => navigate('/contact')} className="w-full py-4 border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors">Medicare Consultation</button>
             </div>

             <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                <FileHeart className="w-12 h-12 text-teal-600 mb-6" />
                <h3 className="text-3xl font-bold mb-6">ACA / Health Marketplace</h3>
                <p className="text-slate-600 text-lg mb-8">Quality health insurance for families and individuals. We help you find subsidized plans that maximize your benefits while minimizing costs.</p>
                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-3"><CheckCircle className="text-teal-500 w-5 h-5" /> Individual & Family Health Plans</div>
                  <div className="flex items-center gap-3"><CheckCircle className="text-teal-500 w-5 h-5" /> Subsidy Eligibility Verification</div>
                  <div className="flex items-center gap-3"><CheckCircle className="text-teal-500 w-5 h-5" /> Dental, Vision & Hearing Add-ons</div>
                </div>
                <button onClick={() => navigate('/contact')} className="w-full py-4 border-2 border-teal-600 text-teal-600 font-bold rounded-xl hover:bg-teal-50 transition-colors">ACA Quote Request</button>
             </div>
          </div>
        </div>

        {/* Section 3: Final Expense & Ancillary */}
        <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-500 rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
           <div className="relative z-10">
             <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-4xl font-bold mb-6">Additional Protection Programs</h2>
                <p className="text-slate-400 text-lg">A complete financial plan accounts for all possibilities. Explore our specialized protection options.</p>
             </div>
             
             <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                   <Landmark className="w-10 h-10 text-secondary-400 mb-6" />
                   <h4 className="text-xl font-bold mb-3">Final Expense</h4>
                   <p className="text-slate-400 text-sm">Small whole-life policies designed to cover funeral and burial costs, protecting your family from unexpected debt.</p>
                </div>
                <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                   <Building2 className="w-10 h-10 text-secondary-400 mb-6" />
                   <h4 className="text-xl font-bold mb-3">Hospital Indemnity</h4>
                   <p className="text-slate-400 text-sm">Cash payments made directly to you if you are hospitalized, helping cover out-of-pocket medical expenses.</p>
                </div>
                <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                   <Briefcase className="w-10 h-10 text-secondary-400 mb-6" />
                   <h4 className="text-xl font-bold mb-3">Disability Income</h4>
                   <p className="text-slate-400 text-sm">Protect your most valuable asset—your ability to earn an income. We provide solutions for when you can't work due to illness or injury.</p>
                </div>
             </div>
           </div>
        </div>
      </div>
      
      <div className="bg-secondary-50 py-24">
         <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Take Control of Your Financial Future Today</h2>
            <p className="text-xl text-slate-600 mb-10">Don't leave your legacy to chance. Let's design a strategy that protects your family and grows your wealth.</p>
            <button onClick={() => navigate('/contact')} className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
               Schedule My Financial Review
            </button>
         </div>
      </div>
    </div>
  );
};

const Contact: React.FC = () => {
// ... (rest of Contact component remains unchanged)
  return (
    <div className="bg-slate-50 min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">Consultation Request</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">Complete my qualifying assessment below to ensure we prioritize your specific timeline and needs.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex items-start gap-6">
              <div className="bg-secondary-50 p-4 rounded-xl text-secondary-600">
                <Phone size={28} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg mb-1">Call Me</h3>
                <p className="text-slate-500 text-sm mb-3">Direct line for consultations.</p>
                <a href="tel:17067057603" className="text-secondary-600 font-bold text-xl hover:underline">1 (706) 705-7603</a>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex items-start gap-6">
              <div className="bg-primary-50 p-4 rounded-xl text-primary-600">
                <Mail size={28} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg mb-1">Email Me</h3>
                <p className="text-slate-500 text-sm mb-3">Get answers to your questions.</p>
                <a href="mailto:csmithgapbridge@gmail.com" className="text-primary-600 font-bold text-lg break-all hover:underline">csmithgapbridge@gmail.com</a>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex items-start gap-6">
              <div className="bg-slate-50 p-4 rounded-xl text-slate-600">
                <MapPin size={28} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg mb-1">Office Location</h3>
                <p className="text-slate-500">
                  123 Insurance Way, Suite 100<br />
                  Atlanta, GA 30303
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-slate-100 min-h-[500px] flex flex-col justify-center">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotFound: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
    <h1 className="text-7xl font-bold text-slate-900 mb-4">404</h1>
    <p className="text-xl text-slate-600 mb-8">Page not found.</p>
    <a href="/" className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold">Return Home</a>
  </div>
);

// Protected route wrapper — redirects to login if not authenticated
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" replace />;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public site routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin routes (no Layout wrapper) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
          <Route path="/admin/*" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;