import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { 
  Menu, 
  LinkedinIcon, 
  Mail, 
  Phone,
  User,
  Briefcase,
  Award,
  MessageSquare,
  Home
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { getProfile } from '../services/api';

const Header = () => {
  const { data: profileData } = useApi(getProfile);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      // Update active section based on scroll position
      const sections = ['home', 'about', 'skills', 'experience', 'certifications', 'projects', 'testimonials', 'contact'];
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'about', label: 'About', icon: User },
    { id: 'skills', label: 'Skills', icon: Award },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'certifications', label: 'Credentials', icon: Award },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
    { id: 'contact', label: 'Contact', icon: MessageSquare }
  ];

  // Use fallback data if profile data is not loaded yet
  const personal = profileData?.personal || {
    name: 'Vinayak Bhadani',
    email: 'vinayakbhadani1998@gmail.com',
    phone: '+971556270561',
    linkedin: 'https://www.linkedin.com/in/vinayakbhadani'
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-slate-200' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo/Name */}
          <div 
            className="cursor-pointer"
            onClick={() => scrollToSection('home')}
          >
            <h1 className={`text-2xl font-bold transition-colors duration-300 ${
              isScrolled ? 'text-slate-900' : 'text-white'
            }`}>
              {personal.name}
            </h1>
            <p className={`text-sm transition-colors duration-300 ${
              isScrolled ? 'text-slate-600' : 'text-slate-300'
            }`}>
              Supply Chain Analyst
            </p>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`font-medium transition-all duration-300 relative group ${
                  activeSection === item.id
                    ? isScrolled 
                      ? 'text-teal-600' 
                      : 'text-teal-400'
                    : isScrolled 
                      ? 'text-slate-700 hover:text-teal-600' 
                      : 'text-slate-300 hover:text-white'
                }`}
              >
                {item.label}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-500 transition-all duration-300 group-hover:w-full ${
                  activeSection === item.id ? 'w-full' : ''
                }`}></span>
              </button>
            ))}
          </nav>

          {/* Desktop Contact Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className={`${
                isScrolled 
                  ? 'text-slate-600 hover:text-teal-600 hover:bg-teal-50' 
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => window.open('https://www.linkedin.com/in/vinayakbhadani', '_blank')}
            >
              <LinkedinIcon className="w-4 h-4" />
            </Button>
            
            <Button
              className={`${
                isScrolled 
                  ? 'bg-teal-600 hover:bg-teal-700' 
                  : 'bg-teal-600/90 hover:bg-teal-600 backdrop-blur-sm'
              } text-white transition-all duration-300`}
              onClick={() => scrollToSection('contact')}
            >
              <Mail className="w-4 h-4 mr-2" />
              Let's Connect
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`${
                    isScrolled 
                      ? 'text-slate-700 hover:text-teal-600' 
                      : 'text-white hover:text-teal-400'
                  }`}
                >
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-white">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="border-b border-slate-200 pb-4 mb-6">
                    <h2 className="text-xl font-bold text-slate-900">{personal.name}</h2>
                    <p className="text-sm text-slate-600">Supply Chain Analyst</p>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="space-y-2 flex-1">
                    {navigationItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                          activeSection === item.id
                            ? 'bg-teal-50 text-teal-700'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    ))}
                  </nav>

                  {/* Mobile Contact */}
                  <div className="border-t border-slate-200 pt-6 space-y-4">
                    <Button
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                      onClick={() => scrollToSection('contact')}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Get In Touch
                    </Button>
                    
                    <div className="flex space-x-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open('https://www.linkedin.com/in/vinayakbhadani', '_blank')}
                      >
                        <LinkedinIcon className="w-4 h-4 mr-2" />
                        LinkedIn
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(`tel:${personal.phone}`, '_blank')}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;