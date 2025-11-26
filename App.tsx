import React, { useState } from 'react';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import { HeartPulse, FileHeart, Users, CheckCircle, ArrowRight, Calendar, Star, Shield, Phone, Mail, MapPin, ChevronDown, ChevronUp, Umbrella, Home as HomeIcon, TrendingUp, Coins, Landmark, Briefcase, Stethoscope, Eye, Building2 } from 'lucide-react';

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

const ContactForm = () => {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    topic: 'I need help with Medicare',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    // Construct email content
    const subject = `New Website Inquiry: ${formData.topic} - ${formData.firstName} ${formData.lastName}`;
    const body = `Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Phone: ${formData.phone}
Topic: ${formData.topic}

Message:
${formData.message}

--
Sent from Cassandra Smith Insurance Website`;

    // Create mailto link
    const mailtoLink = `mailto:csmithgapbridge@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open email client
    window.location.href = mailtoLink;

    // Show success message in UI
    setStatus('success');
  };

  if (status === 'success') {
    return (
      <div className="bg-green-50 text-green-800 p-8 rounded-xl text-center border border-green-200">
        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
        <h3 className="text-xl font-bold mb-2">Message Prepared!</h3>
        <p>Your email client should have opened with your message ready to send.</p>
        <p className="mt-2 text-sm">If it didn't open, please email me directly at <br/><strong>csmithgapbridge@gmail.com</strong></p>
        <button onClick={() => setStatus('idle')} className="mt-6 text-green-700 font-semibold hover:underline">Send another message</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
          <input 
            required 
            type="text" 
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-slate-600 bg-slate-800 text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
          <input 
            required 
            type="text" 
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-slate-600 bg-slate-800 text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition" 
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
        <input 
          required 
          type="email" 
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-slate-600 bg-slate-800 text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition" 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
        <input 
          type="tel" 
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-slate-600 bg-slate-800 text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition" 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">How can I help you?</label>
        <select 
          name="topic"
          value={formData.topic}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-slate-600 bg-slate-800 text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition mb-3"
        >
          <option className="bg-slate-800 text-white">I need help with Medicare</option>
          <option className="bg-slate-800 text-white">I need help with ACA / Marketplace</option>
          <option className="bg-slate-800 text-white">Life Insurance / Financial Planning</option>
          <option className="bg-slate-800 text-white">Other inquiry</option>
        </select>
        <textarea 
          required 
          rows={4} 
          name="message"
          value={formData.message}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-slate-600 bg-slate-800 text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition" 
          placeholder="Tell me a bit about your situation..."
        ></textarea>
      </div>
      <button disabled={status === 'submitting'} type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2">
        {status === 'submitting' ? 'Preparing...' : 'Send Message'}
        {!status && <ArrowRight size={18} />}
      </button>
    </form>
  );
}

// --- Pages ---

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 to-slate-900/60"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="lg:w-2/3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-900/50 border border-primary-500/30 text-primary-300 text-xs font-semibold uppercase tracking-wider mb-6">
              <Star className="w-3 h-3 text-secondary-400 fill-secondary-400" /> Top Rated Agent in Georgia
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">
              Healthcare Made <span className="text-primary-400">Simple</span> & <span className="text-secondary-400">Personal</span>.
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl leading-relaxed">
              Navigating Medicare and ACA health insurance doesn't have to be confusing. Let Cassandra Smith guide you to the perfect coverage for your life and budget.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => navigate('/contact')} className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-primary-600/30 flex items-center justify-center gap-2">
                Schedule a Consultation <ArrowRight size={20} />
              </button>
              <button onClick={() => navigate('/services')} className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm px-8 py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center border border-white/20">
                Explore Plans
              </button>
            </div>
            <p className="mt-6 text-sm text-slate-400 flex items-center gap-2">
              <CheckCircle size={16} className="text-green-400" /> No cost to you for my services.
            </p>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Comprehensive Coverage Options</h2>
            <p className="mt-4 text-lg text-slate-600">Specializing in the two most critical areas of personal healthcare.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-100 hover:shadow-md transition-all group">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                <HeartPulse className="text-blue-600 w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Medicare Solutions</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Approaching 65? Confused by Parts A, B, C, and D? I simplify the process, explaining Medicare Advantage vs. Supplements so you can retire with peace of mind.
              </p>
              <ul className="space-y-3 mb-8">
                {['Medicare Advantage (Part C)', 'Medicare Supplements (Medigap)', 'Prescription Drug Plans (Part D)'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-slate-700">
                    <CheckCircle className="w-5 h-5 text-primary-500" /> {item}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/services')} className="text-primary-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                Learn more about Medicare <ArrowRight size={18} />
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-100 hover:shadow-md transition-all group">
              <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-teal-100 transition-colors">
                <FileHeart className="text-teal-600 w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">ACA / Health Marketplace</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Need health insurance before 65? I help individuals and families navigate the Affordable Care Act (Obamacare) marketplace to find subsidized plans that fit your budget.
              </p>
              <ul className="space-y-3 mb-8">
                {['Individual & Family Plans', 'Subsidy Eligibility Checks', 'Dental & Vision Add-ons'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-slate-700">
                    <CheckCircle className="w-5 h-5 text-teal-500" /> {item}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/services')} className="text-teal-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                Learn more about ACA <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Teaser */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-secondary-100 rounded-full z-0"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary-100 rounded-full z-0"></div>
              {/* Image with updated S3 URL */}
              <img 
                src="https://getlyfe.s3.us-east-2.amazonaws.com/wp-content/uploads/2025/11/25164233/Cassandra.jpg" 
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800";
                  e.currentTarget.onerror = null; // Prevent infinite loop
                }}
                alt="Cassandra Smith" 
                className="relative z-10 rounded-2xl shadow-xl w-full object-cover h-[500px]"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Meet Cassandra Smith</h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                With over <span className="font-semibold text-primary-600">10 years of experience in the financial services industry</span>, I've made it my mission to demystify healthcare coverage and financial planning. I believe everyone deserves to understand their benefits without the jargon.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                As an independent broker, my loyalty lies with <span className="font-semibold text-slate-900">you</span>, not the insurance carriers. I shop the market to find the plan that offers the best value for your specific needs.
              </p>
              <button onClick={() => navigate('/about')} className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-lg font-semibold transition-all">
                Read My Story
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to secure your health coverage?</h2>
          <p className="text-xl text-primary-100 mb-8">
            Let's have a conversation. No pressure, just honest answers and expert guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <button onClick={() => navigate('/contact')} className="bg-white text-primary-600 hover:bg-slate-100 px-8 py-4 rounded-lg font-bold text-lg shadow-lg transition-all">
                Get a Free Quote
              </button>
              <button onClick={() => navigate('/contact')} className="bg-primary-700 border border-primary-500 hover:bg-primary-800 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all">
                Call 1 (706) 705-7603
              </button>
          </div>
        </div>
      </section>
    </div>
  );
};

const About: React.FC = () => {
  return (
    <div className="bg-white">
      <div className="bg-slate-50 py-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-slate-900">About Cassandra</h1>
          <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto">Your trusted partner in healthcare navigation.</p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          {/* Added Image to About Page */}
          <div className="w-full md:w-1/3 flex-shrink-0">
             <img 
              src="https://getlyfe.s3.us-east-2.amazonaws.com/wp-content/uploads/2025/11/25164233/Cassandra.jpg" 
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800";
                e.currentTarget.onerror = null;
              }}
              alt="Cassandra Smith" 
              className="w-full rounded-2xl shadow-lg object-cover aspect-[3/4]"
            />
          </div>
          <div className="prose prose-lg text-slate-600 w-full md:w-2/3">
            <p className="lead text-xl text-slate-800 font-medium">
              Hello! I'm Cassandra Smith. I founded my agency with a simple premise: <strong>Insurance shouldn't be a headache.</strong>
            </p>
            <p>
              I began my career with over <strong>10 years of experience in the financial services industry</strong>. While I learned the ins and outs of policies, I quickly realized that the "one-size-fits-all" approach often left clients with gaps in coverage or paying for benefits they didn't need.
            </p>
            <h3>Why I Became an Independent Broker</h3>
            <p>
              Becoming independent meant I could represent <em>multiple</em> top-rated insurance companies. This gives me the freedom to compare plans side-by-side and offer unbiased recommendations based strictly on what's best for my clients.
            </p>
            <h3>My Promise to You</h3>
            <ul className="list-none pl-0 space-y-4">
              <li className="flex gap-3 items-start">
                <CheckCircle className="w-6 h-6 text-primary-500 shrink-0 mt-1" />
                <span><strong>Transparency:</strong> I explain the good, the bad, and the fine print.</span>
              </li>
              <li className="flex gap-3 items-start">
                <CheckCircle className="w-6 h-6 text-primary-500 shrink-0 mt-1" />
                <span><strong>Availability:</strong> I'm here year-round, not just during enrollment season.</span>
              </li>
              <li className="flex gap-3 items-start">
                <CheckCircle className="w-6 h-6 text-primary-500 shrink-0 mt-1" />
                <span><strong>Advocacy:</strong> If you have a billing issue or claim dispute, I'm in your corner.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const Services: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-white">
      {/* Hero Header */}
      <div className="relative bg-slate-900 py-24 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 to-slate-900 z-0"></div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"></div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <span className="inline-block py-1 px-3 rounded-full bg-primary-800 text-primary-200 text-sm font-semibold tracking-wider mb-4 border border-primary-700">EXPERTISE YOU CAN TRUST</span>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">Insurance Solutions <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">Tailored to You</span></h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Whether you are turning 65 or need coverage for your family, I simplify the options to find the perfect plan.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20 space-y-32">
        
        {/* Medicare Section */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 relative">
             <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/10 border border-slate-100 group">
                <img 
                  src="https://images.unsplash.com/photo-1516733968668-dbdce39c4651?auto=format&fit=crop&q=80&w=800" 
                  alt="Happy seniors enjoying life" 
                  className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-8 text-white max-w-xs">
                  <div className="h-1 w-12 bg-secondary-500 mb-4"></div>
                  <p className="font-bold text-2xl">Retire with Confidence</p>
                  <p className="text-slate-200 text-sm mt-2">Expert guidance for your golden years.</p>
                </div>
             </div>
             {/* Decorative blob */}
             <div className="absolute -z-10 -bottom-10 -left-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
          </div>
          <div className="order-1 md:order-2">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-blue-50 text-blue-600 p-3 rounded-xl"><HeartPulse className="w-6 h-6" /></span>
              <span className="text-sm font-bold tracking-wider text-blue-600 uppercase">Ages 65+ & Eligible</span>
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">Medicare Made Easy</h2>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed">
              Medicare is a federal program, but you have choices in how you receive your benefits. I help you understand the "Alphabet Soup" of Medicare parts so you can make an informed decision.
            </p>
            
            <div className="space-y-4">
              <AccordionItem title="Medicare Advantage (Part C)">
                <p>These "all-in-one" bundled plans include Part A (Hospital), Part B (Medical), and usually Part D (Drugs). Most plans also offer extra benefits like <strong>dental, vision, hearing, and gym memberships</strong>—often for a $0 monthly premium.</p>
              </AccordionItem>
              <AccordionItem title="Medicare Supplements (Medigap)">
                <p>These plans work alongside Original Medicare to pay your share of costs (like the 20% coinsurance). They offer the flexibility to see <strong>any doctor nationwide</strong> who accepts Medicare, with no referrals needed.</p>
              </AccordionItem>
              <AccordionItem title="Part D Prescription Drug Plans">
                <p>Standalone plans that help cover the cost of brand-name and generic medications. I review your specific medication list to find the plan with the lowest total annual cost for you.</p>
              </AccordionItem>
            </div>

            <div className="mt-10 p-6 bg-slate-50 rounded-xl border border-slate-100 flex gap-4 items-start">
              <Shield className="text-blue-600 w-6 h-6 shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-slate-900 text-lg">Annual Policy Review</h4>
                <p className="text-slate-600 mt-2 leading-relaxed">Plans change every year. I review your coverage annually during the Annual Enrollment Period (Oct 15 - Dec 7) to ensure it still fits your needs.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ACA Section */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-teal-50 text-teal-600 p-3 rounded-xl"><FileHeart className="w-6 h-6" /></span>
              <span className="text-sm font-bold tracking-wider text-teal-600 uppercase">Under 65 & Families</span>
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">ACA / Marketplace Health Plans</h2>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed">
              The Affordable Care Act (Obamacare) ensures quality health insurance is accessible. Whether you are self-employed, between jobs, or an early retiree, there is a plan for you.
            </p>
            
            <div className="space-y-4">
               <AccordionItem title="Do I qualify for financial help?">
                <p>Most individuals qualify for <strong>Premium Tax Credits (Subsidies)</strong> that lower your monthly bill. Eligibility is based on household income and size. I can calculate your subsidy instantly.</p>
              </AccordionItem>
              <AccordionItem title="What is covered?">
                <p>All ACA plans are "Qualified Health Plans" covering 10 essential benefits: Emergency services, hospitalization, maternity, mental health, prescription drugs, preventive care, and more. <strong>Pre-existing conditions are always covered.</strong></p>
              </AccordionItem>
              <AccordionItem title="When can I enroll?">
                <p className="mb-2"><strong className="text-slate-900">Open Enrollment:</strong> Nov 1 – Jan 15 every year.</p>
                <p><strong className="text-slate-900">Special Enrollment Period (SEP):</strong> Available year-round if you have a life event like marriage, birth of a child, moving, or losing other coverage.</p>
              </AccordionItem>
            </div>

             <div className="mt-10">
               <button onClick={() => navigate('/contact')} className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-xl font-semibold transition shadow-lg shadow-teal-200 hover:shadow-teal-300 transform hover:-translate-y-0.5 flex items-center gap-2">
                 Get an ACA Quote <ArrowRight size={18} />
               </button>
             </div>
          </div>
          <div className="relative">
             <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-teal-900/10 border border-slate-100 group">
                <img 
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800" 
                  alt="Family smiling together" 
                  className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                 <div className="absolute bottom-8 left-8 text-white max-w-xs">
                  <div className="h-1 w-12 bg-secondary-500 mb-4"></div>
                  <p className="font-bold text-2xl">Protect Your Family</p>
                  <p className="text-slate-200 text-sm mt-2">Comprehensive coverage for peace of mind.</p>
                </div>
             </div>
             {/* Decorative blob */}
             <div className="absolute -z-10 -top-10 -right-10 w-40 h-40 bg-teal-100 rounded-full blur-3xl opacity-50"></div>
          </div>
        </div>

        {/* Life Insurance & Financial Planning Section */}
        <div>
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="text-primary-600 font-semibold tracking-wider text-sm uppercase mb-2 block">Beyond Health Insurance</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Life Insurance & Financial Planning</h2>
            <p className="text-lg text-slate-600">Secure your legacy and protect your financial future with comprehensive solutions designed to grow and preserve your wealth.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Life Insurance */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col group relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
               <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-100 transition-colors">
                  <Umbrella className="w-7 h-7 text-indigo-600" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-3">Life Insurance</h3>
               <p className="text-slate-600 text-sm leading-relaxed flex-grow">Term and permanent life insurance options to provide financial security for your loved ones in the event of the unexpected.</p>
            </div>

            {/* Final Expense */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col group relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
               <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-100 transition-colors">
                  <Briefcase className="w-7 h-7 text-emerald-600" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-3">Final Expense</h3>
               <p className="text-slate-600 text-sm leading-relaxed flex-grow">Affordable whole life policies designed specifically to cover funeral costs and other end-of-life expenses, easing the burden on your family.</p>
            </div>

            {/* Mortgage Protection */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col group relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-rose-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
               <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-rose-100 transition-colors">
                  <HomeIcon className="w-7 h-7 text-rose-600" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-3">Mortgage Protection</h3>
               <p className="text-slate-600 text-sm leading-relaxed flex-grow">Ensure your family can keep their home if you pass away or become disabled. This coverage pays off or reduces the mortgage balance.</p>
            </div>

             {/* Retirement Solutions */}
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col group relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
               <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-100 transition-colors">
                  <Coins className="w-7 h-7 text-amber-600" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-3">Retirement Solutions</h3>
               <p className="text-slate-600 text-sm leading-relaxed flex-grow">Strategic planning to help you accumulate wealth and ensure you have a steady stream of income throughout your retirement years.</p>
            </div>

            {/* Annuities */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col group relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
               <div className="w-14 h-14 bg-cyan-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-cyan-100 transition-colors">
                  <Landmark className="w-7 h-7 text-cyan-600" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-3">Annuities</h3>
               <p className="text-slate-600 text-sm leading-relaxed flex-grow">Safe growth vehicles that provide guaranteed income for life, protecting your principal from market downturns.</p>
            </div>

            {/* IULs */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col group relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-violet-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
               <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-violet-100 transition-colors">
                  <TrendingUp className="w-7 h-7 text-violet-600" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-3">Indexed Universal Life (IUL)</h3>
               <p className="text-slate-600 text-sm leading-relaxed flex-grow">A flexible life insurance policy that offers death benefit protection with the potential for cash value accumulation linked to a market index.</p>
            </div>
          </div>
        </div>

        {/* Additional Services */}
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-8 md:p-16 border border-slate-200">
           <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-slate-900">Complete Your Coverage</h2>
              <p className="mt-4 text-slate-600 text-lg">Health insurance is the foundation, but don't forget the other important aspects of your wellbeing.</p>
           </div>
           
           <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col items-center">
                 <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                    <Stethoscope className="w-8 h-8" />
                 </div>
                 <h3 className="font-bold text-xl text-slate-900 mb-3">Dental Insurance</h3>
                 <p className="text-slate-600 leading-relaxed">Coverage for cleanings, fillings, crowns, and major work.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col items-center">
                 <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-6">
                    <Eye className="w-8 h-8" />
                 </div>
                 <h3 className="font-bold text-xl text-slate-900 mb-3">Vision Plans</h3>
                 <p className="text-slate-600 leading-relaxed">Allowances for eye exams, glasses, and contact lenses.</p>
              </div>
               <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col items-center">
                 <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-6">
                    <Building2 className="w-8 h-8" />
                 </div>
                 <h3 className="font-bold text-xl text-slate-900 mb-3">Hospital Indemnity</h3>
                 <p className="text-slate-600 leading-relaxed">Cash benefits to help cover copays if you are hospitalized.</p>
              </div>
           </div>
        </div>

      </div>
      
      {/* Process CTA */}
      <div className="bg-secondary-50 border-t border-secondary-100 py-24">
         <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Unsure what you need?</h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">That's what I'm here for. Let's schedule a 15-minute discovery call to review your options together.</p>
            <button onClick={() => navigate('/contact')} className="bg-slate-900 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
               Schedule Free Consultation
            </button>
         </div>
      </div>
    </div>
  );
};

const Contact: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900">Get in Touch</h1>
          <p className="mt-4 text-xl text-slate-600">Have questions? Ready to enroll? I'm here to help.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start gap-4">
              <div className="bg-primary-50 p-3 rounded-full text-primary-600">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Call Me</h3>
                <p className="text-slate-600 text-sm mb-2">Mon-Fri from 9am to 6pm.</p>
                <a href="tel:17067057603" className="text-primary-600 font-semibold hover:underline">1 (706) 705-7603</a>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start gap-4">
              <div className="bg-primary-50 p-3 rounded-full text-primary-600">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Email Me</h3>
                <p className="text-slate-600 text-sm mb-2">I typically respond within 24 hours.</p>
                <a href="mailto:csmithgapbridge@gmail.com" className="text-primary-600 font-semibold hover:underline">csmithgapbridge@gmail.com</a>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start gap-4">
              <div className="bg-primary-50 p-3 rounded-full text-primary-600">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Office</h3>
                <p className="text-slate-600 text-sm">
                  123 Insurance Way, Suite 100<br />
                  Atlanta, GA 30303
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Send a Message</h2>
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
    <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
    <p className="text-xl text-slate-600 mb-8">Page not found.</p>
    <a href="/" className="text-primary-600 hover:underline">Go back home</a>
  </div>
);

const App: React.FC = () => {
  return (
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
};

export default App;