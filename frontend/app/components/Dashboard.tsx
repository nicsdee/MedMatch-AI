'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import { 
  Users, Building2, Calendar, CheckCircle, Eye, ChevronDown, ChevronUp, 
  MapPin, Mail, Award, X, Clock, TrendingUp, Activity, Sparkles, 
  ArrowRight, Brain, Heart, Zap, Shield, Target, Network, Cpu, Gem
} from 'lucide-react';

interface DashboardProps {
  providers: any[];
  facilities: any[];
  shifts: any[];
  setActiveView?: (view: string) => void;
  setShowShiftModal?: (show: boolean) => void;
}

export default function Dashboard({ providers, facilities, shifts, setActiveView, setShowShiftModal }: DashboardProps) {
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [expandedProviderId, setExpandedProviderId] = useState<number | null>(null);
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getUrgencyClass = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-rose-50 text-rose-600 ring-1 ring-rose-200';
      case 'medium': return 'bg-amber-50 text-amber-600 ring-1 ring-amber-200';
      default: return 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200';
    }
  };

  const stats = [
    { id: 'providers', label: 'Providers', value: providers.length, icon: Users, color: 'emerald' },
    { id: 'facilities', label: 'Facilities', value: facilities.length, icon: Building2, color: 'amber' },
    { id: 'shifts', label: 'Open Shifts', value: shifts.length, icon: Calendar, color: 'orange' },
    { id: 'available', label: 'Available Now', value: providers.filter((p: any) => p.available).length, icon: CheckCircle, color: 'teal' },
  ];

  const colorClasses: any = {
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    orange: 'bg-orange-50 text-orange-600',
    teal: 'bg-teal-50 text-teal-600',
  };

  const toggleProviderDetails = (providerId: number) => {
    setExpandedProviderId(expandedProviderId === providerId ? null : providerId);
  };

  const avgMatchRate = providers.length > 0 && shifts.length > 0 
    ? Math.min(94, Math.floor((providers.filter(p => p.available).length / providers.length) * 70 + 30))
    : 0;

  const animatedColors = [
    'from-emerald-400 to-teal-500',
    'from-blue-500 to-cyan-400',
    'from-purple-500 to-pink-500',
    'from-amber-500 to-orange-500',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Welcome Header with animated pulse */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Dashboard</h1>
              <p className="text-sm text-slate-500 mt-1">Instant Intelligent healthcare staffing platform</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs bg-white rounded-full px-3 py-1.5 shadow-sm border border-slate-200">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-slate-600">Live Data</span>
              </div>
              <div className="flex items-center gap-2 text-xs bg-white rounded-full px-3 py-1.5 shadow-sm border border-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-slate-600">AI Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.id}
              onClick={() => setActiveTable(activeTable === stat.id ? null : stat.id)}
              className={`group relative bg-white rounded-2xl shadow-sm border transition-all duration-200 p-6 cursor-pointer hover:shadow-md hover:scale-[1.01] ${
                activeTable === stat.id 
                  ? 'border-emerald-400 ring-2 ring-emerald-200 shadow-emerald-100' 
                  : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-sm font-medium tracking-wide">{stat.label}</p>
                  <p className="text-4xl font-bold text-slate-800 mt-2 tracking-tight">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${colorClasses[stat.color]} transition-colors group-hover:scale-105`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                <Eye className="w-3.5 h-3.5" />
                <span className="font-medium">
                  {activeTable === stat.id ? 'Hide details' : 'Click to view details'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Tables Section */}
        <div className="space-y-6">
          {/* Providers Table */}
          {activeTable === 'providers' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800">Healthcare Providers</h2>
                    <p className="text-sm text-slate-500 mt-0.5">All providers in your network</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">
                    <Users className="w-3.5 h-3.5" />
                    <span>{providers.length} total</span>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/50">
                    <tr className="border-b border-slate-100">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Skills</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Experience</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {providers.slice(0, 10).map((provider: any) => (
                      <React.Fragment key={provider.id}>
                        <tr className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                <span className="text-emerald-700 text-sm font-medium">{provider.name?.charAt(0) || '?'}</span>
                              </div>
                              <span className="text-sm font-medium text-slate-800">{provider.name}</span>
                            </div>
                           </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{provider.role}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              {provider.skills?.slice(0, 2).map((s: string, i: number) => (
                                <span key={`${provider.id}-skill-${i}`} className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full">{s}</span>
                              ))}
                              {provider.skills?.length > 2 && (
                                <span className="text-xs text-slate-400 px-1">+{provider.skills.length - 2}</span>
                              )}
                            </div>
                           </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{provider.experience_years} yrs</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-medium ${
                              provider.available 
                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' 
                                : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
                            }`}>
                              {provider.available ? <><CheckCircle className="w-3 h-3" /> Available</> : <><Clock className="w-3 h-3" /> Assigned</>}
                            </span>
                            </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => toggleProviderDetails(provider.id)} className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors">
                              {expandedProviderId === provider.id ? <><ChevronUp className="w-4 h-4" /> Less</> : <><ChevronDown className="w-4 h-4" /> Details</>}
                            </button>
                            </td>
                        </tr>
                        {expandedProviderId === provider.id && (
                          <tr className="bg-slate-50/80">
                            <td colSpan={6} className="px-6 py-5">
                              <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                  <div><p className="text-xs font-medium text-slate-400">License Number</p><p className="text-sm text-slate-800 mt-1 font-mono">{provider.license_number}</p></div>
                                  <div><p className="text-xs font-medium text-slate-400">Email</p><p className="text-sm text-slate-800 mt-1">{provider.email}</p></div>
                                  <div><p className="text-xs font-medium text-slate-400">Status</p><p className={`text-sm font-medium mt-1 ${provider.available ? 'text-emerald-600' : 'text-slate-500'}`}>{provider.available ? 'Available for immediate assignment' : 'Currently on assignment'}</p></div>
                                  <div className="md:col-span-2 lg:col-span-3"><p className="text-xs font-medium text-slate-400 mb-2">All Skills</p><div className="flex flex-wrap gap-2">{provider.skills?.map((s: string, i: number) => (<span key={i} className="px-3 py-1.5 text-sm rounded-full bg-slate-100 text-slate-700 border border-slate-200">{s}</span>))}</div></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Facilities Table */}
          {activeTable === 'facilities' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div><h2 className="text-xl font-semibold text-slate-800">Partner Facilities</h2><p className="text-sm text-slate-500 mt-0.5">Healthcare facilities in your network</p></div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full"><Building2 className="w-3.5 h-3.5" /><span>{facilities.length} facilities</span></div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/50"><tr className="border-b border-slate-100"><th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th><th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Location</th><th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th><th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th></tr></thead>
                  <tbody className="divide-y divide-slate-50">{facilities.map((facility: any) => (<tr key={facility.id} className="hover:bg-slate-50/40 transition-colors"><td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center"><span className="text-amber-700 text-sm font-medium">{facility.name?.charAt(0) || '?'}</span></div><span className="text-sm font-medium text-slate-800">{facility.name}</span></div></td><td className="px-6 py-4"><div className="flex items-center gap-2 text-sm text-slate-600"><MapPin className="w-3.5 h-3.5 text-slate-400" />{facility.location}</div></td><td className="px-6 py-4"><div className="flex items-center gap-2 text-sm text-slate-500"><Mail className="w-3.5 h-3.5 text-slate-400" />{facility.email}</div></td><td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 font-medium"><CheckCircle className="w-3 h-3" />Active Partner</span></td></tr>))}</tbody>
                </table>
              </div>
            </div>
          )}

          {/* Shifts Table */}
          {activeTable === 'shifts' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div><h2 className="text-xl font-semibold text-slate-800">Open Shifts</h2><p className="text-sm text-slate-500 mt-0.5">Current shift requirements</p></div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full"><Calendar className="w-3.5 h-3.5" /><span>{shifts.length} open shifts</span></div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/50"><tr className="border-b border-slate-100"><th className="px-6 py-4 text-left text-xs font-semibold text-slate-600">Role</th><th className="px-6 py-4 text-left text-xs font-semibold text-slate-600">Facility</th><th className="px-6 py-4 text-left text-xs font-semibold text-slate-600">Date</th><th className="px-6 py-4 text-left text-xs font-semibold text-slate-600">Skills</th><th className="px-6 py-4 text-left text-xs font-semibold text-slate-600">Urgency</th></tr></thead>
                  <tbody className="divide-y divide-slate-50">{shifts.map((shift: any) => {const facility = facilities.find((f: any) => f.id === shift.facility_id); return (<tr key={shift.id} className="hover:bg-slate-50/40 transition-colors"><td className="px-6 py-4 text-sm font-medium text-slate-800">{shift.role}</td><td className="px-6 py-4 text-sm text-slate-600">{facility?.name}</td><td className="px-6 py-4 text-sm text-slate-600">{shift.shift_date ? new Date(shift.shift_date).toLocaleDateString('en-GB') : 'TBD'}</td><td className="px-6 py-4"><div className="flex flex-wrap gap-1.5">{shift.required_skills?.slice(0, 2).map((s: string, i: number) => (<span key={i} className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full">{s}</span>))}</div></td><td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-medium ${getUrgencyClass(shift.urgency)}`}>{shift.urgency === 'high' ? 'High' : shift.urgency === 'medium' ? 'Medium' : 'Low'}</span></td></tr>)})}</tbody>
                </table>
              </div>
            </div>
          )}

          {/* Available Providers Table */}
          {activeTable === 'available' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div><h2 className="text-xl font-semibold text-slate-800">Available Providers</h2><p className="text-sm text-slate-500 mt-0.5">Ready for immediate assignment</p></div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full"><CheckCircle className="w-3.5 h-3.5" /><span>{providers.filter((p: any) => p.available).length} available</span></div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/50"><tr className="border-b border-slate-100"><th className="px-6 py-4 text-left text-xs font-semibold text-slate-600">Name</th><th className="px-6 py-4 text-left text-xs font-semibold text-slate-600">Role</th><th className="px-6 py-4 text-left text-xs font-semibold text-slate-600">Skills</th><th className="px-6 py-4 text-left text-xs font-semibold text-slate-600">Experience</th><th className="px-6 py-4 text-left text-xs font-semibold text-slate-600">License</th></tr></thead>
                  <tbody className="divide-y divide-slate-50">{providers.filter((p: any) => p.available).slice(0, 10).map((provider: any) => (<tr key={provider.id} className="hover:bg-slate-50/40 transition-colors"><td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center"><span className="text-teal-700 text-sm font-medium">{provider.name?.charAt(0) || '?'}</span></div><span className="text-sm font-medium text-slate-800">{provider.name}</span></div></td><td className="px-6 py-4 text-sm text-slate-600">{provider.role}</td><td className="px-6 py-4"><div className="flex flex-wrap gap-1.5">{provider.skills?.slice(0, 2).map((s: string, i: number) => (<span key={i} className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full">{s}</span>))}</div></td><td className="px-6 py-4 text-sm text-slate-600">{provider.experience_years} yrs</td><td className="px-6 py-4"><span className="font-mono text-sm text-slate-500">{provider.license_number}</span></td></tr>))}</tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Animated AI Matching Intelligence Card - Light Grey Background with Healthcare Colors */}
        {!activeTable && (
          <div className="relative overflow-hidden bg-gray-100 rounded-2xl shadow-xl border border-gray-300 mt-8">
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-emerald-400/20 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `pulse ${2 + Math.random() * 3}s infinite`
                  }}
                />
              ))}
              <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative px-6 py-8 md:p-8">
              {/* Header - Healthcare colors */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full border border-emerald-300 shadow-sm mb-4">
                  <Brain className="w-5 h-5 text-emerald-700" />
                  <span className="text-sm font-mono text-emerald-800 font-bold tracking-wider">AI MATCHING ENGINE</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
                  Instant Intelligent Provider -to-  Facility Matching
                </h2>
                <p className="text-slate-600 text-base mt-2 max-w-2xl mx-auto font-medium">
                  Neural network connecting healthcare facilities with qualified providers in real-time
                </p>
              </div>

              {/* Animated Connection Visualization */}
              <div className="relative mb-10">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-full h-40" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="1">
                          <animate attributeName="stop-opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
                        </stop>
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="1">
                          <animate attributeName="stop-opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
                        </stop>
                      </linearGradient>
                      <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="1">
                          <animate attributeName="stop-opacity" values="1;0.3;1" dur="2.5s" repeatCount="indefinite"/>
                        </stop>
                        <stop offset="100%" stopColor="#ec4899" stopOpacity="1">
                          <animate attributeName="stop-opacity" values="0.3;1;0.3" dur="2.5s" repeatCount="indefinite"/>
                        </stop>
                      </linearGradient>
                    </defs>
                    <path d="M 0 50 L 200 50" stroke="url(#grad1)" strokeWidth="3" fill="none" strokeDasharray="5,5">
                      <animate attributeName="stroke-dashoffset" from="0" to="20" dur="1s" repeatCount="indefinite"/>
                    </path>
                    <path d="M 300 50 L 500 50" stroke="url(#grad2)" strokeWidth="3" fill="none" strokeDasharray="5,5">
                      <animate attributeName="stroke-dashoffset" from="0" to="20" dur="1s" repeatCount="indefinite"/>
                    </path>
                    <circle cx="150" cy="50" r="5" fill="#10b981">
                      <animate attributeName="cx" from="0" to="200" dur="2s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="350" cy="50" r="5" fill="#8b5cf6">
                      <animate attributeName="cx" from="300" to="500" dur="2.5s" repeatCount="indefinite"/>
                    </circle>
                  </svg>
                </div>

                {/* Nodes */}
                <div className="relative flex justify-between items-center">
                  {/* Left Node - Facilities */}
                  <div className="text-center group">
                    <div className="relative">
                      <div className={`absolute inset-0 bg-gradient-to-r ${animatedColors[animationStep % 4]} rounded-2xl blur-xl opacity-40 transition-all duration-1000`}></div>
                      <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto bg-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-emerald-400 group-hover:scale-105 transition-transform duration-300">
                        <Building2 className="w-10 h-10 md:w-14 md:h-14 text-emerald-600" />
                      </div>
                      <div className="absolute -inset-2 rounded-2xl border-2 border-emerald-400/40 animate-ping-slow"></div>
                    </div>
                    <p className="text-slate-700 font-bold mt-3 text-sm md:text-base">Facilities</p>
                    <p className="text-3xl md:text-4xl font-bold text-slate-800">{facilities.length}</p>
                    <p className="text-sm text-slate-500 font-medium">Healthcare Partners</p>
                  </div>

                  {/* Animated Processing */}
                  <div className="flex-1 flex flex-col items-center justify-center gap-3">
                    <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full border border-emerald-200 shadow-sm">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-sm font-mono text-emerald-700 font-semibold">Skills Analysis</span>
                      <ArrowRight className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full border border-purple-200 shadow-sm">
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                      <span className="text-sm font-mono text-purple-700 font-semibold">Geo Matching</span>
                      <ArrowRight className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full border border-cyan-200 shadow-sm">
                      <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                      <span className="text-sm font-mono text-cyan-700 font-semibold">Availability Check</span>
                      <ArrowRight className="w-4 h-4 text-cyan-500" />
                    </div>
                  </div>

                  {/* Right Node - Providers */}
                  <div className="text-center group">
                    <div className="relative">
                      <div className={`absolute inset-0 bg-gradient-to-r ${animatedColors[(animationStep + 2) % 4]} rounded-2xl blur-xl opacity-40 transition-all duration-1000`}></div>
                      <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto bg-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-cyan-400 group-hover:scale-105 transition-transform duration-300">
                        <Users className="w-10 h-10 md:w-14 md:h-14 text-cyan-600" />
                      </div>
                      <div className="absolute -inset-2 rounded-2xl border-2 border-cyan-400/40 animate-ping-slow" style={{ animationDelay: '0.5s' }}></div>
                    </div>
                    <p className="text-slate-700 font-bold mt-3 text-sm md:text-base">Providers</p>
                    <p className="text-3xl md:text-4xl font-bold text-slate-800">{providers.length}</p>
                    <p className="text-sm text-slate-500 font-medium">Qualified Professionals</p>
                  </div>
                </div>
              </div>

              {/* Three Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-emerald-100 rounded-xl"><Target className="w-5 h-5 text-emerald-700" /></div>
                    <span className="text-base font-bold text-slate-800">Smart Ranking Algorithm</span>
                  </div>
                  <p className="text-sm text-slate-600">Multi-factor scoring based on skill relevance, experience, proximity, and availability.</p>
                  <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="w-3/4 h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div></div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-100 rounded-xl"><Activity className="w-5 h-5 text-purple-700" /></div>
                    <span className="text-base font-bold text-slate-800">Real-time Processing</span>
                  </div>
                  <p className="text-sm text-slate-600">Live sync with provider availability and facility updates for instant matching.</p>
                  <div className="mt-4 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div><span className="text-xs text-slate-500 font-medium">Live data stream active</span></div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-cyan-100 rounded-xl"><Gem className="w-5 h-5 text-cyan-700" /></div>
                    <span className="text-base font-bold text-slate-800">Quality Optimization</span>
                  </div>
                  <p className="text-sm text-slate-600">Prioritizing long-term fit to reduce turnover and improve patient care.</p>
                </div>
              </div>

              {/* Match Rate Footer */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2"><h4 className="font-bold text-slate-800 text-lg">Current Matching Potential</h4><span className="text-xs bg-emerald-100 px-2 py-0.5 rounded-full text-emerald-700 font-bold border border-emerald-200">Neural Net Active</span></div>
                    <p className="text-sm text-slate-500 mt-1">{providers.filter(p => p.available).length} providers available for {shifts.length} open shifts</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right"><p className="text-4xl md:text-5xl font-bold text-slate-800">{avgMatchRate}%</p><p className="text-sm text-slate-500 font-medium">match accuracy</p></div>
                    <div className="relative w-40 md:w-48 bg-slate-200 rounded-full h-4 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 h-full rounded-full transition-all duration-1000" style={{ width: `${avgMatchRate}%` }}><div className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg animate-pulse border border-emerald-300"></div></div>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>

            {/* Animated bottom border */}
            <div className="h-1 bg-gradient-to-r from-emerald-400 via-purple-400 to-cyan-400 w-full animate-shimmer"></div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
        }
        @keyframes ping-slow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0; transform: scale(1.3); }
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}