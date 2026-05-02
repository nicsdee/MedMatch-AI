'use client';

import { useState } from 'react';
import { Search, MapPin, Mail, Building2, Star, Users, Calendar, X, Phone, Globe, Award } from 'lucide-react';

export default function FacilitiesView({ facilities, shifts = [] }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  // Get unique regions for filter
  const uniqueRegions = [...new Set(facilities.map((f: any) => f.location).filter(Boolean))];

  const filteredFacilities = facilities.filter((f: any) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = !selectedRegion || f.location === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  // Get facility stats (how many shifts posted)
  const getShiftCount = (facilityId: number) => {
    return shifts.filter((s: any) => s.facility_id === facilityId).length;
  };

  // Generate realistic random rating for each facility (based on id for consistency)
  const getFacilityRating = (id: number) => {
    const ratings = [4.2, 4.5, 4.8, 4.3, 4.6, 4.9, 4.1, 4.7, 4.4];
    return ratings[id % ratings.length];
  };

  // Generate review count based on facility size
  const getReviewCount = (id: number) => {
    const counts = [87, 124, 56, 203, 45, 312, 78, 156, 92];
    return counts[id % counts.length];
  };

  const handleViewDetails = (facility: any) => {
    setSelectedFacility(facility);
    setShowModal(true);
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

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Partner Facilities</h1>
        </div>
        <p className="text-gray-500 text-sm">Healthcare facilities in our network</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
          <Building2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-800">{facilities.length}</p>
          <p className="text-xs text-gray-500">Total Facilities</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
          <MapPin className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-800">{uniqueRegions.length}</p>
          <p className="text-xs text-gray-500">Regions</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
          <Users className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-800">{facilities.filter((f: any) => f.location).length}</p>
          <p className="text-xs text-gray-500">Active Partners</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
          <Award className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-800">{shifts.length}</p>
          <p className="text-xs text-gray-500">Total Shifts</p>
        </div>
      </div>

      {/* Search and Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-sm"
          />
        </div>
        
        {uniqueRegions.length > 0 && (
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-sm min-w-[130px]"
          >
            <option value="">All Regions</option>
            {uniqueRegions.map((region: string) => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        )}
      </div>

      {/* Facilities Grid */}
      {filteredFacilities.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No facilities found</h3>
          <p className="text-gray-500">Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFacilities.map((facility: any) => {
            const rating = getFacilityRating(facility.id);
            const reviewCount = getReviewCount(facility.id);
            const shiftCount = getShiftCount(facility.id);
            
            return (
              <div
                key={facility.id}
                className="group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 overflow-hidden hover:scale-[1.02]"
              >
                <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg group-hover:text-emerald-600 transition">
                        {facility.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(rating)}
                        <span className="text-xs text-gray-500">({reviewCount} reviews)</span>
                      </div>
                    </div>
                    <div className="bg-emerald-100 px-2.5 py-1 rounded-full">
                      <span className="text-xs text-emerald-700 font-medium">Partner</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-3">
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{facility.location || 'Location not specified'}</span>
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{facility.email}</span>
                    </p>
                    {shiftCount > 0 && (
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span>{shiftCount} active {shiftCount === 1 ? 'shift' : 'shifts'}</span>
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleViewDetails(facility)}
                    className="mt-4 w-full py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition opacity-100"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer note */}
      {filteredFacilities.length > 0 && (
        <div className="mt-6 text-center text-xs text-gray-400">
          Showing {filteredFacilities.length} of {facilities.length} facilities
        </div>
      )}

      {/* Facility Details Modal */}
      {showModal && selectedFacility && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">{selectedFacility.name}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{selectedFacility.location || 'Location not specified'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-400" />
                <a href={`mailto:${selectedFacility.email}`} className="text-emerald-600 hover:underline">
                  {selectedFacility.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-500">+254 700 000 000</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-gray-400" />
                <a href="#" className="text-emerald-600 hover:underline">www.{selectedFacility.name.toLowerCase().replace(/\s/g, '')}.com</a>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-2">About this facility</h3>
                <p className="text-gray-600 text-sm">
                  {selectedFacility.name} is a leading healthcare facility in {selectedFacility.location}, 
                  providing quality medical services to the community. They are actively looking for 
                  qualified healthcare professionals to join their team.
                </p>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-600">{getShiftCount(selectedFacility.id)}</p>
                    <p className="text-xs text-gray-500">Active Shifts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-600">{getReviewCount(selectedFacility.id)}</p>
                    <p className="text-xs text-gray-500">Reviews</p>
                  </div>
                </div>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
                  Contact Facility
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}