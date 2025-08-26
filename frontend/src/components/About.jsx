import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Quote, Target, TrendingUp, Lightbulb, Rocket } from 'lucide-react';
import mockData from '../mock';

const About = () => {
  const { about } = mockData;

  const storySteps = [
    {
      icon: Target,
      title: "The Challenge",
      content: about.story.challenge,
      color: "text-red-400"
    },
    {
      icon: TrendingUp,
      title: "The Journey",
      content: about.story.journey,
      color: "text-blue-400"
    },
    {
      icon: Lightbulb,
      title: "The Breakthrough",
      content: about.story.breakthrough,
      color: "text-yellow-400"
    },
    {
      icon: Rocket,
      title: "The Impact",
      content: about.story.impact,
      color: "text-green-400"
    }
  ];

  return (
    <section id="about" className="py-20 bg-slate-50">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-teal-100 text-teal-800 px-4 py-2">
            About Me
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            My Professional Journey
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            From engineering foundations to supply chain excellence, discover how I transform 
            complex logistics challenges into streamlined, profitable operations.
          </p>
        </div>

        {/* Story Timeline */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {storySteps.map((step, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardContent className="p-8">
                <div className="flex items-start space-x-4">
                  <div className={`${step.color} bg-slate-100 p-3 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {step.content}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Philosophy Quote */}
        <Card className="bg-gradient-to-r from-slate-900 to-slate-800 border-0 shadow-xl">
          <CardContent className="p-12 text-center">
            <Quote className="w-12 h-12 text-teal-400 mx-auto mb-6" />
            <blockquote className="text-2xl lg:text-3xl font-medium text-white leading-relaxed mb-8">
              "{about.philosophy}"
            </blockquote>
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-1 bg-teal-400 rounded-full"></div>
              <span className="text-teal-400 font-semibold">Vinayak Bhadani</span>
              <div className="w-12 h-1 bg-teal-400 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        {/* Future Vision */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-6">
            Looking Forward
          </h3>
          <p className="text-lg text-slate-600 max-w-4xl mx-auto leading-relaxed">
            {about.story.future}
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;