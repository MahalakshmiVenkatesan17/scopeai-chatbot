'use client';
 
import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Check, Mail, Phone, MessageSquare, User, Building2, Send } from 'lucide-react';

function ContactSalesContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'enterprise';
 
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    companySize: '',
    message: '',
    preferredContact: 'email',
  });
 
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
 
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
 
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.companySize) newErrors.companySize = 'Company size is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    if (formData.preferredContact === 'phone' && !formData.phone.trim()) newErrors.phone = 'Phone is required';
 
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
 
    if (!validateForm()) return;
 
    setLoading(true);
    try {
      const response = await fetch('/api/contact-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          plan,
        }),
      });
 
      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 3000);
      } else {
        const error = await response.json();
        setErrors({ submit: error.message || 'Failed to submit inquiry' });
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };
 
//   if (submitted) {
    return (
    <DashboardLayout>
      <div className="min-h-screen bg-linear-to-b from-white via-blue-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column - Info */}
            <div className="md:col-span-1">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors">Talk to Sales</h1>
                <p className="text-gray-600 dark:text-gray-400 transition-colors">Let&apos;s discuss your Enterprise needs</p>
              </div>
 
              {/* Enterprise Badge */}
              <div className="bg-linear-to-br from-purple-50 to-white dark:from-purple-900/10 dark:to-slate-900 rounded-2xl border-2 border-purple-100 dark:border-purple-900/30 p-6 mb-8 transition-colors">
                <div className="inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-bold mb-4 transition-colors">
                 Enterprise Plan
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors">Unlimited Everything</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 transition-colors">Custom integrations, dedicated support, and SLA guarantees</p>
                {/* <a href="/pricing" className="text-purple-600 font-bold text-sm hover:underline">
                  View all features →
                </a> */}
              </div>
 
              {/* Contact Info */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-gray-100 text-sm transition-colors">Email</p>
                    <a href="mailto:sales@example.com" className="text-blue-600 dark:text-blue-400 hover:underline text-sm transition-colors">
                      sales@example.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-gray-100 text-sm transition-colors">Phone</p>
                    <a href="tel:+1234567890" className="text-blue-600 dark:text-blue-400 hover:underline text-sm transition-colors">
                      +1 (234) 567-8900
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-gray-100 text-sm transition-colors">Live Chat</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors">Available Mon-Fri, 9AM-6PM EST</p>
                  </div>
                </div>
              </div>
            </div>
 
            {/* Right Column - Form */}
            <div className="md:col-span-2">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-blue-100 dark:border-slate-800 p-8 shadow-lg transition-colors">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 transition-colors">Send us your details</h2>
 
                <form onSubmit={handleSubmit}>
                  {/* First Name & Last Name */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors">First Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 dark:text-gray-100 transition-colors"
                          placeholder="John"
                        />
                      </div>
                      {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors">Last Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 dark:text-gray-100 transition-colors"
                          placeholder="Doe"
                        />
                      </div>
                      {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                    </div>
                  </div>
 
                  {/* Email */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 dark:text-gray-100 transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
 
                  {/* Phone */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 dark:text-gray-100 transition-colors"
                        placeholder="+1 (234) 567-8900"
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
 
                  {/* Company Name */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors">Company Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 dark:text-gray-100 transition-colors"
                        placeholder="Your Company"
                      />
                    </div>
                    {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
                  </div>
 
                  {/* Company Size */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors">Company Size</label>
                    <select
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 dark:text-gray-100 transition-colors"
                    >
                      <option value="">Select company size</option>
                      <option value="1-50">1-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </select>
                    {errors.companySize && <p className="text-red-500 text-xs mt-1">{errors.companySize}</p>}
                  </div>
 
                  {/* Message */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors">Tell us about your needs</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 rounded-lg focus:border-blue-500 focus:outline-none resize-none text-gray-900 dark:text-gray-100 transition-colors"
                      placeholder="Tell us about your use case and requirements..."
                    />
                    {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                  </div>
 
                  {/* Preferred Contact */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 transition-colors">Preferred contact method</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="preferredContact"
                          value="email"
                          checked={formData.preferredContact === 'email'}
                          onChange={handleChange}
                           className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors">Email</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="preferredContact"
                          value="phone"
                          checked={formData.preferredContact === 'phone'}
                          onChange={handleChange}
                           className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors">Phone</span>
                      </label>
                    </div>
                  </div>
 
                  {/* Error */}
                  {errors.submit && (
                    <p className="text-red-500 text-sm mb-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg transition-colors">{errors.submit}</p>
                  )}
 
                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-linear-to-r from-purple-600 to-purple-500 text-white font-bold py-4 px-4 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    {loading ? 'Sending...' : 'Send Inquiry'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ContactSalesFallback() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-linear-to-b from-white via-blue-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4 transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading contact form...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function ContactSalesPage() {
  return (
    <Suspense fallback={<ContactSalesFallback />}>
      <ContactSalesContent />
    </Suspense>
  );
}