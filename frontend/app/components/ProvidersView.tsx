'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, Users, Star, Mail, Award, Calendar, Clock, X, CheckCircle, Briefcase } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ProvidersView({ providers }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [assignments, setAssignments] = useState<{ [key: number]: number }>({});
  const [loadingAssignments, setLoadingAssignments] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get(`${API_URL}/matches`);
      const matches = response.data;
      const counts: { [key: number]: number } = {};
      matches.forEach((match: any) => {
        if (match.status === 'accepted') {
          counts[match.provider_id] = (counts[match.provider_id] || 0) + 1;
        }
      });
      setAssignments(counts);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const uniqueRoles = [...new Set(providers.map((p: any) => p.role).filter(Boolean))] as string[];

  const filteredProviders = providers.filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.skills?.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = !selectedRole || p.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getProviderRating = (experience: number, available: boolean) => {
    const baseRating = 4.0;
    const experienceBonus = Math.min(0.5, experience / 20);
    const availabilityBonus = available ? 0.2 : 0;
    return Math.min(5, baseRating + experienceBonus + availabilityBonus);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-amber-400 fill-amber-400" />
        ))}
        {hasHalfStar && (
          <Star className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-amber-400 fill-amber-400" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={i} className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-gray-300" />
        ))}
      </div>
    );
  };

  const handleViewDetails = (provider: any) => {
    setSelectedProvider(provider);
    setShowModal(true);
  };

  const getAssignedShiftsCount = (providerId: number) => {
    return assignments[providerId] || 0;
  };

  const getStatusBadge = (available: boolean, providerId: number) => {
    const assignmentCount = getAssignedShiftsCount(providerId);
    
    if (available) {
      return {
        badge: <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs rounded-full bg-emerald-100 text-emerald-700">Available</span>,
        modalText: "Ready for instant matching"
      };
    } else if (assignmentCount > 0) {
      return {
        badge: <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs rounded-full bg-blue-100 text-blue-700">On Assignment</span>,
        modalText: `Currently on Assignment (${assignmentCount} active)`
      };
    } else {
      return {
        badge: <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs rounded-full bg-amber-100 text-amber-700">Unavailable</span>,
        modalText: "Temporarily Unavailable"
      };
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-4 sm:mb-5 md:mb-6">
        <div className="flex items-center gap-2 mb-1 sm:mb-2">
          <div className="w-1 h-6 sm:h-7 md:h-8 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Provider Network</h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-500">Qualified healthcare professionals ready for instant matching</p>
      </div>

      {/* Stats Overview - Responsive grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-100 p-2 sm:p-3 text-center shadow-sm">
          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-base sm:text-lg md:text-xl font-bold text-gray-800">{providers.length}</p>
          <p className="text-[10px] sm:text-xs text-gray-500">Total Providers</p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-100 p-2 sm:p-3 text-center shadow-sm">
          <Award className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-base sm:text-lg md:text-xl font-bold text-gray-800">{uniqueRoles.length}</p>
          <p className="text-[10px] sm:text-xs text-gray-500">Specialties</p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-100 p-2 sm:p-3 text-center shadow-sm">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-base sm:text-lg md:text-xl font-bold text-gray-800">{providers.filter((p: any) => p.available).length}</p>
          <p className="text-[10px] sm:text-xs text-gray-500">Available Now</p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-100 p-2 sm:p-3 text-center shadow-sm">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-base sm:text-lg md:text-xl font-bold text-gray-800">
            {Math.round(providers.reduce((acc: number, p: any) => acc + p.experience_years, 0) / providers.length)} yrs
          </p>
          <p className="text-[10px] sm:text-xs text-gray-500">Avg Experience</p>
        </div>
      </div>

      {/* Search and Filter Row - Responsive */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, role, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-xs sm:text-sm"
          />
        </div>
        
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-3 sm:px-4 py-1.5 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-xs sm:text-sm min-w-[120px] sm:min-w-[150px]"
        >
          <option value="">All Roles</option>
          {uniqueRoles.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      {/* Providers Grid - Responsive: 1 col on mobile, 2 on tablet, 3 on desktop */}
      {filteredProviders.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-white rounded-lg sm:rounded-xl border border-gray-100">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Users className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-1 sm:mb-2">No providers found</h3>
          <p className="text-xs sm:text-sm text-gray-500">Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredProviders.map((provider: any) => {
            const rating = getProviderRating(provider.experience_years, provider.available);
            const assignmentCount = getAssignedShiftsCount(provider.id);
            const statusInfo = getStatusBadge(provider.available, provider.id);
            
            return (
              <div
                key={provider.id}
                className="group bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 overflow-hidden hover:scale-[1.01] sm:hover:scale-[1.02]"
              >
                <div className="h-1 sm:h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
                
                <div className="p-3 sm:p-4 md:p-5">
                  <div className="flex justify-between items-start gap-2 mb-2 sm:mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-base md:text-lg group-hover:text-emerald-600 transition truncate">
                        {provider.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-emerald-600 font-medium mt-0.5 truncate">{provider.role}</p>
                      <div className="flex items-center gap-1 sm:gap-2 mt-1">
                        {renderStars(rating)}
                        <span className="text-[10px] sm:text-xs text-gray-500">{provider.experience_years} years exp</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {statusInfo.badge}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2 sm:mt-3">
                    {provider.skills?.slice(0, 3).map((skill: string, i: number) => (
                      <span key={i} className="px-1.5 py-0.5 text-[9px] sm:text-xs rounded-full bg-gray-100 text-gray-600 truncate max-w-[100px] sm:max-w-none">
                        {skill}
                      </span>
                    ))}
                    {provider.skills?.length > 3 && (
                      <span className="px-1.5 py-0.5 text-[9px] sm:text-xs rounded-full bg-gray-100 text-gray-500">
                        +{provider.skills.length - 3}
                      </span>
                    )}
                  </div>

                  {assignmentCount > 0 && !loadingAssignments && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] sm:text-xs text-gray-500">
                      <Briefcase className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span>{assignmentCount} assignment{assignmentCount !== 1 ? 's' : ''} completed</span>
                    </div>
                  )}

                  <div className="mt-2 sm:mt-3 flex items-center justify-between">
                    <button
                      onClick={() => setExpandedId(expandedId === provider.id ? null : provider.id)}
                      className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      {expandedId === provider.id ? <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />}
                      {expandedId === provider.id ? 'Show less' : 'Show details'}
                    </button>
                    
                    <button
                      onClick={() => handleViewDetails(provider)}
                      className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-medium opacity-0 group-hover:opacity-100 transition"
                    >
                      View Profile →
                    </button>
                  </div>

                  {expandedId === provider.id && (
                    <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100 space-y-1.5 sm:space-y-2">
                      <p className="text-xs sm:text-sm text-gray-700 break-all">
                        <span className="font-bold text-gray-800">License:</span> {provider.license_number}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-700">
                        <span className="font-bold text-gray-800">Experience:</span> {provider.experience_years} years
                      </p>
                      <p className="text-xs sm:text-sm text-gray-700 break-all">
                        <span className="font-bold text-gray-800">Email:</span> {provider.email}
                      </p>
                      {assignmentCount > 0 && !loadingAssignments && (
                        <p className="text-xs sm:text-sm text-gray-700">
                          <span className="font-bold text-gray-800">Assignments:</span> {assignmentCount} completed
                        </p>
                      )}
                      <p className="text-xs sm:text-sm text-gray-700">
                        <span className="font-bold text-gray-800">All Skills:</span>
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {provider.skills?.map((skill: string, i: number) => (
                          <span key={i} className="px-1.5 py-0.5 text-[10px] sm:text-xs rounded-full bg-gray-100 text-gray-600">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer note */}
      {filteredProviders.length > 0 && (
        <div className="mt-4 sm:mt-5 md:mt-6 text-center text-[10px] sm:text-xs text-gray-400">
          Showing {filteredProviders.length} of {providers.length} providers
        </div>
      )}

      {/* Provider Details Modal - Responsive */}
      {showModal && selectedProvider && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-[95%] sm:max-w-lg md:max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white p-3 sm:p-4 md:p-6 border-b border-gray-100 flex justify-between items-center">
              <div className="pr-2">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">{selectedProvider.name}</h2>
                <p className="text-xs sm:text-sm text-emerald-600 mt-0.5">{selectedProvider.role}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 flex-shrink-0" />
                <span className="font-bold text-gray-800 text-xs sm:text-sm">Status:</span>
                <span className={`text-xs sm:text-sm ${selectedProvider.available ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {selectedProvider.available ? 'Available for Matching' : 'On Assignment'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                <span className="font-bold text-gray-800 text-xs sm:text-sm">License:</span>
                <span className="text-xs sm:text-sm text-gray-700 break-all">{selectedProvider.license_number}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                <span className="font-bold text-gray-800 text-xs sm:text-sm">Experience:</span>
                <span className="text-xs sm:text-sm text-gray-700">{selectedProvider.experience_years} years</span>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                <span className="font-bold text-gray-800 text-xs sm:text-sm">Email:</span>
                <a href={`mailto:${selectedProvider.email}`} className="text-emerald-600 hover:underline text-xs sm:text-sm break-all">
                  {selectedProvider.email}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                <span className="font-bold text-gray-800 text-xs sm:text-sm">Assignments:</span>
                <span className="text-xs sm:text-sm text-gray-700">{getAssignedShiftsCount(selectedProvider.id)} completed</span>
              </div>

              <div className="pt-3 sm:pt-4 border-t border-gray-100">
                <h3 className="font-bold text-gray-800 text-sm sm:text-base mb-1 sm:mb-2">Professional Summary</h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {selectedProvider.name} is a {selectedProvider.role} with {selectedProvider.experience_years} years 
                  of experience specializing in {selectedProvider.skills?.slice(0, 3).join(', ')}. 
                  Licensed under {selectedProvider.license_number}.
                </p>
              </div>

              <div className="pt-2">
                <h3 className="font-bold text-gray-800 text-sm sm:text-base mb-2">Core Competencies</h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {selectedProvider.skills?.map((skill: string, i: number) => (
                    <span key={i} className="px-1.5 py-1 text-[10px] sm:text-xs rounded-full bg-gray-100 text-gray-700">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap justify-between items-center gap-3 pt-3 sm:pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="text-center">
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-600">{selectedProvider.experience_years}+</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">Years Exp</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-600">{selectedProvider.skills?.length || 0}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">Skills</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-600">{getAssignedShiftsCount(selectedProvider.id)}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">Assignments</p>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-amber-400">
                  {selectedProvider.available ? 'Ready for instant matching' : 'Currently on assignment'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}