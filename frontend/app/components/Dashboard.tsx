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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        
        {/* Welcome Header */}
<div className="mb-6 sm:mb-8">
  <div className="flex flex-col gap-4">
    {/* AI Matching Description - Moved to Top */}
    <div className="text-center">
      
      <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 px-2">
        Instant Intelligent Provider -to- Facility Matching
      </h2>
     
    </div>

    {/* Stats and Badges Row */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mt-2">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs bg-white rounded-full px-2 sm:px-3 py-1 sm:py-1.5 shadow-sm border border-slate-200">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-slate-600">Instant Matching</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs bg-white rounded-full px-2 sm:px-3 py-1 sm:py-1.5 shadow-sm border border-slate-200">
          <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-amber-500" />
          <span className="text-slate-600">AI Active</span>
        </div>
      </div>
      
      {/* Optional: Add a small stats summary here if needed */}
      <div className="text-xs text-slate-400">
        {providers.length} Providers • {facilities.length} Facilities • {shifts.length} Open Shifts
      </div>
    </div>
  </div>
</div>

        {/* Stats Grid - Responsive: 2 cols on mobile, 4 cols on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          {stats.map((stat) => (
            <div
              key={stat.id}
              onClick={() => setActiveTable(activeTable === stat.id ? null : stat.id)}
              className={`group relative bg-white rounded-xl sm:rounded-2xl shadow-sm border transition-all duration-200 p-3 sm:p-4 md:p-6 cursor-pointer hover:shadow-md hover:scale-[1.01] ${
                activeTable === stat.id 
                  ? 'border-emerald-400 ring-2 ring-emerald-200 shadow-emerald-100' 
                  : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium tracking-wide">{stat.label}</p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mt-1 sm:mt-2 tracking-tight">{stat.value}</p>
                </div>
                <div className={`p-2 sm:p-3 rounded-xl ${colorClasses[stat.color]} transition-colors group-hover:scale-105`}>
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 md:mt-4 flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-slate-400">
                <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="font-medium">
                  {activeTable === stat.id ? 'Hide details' : 'Click to view details'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Tables Section - Responsive overflow */}
        <div className="space-y-4 sm:space-y-6">
          {/* Providers Table */}
          {activeTable === 'providers' && (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-slate-800">Healthcare Providers</h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">All providers in your network</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full self-start sm:self-auto">
                    <Users className="w-3.5 h-3.5" />
                    <span>{providers.length} total</span>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-slate-50/50">
                    <tr className="border-b border-slate-100">
                      <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                      <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden sm:table-cell">Role</th>
                      <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden md:table-cell">Skills</th>
                      <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden lg:table-cell">Experience</th>
                      <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                      <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {providers.slice(0, 5).map((provider: any) => (
                      <React.Fragment key={provider.id}>
                        <tr className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-emerald-700 text-xs sm:text-sm font-medium">{provider.name?.charAt(0) || '?'}</span>
                              </div>
                              <span className="text-xs sm:text-sm font-medium text-slate-800 truncate max-w-[100px] sm:max-w-none">{provider.name}</span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600 hidden sm:table-cell">{provider.role}</td>
                          <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 hidden md:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {provider.skills?.slice(0, 2).map((s: string, i: number) => (
                                <span key={`${provider.id}-skill-${i}`} className="px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-600 rounded-full truncate max-w-[80px]">{s}</span>
                              ))}
                              {provider.skills?.length > 2 && (
                                <span className="text-[10px] text-slate-400 px-1">+{provider.skills.length - 2}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600 hidden lg:table-cell">{provider.experience_years} yrs</td>
                          <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs rounded-full font-medium ${
                              provider.available 
                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' 
                                : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
                            }`}>
                              {provider.available ? <><CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> <span className="hidden sm:inline">Available</span></> : <><Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Assigned</>}
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-right">
                            <button onClick={() => toggleProviderDetails(provider.id)} className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-xs sm:text-sm font-medium transition-colors">
                              {expandedProviderId === provider.id ? <><ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" /> Less</> : <><ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" /> Details</>}
                            </button>
                          </td>
                        </tr>
                        {expandedProviderId === provider.id && (
                          <tr className="bg-slate-50/80">
                            <td colSpan={6} className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                              <div className="rounded-lg sm:rounded-xl bg-white border border-slate-200 shadow-sm p-3 sm:p-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                  <div><p className="text-[10px] sm:text-xs font-medium text-slate-400">License Number</p><p className="text-xs sm:text-sm text-slate-800 mt-1 font-mono break-all">{provider.license_number}</p></div>
                                  <div><p className="text-[10px] sm:text-xs font-medium text-slate-400">Email</p><p className="text-xs sm:text-sm text-slate-800 mt-1 break-all">{provider.email}</p></div>
                                  <div><p className="text-[10px] sm:text-xs font-medium text-slate-400">Status</p><p className={`text-xs sm:text-sm font-medium mt-1 ${provider.available ? 'text-emerald-600' : 'text-slate-500'}`}>{provider.available ? 'Available for immediate assignment' : 'Currently on assignment'}</p></div>
                                  <div className="sm:col-span-2"><p className="text-[10px] sm:text-xs font-medium text-slate-400 mb-2">All Skills</p><div className="flex flex-wrap gap-1.5 sm:gap-2">{provider.skills?.map((s: string, i: number) => (<span key={i} className="px-2 py-1 text-[10px] sm:text-xs rounded-full bg-slate-100 text-slate-700 border border-slate-200">{s}</span>))}</div></div>
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

          {/* Facilities Table - Simplified for mobile */}
          {activeTable === 'facilities' && (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div><h2 className="text-lg sm:text-xl font-semibold text-slate-800">Partner Facilities</h2><p className="text-xs sm:text-sm text-slate-500 mt-0.5">Healthcare facilities in your network</p></div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full self-start sm:self-auto"><Building2 className="w-3.5 h-3.5" /><span>{facilities.length} facilities</span></div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead className="bg-slate-50/50"><tr className="border-b border-slate-100"><th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs font-semibold text-slate-600">Name</th><th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs font-semibold text-slate-600 hidden sm:table-cell">Location</th><th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs font-semibold text-slate-600 hidden md:table-cell">Email</th><th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs font-semibold text-slate-600">Status</th></tr></thead>
                  <tbody className="divide-y divide-slate-50">{facilities.slice(0, 8).map((facility: any) => (<tr key={facility.id} className="hover:bg-slate-50/40 transition-colors"><td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4"><div className="flex items-center gap-2 sm:gap-3"><div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0"><span className="text-amber-700 text-xs sm:text-sm font-medium">{facility.name?.charAt(0) || '?'}</span></div><span className="text-xs sm:text-sm font-medium text-slate-800 truncate max-w-[120px] sm:max-w-none">{facility.name}</span></div></td><td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600 hidden sm:table-cell">{facility.location}</td><td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-500 hidden md:table-cell truncate max-w-[150px]">{facility.email}</td><td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4"><span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 font-medium"><CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />Active</span></td></tr>))}</tbody>
                </table>
              </div>
            </div>
          )}

          {/* Shifts Table */}
          {activeTable === 'shifts' && (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div><h2 className="text-lg sm:text-xl font-semibold text-slate-800">Open Shifts</h2><p className="text-xs sm:text-sm text-slate-500 mt-0.5">Current shift requirements</p></div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full self-start sm:self-auto"><Calendar className="w-3.5 h-3.5" /><span>{shifts.length} open shifts</span></div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-slate-50/50"><tr className="border-b border-slate-100"><th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs font-semibold text-slate-600">Role</th><th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs font-semibold text-slate-600 hidden sm:table-cell">Facility</th><th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs font-semibold text-slate-600 hidden md:table-cell">Date</th><th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs font-semibold text-slate-600 hidden lg:table-cell">Skills</th><th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs font-semibold text-slate-600">Urgency</th></tr></thead>
                  <tbody className="divide-y divide-slate-50">{shifts.slice(0, 6).map((shift: any) => {const facility = facilities.find((f: any) => f.id === shift.facility_id); return (<tr key={shift.id} className="hover:bg-slate-50/40 transition-colors"><td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-slate-800">{shift.role}</td><td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600 hidden sm:table-cell">{facility?.name}</td><td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600 hidden md:table-cell">{shift.shift_date ? new Date(shift.shift_date).toLocaleDateString('en-GB') : 'TBD'}</td><td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 hidden lg:table-cell"><div className="flex flex-wrap gap-1">{shift.required_skills?.slice(0, 2).map((s: string, i: number) => (<span key={i} className="px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-600 rounded-full truncate max-w-[80px]">{s}</span>))}</div></td><td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4"><span className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs rounded-full font-medium ${getUrgencyClass(shift.urgency)}`}>{shift.urgency === 'high' ? 'High' : shift.urgency === 'medium' ? 'Med' : 'Low'}</span></td></tr>)})}</tbody>
                </table>
              </div>
            </div>
          )}

          {/* Available Providers Table */}
          {activeTable === 'available' && (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div><h2 className="text-lg sm:text-xl font-semibold text-slate-800">Available Providers</h2><p className="text-xs sm:text-sm text-slate-500 mt-0.5">Ready for immediate assignment</p></div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full self-start sm:self-auto"><CheckCircle className="w-3.5 h-3.5" /><span>{providers.filter((p: any) => p.available).length} available</span></div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-slate-50/50"><tr className="border-b border-slate-100"><th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs font-semibold text-slate-600">Name</th><th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs font-semibold text-slate-600 hidden sm:table-cell">Role</th><th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs font-semibold text-slate-600 hidden md:table-cell">Skills</th><th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs font-semibold text-slate-600 hidden lg:table-cell">Experience</th><th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs font-semibold text-slate-600">License</th></tr></thead>
                  <tbody className="divide-y divide-slate-50">{providers.filter((p: any) => p.available).slice(0, 5).map((provider: any) => (<tr key={provider.id} className="hover:bg-slate-50/40 transition-colors"><td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4"><div className="flex items-center gap-2 sm:gap-3"><div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0"><span className="text-teal-700 text-xs sm:text-sm font-medium">{provider.name?.charAt(0) || '?'}</span></div><span className="text-xs sm:text-sm font-medium text-slate-800 truncate max-w-[100px] sm:max-w-none">{provider.name}</span></div></td><td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600 hidden sm:table-cell">{provider.role}</td><td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 hidden md:table-cell"><div className="flex flex-wrap gap-1">{provider.skills?.slice(0, 2).map((s: string, i: number) => (<span key={i} className="px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-600 rounded-full">{s}</span>))}</div></td><td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600 hidden lg:table-cell">{provider.experience_years} yrs</td><td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4"><span className="font-mono text-[10px] sm:text-xs text-slate-500">{provider.license_number}</span></td></tr>))}</tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Animated AI Matching Intelligence Card - Made Responsive */}
        {!activeTable && (
          <div className="relative overflow-hidden bg-gray-100 rounded-xl sm:rounded-2xl shadow-xl border border-gray-300 mt-6 sm:mt-8">
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 sm:w-1.5 sm:h-1.5 bg-emerald-400/20 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `pulse ${2 + Math.random() * 3}s infinite`
                  }}
                />
              ))}
              <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-72 sm:h-72 bg-emerald-400/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-1/4 right-1/4 w-56 h-56 sm:w-80 sm:h-80 bg-cyan-400/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative px-4 sm:px-6 py-6 sm:py-8">
              {/* Header */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-emerald-100 rounded-full border border-emerald-300 shadow-sm mb-3 sm:mb-4">
                  <Brain className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-emerald-700" />
                  <span className="text-[10px] sm:text-xs md:text-sm font-mono text-emerald-800 font-bold tracking-wider">AI MATCHING ENGINE</span>
                </div>
               
                <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2 max-w-2xl mx-auto font-medium px-3">
                  Neural network connecting healthcare facilities with qualified providers in real-time
                </p>
              </div>

              {/* Animated Connection Visualization - Responsive layout */}
              <div className="relative mb-8 sm:mb-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-4">
                  {/* Left Node - Facilities */}
                  <div className="text-center w-full md:w-auto">
                    <div className="relative">
                      <div className={`absolute inset-0 bg-gradient-to-r ${animatedColors[animationStep % 4]} rounded-xl sm:rounded-2xl blur-xl opacity-40 transition-all duration-1000`}></div>
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 mx-auto bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg border-2 border-emerald-400">
                        <Building2 className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-emerald-600" />
                      </div>
                    </div>
                    <p className="text-slate-700 font-bold mt-2 text-sm md:text-base">Facilities</p>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800">{facilities.length}</p>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">Healthcare Partners</p>
                  </div>

                  {/* Mobile: Processing steps stacked */}
                  <div className="flex-1 flex flex-col items-center justify-center gap-2 sm:gap-3 w-full max-w-[280px] mx-auto md:mx-0">
                    <div className="flex items-center justify-center gap-2 w-full bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-emerald-200 shadow-sm">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-xs sm:text-sm font-mono text-emerald-700 font-semibold">Skills Analysis</span>
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
                    </div>
                    <div className="flex items-center justify-center gap-2 w-full bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-purple-200 shadow-sm">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                      <span className="text-xs sm:text-sm font-mono text-purple-700 font-semibold">Geo Matching</span>
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                    </div>
                    <div className="flex items-center justify-center gap-2 w-full bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-cyan-200 shadow-sm">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyan-500 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                      <span className="text-xs sm:text-sm font-mono text-cyan-700 font-semibold">Availability Check</span>
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-500" />
                    </div>
                  </div>

                  {/* Right Node - Providers */}
                  <div className="text-center w-full md:w-auto">
                    <div className="relative">
                      <div className={`absolute inset-0 bg-gradient-to-r ${animatedColors[(animationStep + 2) % 4]} rounded-xl sm:rounded-2xl blur-xl opacity-40 transition-all duration-1000`}></div>
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 mx-auto bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg border-2 border-cyan-400">
                        <Users className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-cyan-600" />
                      </div>
                    </div>
                    <p className="text-slate-700 font-bold mt-2 text-sm md:text-base">Providers</p>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800">{providers.length}</p>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">Qualified Professionals</p>
                  </div>
                </div>
              </div>

              {/* Three Pillars - Responsive grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 mb-6 sm:mb-8">
                <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2"><div className="p-1.5 sm:p-2 bg-emerald-100 rounded-lg"><Target className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" /></div><span className="text-sm sm:text-base font-bold text-slate-800">Smart Ranking</span></div>
                  <p className="text-xs sm:text-sm text-slate-600">Multi-factor scoring based on skill relevance, experience, proximity.</p>
                </div>
                <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2"><div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg"><Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-700" /></div><span className="text-sm sm:text-base font-bold text-slate-800">Real-time Sync</span></div>
                  <p className="text-xs sm:text-sm text-slate-600">Live availability tracking for instant matching.</p>
                  <div className="mt-2 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div><span className="text-[10px] sm:text-xs text-slate-500">Instnt Matches</span></div>
                </div>
                <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2"><div className="p-1.5 sm:p-2 bg-cyan-100 rounded-lg"><Gem className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-700" /></div><span className="text-sm sm:text-base font-bold text-slate-800">Quality First</span></div>
                  <p className="text-xs sm:text-sm text-slate-600">Prioritizing long-term fit for better patient care.</p>
                </div>
              </div>

              {/* Match Rate Footer */}
              <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap"><h4 className="font-bold text-slate-800 text-sm sm:text-base md:text-lg">Matching Potential</h4><span className="text-[10px] sm:text-xs bg-emerald-100 px-1.5 sm:px-2 py-0.5 rounded-full text-emerald-700 font-bold">Neural Net Active</span></div>
                    <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{providers.filter(p => p.available).length} providers for {shifts.length} shifts</p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="text-right"><p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800">{avgMatchRate}%</p><p className="text-[10px] sm:text-xs text-slate-500">accuracy</p></div>
                    <div className="relative w-28 sm:w-36 md:w-40 lg:w-48 bg-slate-200 rounded-full h-2 sm:h-3 md:h-4 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 h-full rounded-full transition-all duration-1000" style={{ width: `${avgMatchRate}%` }}><div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-white rounded-full shadow-lg animate-pulse border border-emerald-300"></div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Animated bottom border */}
            <div className="h-0.5 sm:h-1 bg-gradient-to-r from-emerald-400 via-purple-400 to-cyan-400 animate-shimmer"></div>
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