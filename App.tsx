import React, { useState } from 'react';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import { HeartPulse, FileHeart, Users, CheckCircle, ArrowRight, Calendar, Star, Shield, Phone, Mail, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

// --- Components ---

const AccordionItem = ({ title, children }: { title: string, children?: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 bg-white hover:bg-slate-50 transition-colors text-left"
      >
        <span className="font-semibold text-slate-900">{title}</span>
        {isOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
      </button>
      {isOpen && (
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-slate-600 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
};

const ContactForm = () => {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    // Simulate network request
    setTimeout(() => setStatus('success'), 1500);
  };

  if (status === 'success') {
    return (
      <div className="bg-green-50 text-green-800 p-8 rounded-xl text-center border border-green-200">
        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
        <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
        <p>Thank you for reaching out. Cassandra will get back to you within 24 hours.</p>
        <button onClick={() => setStatus('idle')} className="mt-6 text-green-700 font-semibold hover:underline">Send another message</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
          <input required type="text" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
          <input required type="text" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
        <input required type="email" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
        <input type="tel" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">How can I help you?</label>
        <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition mb-3">
          <option>I need help with Medicare</option>
          <option>I need help with ACA / Marketplace</option>
          <option>I want to review my current plan</option>
          <option>Other inquiry</option>
        </select>
        <textarea required rows={4} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition" placeholder="Tell me a bit about your situation..."></textarea>
      </div>
      <button disabled={status === 'submitting'} type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2">
        {status === 'submitting' ? 'Sending...' : 'Send Message'}
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
              <img 
                src="./cassandra.jpg" 
                alt="Cassandra Smith" 
                className="relative z-10 rounded-2xl shadow-xl w-full object-cover h-[500px]"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Meet Cassandra Smith</h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                With over 15 years of experience in the insurance industry, I've made it my mission to demystify healthcare coverage. I believe everyone deserves to understand their benefits without the jargon.
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
                Call (555) 123-4567
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
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="prose prose-lg text-slate-600 mx-auto">
          <p>
            Hello! I'm Cassandra Smith. I founded my agency with a simple premise: <strong>Insurance shouldn't be a headache.</strong>
          </p>
          <p>
            I began my career working for a large national carrier. While I learned the ins and outs of policies, I quickly realized that the "one-size-fits-all" approach often left clients with gaps in coverage or paying for benefits they didn't need.
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
  );
};

const Services: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-white">
      <div className="bg-primary-900 py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold">Insurance Services</h1>
          <p className="mt-4 text-xl text-primary-200 max-w-2xl mx-auto">Tailored solutions for every stage of life.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 space-y-24">
        {/* Medicare Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-bold mb-4">Ages 65+</div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Medicare</h2>
            <p className="text-lg text-slate-600 mb-6">
              Medicare is the federal health insurance program for people who are 65 or older. It can be complex, but breaking it down into parts helps.
            </p>
            <div className="space-y-4">
              <AccordionItem title="Part A & B (Original Medicare)">
                Part A covers hospital stays, care in a skilled nursing facility, hospice care, and some home health care. Part B covers certain doctors' services, outpatient care, medical supplies, and preventive services.
              </AccordionItem>
              <AccordionItem title="Part C (Medicare Advantage)">
                An all-in-one alternative to Original Medicare. These "bundled" plans include Part A, Part B, and usually Part D. They often offer extra benefits like vision, hearing, and dental.
              </AccordionItem>
              <AccordionItem title="Part D (Prescription Drugs)">
                Helps cover the cost of prescription drugs (including many recommended shots or vaccines). Plans are offered by private insurance companies approved by Medicare.
              </AccordionItem>
              <AccordionItem title="Medicare Supplement (Medigap)">
                Extra insurance you can buy from a private company that helps pay your share of costs in Original Medicare, like copayments, coinsurance, and deductibles.
              </AccordionItem>
            </div>
            <button onClick={() => navigate('/contact')} className="mt-8 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition">
              Get a Medicare Quote
            </button>
          </div>
          <div className="relative h-full min-h-[400px]">
             <img src="https://images.unsplash.com/photo-1516733968668-dbdce39c4651?auto=format&fit=crop&q=80&w=800" alt="Happy seniors" className="rounded-2xl shadow-lg w-full h-full object-cover" />
          </div>
        </div>

        {/* ACA Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 relative h-full min-h-[400px]">
             <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800" alt="Family smiling" className="rounded-2xl shadow-lg w-full h-full object-cover" />
          </div>
          <div className="order-1 md:order-2">
            <div className="inline-block bg-teal-100 text-teal-700 px-4 py-1 rounded-full text-sm font-bold mb-4">Under 65</div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">ACA / Marketplace Plans</h2>
            <p className="text-lg text-slate-600 mb-6">
              The Affordable Care Act (ACA) ensures that comprehensive health insurance is available to everyone, regardless of medical history. 
            </p>
            <div className="space-y-4">
              <AccordionItem title="Essential Health Benefits">
                All Marketplace plans must cover 10 essential health benefits, including emergency services, hospitalization, maternity care, and mental health services.
              </AccordionItem>
              <AccordionItem title="Subsidies & Tax Credits">
                Depending on your income, you may qualify for premium tax credits that lower your monthly insurance bill and cost-sharing reductions that lower your out-of-pocket costs.
              </AccordionItem>
              <AccordionItem title="Open Enrollment">
                The yearly period (typically Nov 1 – Jan 15) when people can enroll in a health insurance plan. Special Enrollment Periods exist for life events like getting married or having a baby.
              </AccordionItem>
            </div>
            <button onClick={() => navigate('/contact')} className="mt-8 bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition">
              Check ACA Eligibility
            </button>
          </div>
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
                <a href="tel:5551234567" className="text-primary-600 font-semibold hover:underline">(555) 123-4567</a>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start gap-4">
              <div className="bg-primary-50 p-3 rounded-full text-primary-600">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Email Me</h3>
                <p className="text-slate-600 text-sm mb-2">I typically respond within 24 hours.</p>
                <a href="mailto:cassandra@smithinsurance.com" className="text-primary-600 font-semibold hover:underline">cassandra@smithinsurance.com</a>
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
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;