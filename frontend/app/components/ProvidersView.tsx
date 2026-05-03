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

  // Fetch assignments count for each provider
  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get(`${API_URL}/matches`);
      const matches = response.data;
      
      // Count accepted matches per provider
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

  // ✅ FIXED: Added type assertion and filter to ensure string[] type
  const uniqueRoles: string[] = [...new Set(providers.map((p: any) => p.role).filter(Boolean))];

  const filteredProviders = providers.filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.skills?.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = !selectedRole || p.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  // Get provider rating (based on experience and availability)
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
          <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
        ))}
        {hasHalfStar && (
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={i} className="w-3 h-3 text-gray-300" />
        ))}
      </div>
    );
  };

  const handleViewDetails = (provider: any) => {
    setSelectedProvider(provider);
    setShowModal(true);
  };

  // Get provider's assignment count from API data
  const getAssignedShiftsCount = (providerId: number) => {
    return assignments[providerId] || 0;
  };

  // Get status badge and text
  const getStatusBadge = (available: boolean, providerId: number) => {
    const assignmentCount = getAssignedShiftsCount(providerId);
    
    if (available) {
      return {
        badge: <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700">Available for Matching</span>,
        modalText: "Ready for instant matching"
      };
    } else if (assignmentCount > 0) {
      return {
        badge: <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">On Assignment</span>,
        modalText: `Currently on Assignment (${assignmentCount} active)`
      };
    } else {
      return {
        badge: <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700">Unavailable</span>,
        modalText: "Temporarily Unavailable"
      };
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Provider Network</h1>
        </div>
        <p className="text-gray-500 text-sm">Qualified healthcare professionals ready for instant matching</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
          <Users className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-800">{providers.length}</p>
          <p className="text-xs text-gray-500">Total Providers</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
          <Award className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-800">{uniqueRoles.length}</p>
          <p className="text-xs text-gray-500">Specialties</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
          <Clock className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-800">{providers.filter((p: any) => p.available).length}</p>
          <p className="text-xs text-gray-500">Available Now</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
          <Calendar className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-800">
            {Math.round(providers.reduce((acc: number, p: any) => acc + p.experience_years, 0) / providers.length)} yrs
          </p>
          <p className="text-xs text-gray-500">Avg Experience</p>
        </div>
      </div>

      {/* Search and Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, role, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-sm"
          />
        </div>
        
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-sm min-w-[150px]"
        >
          <option value="">All Roles</option>
          {/* ✅ FIXED: Removed explicit string type annotation */}
          {uniqueRoles.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      {/* Providers Grid */}
      {filteredProviders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No providers found</h3>
          <p className="text-gray-500">Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProviders.map((provider: any) => {
            const rating = getProviderRating(provider.experience_years, provider.available);
            const assignmentCount = getAssignedShiftsCount(provider.id);
            const statusInfo = getStatusBadge(provider.available, provider.id);
            
            return (
              <div
                key={provider.id}
                className="group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 overflow-hidden hover:scale-[1.02]"
              >
                <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg group-hover:text-emerald-600 transition">
                        {provider.name}
                      </h3>
                      <p className="text-sm text-emerald-600 font-medium mt-0.5">{provider.role}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(rating)}
                        <span className="text-xs text-gray-500">{provider.experience_years} years exp</span>
                      </div>
                    </div>
                    {statusInfo.badge}
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-3">
                    {provider.skills?.slice(0, 3).map((skill: string, i: number) => (
                      <span key={i} className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                        {skill}
                      </span>
                    ))}
                    {provider.skills?.length > 3 && (
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-500">
                        +{provider.skills.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Show assignment count if > 0 */}
                  {assignmentCount > 0 && !loadingAssignments && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                      <Briefcase className="w-3 h-3" />
                      <span>{assignmentCount} assignment{assignmentCount !== 1 ? 's' : ''} completed</span>
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <button
                      onClick={() => setExpandedId(expandedId === provider.id ? null : provider.id)}
                      className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      {expandedId === provider.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {expandedId === provider.id ? 'Show less' : 'Show details'}
                    </button>
                    
                    <button
                      onClick={() => handleViewDetails(provider)}
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium opacity-0 group-hover:opacity-100 transition"
                    >
                      View Profile →
                    </button>
                  </div>

                  {expandedId === provider.id && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                      <p className="text-sm text-gray-700">
                        <span className="font-bold text-gray-800">License:</span> {provider.license_number}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-bold text-gray-800">Experience:</span> {provider.experience_years} years
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-bold text-gray-800">Email:</span> {provider.email}
                      </p>
                      {assignmentCount > 0 && !loadingAssignments && (
                        <p className="text-sm text-gray-700">
                          <span className="font-bold text-gray-800">Assignments:</span> {assignmentCount} completed
                        </p>
                      )}
                      <p className="text-sm text-gray-700">
                        <span className="font-bold text-gray-800">All Skills:</span>
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {provider.skills?.map((skill: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
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
        <div className="mt-6 text-center text-xs text-gray-400">
          Showing {filteredProviders.length} of {providers.length} providers
        </div>
      )}

      {/* Provider Details Modal */}
      {showModal && selectedProvider && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{selectedProvider.name}</h2>
                <p className="text-sm text-emerald-600 mt-0.5">{selectedProvider.role}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="font-bold text-gray-800">Status:</span>
                <span className={selectedProvider.available ? 'text-emerald-600' : 'text-amber-600'}>
                  {selectedProvider.available ? 'Available for Matching' : 'On Assignment'}
                </span>
              </div>

              {/* License */}
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-gray-400" />
                <span className="font-bold text-gray-800">License:</span>
                <span className="text-gray-700">{selectedProvider.license_number}</span>
              </div>

              {/* Experience */}
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="font-bold text-gray-800">Experience:</span>
                <span className="text-gray-700">{selectedProvider.experience_years} years</span>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="font-bold text-gray-800">Email:</span>
                <a href={`mailto:${selectedProvider.email}`} className="text-emerald-600 hover:underline">
                  {selectedProvider.email}
                </a>
              </div>

              {/* Assignments Count */}
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <span className="font-bold text-gray-800">Assignments:</span>
                <span className="text-gray-700">{getAssignedShiftsCount(selectedProvider.id)} completed</span>
              </div>

              {/* Professional Summary */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="font-bold text-gray-800 mb-2">Professional Summary</h3>
                <p className="text-gray-600 text-sm">
                  {selectedProvider.name} is a {selectedProvider.role} with {selectedProvider.experience_years} years 
                  of experience specializing in {selectedProvider.skills?.slice(0, 3).join(', ')}. 
                  Licensed under {selectedProvider.license_number}.
                </p>
              </div>

              {/* Skills Section */}
              <div className="pt-2">
                <h3 className="font-bold text-gray-800 mb-2">Core Competencies</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProvider.skills?.map((skill: string, i: number) => (
                    <span key={i} className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats Footer */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-600">{selectedProvider.experience_years}+</p>
                    <p className="text-xs text-gray-500">Years Exp</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-600">{selectedProvider.skills?.length || 0}</p>
                    <p className="text-xs text-gray-500">Skills</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-600">{getAssignedShiftsCount(selectedProvider.id)}</p>
                    <p className="text-xs text-gray-500">Assignments</p>
                  </div>
                </div>
                <div className="text-sm text-amber-400">
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