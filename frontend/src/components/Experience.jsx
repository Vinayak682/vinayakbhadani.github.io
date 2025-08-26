import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Calendar, 
  MapPin, 
  TrendingUp, 
  CheckCircle, 
  Building2,
  ArrowRight
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { getExperience } from '../services/api';

const Experience = () => {
  const { data: experienceData, loading, error } = useApi(getExperience);

  if (loading) {
    return (
      <section id="experience" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 text-lg">Loading experience...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !experienceData) {
    return (
      <section id="experience" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <p className="text-red-600 text-lg">Failed to load experience information</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="experience" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-teal-100 text-teal-800 px-4 py-2">
            Professional Experience
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Career Progression
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            A track record of delivering exceptional results in supply chain optimization, 
            inventory management, and cross-functional leadership across diverse markets.
          </p>
        </div>

        {/* Experience Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200 hidden lg:block"></div>

          <div className="space-y-12">
            {experienceData.map((exp, index) => (
              <div key={exp.id} className="relative">
                {/* Timeline Dot */}
                <div className="absolute left-6 w-4 h-4 bg-teal-500 rounded-full border-4 border-white shadow-lg hidden lg:block z-10"></div>

                <Card className="lg:ml-16 shadow-lg border-0 hover:shadow-xl transition-all duration-300 group">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div>
                        <CardTitle className="text-2xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors duration-300">
                          {exp.position}
                        </CardTitle>
                        <div className="flex items-center text-slate-600 mt-2 space-x-4">
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 mr-2" />
                            <span className="font-semibold">{exp.company}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{exp.location}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col lg:items-end gap-2">
                        <Badge 
                          variant={exp.type === 'Current Role' ? 'default' : 'secondary'}
                          className={`${
                            exp.type === 'Current Role' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : 'bg-slate-100 text-slate-700'
                          } px-3 py-1`}
                        >
                          {exp.type}
                        </Badge>
                        <div className="flex items-center text-sm text-slate-500">
                          <Calendar className="w-4 h-4 mr-2" />
                          {exp.duration}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Key Achievements */}
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-teal-600" />
                        Key Achievements
                      </h4>
                      <div className="space-y-3">
                        {exp.achievements.map((achievement, achievementIndex) => (
                          <div key={achievementIndex} className="flex items-start space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <p className="text-slate-600 leading-relaxed">{achievement}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Skills Used */}
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">Core Skills Applied</h4>
                      <div className="flex flex-wrap gap-2">
                        {exp.skills.map((skill, skillIndex) => (
                          <Badge 
                            key={skillIndex} 
                            variant="outline" 
                            className="text-xs bg-slate-50 text-slate-700 border-slate-200 hover:bg-teal-50 hover:text-teal-700 transition-colors duration-200"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Impact Highlight */}
                    <Card className="bg-gradient-to-r from-teal-50 to-slate-50 border-teal-100">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-slate-600 mb-1">Primary Impact</div>
                            <div className="text-lg font-bold text-teal-700">{exp.impact.primary}</div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-slate-400" />
                          <div className="text-right">
                            <div className="text-sm font-medium text-slate-600 mb-1">Secondary Impact</div>
                            <div className="text-lg font-bold text-slate-700">{exp.impact.secondary}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;