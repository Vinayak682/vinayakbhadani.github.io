import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { 
  Mail, 
  Phone, 
  MapPin, 
  LinkedinIcon, 
  Send,
  CheckCircle,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useApi, useApiMutation } from '../hooks/useApi';
import { getProfile, submitContactMessage } from '../services/api';

const Contact = () => {
  const { data: profileData, loading: profileLoading } = useApi(getProfile);
  const { mutate: submitMessage, loading: submitting } = useApiMutation(submitContactMessage);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await submitMessage(formData);
      toast({
        title: "Message Sent Successfully!",
        description: "Thank you for reaching out. I'll get back to you within 24 hours.",
      });
      setFormData({ name: '', email: '', company: '', message: '' });
    } catch (error) {
      toast({
        title: "Failed to Send Message",
        description: error.message || "Please try again later.",
      });
    }
  };

  if (profileLoading) {
    return (
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 text-lg">Loading contact information...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!profileData) {
    return (
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <p className="text-red-600 text-lg">Failed to load contact information</p>
          </div>
        </div>
      </section>
    );
  }

  const { contact, personal } = profileData;

  const contactMethods = [
    {
      icon: Mail,
      label: "Email",
      value: personal.email,
      action: () => window.open(`mailto:${personal.email}`, '_blank'),
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Phone,
      label: "Phone",
      value: personal.phone,
      action: () => window.open(`tel:${personal.phone}`, '_blank'),
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: LinkedinIcon,
      label: "LinkedIn",
      value: "Connect Professionally",
      action: () => window.open('https://www.linkedin.com/in/vinayakbhadani', '_blank'),
      color: "text-blue-700",
      bgColor: "bg-blue-50"
    },
    {
      icon: MapPin,
      label: "Location",
      value: personal.location,
      action: null,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-teal-100 text-teal-800 px-4 py-2">
            Get In Touch
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            {contact.cta}
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {contact.description}
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-7">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
                  <MessageSquare className="w-6 h-6 mr-3 text-teal-600" />
                  Send a Message
                </CardTitle>
                <p className="text-slate-600">
                  Fill out the form below and I'll respond within 24 hours.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Full Name *
                      </label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        required
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Email Address *
                      </label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@company.com"
                        required
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Company/Organization
                    </label>
                    <Input
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="Your company name (optional)"
                      className="h-12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Message *
                    </label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell me about your supply chain challenges or opportunities..."
                      required
                      rows={6}
                      className="resize-none"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={submitting}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white h-12 text-base font-semibold"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="lg:col-span-5 space-y-6">
            {/* Contact Methods */}
            <div className="space-y-4">
              {contactMethods.map((method, index) => (
                <Card 
                  key={index} 
                  className={`${method.action ? 'cursor-pointer hover:shadow-lg' : ''} transition-all duration-300 border-0 shadow-md`}
                  onClick={method.action}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`${method.bgColor} p-3 rounded-lg`}>
                        <method.icon className={`w-6 h-6 ${method.color}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{method.label}</h4>
                        <p className="text-slate-600">{method.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Availability */}
            <Card className="bg-gradient-to-r from-teal-50 to-slate-50 border-teal-100">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Current Availability</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {contact.availability}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Meeting */}
            <Card className="bg-slate-900 border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Calendar className="w-10 h-10 text-teal-400 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-white mb-3">
                  Schedule a Call
                </h4>
                <p className="text-slate-300 text-sm mb-6">
                  Book a 30-minute consultation to discuss your supply chain optimization needs.
                </p>
                <Button 
                  className="bg-teal-600 hover:bg-teal-700 text-white w-full"
                  onClick={() => window.open('https://calendly.com/vinayakbhadani', '_blank')}
                >
                  Book Meeting
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;