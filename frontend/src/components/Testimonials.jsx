import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Quote, 
  Star, 
  LinkedinIcon, 
  ExternalLink
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { getTestimonials } from '../services/api';

const Testimonials = () => {
  const { data: testimonialsData, loading, error } = useApi(getTestimonials);

  // Professional headshot images for each recommender
  const recommenderImages = {
    "rajiv-aserkar-testimonial": "https://customer-assets.emergentagent.com/job_profile-pro-3/artifacts/cqsl81si_IMG_6861.jpg",
    "dorrin-goyal-testimonial": "https://customer-assets.emergentagent.com/job_profile-pro-3/artifacts/o0az39uz_IMG_6862.jpg", 
    "sami-anthony-testimonial": "https://customer-assets.emergentagent.com/job_profile-pro-3/artifacts/yb6o7uh5_IMG_6864.jpg"
  };

  if (loading) {
    return (
      <section id="testimonials" className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 text-lg">Loading testimonials...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !testimonialsData) {
    return (
      <section id="testimonials" className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <p className="text-red-600 text-lg">Failed to load testimonials</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="testimonials" className="py-20 bg-slate-50">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-teal-100 text-teal-800 px-4 py-2">
            Testimonials
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            What Colleagues Say
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Professional recommendations from supervisors, colleagues, and academic mentors 
            who have witnessed my impact firsthand.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {testimonialsData.map((testimonial) => (
            <Card key={testimonial.id} className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg bg-white relative overflow-hidden">
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50 opacity-60"></div>
              
              <CardContent className="p-8 h-full flex flex-col relative z-10">
                {/* Quote Icon */}
                <div className="mb-6">
                  <Quote className="w-10 h-10 text-teal-500 group-hover:scale-110 transition-transform duration-300" />
                </div>

                {/* Rating */}
                <div className="flex space-x-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, starIndex) => (
                    <Star key={starIndex} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Testimonial Content */}
                <blockquote className="text-slate-700 leading-relaxed mb-8 flex-grow italic text-base font-medium">
                  "{testimonial.content}"
                </blockquote>

                {/* Relationship Badge */}
                <div className="mb-6">
                  <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 font-medium">
                    {testimonial.relationship}
                  </Badge>
                </div>

                {/* Author Info with Professional Photo */}
                <div className="border-t border-slate-200 pt-6">
                  <div className="flex items-center space-x-4">
                    {/* Professional Headshot */}
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-slate-200 group-hover:ring-teal-200 transition-all duration-300 shadow-lg">
                        <img 
                          src={recommenderImages[testimonial.id]}
                          alt={`${testimonial.name} - ${testimonial.position}`}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            // Fallback to initials if image fails to load
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        {/* Fallback initials */}
                        <div className="w-full h-full bg-slate-600 text-white font-bold text-lg hidden items-center justify-center">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      </div>
                      {/* Professional verification indicator */}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-teal-500 rounded-full border-2 border-white flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Name and Title */}
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors duration-300 text-lg">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-slate-600 font-medium leading-tight">{testimonial.position}</p>
                      <p className="text-sm text-slate-500 leading-tight">{testimonial.company}</p>
                    </div>
                    
                    {/* LinkedIn Button */}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-slate-400 hover:text-teal-600 hover:bg-teal-50 p-2 rounded-full transition-all duration-300"
                      onClick={() => window.open(testimonial.linkedin, '_blank')}
                    >
                      <LinkedinIcon className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Professional Credibility Indicator */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        Verified Professional
                      </span>
                      <span>LinkedIn Recommendation</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* LinkedIn CTA */}
        <div className="mt-16 text-center">
          <Card className="inline-block bg-gradient-to-r from-slate-900 to-slate-800 border-0 shadow-2xl">
            <CardContent className="p-10">
              <LinkedinIcon className="w-12 h-12 text-teal-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">
                More Recommendations on LinkedIn
              </h3>
              <p className="text-slate-300 mb-6 max-w-md">
                Connect with me to see additional professional recommendations and endorsements from industry colleagues.
              </p>
              <Button 
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 text-base font-semibold shadow-lg hover:shadow-teal-600/25 transition-all duration-300"
                onClick={() => window.open('https://www.linkedin.com/in/vinayakbhadani', '_blank')}
              >
                <LinkedinIcon className="w-5 h-5 mr-3" />
                View LinkedIn Profile
                <ExternalLink className="w-4 h-4 ml-3" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;