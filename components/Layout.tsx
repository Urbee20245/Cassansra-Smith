
import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { ShieldCheck, Menu, X, Phone, Mail, MapPin, Facebook, Linkedin, Twitter, Scale, Sparkles } from 'lucide-react';

const Layout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Services & IUL', path: '/services' },
    { label: 'About Cassandra', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Top Bar - Contact Info */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2"><Phone size={14} className="text-secondary-400" /> 1 (706) 705-7603</span>
            <span className="flex items-center gap-2"><Mail size={14} className="text-secondary-400" /> csmithgapbridge@gmail.com</span>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <span className="flex items-center gap-1.5"><Scale size={12} className="text-secondary-400" /> Specialist in GA & SC</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <header className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <NavLink to="/" className="flex items-center gap-3">
                <div className="bg-secondary-500 p-2 rounded-lg">
                  <ShieldCheck className="h-7 w-7 text-slate-900" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tight text-slate-900 leading-none">Cassandra Smith</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Wealth & Protection</span>
                </div>
              </NavLink>
            </div>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-10 items-center">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => 
                    `text-sm font-bold transition-all duration-200 border-b-2 py-1 ${
                      isActive ? 'text-secondary-600 border-secondary-500' : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <NavLink 
                to="/contact" 
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Wealth Assessment
              </NavLink>
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-600 hover:text-slate-900 p-2 bg-slate-50 rounded-lg"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 absolute w-full z-50 shadow-2xl">
            <div className="px-4 pt-4 pb-6 space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => 
                    `block px-4 py-4 rounded-xl text-base font-bold ${
                      isActive ? 'bg-secondary-50 text-secondary-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <NavLink 
                to="/contact" 
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full bg-slate-900 text-white text-center py-4 rounded-xl font-bold mt-4"
              >
                Start Wealth Review
              </NavLink>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-16">
            
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="h-8 w-8 text-secondary-400" />
                <span className="text-2xl font-black tracking-tight">Cassandra Smith</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Expert Indexed Universal Life (IUL) strategist and insurance professional. Helping you grow tax-advantaged wealth and secure your family's future.
              </p>
              <div className="flex space-x-5">
                <a href="#" className="text-slate-400 hover:text-secondary-400 transition transform hover:scale-110"><Facebook size={22} /></a>
                <a href="#" className="text-slate-400 hover:text-secondary-400 transition transform hover:scale-110"><Linkedin size={22} /></a>
                <a href="#" className="text-slate-400 hover:text-secondary-400 transition transform hover:scale-110"><Twitter size={22} /></a>
              </div>
            </div>

            {/* Financial Services */}
            <div>
              <h3 className="text-lg font-bold mb-6 text-white uppercase tracking-wider text-sm">Wealth Strategies</h3>
              <ul className="space-y-4 text-slate-400 text-sm font-medium">
                <li><NavLink to="/services" className="hover:text-secondary-400 transition">Indexed Universal Life (IUL)</NavLink></li>
                <li><NavLink to="/services" className="hover:text-secondary-400 transition">Retirement Planning</NavLink></li>
                <li><NavLink to="/services" className="hover:text-secondary-400 transition">Living Benefits</NavLink></li>
                <li><NavLink to="/services" className="hover:text-secondary-400 transition">Mortgage Protection</NavLink></li>
                <li><NavLink to="/services" className="hover:text-secondary-400 transition">Final Expense</NavLink></li>
              </ul>
            </div>

            {/* Health Services */}
            <div>
              <h3 className="text-lg font-bold mb-6 text-white uppercase tracking-wider text-sm">Health Protection</h3>
              <ul className="space-y-4 text-slate-400 text-sm font-medium">
                <li><NavLink to="/services" className="hover:text-secondary-400 transition">Medicare Advantage</NavLink></li>
                <li><NavLink to="/services" className="hover:text-secondary-400 transition">Medicare Supplements</NavLink></li>
                <li><NavLink to="/services" className="hover:text-secondary-400 transition">ACA Health Insurance</NavLink></li>
                <li><NavLink to="/services" className="hover:text-secondary-400 transition">Dental & Vision Plans</NavLink></li>
                <li><NavLink to="/services" className="hover:text-secondary-400 transition">Hospital Indemnity</NavLink></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-bold mb-6 text-white uppercase tracking-wider text-sm">Direct Contact</h3>
              <ul className="space-y-5 text-slate-400 text-sm">
                <li className="flex items-start gap-4">
                  <MapPin className="h-6 w-6 text-secondary-400 shrink-0" />
                  <span>123 Insurance Way, Suite 100<br/>Atlanta, GA 30303</span>
                </li>
                <li className="flex items-center gap-4">
                  <Phone className="h-6 w-6 text-secondary-400 shrink-0" />
                  <span className="font-bold text-slate-200">1 (706) 705-7603</span>
                </li>
                <li className="flex items-center gap-4">
                  <Mail className="h-6 w-6 text-secondary-400 shrink-0" />
                  <span className="break-all">csmithgapbridge@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-10 text-center">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-xs text-slate-500 font-medium">
                <p>&copy; {new Date().getFullYear()} Cassandra Smith Wealth & Insurance. All rights reserved.</p>
                <p className="mt-1">Licensed in GA and SC. Not affiliated with any government agency.</p>
              </div>
              <div className="flex flex-col items-center md:items-end gap-1">
                <span className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Digital Excellence by</span>
                <a 
                  href="https://customwebsitesplus.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group relative flex items-center gap-2"
                >
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-400 via-secondary-200 to-secondary-500 font-black uppercase tracking-[0.25em] text-sm transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]">
                    Customwebsitesplus
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-secondary-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:rotate-12" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
