import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowRight, MapPin, LinkedinIcon, Mail, Phone } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { getProfile } from '../services/api';

const Hero = () => {
  const { data: profileData, loading, error } = useApi(getProfile);

  if (loading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Loading profile...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">Failed to load profile: {error}</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="border-slate-600 text-slate-300">
            Retry
          </Button>
        </div>
      </section>
    );
  }

  if (!profileData) {
    return null;
  }

  const { personal, hero } = profileData;

  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.03%22%3E%3Cpath%20d=%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            {/* Badge */}
            <Badge variant="secondary" className="bg-teal-600/20 text-teal-300 border-teal-600/30 px-4 py-2 text-sm font-medium">
              <MapPin className="w-4 h-4 mr-2" />
              Based in {personal.location}
            </Badge>

            {/* Main Title */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                {personal.name}
                <span className="block text-2xl lg:text-3xl font-normal text-slate-300 mt-2">
                  {personal.title}
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-teal-400 font-medium leading-relaxed">
                {hero.tagline}
              </p>
              
              <p className="text-lg text-slate-300 leading-relaxed max-w-2xl">
                {hero.description}
              </p>
            </div>

            {/* Social Proof Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-teal-400">
                  {hero.socialProof.experience}
                </div>
                <div className="text-sm text-slate-400 font-medium">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-teal-400">
                  {hero.socialProof.unitsManaged}
                </div>
                <div className="text-sm text-slate-400 font-medium">Units Monthly</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-teal-400">
                  {hero.socialProof.costReduction}%
                </div>
                <div className="text-sm text-slate-400 font-medium">Cost Reduction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-teal-400">
                  {hero.socialProof.accuracyRate}%
                </div>
                <div className="text-sm text-slate-400 font-medium">Accuracy Rate</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 text-base font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-teal-600/25"
                onClick={() => window.open('https://www.linkedin.com/in/vinayakbhadani', '_blank')}
              >
                <LinkedinIcon className="w-5 h-5 mr-2" />
                Connect on LinkedIn
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white px-8 py-4 text-base font-medium transition-all duration-300"
                onClick={() => document.getElementById('projects').scrollIntoView({ behavior: 'smooth' })}
              >
                View My Work
              </Button>
            </div>

            {/* Contact Info */}
            <div className="flex flex-wrap gap-6 pt-4 border-t border-slate-700">
              <a 
                href={`mailto:${personal.email}`}
                className="flex items-center text-slate-400 hover:text-teal-400 transition-colors duration-300"
              >
                <Mail className="w-4 h-4 mr-2" />
                {personal.email}
              </a>
              <a 
                href={`tel:${personal.phone}`}
                className="flex items-center text-slate-400 hover:text-teal-400 transition-colors duration-300"
              >
                <Phone className="w-4 h-4 mr-2" />
                {personal.phone}
              </a>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img 
                src={personal.heroImage}
                alt="Modern Supply Chain Operations"
                className="w-full h-[500px] lg:h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
              
              {/* Floating Stats Card */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="text-white text-sm font-medium mb-2">Latest Achievement</div>
                <div className="text-teal-400 text-lg font-bold">30% Cost Reduction in Air Freight</div>
                <div className="text-white/80 text-sm">Through strategic vendor consolidation</div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-teal-600/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-slate-700/30 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-slate-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-slate-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;