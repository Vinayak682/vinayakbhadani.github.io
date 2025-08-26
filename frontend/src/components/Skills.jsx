import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Database, Settings, Globe, BarChart3 } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { getSkills } from '../services/api';

const Skills = () => {
  const { data: skillsData, loading, error } = useApi(getSkills);

  // Simulated skill proficiency levels
  const skillProficiency = {
    "ERP Systems (SAP, Oracle)": 90,
    "Supply Chain Analytics": 95,
    "Demand Forecasting": 88,
    "S&OP Planning": 92,
    "Cross-functional Leadership": 85,
    "MENA Market Expertise": 94,
    "Process Improvement": 90,
    "3PL Management": 87,
    "Cost Optimization": 91
  };

  const highlightedSkills = [
    "Supply Chain Analytics",
    "S&OP Planning", 
    "MENA Market Expertise",
    "Process Improvement",
    "ERP Systems (SAP, Oracle)",
    "Cross-functional Leadership",
    "3PL Management",
    "Cost Optimization",
    "Demand Forecasting"
  ];

  if (loading) {
    return (
      <section id="skills" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 text-lg">Loading skills...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !skillsData) {
    return (
      <section id="skills" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <p className="text-red-600 text-lg">Failed to load skills information</p>
          </div>
        </div>
      </section>
    );
  }

  const iconMap = {
    'Database': Database,
    'Settings': Settings,
    'Globe': Globe
  };

  return (
    <section id="skills" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-teal-100 text-teal-800 px-4 py-2">
            Skills & Expertise
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Core Competencies
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            A comprehensive skill set developed through hands-on experience in supply chain 
            optimization, data analysis, and cross-regional operations management.
          </p>
        </div>

        {/* Skills Categories */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {skillsData.map((category, index) => {
            const IconComponent = iconMap[category.icon] || Database;
            return (
              <Card key={category.id} className={`group hover:shadow-xl transition-all duration-300 ${category.borderColor} border-2 hover:border-opacity-50`}>
                <CardHeader className="text-center pb-4">
                  <div className={`${category.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className={`text-xl font-bold ${category.textColor}`}>
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.skills.map((skill, skillIndex) => (
                      <Badge 
                        key={skillIndex} 
                        variant="secondary" 
                        className="text-sm font-medium mr-2 mb-2 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors duration-200"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Proficiency Levels */}
        <div className="bg-slate-50 rounded-2xl p-8 lg:p-12">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">
              Skill Proficiency Levels
            </h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Based on years of experience and measurable project outcomes
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {highlightedSkills.map((skill, index) => (
              <div key={index} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-800">{skill}</span>
                  <span className="text-teal-600 font-bold">{skillProficiency[skill]}%</span>
                </div>
                <Progress 
                  value={skillProficiency[skill]} 
                  className="h-3 bg-slate-200"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Certifications Placeholder */}
        <div className="mt-16 text-center">
          <Card className="inline-block bg-gradient-to-r from-teal-600 to-teal-700 border-0 shadow-lg">
            <CardContent className="p-8">
              <BarChart3 className="w-12 h-12 text-white mx-auto mb-4" />
              <h4 className="text-xl font-bold text-white mb-2">
                Continuous Learning
              </h4>
              <p className="text-teal-100">
                Always expanding expertise through industry certifications and advanced training programs
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Skills;