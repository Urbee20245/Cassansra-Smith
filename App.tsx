
import React, { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import { HeartPulse, FileHeart, Users, CheckCircle, ArrowRight, Calendar, Star, Shield, Phone, Mail, MapPin, ChevronDown, ChevronUp, Umbrella, Home as HomeIcon, TrendingUp, Landmark, Briefcase, Building2, PiggyBank, Scale, AlertCircle, Thermometer, Sparkles } from 'lucide-react';

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
    message: ''
  });

  const isHighIntent = useMemo(() => {
    return formData.timeline === 'ASAP / Within 48 Hours' && formData.priorityScore >= 7;
  }, [formData.timeline, formData.priorityScore]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const setTimeline = (val: string) => {
    setFormData(prev => ({ ...prev, timeline: val }));
    setStep('priority');
  };

  const setPriority = (val: number) => {
    setFormData(prev => ({ ...prev, priorityScore: val }));
    const urgent = formData.timeline === 'ASAP / Within 48 Hours' && val >= 7;
    if (urgent) {
      setStep('final_form');
    } else {
      setStep('future_calendar');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    const intentLevel = isHighIntent ? '🔥 HIGH INTENT (URGENT)' : '❄️ PLANNING / FUTURE';
    const subject = `${intentLevel}: ${formData.topic} Inquiry - ${formData.firstName} ${formData.lastName}`;
    const body = `Name: ${formData.firstName} ${formData.lastName}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nTopic: ${formData.topic}\nTimeline: ${formData.timeline}\nPriority Level: ${formData.priorityScore}/10\n${formData.futureDate ? `Requested Follow-up Date: ${formData.futureDate}` : ''}\n\nMessage:\n${formData.message}\n\n--\nLead Qualified via Heatmap Form`;

    const mailtoLink = `mailto:csmithgapbridge@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    setStatus('success');
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
        <button onClick={() => { setStep('inquiry'); setStatus('idle'); }} className="text-primary-600 font-bold hover:underline">Start New Request</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-end mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stepsInfo[step].title}</span>
          <span className="text-xs font-bold text-slate-900">{stepsInfo[step].progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-secondary-500 transition-all duration-500" style={{ width: `${stepsInfo[step].progress}%` }}></div>
        </div>
      </div>

      {step === 'inquiry' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 gap-3">
            {[
              { id: 'IUL & Life Insurance Planning', icon: <Landmark className="w-5 h-5" /> },
              { id: 'Retirement & Annuities', icon: <PiggyBank className="w-5 h-5" /> },
              { id: 'Medicare Solutions', icon: <HeartPulse className="w-5 h-5" /> },
              { id: 'ACA / Health Marketplace', icon: <FileHeart className="w-5 h-5" /> }
            ].map((opt) => (
              <button key={opt.id} onClick={() => { setFormData({ ...formData, topic: opt.id }); setStep('urgency'); }} className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-secondary-400 hover:bg-secondary-50 transition-all text-left">
                <div className="p-2 bg-slate-100 rounded-lg">{opt.icon}</div>
                <span className="font-bold text-slate-800">{opt.id}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'urgency' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 gap-3">
            {['ASAP / Within 48 Hours', 'Within the next week', 'In the next 30 days', 'Just browsing'].map((opt) => (
              <button key={opt} onClick={() => setTimeline(opt)} className="p-5 rounded-xl border-2 border-slate-100 hover:border-secondary-500 transition-all text-left font-bold text-slate-900">
                {opt}
              </button>
            ))}
          </div>
          <button onClick={() => setStep('inquiry')} className="text-slate-400 text-sm font-bold">← Back</button>
        </div>
      )}

      {step === 'priority' && (
        <div className="space-y-8 animate-fade-in text-center">
          <div className="flex justify-center mb-6"><Thermometer className="w-16 h-16 text-secondary-500" /></div>
          <p className="text-slate-600">On a scale of 1-10, how important is this to you?</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button key={num} onClick={() => setPriority(num)} className="w-10 h-10 rounded-full border border-slate-200 hover:bg-secondary-500 hover:text-white font-bold transition-all">
                {num}
              </button>
            ))}
          </div>
          <button onClick={() => setStep('urgency')} className="text-slate-400 text-sm font-bold">← Back</button>
        </div>
      )}

      {step === 'final_form' && (
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
          <div className="bg-red-50 p-4 rounded-xl flex gap-3 mb-6"><AlertCircle className="text-red-500" /> <span className="text-sm font-bold text-red-900">Urgent Follow-up Selected</span></div>
          <div className="grid grid-cols-2 gap-4">
            <input required placeholder="First Name" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-secondary-500" />
            <input required placeholder="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-secondary-500" />
          </div>
          <input required type="email" placeholder="Email Address" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200" />
          <input required type="tel" placeholder="Phone Number" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200" />
          <textarea required placeholder="Briefly describe your situation..." name="message" value={formData.message} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200"></textarea>
          <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl">Secure My Strategy Session</button>
        </form>
      )}

      {step === 'future_calendar' && (
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
          <div className="bg-blue-50 p-6 rounded-2xl text-center mb-6"><Calendar className="w-10 h-10 text-blue-500 mx-auto mb-3" /><h3 className="font-bold text-blue-900">Plan for the Future</h3></div>
          <input required type="date" name="futureDate" value={formData.futureDate} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200" />
          <div className="grid grid-cols-2 gap-4">
            <input required placeholder="First Name" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200" />
            <input required placeholder="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200" />
          </div>
          <input required type="email" placeholder="Email Address" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200" />
          <button type="submit" className="w-full bg-primary-600 text-white font-bold py-4 rounded-xl">Schedule Future Consultation</button>
        </form>
      )}
    </div>
  );
}

// --- Pages ---

const Home: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-0">
      <section className="relative bg-slate-900 py-24 lg:py-40 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=1920')] bg-cover"></div>
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="lg:w-3/5">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">Secure Your <span className="text-secondary-400">Legacy</span>. Grow Your <span className="text-primary-400">Wealth</span>.</h1>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl">Specializing in Indexed Universal Life (IUL) and comprehensive insurance strategies designed to protect your family and optimize your financial future.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => navigate('/services')} className="bg-secondary-500 hover:bg-secondary-600 text-slate-900 px-8 py-4 rounded-lg font-bold">Explore IUL Strategies</button>
              <button onClick={() => navigate('/contact')} className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-semibold border border-white/20">Book Consultation</button>
            </div>
          </div>
        </div>
      </section>
      {/* Short Summary Sections */}
      <section className="py-24 bg-white"><div className="max-w-7xl mx-auto px-4 text-center"><h2 className="text-3xl font-bold mb-6">Expert Guidance You Can Trust</h2><p className="text-lg text-slate-600 max-w-2xl mx-auto">Providing holistic wealth and health insurance solutions since 2014.</p></div></section>
    </div>
  );
};

const About: React.FC = () => (
  <div className="bg-white">
    <div className="bg-slate-900 py-24 text-white text-center"><h1 className="text-5xl font-extrabold mb-4">About Cassandra</h1><p className="text-xl text-slate-400">Over 10 years of expertise in financial strategy.</p></div>
    <div className="max-w-4xl mx-auto px-4 py-20 text-slate-600 prose prose-lg">
      <p>I don't just sell insurance; I architect financial security. With a decade in financial services, I help clients navigate complex options to find strategies that actually build wealth while providing protection.</p>
    </div>
  </div>
);

const Services: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-white">
      <div className="bg-slate-900 py-32 text-white text-center relative overflow-hidden">
        <h1 className="text-5xl font-extrabold mb-8 relative z-10">Wealth & Wellness Strategies</h1>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-24 space-y-24">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-slate-50 p-10 rounded-3xl">
            <h3 className="text-3xl font-bold mb-6">Indexed Universal Life (IUL)</h3>
            <p className="mb-6">Participate in market gains with a 0% floor against loss. Build tax-advantaged cash value for retirement or legacy planning.</p>
            <button onClick={() => navigate('/contact')} className="text-secondary-600 font-bold">Learn More →</button>
          </div>
          <div className="bg-slate-50 p-10 rounded-3xl">
            <h3 className="text-3xl font-bold mb-6">Medicare & ACA</h3>
            <p className="mb-6">Navigate the complexities of health insurance with an expert. We find the right coverage for your budget and medical needs.</p>
            <button onClick={() => navigate('/contact')} className="text-primary-600 font-bold">Learn More →</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Contact: React.FC = () => (
  <div className="bg-slate-50 min-h-screen py-20">
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-16"><h1 className="text-5xl font-extrabold text-slate-900 mb-4">Consultation Request</h1><p className="text-xl text-slate-600">Secure your session below.</p></div>
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-3xl shadow-xl border border-slate-100"><ContactForm /></div>
    </div>
  </div>
);

const NotFound: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center"><h1 className="text-7xl font-bold mb-4">404</h1><a href="/" className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold">Return Home</a></div>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
