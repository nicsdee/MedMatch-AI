'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Types
interface Provider {
  id: number;
  name: string;
  role: string;
  skills: string[];
  available: boolean;
  experience_years: number;
  license_number: string;
  email: string;
}

interface Facility {
  id: number;
  name: string;
  location: string;
  email: string;
}

interface Shift {
  id: number;
  facility_id: number;
  role: string;
  shift_date: string;
  required_skills: string[];
  urgency: string;
  status: string;
  description?: string;
}

interface Match {
  provider_id: number;
  score: number;
  reason: string;
  experience_years?: number;
}

export default function Home() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'shifts' | 'providers'>('shifts');
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newShift, setNewShift] = useState({
    facility_id: '',
    role: '',
    shift_date: '',
    required_skills: '',
    urgency: 'medium',
    description: ''
  });

  // Fetch all data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [providersRes, facilitiesRes, shiftsRes] = await Promise.all([
        axios.get(`${API_URL}/providers`),
        axios.get(`${API_URL}/facilities`),
        axios.get(`${API_URL}/shifts/open`),
      ]);
      setProviders(providersRes.data);
      setFacilities(facilitiesRes.data);
      setShifts(shiftsRes.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique roles from database for dropdown
  const uniqueRoles = [...new Set(providers.map(p => p.role))];

  // Handle match
  const handleMatch = async (shift: Shift) => {
    setSelectedShift(shift);
    setShowMatchModal(true);
    try {
      const response = await axios.post(`${API_URL}/match/${shift.id}`);
      setMatches(response.data.matches || []);
    } catch (error) {
      console.error('Match error:', error);
      setMatches([]);
    }
  };

  // Handle accept match
  const handleAcceptMatch = async (providerId: number) => {
    if (!selectedShift) return;
    try {
      const matchesResponse = await axios.get(`${API_URL}/matches/${selectedShift.id}`);
      const match = matchesResponse.data.find((m: any) => m.provider_id === providerId);
      if (match) {
        await axios.put(`${API_URL}/matches/${match.id}/accept`);
        alert('✓ Provider assigned successfully');
        setShowMatchModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Accept error:', error);
      alert('Error accepting match');
    }
  };

  // Handle post shift
  const handlePostShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/shifts`, {
        facility_id: parseInt(newShift.facility_id),
        role: newShift.role,
        shift_date: newShift.shift_date,
        required_skills: newShift.required_skills.split(',').map(s => s.trim()),
        urgency: newShift.urgency,
        description: newShift.description,
      });
      alert('✓ Shift posted successfully');
      setShowShiftModal(false);
      setNewShift({ facility_id: '', role: '', shift_date: '', required_skills: '', urgency: 'medium', description: '' });
      fetchData();
    } catch (error) {
      console.error('Post error:', error);
      alert('Error posting shift');
    }
  };

  // Get urgency color
  const getUrgencyClass = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  // Get score class
  const getScoreClass = (score: number) => {
    if (score >= 0.8) return 'bg-emerald-100 text-emerald-700';
    if (score >= 0.6) return 'bg-amber-100 text-amber-700';
    return 'bg-gray-100 text-gray-600';
  };

  // Filter shifts
  const filteredShifts = shifts.filter(shift => {
    const matchesSearch = shift.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Filter providers
  const filteredProviders = providers.filter(provider => {
    const matchesRole = !selectedRoleFilter || provider.role === selectedRoleFilter;
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading MedMatch...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-800 text-lg">MedMatch AI</h1>
                <p className="text-xs text-gray-500">Healthcare Staffing</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => setActiveTab('shifts')} className={`px-3 py-2 text-sm font-medium transition ${activeTab === 'shifts' ? 'text-amber-600 border-b-2 border-amber-500' : 'text-gray-600 hover:text-gray-800'}`}>Open Shifts</button>
              <button onClick={() => setActiveTab('providers')} className={`px-3 py-2 text-sm font-medium transition ${activeTab === 'providers' ? 'text-amber-600 border-b-2 border-amber-500' : 'text-gray-600 hover:text-gray-800'}`}>Provider Network</button>
              <button onClick={() => setShowShiftModal(true)} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-orange-600 transition shadow-md flex items-center gap-2">+ New Shift</button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              <button onClick={() => setShowShiftModal(true)} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-lg text-sm">+ Shift</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition"><div><p className="text-gray-500 text-xs uppercase tracking-wide">Providers</p><p className="text-2xl font-bold text-gray-800">{providers.length}</p></div><div className="bg-emerald-100 w-10 h-10 rounded-lg flex items-center justify-center mt-2"><svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg></div></div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition"><div><p className="text-gray-500 text-xs uppercase tracking-wide">Facilities</p><p className="text-2xl font-bold text-gray-800">{facilities.length}</p></div><div className="bg-amber-100 w-10 h-10 rounded-lg flex items-center justify-center mt-2"><svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg></div></div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition"><div><p className="text-gray-500 text-xs uppercase tracking-wide">Open Shifts</p><p className="text-2xl font-bold text-gray-800">{shifts.length}</p></div><div className="bg-orange-100 w-10 h-10 rounded-lg flex items-center justify-center mt-2"><svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div></div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition"><div><p className="text-gray-500 text-xs uppercase tracking-wide">Available Now</p><p className="text-2xl font-bold text-gray-800">{providers.filter(p => p.available).length}</p></div><div className="bg-teal-100 w-10 h-10 rounded-lg flex items-center justify-center mt-2"><svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div></div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search shifts or providers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white" />
          </div>
        </div>

        {/* Role Filter - from database */}
        {activeTab === 'providers' && (
          <div className="mb-6 flex flex-wrap gap-2">
            <button onClick={() => setSelectedRoleFilter('')} className={`px-3 py-1.5 text-sm rounded-full transition ${!selectedRoleFilter ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
            {uniqueRoles.map(role => (
              <button key={role} onClick={() => setSelectedRoleFilter(role)} className={`px-3 py-1.5 text-sm rounded-full transition ${selectedRoleFilter === role ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{role}</button>
            ))}
          </div>
        )}

        {/* Content Sections */}
        {activeTab === 'shifts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredShifts.length === 0 ? (<div className="col-span-2 text-center py-12 bg-white rounded-xl"><p className="text-gray-500">No open shifts. Click "New Shift" to post one.</p></div>) : 
              filteredShifts.map(shift => {
                const facility = facilities.find(f => f.id === shift.facility_id);
                return (
                  <div key={shift.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition group">
                    <div className="flex justify-between items-start">
                      <div className="flex-1"><div className="flex items-center gap-2 mb-2"><h3 className="font-semibold text-gray-800">{shift.role}</h3><span className={`px-2 py-0.5 text-xs rounded-full ${getUrgencyClass(shift.urgency)}`}>{shift.urgency}</span></div>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mb-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>{facility?.name}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>{new Date(shift.shift_date).toLocaleDateString()}</p>
                      <div className="flex flex-wrap gap-1 mt-2">{shift.required_skills?.slice(0, 3).map((s, i) => (<span key={i} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">{s}</span>))}</div></div>
                      <button onClick={() => handleMatch(shift)} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-orange-600 transition text-sm opacity-0 group-hover:opacity-100">Match</button>
                    </div>
                  </div>
                );
              })
            }
          </div>
        )}

        {activeTab === 'providers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProviders.map(provider => (
              <div key={provider.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between"><div><h3 className="font-semibold text-gray-800">{provider.name}</h3><p className="text-sm text-amber-600">{provider.role}</p></div><span className={`px-2 py-0.5 text-xs rounded-full ${provider.available ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{provider.available ? 'Available' : 'Assigned'}</span></div>
                <div className="flex flex-wrap gap-1 mt-3">{provider.skills?.slice(0, 3).map((s, i) => (<span key={i} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">{s}</span>))}</div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100"><span className="text-sm text-gray-500">{provider.experience_years} years exp</span><span className="text-xs text-gray-400">{provider.license_number}</span></div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div><h3 className="font-semibold text-gray-800 mb-3">MedMatch AI</h3><p className="text-sm text-gray-500">Intelligent healthcare staffing for modern facilities.</p></div>
            <div><h3 className="font-semibold text-gray-800 mb-3">Quick Links</h3><ul className="space-y-2 text-sm text-gray-500"><li><a href="#" className="hover:text-amber-600">About Us</a></li><li><a href="#" className="hover:text-amber-600">How It Works</a></li><li><a href="#" className="hover:text-amber-600">Pricing</a></li></ul></div>
            <div><h3 className="font-semibold text-gray-800 mb-3">Support</h3><ul className="space-y-2 text-sm text-gray-500"><li><a href="#" className="hover:text-amber-600">Help Center</a></li><li><a href="#" className="hover:text-amber-600">Contact Us</a></li><li><a href="#" className="hover:text-amber-600">API Docs</a></li></ul></div>
            <div><h3 className="font-semibold text-gray-800 mb-3">Legal</h3><ul className="space-y-2 text-sm text-gray-500"><li><a href="#" className="hover:text-amber-600">Privacy Policy</a></li><li><a href="#" className="hover:text-amber-600">Terms of Service</a></li><li><a href="#" className="hover:text-amber-600">Cookie Policy</a></li></ul></div>
          </div>
          <div className="border-t border-gray-100 mt-8 pt-6 text-center text-sm text-gray-500">© 2026 MedMatch AI. All rights reserved.</div>
        </div>
      </footer>

      {/* New Shift Modal */}
      {showShiftModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowShiftModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center"><h2 className="text-xl font-bold text-gray-800">Post New Shift</h2><button onClick={() => setShowShiftModal(false)} className="text-gray-400 hover:text-gray-600">✕</button></div>
            <form onSubmit={handlePostShift} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Facility</label><select required value={newShift.facility_id} onChange={(e) => setNewShift({...newShift, facility_id: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"><option value="">Select facility</option>{facilities.map(f => (<option key={f.id} value={f.id}>{f.name}</option>))}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Role</label><input type="text" required placeholder="e.g., ICU Nurse" value={newShift.role} onChange={(e) => setNewShift({...newShift, role: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Shift Date</label><input type="date" required value={newShift.shift_date} onChange={(e) => setNewShift({...newShift, shift_date: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label><input type="text" required placeholder="ventilator management, critical care" value={newShift.required_skills} onChange={(e) => setNewShift({...newShift, required_skills: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label><div className="flex gap-4"><label className="flex items-center gap-2"><input type="radio" name="urgency" value="low" checked={newShift.urgency === 'low'} onChange={(e) => setNewShift({...newShift, urgency: e.target.value})} /><span>Low</span></label><label className="flex items-center gap-2"><input type="radio" name="urgency" value="medium" checked={newShift.urgency === 'medium'} onChange={(e) => setNewShift({...newShift, urgency: e.target.value})} /><span>Medium</span></label><label className="flex items-center gap-2"><input type="radio" name="urgency" value="high" checked={newShift.urgency === 'high'} onChange={(e) => setNewShift({...newShift, urgency: e.target.value})} /><span>High</span></label></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea rows={3} placeholder="Additional requirements..." value={newShift.description} onChange={(e) => setNewShift({...newShift, description: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" /></div>
              <button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2.5 rounded-lg hover:from-amber-600 hover:to-orange-600 transition font-medium">Post Shift</button>
            </form>
          </div>
        </div>
      )}

      {/* Match Results Modal */}
      {showMatchModal && selectedShift && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowMatchModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex justify-between items-center"><h2 className="text-xl font-bold text-gray-800">Match Results</h2><button onClick={() => setShowMatchModal(false)} className="text-gray-400 hover:text-gray-600">✕</button></div>
            <div className="p-6">
              {matches.length === 0 ? (<div className="text-center py-12"><p className="text-gray-500">No matches found for this shift.</p></div>) : (
                <div className="space-y-4">{matches.map((match, idx) => {
                  const provider = providers.find(p => p.id === match.provider_id);
                  if (!provider) return null;
                  return (<div key={idx} className="border border-gray-100 rounded-xl p-4"><div className="flex justify-between items-start"><div className="flex-1"><h3 className="font-semibold text-gray-800">{provider.name}</h3><p className="text-sm text-amber-600">{provider.role}</p><div className="flex flex-wrap gap-1 mt-2">{provider.skills?.slice(0, 3).map((s, i) => (<span key={i} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">{s}</span>))}</div><p className="text-sm mt-2 text-gray-600">{match.reason}</p><div className="flex gap-3 mt-2 text-xs text-gray-400"><span>{provider.experience_years} years exp</span><span>{provider.license_number}</span></div></div><div className="text-right"><span className={`px-2 py-1 text-xs rounded-full ${getScoreClass(match.score)}`}>{Math.round(match.score * 100)}% Match</span><button onClick={() => handleAcceptMatch(provider.id)} className="mt-2 bg-emerald-500 text-white px-4 py-1.5 rounded-lg hover:bg-emerald-600 transition text-sm w-full">Assign</button></div></div></div>);
                })}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}