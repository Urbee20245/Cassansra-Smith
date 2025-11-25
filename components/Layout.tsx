import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { ShieldCheck, Menu, X, Phone, Mail, MapPin, Facebook, Linkedin, Twitter } from 'lucide-react';
import ChatWidget from './ChatWidget';

const Layout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'About Cassandra', path: '/about' },
    { label: 'Services', path: '/services' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Top Bar - Contact Info */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Phone size={12} /> (555) 123-4567</span>
            <span className="flex items-center gap-1"><Mail size={12} /> cassandra@smithinsurance.com</span>
          </div>
          <div className="hidden sm:flex gap-4">
            <span>Licensed in GA, FL, TX, NC</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <NavLink to="/" className="flex items-center gap-2 text-primary-600">
                <ShieldCheck className="h-8 w-8" />
                <div className="flex flex-col">
                  <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">Cassandra Smith</span>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">Insurance Services</span>
                </div>
              </NavLink>
            </div>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-8 items-center">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => 
                    `text-sm font-medium transition-colors duration-200 ${
                      isActive ? 'text-primary-600' : 'text-slate-600 hover:text-primary-600'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <NavLink 
                to="/contact" 
                className="bg-secondary-500 hover:bg-secondary-600 text-white px-5 py-2.5 rounded-md text-sm font-semibold shadow-md transition-all hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Get a Quote
              </NavLink>
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-600 hover:text-slate-900 p-2"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 absolute w-full z-50">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => 
                    `block px-3 py-4 rounded-md text-base font-medium ${
                      isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="h-6 w-6 text-primary-400" />
                <span className="text-xl font-bold">Cassandra Smith</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Dedicated to simplifying healthcare coverage. I help seniors and families find the right plan for their needs and budget.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-white transition"><Facebook size={20} /></a>
                <a href="#" className="text-slate-400 hover:text-white transition"><Linkedin size={20} /></a>
                <a href="#" className="text-slate-400 hover:text-white transition"><Twitter size={20} /></a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li><NavLink to="/" className="hover:text-primary-400 transition">Home</NavLink></li>
                <li><NavLink to="/about" className="hover:text-primary-400 transition">About Cassandra</NavLink></li>
                <li><NavLink to="/services" className="hover:text-primary-400 transition">Medicare Plans</NavLink></li>
                <li><NavLink to="/services" className="hover:text-primary-400 transition">ACA Health Insurance</NavLink></li>
                <li><NavLink to="/contact" className="hover:text-primary-400 transition">Contact Us</NavLink></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Contact Info</h3>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary-400 shrink-0" />
                  <span>123 Insurance Way, Suite 100<br/>Atlanta, GA 30303</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary-400 shrink-0" />
                  <span>(555) 123-4567</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary-400 shrink-0" />
                  <span>cassandra@smithinsurance.com</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} Cassandra Smith Insurance Services. All rights reserved.</p>
            <p className="mt-2">Not connected with or endorsed by the U.S. government or the federal Medicare program.</p>
          </div>
        </div>
      </footer>

      <ChatWidget />
    </div>
  );
};

export default Layout;