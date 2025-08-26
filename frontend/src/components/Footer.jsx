import React from 'react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { 
  LinkedinIcon, 
  Mail, 
  Phone, 
  MapPin,
  ArrowUp,
  Heart,
  Building2,
  GraduationCap
} from 'lucide-react';
import mockData from '../mock';

const Footer = () => {
  const { personal, contact } = mockData;
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { label: 'About Me', section: 'about' },
    { label: 'Skills', section: 'skills' },
    { label: 'Experience', section: 'experience' },
    { label: 'Projects', section: 'projects' },
    { label: 'Testimonials', section: 'testimonials' },
    { label: 'Contact', section: 'contact' }
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-6">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid lg:grid-cols-4 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">{personal.name}</h3>
                <p className="text-slate-400 text-lg">{personal.title}</p>
                <div className="flex items-center text-slate-400 mt-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  {personal.location}
                </div>
              </div>
              
              <p className="text-slate-300 leading-relaxed max-w-md">
                {contact.description}
              </p>

              {/* Social Links */}
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-teal-600 hover:border-teal-600 hover:text-white transition-colors duration-300"
                  onClick={() => window.open(personal.linkedin, '_blank')}
                >
                  <LinkedinIcon className="w-4 h-4 mr-2" />
                  LinkedIn
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-teal-600 hover:border-teal-600 hover:text-white transition-colors duration-300"
                  onClick={() => window.open(`mailto:${personal.email}`, '_blank')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
              <nav className="space-y-3">
                {quickLinks.map((link, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToSection(link.section)}
                    className="block text-slate-400 hover:text-teal-400 transition-colors duration-300 text-left"
                  >
                    {link.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Get In Touch</h4>
              <div className="space-y-4">
                <a
                  href={`mailto:${personal.email}`}
                  className="flex items-center text-slate-400 hover:text-teal-400 transition-colors duration-300"
                >
                  <Mail className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span className="text-sm">{personal.email}</span>
                </a>
                <a
                  href={`tel:${personal.phone}`}
                  className="flex items-center text-slate-400 hover:text-teal-400 transition-colors duration-300"
                >
                  <Phone className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span className="text-sm">{personal.phone}</span>
                </a>
                <div className="flex items-start text-slate-400">
                  <MapPin className="w-4 h-4 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{personal.location}</span>
                </div>
              </div>

              {/* Availability Status */}
              <div className="mt-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-slate-300">Available for Projects</span>
                </div>
                <p className="text-xs text-slate-400">{contact.availability}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-slate-700" />

        {/* Bottom Footer */}
        <div className="py-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-6 text-sm text-slate-400">
              <div className="flex items-center">
                <GraduationCap className="w-4 h-4 mr-2" />
                MBA - SP Jain Global
              </div>
              <div className="flex items-center">
                <Building2 className="w-4 h-4 mr-2" />
                B.Tech - Information Science
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <p className="text-sm text-slate-400">
                © {currentYear} {personal.name}. Built with{' '}
                <Heart className="w-4 h-4 inline text-red-400 mx-1" />
                for supply chain excellence.
              </p>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={scrollToTop}
                className="text-slate-400 hover:text-teal-400 hover:bg-slate-800 p-2"
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;