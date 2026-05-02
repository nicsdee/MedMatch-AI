'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardList, Users, Building2, CheckCircle, PlusCircle } from 'lucide-react';
import Link from 'next/link';

const API_URL = 'http://localhost:8000';

interface Provider {
  id: number;
  name: string;
  role: string;
  skills: string[];
  available: boolean;
  experience_years: number;
}

interface Facility {
  id: number;
  name: string;
  location: string;
}

interface Shift {
  id: number;
  facility_id: number;
  role: string;
  shift_date: string;
  required_skills: string[];
  urgency: string;
  status: string;
}

interface Match {
  provider_id: number;
  score: number;
  reason: string;
  match_id?: number;
}

export default function Home() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShift, setSelectedShift] = useState<number | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);

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
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async (shiftId: number) => {
    try {
      const response = await axios.post(`${API_URL}/match/${shiftId}`);
      setMatches(response.data.matches);
      setSelectedShift(shiftId);
    } catch (error) {
      console.error('Error matching:', error);
      alert('Error finding matches. Please try again.');
    }
  };

  const handleAcceptMatch = async (shiftId: number, providerId: number) => {
    try {
      const matchesResponse = await axios.get(`${API_URL}/matches/${shiftId}`);
      const match = matchesResponse.data.find((m: any) => m.provider_id === providerId);
      
      if (match) {
        await axios.put(`${API_URL}/matches/${match.id}/accept`);
        alert('Match accepted! Provider has been assigned.');
        fetchData();
        setSelectedShift(null);
        setMatches([]);
      }
    } catch (error) {
      console.error('Error accepting match:', error);
      alert('Error accepting match. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading MedMatch AI...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navigation Button */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-blue-600">MedMatch AI</h1>
              <p className="text-gray-600">Healthcare Provider-Facility Matching System</p>
            </div>
            <Link
              href="/post-shift"
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <PlusCircle className="w-4 h-4" />
              Post New Shift
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Providers</p>
                <p className="text-3xl font-bold">{providers.length}</p>
              </div>
              <Users className="w-12 h-12 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Facilities</p>
                <p className="text-3xl font-bold">{facilities.length}</p>
              </div>
              <Building2 className="w-12 h-12 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Open Shifts</p>
                <p className="text-3xl font-bold">{shifts.length}</p>
              </div>
              <ClipboardList className="w-12 h-12 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shifts Column */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Open Shifts</h2>
            {shifts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No open shifts available. Click "Post New Shift" to create one.
              </p>
            ) : (
              <div className="space-y-4">
                {shifts.map((shift) => {
                  const facility = facilities.find(f => f.id === shift.facility_id);
                  return (
                    <div key={shift.id} className="border rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{shift.role}</h3>
                          <p className="text-sm text-gray-600">{facility?.name}</p>
                          <p className="text-sm text-gray-600">
                            Date: {new Date(shift.shift_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Skills: {shift.required_skills?.join(', ') || 'None specified'}
                          </p>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                            shift.urgency === 'high' ? 'bg-red-100 text-red-700' :
                            shift.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {shift.urgency.toUpperCase()} Urgency
                          </span>
                        </div>
                        <button
                          onClick={() => handleMatch(shift.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition ml-4"
                        >
                          Find Matches
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Matches Column */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">AI-Powered Matches</h2>
            {selectedShift === null ? (
              <p className="text-gray-500 text-center py-8">
                Click "Find Matches" on any shift to see AI-powered provider recommendations.
              </p>
            ) : matches.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No matches found for this shift.</p>
            ) : (
              <div className="space-y-4">
                {matches.map((match, index) => {
                  const provider = providers.find(p => p.id === match.provider_id);
                  if (!provider) return null;
                  
                  return (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{provider.name}</h3>
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 text-xs rounded-full">
                              Score: {(match.score * 100).toFixed(0)}%
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{provider.role}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Skills: {provider.skills?.join(', ')}
                          </p>
                          <p className="text-sm text-gray-600">
                            Experience: {provider.experience_years} years
                          </p>
                          <p className="text-sm mt-2 text-gray-700 italic">
                            "{match.reason}"
                          </p>
                        </div>
                        <button
                          onClick={() => handleAcceptMatch(selectedShift, provider.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Accept
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Providers Table */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Available Providers</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-left">Skills</th>
                  <th className="px-4 py-2 text-left">Experience</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((provider) => (
                  <tr key={provider.id} className="border-t">
                    <td className="px-4 py-2 font-medium">{provider.name}</td>
                    <td className="px-4 py-2">{provider.role}</td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-1">
                        {provider.skills?.slice(0, 2).map((skill, i) => (
                          <span key={i} className="bg-gray-100 px-2 py-1 text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                        {provider.skills?.length > 2 && (
                          <span className="text-xs text-gray-500">+{provider.skills.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2">{provider.experience_years} years</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        provider.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {provider.available ? 'Available' : 'Assigned'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}