import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  GraduationCap, 
  Award, 
  Shield, 
  ExternalLink,
  Calendar,
  MapPin,
  CheckCircle,
  Trophy,
  Clock
} from 'lucide-react';

const Certifications = () => {
  const education = [
    {
      id: 'mba',
      type: 'Graduate',
      degree: "Master of Global Business (MGB)",
      specialization: "Global Logistics and Supply Chain Management",
      institution: "SP Jain School of Global Management",
      studentNumber: "MS22GL091",
      graduationDate: "June 29, 2023",
      locations: "Dubai, Mumbai, Singapore, Sydney",
      accreditation: "TEQSA Accredited (CRICOS 03335G)",
      duration: "16 months",
      description: "Designed to groom junior and middle-level managers into 'general managers' capable of assuming cross-functional roles, engaging in critical thinking, building teams and taking on leadership roles.",
      websiteUrl: "https://www.spjain.org/programs/postgraduate/mgb",
      gradientFrom: "from-slate-900",
      gradientTo: "to-slate-800",
      badgeColor: "bg-teal-600"
    },
    {
      id: 'undergraduate',
      type: 'Undergraduate',
      degree: "Bachelor of Engineering (B.E.)",
      specialization: "Information Science & Engineering",
      institution: "Sri Venkateshwara College of Engineering",
      studentNumber: "1VE17IS057",
      graduationDate: "August 2021",
      certificateDate: "March 10, 2022",
      locations: "Bengaluru, India",
      duration: "4 years",
      description: "Comprehensive engineering program focusing on Information Science and Engineering, covering software development, data structures, algorithms, and modern computing technologies.",
      websiteUrl: "https://www.svce.ac.in",
      gradientFrom: "from-blue-900",
      gradientTo: "to-blue-800",
      badgeColor: "bg-blue-600"
    }
  ];

  const certifications = [
    {
      id: 'apics-cpim',
      title: 'Certified in Production and Inventory Management',
      abbreviation: 'CPIM',
      issuer: 'Association for Supply Chain Management (ASCM)',
      issuerAbbr: 'APICS/ASCM',
      status: 'In Progress',
      expectedCompletion: 'January 2026',
      description: 'Comprehensive certification program covering production and inventory management, supply chain operations, and strategic planning methodologies.',
      skills: ['Production Planning', 'Inventory Management', 'Supply Chain Operations', 'Master Scheduling', 'Material Requirements Planning'],
      verificationUrl: 'https://www.ascm.org/learning-development/certifications-credentials/cpim/',
      badgeColor: 'bg-orange-600',
      icon: Award,
      isInProgress: true
    },
    {
      id: 'ciscp',
      title: 'Certified International Supply Chain Professional',
      abbreviation: 'CISCP',
      issuer: 'International Purchasing and Supply Chain Management Institute',
      issuerAbbr: 'IPSCMI',
      issueDate: 'September 10, 2024',
      expiryDate: 'September 10, 2029',
      certificationId: 'CISCP224094586',
      description: 'Professional certification in international supply chain management including ethical practices and global logistics.',
      skills: ['Global Supply Chain Management', 'International Trade', 'Ethical Procurement', 'Supply Chain Strategy'],
      verificationUrl: '#',
      badgeColor: 'bg-blue-600',
      icon: Shield
    },
    {
      id: 'ciscm',
      title: 'Certified International Supply Chain Manager',
      abbreviation: 'CISCM',
      issuer: 'International Purchasing and Supply Chain Management Institute',
      issuerAbbr: 'IPSCMI',
      issueDate: 'September 10, 2024',
      expiryDate: 'September 10, 2029',
      certificationId: 'CISCM2240938463',
      description: 'Advanced certification in supply chain management with focus on strategic leadership and operational excellence.',
      skills: ['Supply Chain Leadership', 'Strategic Management', 'Operations Excellence', 'Team Management'],
      verificationUrl: '#',
      badgeColor: 'bg-green-600',
      icon: Trophy
    },
    {
      id: 'ascm',
      title: 'ASCM Professional Member',
      abbreviation: 'ASCM',
      issuer: 'Association for Supply Chain Management',
      issuerAbbr: 'ASCM',
      issueDate: 'Current',
      description: 'Professional membership in the leading global association for supply chain professionals.',
      skills: ['Industry Networking', 'Professional Development', 'Supply Chain Best Practices', 'Continuous Learning'],
      verificationUrl: 'https://www.credly.com/badges/b1be0868-e292-47e5-a691-7ee215c0de49/linked_in_profile',
      badgeColor: 'bg-purple-600',
      icon: Award
    }
  ];

  return (
    <section id="certifications" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-teal-100 text-teal-800 px-4 py-2">
            Academic & Professional Credentials
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Education & Certifications
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Advanced academic qualifications and professional certifications that demonstrate 
            expertise in global supply chain management and strategic operations.
          </p>
        </div>

        {/* Academic Degrees Section */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Academic Qualifications
          </h3>
          
          <div className="space-y-8">
            {education.map((edu) => (
              <Card key={edu.id} className={`bg-gradient-to-br ${edu.gradientFrom} ${edu.gradientTo} border-0 shadow-2xl overflow-hidden`}>
                <CardContent className="p-0">
                  <div className="grid lg:grid-cols-12">
                    {/* Left Section - Icon & Badge */}
                    <div className={`lg:col-span-3 bg-gradient-to-br ${edu.badgeColor.replace('bg-', 'from-')} ${edu.badgeColor.replace('bg-', 'to-')}-700 p-8 flex flex-col items-center justify-center text-center`}>
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4">
                        <GraduationCap className="w-10 h-10 text-white" />
                      </div>
                      <Badge className="bg-white/20 text-white border-white/30 mb-2">
                        {edu.type} Degree
                      </Badge>
                      {edu.accreditation && (
                        <p className="text-teal-100 text-sm">{edu.accreditation}</p>
                      )}
                    </div>

                    {/* Right Section - Content */}
                    <div className="lg:col-span-9 p-8">
                      <div className="mb-6">
                        <h3 className="text-3xl font-bold text-white mb-2">
                          {edu.degree}
                        </h3>
                        <p className="text-xl text-teal-400 font-semibold mb-4">
                          Specialization: {edu.specialization}
                        </p>
                        <p className="text-slate-300 leading-relaxed">
                          {edu.description}
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h4 className="text-white font-semibold mb-3">Institution Details</h4>
                          <div className="space-y-2 text-slate-300">
                            <div className="flex items-center">
                              <GraduationCap className="w-4 h-4 mr-2 text-teal-400" />
                              <span className="text-sm">{edu.institution}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2 text-teal-400" />
                              <span className="text-sm">{edu.locations}</span>
                            </div>
                            {edu.accreditation && (
                              <div className="flex items-center">
                                <CheckCircle className="w-4 h-4 mr-2 text-teal-400" />
                                <span className="text-sm">{edu.accreditation}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-white font-semibold mb-3">Program Details</h4>
                          <div className="space-y-2 text-slate-300">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-teal-400" />
                              <span className="text-sm">Graduated: {edu.graduationDate}</span>
                            </div>
                            {edu.certificateDate && (
                              <div className="flex items-center">
                                <Award className="w-4 h-4 mr-2 text-teal-400" />
                                <span className="text-sm">Certificate: {edu.certificateDate}</span>
                              </div>
                            )}
                            <div className="flex items-center">
                              <Award className="w-4 h-4 mr-2 text-teal-400" />
                              <span className="text-sm">Duration: {edu.duration}</span>
                            </div>
                            <div className="flex items-center">
                              <Shield className="w-4 h-4 mr-2 text-teal-400" />
                              <span className="text-sm">Student ID: {edu.studentNumber}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-700">
                        <Button 
                          variant="outline" 
                          className="border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-slate-900"
                          onClick={() => window.open(edu.websiteUrl, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Institution
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Professional Certifications */}
        <div>
          <h3 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Professional Certifications
          </h3>
          
          <div className="grid lg:grid-cols-4 gap-8">
            {certifications.map((cert) => (
              <Card key={cert.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  {/* Header with Icon */}
                  <div className={`${cert.badgeColor} p-6 text-white text-center relative`}>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <cert.icon className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-xl font-bold mb-1">{cert.abbreviation}</h4>
                      <p className="text-sm opacity-90">{cert.issuerAbbr}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h5 className="text-lg font-bold text-slate-900 mb-2 leading-tight">
                      {cert.title}
                    </h5>
                    
                    <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                      {cert.description}
                    </p>

                    {/* Certification Details */}
                    <div className="space-y-2 mb-4 text-sm text-slate-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Issued: {cert.issueDate}</span>
                      </div>
                      {cert.expiryDate && (
                        <div className="flex items-center">
                          <Shield className="w-4 h-4 mr-2" />
                          <span>Expires: {cert.expiryDate}</span>
                        </div>
                      )}
                      {cert.certificationId && (
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span className="truncate">ID: {cert.certificationId}</span>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {cert.skills.slice(0, 2).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-slate-100 text-slate-600">
                            {skill}
                          </Badge>
                        ))}
                        {cert.skills.length > 2 && (
                          <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600">
                            +{cert.skills.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Verification Button */}
                    {cert.verificationUrl && cert.verificationUrl !== '#' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-slate-600 border-slate-300 hover:bg-slate-50"
                        onClick={() => window.open(cert.verificationUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Verify Credential
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="inline-block bg-gradient-to-r from-teal-600 to-slate-700 border-0 shadow-xl">
            <CardContent className="p-8">
              <Award className="w-12 h-12 text-white mx-auto mb-4" />
              <h4 className="text-2xl font-bold text-white mb-4">
                Committed to Excellence
              </h4>
              <p className="text-slate-200 max-w-2xl">
                These credentials represent my dedication to continuous learning and 
                professional development in supply chain management and global logistics.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Certifications;