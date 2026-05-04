'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, Building2, CheckCircle, Clock, Users, AlertCircle, 
  Award, TrendingUp, MapPin, UserCheck, Star, FileText, 
  Shield, ThumbsUp, Activity, Briefcase,
  ChevronRight, Heart, Stethoscope
} from 'lucide-react';

// ✅ GOOD - Uses environment variable for flexibility
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function MatchedShiftsView({ facilities }: any) {
  const [matchedShifts, setMatchedShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchMatchedShifts();
    fetchProviders();
  }, []);

  const fetchMatchedShifts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/shifts/matched`);
      setMatchedShifts(response.data);
    } catch (error: any) {
      console.error('Error fetching matched shifts:', error);
      if (error.response?.status === 404) {
        setError('Matched shifts endpoint not found.');
      } else if (error.code === 'ERR_NETWORK') {
        setError('Cannot connect to backend. Make sure it is running on port 8000.');
      } else {
        setError('Failed to load matched shifts. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await axios.get(`${API_URL}/providers`);
      setProviders(response.data);
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'filled':
        return <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1 font-medium"><CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Completed</span>;
      case 'accepted':
        return <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1 font-medium"><CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Accepted</span>;
      case 'pending':
        return <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs rounded-full bg-amber-100 text-amber-700 flex items-center gap-1 font-medium"><Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Pending</span>;
      default:
        return <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs rounded-full bg-gray-100 text-gray-600">{status}</span>;
    }
  };

  const getProviderDetails = (providerId: number) => {
    return providers.find(p => p.id === providerId);
  };

  const filteredShifts = matchedShifts.filter(shift => {
    const provider = getProviderDetails(shift.match?.provider_id);
    const matchesSearch = shift.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (provider?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
                          (provider?.role?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    if (filter === 'all') return matchesSearch;
    if (filter === 'filled') return matchesSearch && (shift.status === 'filled' || shift.status === 'accepted');
    if (filter === 'pending') return matchesSearch && shift.status === 'pending';
    return matchesSearch;
  });

  // Calculate stats
  const totalFilled = matchedShifts.filter(s => s.status === 'filled' || s.status === 'accepted').length;
  const totalPending = matchedShifts.filter(s => s.status === 'pending').length;
  const uniqueFacilities = [...new Set(matchedShifts.map(s => s.facility_id))].length;
  const avgMatchScore = matchedShifts.reduce((acc, s) => acc + (s.match?.match_score || 0), 0) / (matchedShifts.length || 1);
  const totalProvidersPlaced = new Set(matchedShifts.filter(s => s.match?.provider_id).map(s => s.match.provider_id)).size;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 sm:py-20">
        <div className="text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600">Loading matched shifts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="text-center py-12 sm:py-16 bg-white rounded-lg sm:rounded-xl border border-gray-100">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-1 sm:mb-2">Unable to Load Data</h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto px-3">{error}</p>
          <button onClick={fetchMatchedShifts} className="mt-5 sm:mt-6 bg-emerald-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-emerald-700 text-sm">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
          <div className="w-1 h-6 sm:h-7 md:h-10 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Matched Shifts</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Track completed assignments and pending placements</p>
          </div>
        </div>
      </div>

      {/* Stats Overview - Responsive grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-100 p-2 sm:p-3 text-center shadow-sm hover:shadow-md transition group cursor-pointer">
          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2 group-hover:bg-emerald-100 transition">
            <Briefcase className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-emerald-600" />
          </div>
          <p className="text-base sm:text-lg md:text-xl font-bold text-gray-800">{matchedShifts.length}</p>
          <p className="text-[10px] sm:text-xs text-gray-500">Total Placements</p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-100 p-2 sm:p-3 text-center shadow-sm hover:shadow-md transition group cursor-pointer">
          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2 group-hover:bg-emerald-100 transition">
            <CheckCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-emerald-600" />
          </div>
          <p className="text-base sm:text-lg md:text-xl font-bold text-emerald-600">{totalFilled}</p>
          <p className="text-[10px] sm:text-xs text-gray-500">Completed</p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-100 p-2 sm:p-3 text-center shadow-sm hover:shadow-md transition group cursor-pointer">
          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2 group-hover:bg-amber-100 transition">
            <Clock className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-amber-600" />
          </div>
          <p className="text-base sm:text-lg md:text-xl font-bold text-amber-600">{totalPending}</p>
          <p className="text-[10px] sm:text-xs text-gray-500">Pending</p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-100 p-2 sm:p-3 text-center shadow-sm hover:shadow-md transition group cursor-pointer">
          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2 group-hover:bg-blue-100 transition">
            <Building2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-blue-600" />
          </div>
          <p className="text-base sm:text-lg md:text-xl font-bold text-gray-800">{uniqueFacilities}</p>
          <p className="text-[10px] sm:text-xs text-gray-500">Facilities</p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-100 p-2 sm:p-3 text-center shadow-sm hover:shadow-md transition group cursor-pointer">
          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2 group-hover:bg-purple-100 transition">
            <Users className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-purple-600" />
          </div>
          <p className="text-base sm:text-lg md:text-xl font-bold text-gray-800">{totalProvidersPlaced}</p>
          <p className="text-[10px] sm:text-xs text-gray-500">Providers</p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-100 p-2 sm:p-3 text-center shadow-sm hover:shadow-md transition group cursor-pointer">
          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2 group-hover:bg-teal-100 transition">
            <TrendingUp className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-teal-600" />
          </div>
          <p className="text-base sm:text-lg md:text-xl font-bold text-teal-600">{Math.round(avgMatchScore * 100)}%</p>
          <p className="text-[10px] sm:text-xs text-gray-500">Match Rate</p>
        </div>
      </div>

      {/* Average Match Score Banner - Responsive */}
      {matchedShifts.length > 0 && (
        <div className="mb-4 sm:mb-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-emerald-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Activity className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-gray-600">AI Matching Performance</p>
                <p className="text-sm sm:text-base md:text-lg font-bold text-emerald-600">{Math.round(avgMatchScore * 100)}% Average Match Score</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                <ThumbsUp className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-gray-600">Successful Placements</p>
                <p className="text-sm sm:text-base md:text-lg font-bold text-teal-600">{totalFilled} Shifts Filled</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-gray-600">Awaiting Confirmation</p>
                <p className="text-sm sm:text-base md:text-lg font-bold text-amber-600">{totalPending} Shifts</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs and Search - Responsive */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <button onClick={() => setFilter('all')} className={`px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${filter === 'all' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            All ({matchedShifts.length})
          </button>
          <button onClick={() => setFilter('filled')} className={`px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${filter === 'filled' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            Completed ({totalFilled})
          </button>
          <button onClick={() => setFilter('pending')} className={`px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${filter === 'pending' ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            Pending ({totalPending})
          </button>
        </div>

        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by role, provider..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 md:w-80 pl-9 pr-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-xs sm:text-sm"
          />
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      {/* Matched Shifts Cards Grid - Responsive: 1 column on all, 2 on large */}
      {filteredShifts.length === 0 ? (
        <div className="text-center py-12 sm:py-16 md:py-20 bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Calendar className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400" />
          </div>
          <h3 className="text-base sm:text-lg md:text-xl font-medium text-gray-800 mb-1 sm:mb-2">No Matched Shifts</h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto px-3">When you accept matches from the Open Shifts page, they will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
          {filteredShifts.map((shift: any) => {
            const facility = facilities.find((f: any) => f.id === shift.facility_id);
            const provider = getProviderDetails(shift.match?.provider_id);
            const matchScore = shift.match?.match_score ? Math.round(shift.match.match_score * 100) : 0;
            const isExpanded = expandedId === shift.id;
            
            return (
              <div
                key={shift.id}
                className={`bg-white rounded-xl sm:rounded-2xl shadow-md border transition-all duration-300 overflow-hidden hover:shadow-xl ${
                  shift.status === 'pending' ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-emerald-500'
                }`}
              >
                {/* Card Header */}
                <div className="p-3 sm:p-4 md:p-5 pb-2 sm:pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Stethoscope className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-emerald-600" />
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm sm:text-base md:text-lg truncate">{shift.role}</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
                        <span className="flex items-center gap-0.5 sm:gap-1"><Building2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> <span className="truncate max-w-[120px] sm:max-w-none">{facility?.name || 'Unknown'}</span></span>
                        <span className="flex items-center gap-0.5 sm:gap-1"><MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {facility?.location || 'Kenya'}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(shift.status)}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="px-3 sm:px-4 md:px-5 pb-2 sm:pb-3">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
                    <span className="flex items-center gap-0.5 sm:gap-1"><Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {new Date(shift.shift_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    {provider && <span className="flex items-center gap-0.5 sm:gap-1"><Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> <span className="truncate max-w-[120px]">{provider.name}</span></span>}
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-1.5 sm:mt-2">
                    {shift.required_skills?.slice(0, 3).map((skill: string, i: number) => (
                      <span key={i} className="px-1.5 py-0.5 text-[9px] sm:text-xs rounded-full bg-gray-100 text-gray-600 flex items-center gap-0.5">
                        <Heart className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-emerald-500" /> {skill}
                      </span>
                    ))}
                    {shift.required_skills?.length > 3 && (
                      <span className="px-1.5 py-0.5 text-[9px] sm:text-xs rounded-full bg-gray-100 text-gray-500">+{shift.required_skills.length - 3}</span>
                    )}
                  </div>

                  {/* Match Score Bar */}
                  {shift.match && (
                    <div className="mt-2 sm:mt-3 pt-1 sm:pt-2">
                      <div className="flex justify-between items-center text-[10px] sm:text-xs mb-0.5 sm:mb-1">
                        <span className="text-gray-500 flex items-center gap-0.5 sm:gap-1"><Award className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Match Score</span>
                        <span className={`font-bold text-xs sm:text-sm ${matchScore >= 80 ? 'text-emerald-600' : matchScore >= 60 ? 'text-amber-600' : 'text-gray-500'}`}>{matchScore}%</span>
                      </div>
                      <div className="h-1 sm:h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${matchScore >= 80 ? 'bg-emerald-500' : matchScore >= 60 ? 'bg-amber-500' : 'bg-gray-400'}`} style={{ width: `${matchScore}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Expandable Details Section */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : shift.id)}
                  className="w-full px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 text-left text-xs sm:text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition flex items-center justify-between border-t border-gray-100"
                >
                  <span>{isExpanded ? 'Show less' : 'View placement details'}</span>
                  <ChevronRight className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>

                {isExpanded && (
                  <div className="px-3 sm:px-4 md:px-5 pb-3 sm:pb-4 md:pb-5 pt-2 bg-gray-50 border-t border-gray-100">
                    {provider && (
                      <div className="space-y-2 sm:space-y-3">
                        <h4 className="font-semibold text-gray-700 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2"><UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Provider Information</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                          <div className="break-all"><span className="font-bold text-gray-700">License:</span> <span className="text-gray-600">{provider.license_number}</span></div>
                          <div><span className="font-bold text-gray-700">Experience:</span> <span className="text-gray-600">{provider.experience_years} years</span></div>
                          <div className="break-all"><span className="font-bold text-gray-700">Email:</span> <a href={`mailto:${provider.email}`} className="text-emerald-600 hover:underline break-all">{provider.email}</a></div>
                          <div><span className="font-bold text-gray-700">Status:</span> <span className={provider.available ? 'text-emerald-600' : 'text-amber-600'}>{provider.available ? 'Available' : 'On Assignment'}</span></div>
                        </div>
                        <div className="pt-1 sm:pt-2">
                          <h4 className="font-semibold text-gray-700 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2"><FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Match Reasoning</h4>
                          <p className="text-xs sm:text-sm text-gray-600 bg-white p-2 sm:p-3 rounded-lg border border-gray-100">{shift.match?.match_reason || 'AI-matched based on skills and experience compatibility.'}</p>
                        </div>
                      </div>
                    )}
                    {!provider && shift.match?.provider_name && (
                      <div className="text-center py-3 sm:py-4">
                        <p className="text-xs sm:text-sm text-gray-500">Provider: {shift.match.provider_name}</p>
                        <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Match score: {matchScore}%</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer note */}
      {filteredShifts.length > 0 && (
        <div className="mt-4 sm:mt-5 md:mt-6 text-center text-[10px] sm:text-xs text-gray-400">
          Showing {filteredShifts.length} of {matchedShifts.length} matched shifts
        </div>
      )}
    </div>
  );
}