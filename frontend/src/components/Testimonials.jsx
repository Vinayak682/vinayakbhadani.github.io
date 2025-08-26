import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Quote, 
  Star, 
  LinkedinIcon, 
  ExternalLink,
  User
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { getTestimonials } from '../services/api';

const Testimonials = () => {
  const { data: testimonialsData, loading, error } = useApi(getTestimonials);

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
            <Card key={testimonial.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white">
              <CardContent className="p-8 h-full flex flex-col">
                {/* Quote Icon */}
                <div className="mb-6">
                  <Quote className="w-8 h-8 text-teal-400 group-hover:scale-110 transition-transform duration-300" />
                </div>

                {/* Rating */}
                <div className="flex space-x-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, starIndex) => (
                    <Star key={starIndex} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Testimonial Content */}
                <blockquote className="text-slate-600 leading-relaxed mb-8 flex-grow italic">
                  "{testimonial.content}"
                </blockquote>

                {/* Relationship Badge */}
                <div className="mb-6">
                  <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                    {testimonial.relationship}
                  </Badge>
                </div>

                {/* Author Info */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center group-hover:bg-teal-100 transition-colors duration-300">
                        <User className="w-6 h-6 text-slate-500 group-hover:text-teal-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors duration-300">
                          {testimonial.name}
                        </h4>
                        <p className="text-sm text-slate-600">{testimonial.position}</p>
                        <p className="text-sm text-slate-500">{testimonial.company}</p>
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-slate-400 hover:text-teal-600 p-2"
                      onClick={() => window.open(testimonial.linkedin, '_blank')}
                    >
                      <LinkedinIcon className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* LinkedIn CTA */}
        <div className="mt-16 text-center">
          <Card className="inline-block bg-gradient-to-r from-slate-900 to-slate-800 border-0 shadow-xl">
            <CardContent className="p-8">
              <LinkedinIcon className="w-12 h-12 text-teal-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">
                More Recommendations on LinkedIn
              </h3>
              <p className="text-slate-300 mb-6 max-w-md">
                Connect with me to see additional professional recommendations and endorsements from industry colleagues.
              </p>
              <Button 
                className="bg-teal-600 hover:bg-teal-700 text-white"
                onClick={() => window.open('https://www.linkedin.com/in/vinayakbhadani', '_blank')}
              >
                <LinkedinIcon className="w-5 h-5 mr-2" />
                View LinkedIn Profile
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;