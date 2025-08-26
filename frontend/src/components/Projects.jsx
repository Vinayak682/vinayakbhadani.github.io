import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  ExternalLink, 
  TrendingUp, 
  Target, 
  Award, 
  ChevronRight,
  Building2,
  MapPin
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { getProjects } from '../services/api';

const Projects = () => {
  const { data: projectsData, loading, error } = useApi(getProjects);
  const [selectedProject, setSelectedProject] = useState(null);

  // Set first project as selected when data loads
  React.useEffect(() => {
    if (projectsData && projectsData.length > 0 && !selectedProject) {
      setSelectedProject(projectsData[0]);
    }
  }, [projectsData, selectedProject]);

  if (loading) {
    return (
      <section id="projects" className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 text-lg">Loading projects...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !projectsData) {
    return (
      <section id="projects" className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <p className="text-red-600 text-lg">Failed to load projects information</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-20 bg-slate-50">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-teal-100 text-teal-800 px-4 py-2">
            Portfolio
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Strategic Supply Chain Projects
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Real-world supply chain transformations that delivered measurable business impact 
            across MENA, GCC, and global markets.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Project List */}
          <div className="lg:col-span-4 space-y-4">
            {projectsData.map((project, index) => (
              <Card 
                key={project.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedProject && selectedProject.id === project.id 
                    ? 'ring-2 ring-teal-500 shadow-lg' 
                    : 'hover:ring-1 hover:ring-slate-300'
                }`}
                onClick={() => setSelectedProject(project)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 mb-2 line-clamp-2">
                        {project.title}
                      </h3>
                      <div className="flex items-center text-sm text-slate-500 mb-2">
                        <Building2 className="w-4 h-4 mr-1" />
                        {project.company}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {project.category}
                      </Badge>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
                      selectedProject && selectedProject.id === project.id ? 'rotate-90 text-teal-500' : ''
                    }`} />
                  </div>
                  
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {project.challenge}
                  </p>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-teal-600">
                      {project.outcomes[0]}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Project Details */}
          {selectedProject && (
            <div className="lg:col-span-8">
              <Card className="shadow-xl border-0">
                {/* Project Image */}
                <div className="relative h-64 lg:h-80 overflow-hidden rounded-t-lg">
                  <img 
                    src={selectedProject.image}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <Badge className="bg-white/20 text-white border-white/30 mb-3">
                      {selectedProject.category}
                    </Badge>
                    <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                      {selectedProject.title}
                    </h3>
                    <div className="flex items-center text-white/90">
                      <Building2 className="w-4 h-4 mr-2" />
                      {selectedProject.company}
                    </div>
                  </div>
                </div>

                <CardContent className="p-8">
                  {/* Challenge */}
                  <div className="mb-8">
                    <div className="flex items-center mb-4">
                      <Target className="w-5 h-5 text-red-500 mr-3" />
                      <h4 className="text-lg font-bold text-slate-900">Challenge</h4>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      {selectedProject.challenge}
                    </p>
                  </div>

                  {/* Approach */}
                  <div className="mb-8">
                    <div className="flex items-center mb-4">
                      <TrendingUp className="w-5 h-5 text-blue-500 mr-3" />
                      <h4 className="text-lg font-bold text-slate-900">Approach</h4>
                    </div>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      {selectedProject.approach}
                    </p>
                    
                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.technologies.map((tech, index) => (
                        <Badge key={index} variant="secondary" className="bg-slate-100 text-slate-700">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Outcomes */}
                  <div className="mb-8">
                    <div className="flex items-center mb-4">
                      <Award className="w-5 h-5 text-green-500 mr-3" />
                      <h4 className="text-lg font-bold text-slate-900">Key Outcomes</h4>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {selectedProject.outcomes.map((outcome, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                          <span className="text-sm font-medium text-green-800">{outcome}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Impact */}
                  <div className="mb-8">
                    <h4 className="text-lg font-bold text-slate-900 mb-3">Business Impact</h4>
                    <p className="text-slate-600 leading-relaxed">
                      {selectedProject.impact}
                    </p>
                  </div>

                  {/* Testimonial */}
                  <Card className="bg-slate-900 border-0">
                    <CardContent className="p-6">
                      <blockquote className="text-slate-300 italic leading-relaxed mb-4">
                        "{selectedProject.testimonial}"
                      </blockquote>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-400">
                          — Project Stakeholder
                        </div>
                        <Button variant="ghost" size="sm" className="text-teal-400 hover:text-teal-300">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Connect on LinkedIn
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Projects;