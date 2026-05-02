'use client';

import { useState } from 'react';
import { Users, Building2, Calendar, CheckCircle, Eye, ChevronDown, ChevronUp, MapPin, Mail, Award } from 'lucide-react';

export default function Dashboard({ providers, facilities, shifts, setShowShiftModal }: any) {
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [expandedProvider, setExpandedProvider] = useState<number | null>(null);

  const getUrgencyClass = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      default: return 'bg-emerald-100 text-emerald-700';
    }
  };

  const stats = [
    { id: 'providers', label: 'Providers', value: providers.length, icon: Users, color: 'emerald' },
    { id: 'facilities', label: 'Facilities', value: facilities.length, icon: Building2, color: 'amber' },
    { id: 'shifts', label: 'Open Shifts', value: shifts.length, icon: Calendar, color: 'orange' },
    { id: 'available', label: 'Available Now', value: providers.filter((p: any) => p.available).length, icon: CheckCircle, color: 'teal' },
  ];

  const colorClasses: any = {
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    orange: 'bg-orange-100 text-orange-600',
    teal: 'bg-teal-100 text-teal-600',
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome to MedMatch AI — intelligent healthcare staffing</p>
      </div>

      {/* Stats Cards - Click to Show Table Below */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.id}
            onClick={() => setActiveTable(activeTable === stat.id ? null : stat.id)}
            className={`bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition cursor-pointer ${activeTable === stat.id ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-gray-100'}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${colorClasses[stat.color]}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-gray-400">
              <Eye className="w-3 h-3" />
              <span>Click to {activeTable === stat.id ? 'hide' : 'view'} details</span>
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Table Below Cards - Shows when card is clicked */}
      
      {/* Providers Table */}
      {activeTable === 'providers' && (
        <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Healthcare Providers</h2>
            <p className="text-sm text-gray-500">All providers in your network</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Skills</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Experience</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {providers.slice(0, 10).map((provider: any) => (
                  <tr key={provider.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{provider.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{provider.role}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {provider.skills?.slice(0, 2).map((s: string, i: number) => (
                          <span key={i} className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">{s}</span>
                        ))}
                        {provider.skills?.length > 2 && <span className="text-xs text-gray-400">+{provider.skills.length - 2}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{provider.experience_years} yrs</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${provider.available ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {provider.available ? 'Available' : 'Assigned'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setExpandedProvider(expandedProvider === provider.id ? null : provider.id)} className="text-emerald-600 hover:text-emerald-700 text-sm flex items-center gap-1">
                        {expandedProvider === provider.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {providers.length > 10 && (
            <div className="p-3 text-center text-sm text-gray-400 border-t border-gray-100">Showing 10 of {providers.length} providers</div>
          )}
        </div>
      )}

      {/* Facilities Table */}
      {activeTable === 'facilities' && (
        <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Partner Facilities</h2>
            <p className="text-sm text-gray-500">Healthcare facilities in your network</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {facilities.map((facility: any) => (
                  <tr key={facility.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{facility.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 flex items-center gap-1"><MapPin className="w-3 h-3" /> {facility.location}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" /> {facility.email}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-700">Active Partner</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Shifts Table */}
      {activeTable === 'shifts' && (
        <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <div><h2 className="font-semibold text-gray-800">Open Shifts</h2><p className="text-sm text-gray-500">Current shift requirements</p></div>
            <button onClick={() => setShowShiftModal(true)} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-emerald-700">+ New Shift</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Facility</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Skills</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Urgency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {shifts.map((shift: any) => {
                  const facility = facilities.find((f: any) => f.id === shift.facility_id);
                  return (
                    <tr key={shift.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{shift.role}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{facility?.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{new Date(shift.shift_date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm"><div className="flex flex-wrap gap-1">{shift.required_skills?.slice(0, 2).map((s: string, i: number) => (<span key={i} className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">{s}</span>))}</div></td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 text-xs rounded-full ${getUrgencyClass(shift.urgency)}`}>{shift.urgency}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Available Providers Table */}
      {activeTable === 'available' && (
        <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Available Providers</h2>
            <p className="text-sm text-gray-500">Ready for immediate assignment</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Skills</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Experience</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">License</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {providers.filter((p: any) => p.available).slice(0, 10).map((provider: any) => (
                  <tr key={provider.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{provider.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{provider.role}</td>
                    <td className="px-4 py-3 text-sm"><div className="flex flex-wrap gap-1">{provider.skills?.slice(0, 2).map((s: string, i: number) => (<span key={i} className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">{s}</span>))}</div></td>
                    <td className="px-4 py-3 text-sm text-gray-600">{provider.experience_years} yrs</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{provider.license_number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expanded Provider Details (when clicking Details button) */}
      {expandedProvider !== null && (
        <div className="mt-4 bg-gray-50 rounded-xl border border-gray-200 p-4">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-gray-800">Provider Details</h3>
            <button onClick={() => setExpandedProvider(null)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          {providers.filter((p: any) => p.id === expandedProvider).map((provider: any) => (
            <div key={provider.id} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500">Full Name</p><p className="font-medium text-gray-800">{provider.name}</p></div>
              <div><p className="text-sm text-gray-500">Role</p><p className="font-medium text-gray-800">{provider.role}</p></div>
              <div><p className="text-sm text-gray-500">License Number</p><p className="font-medium text-gray-800">{provider.license_number}</p></div>
              <div><p className="text-sm text-gray-500">Experience</p><p className="font-medium text-gray-800">{provider.experience_years} years</p></div>
              <div><p className="text-sm text-gray-500">Email</p><p className="font-medium text-gray-800">{provider.email}</p></div>
              <div><p className="text-sm text-gray-500">Status</p><p className={`font-medium ${provider.available ? 'text-emerald-600' : 'text-gray-500'}`}>{provider.available ? 'Available for assignment' : 'Currently on assignment'}</p></div>
              <div className="md:col-span-2"><p className="text-sm text-gray-500">All Skills</p><div className="flex flex-wrap gap-1 mt-1">{provider.skills?.map((s: string, i: number) => (<span key={i} className="px-2 py-1 text-xs rounded-full bg-white border border-gray-200">{s}</span>))}</div></div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Quick Actions</h2>
          <button onClick={() => setShowShiftModal(true)} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2.5 rounded-lg hover:from-emerald-600 hover:to-teal-700 transition font-medium flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Post New Shift
          </button>
          <p className="text-xs text-gray-400 text-center mt-2">Create a new shift requirement</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">At a Glance</h2>
          <p className="text-sm text-gray-600">{shifts.length} open shifts waiting to be filled</p>
          <p className="text-sm text-gray-600 mt-1">{providers.filter((p: any) => p.available).length} providers available for assignment</p>
          <p className="text-sm text-gray-600 mt-1">{facilities.length} partner facilities across Kenya</p>
        </div>
      </div>
    </div>
  );
}