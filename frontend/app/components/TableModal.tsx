'use client';

import { X } from 'lucide-react';

export default function TableModal({ type, title, providers, facilities, shifts, onClose }: any) {
  const getUrgencyClass = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      default: return 'bg-emerald-100 text-emerald-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 overflow-x-auto">
          {type === 'providers' && (
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50">
                <tr><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Skills</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Experience</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th></tr>
              </thead>
              <tbody>
                {providers.map((p: any) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-3 text-sm">{p.name}</td>
                    <td className="px-4 py-3 text-sm">{p.role}</td>
                    <td className="px-4 py-3 text-sm"><div className="flex flex-wrap gap-1">{p.skills?.slice(0,2).map((s: string, i: number) => (<span key={i} className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">{s}</span>))}</div></td>
                    <td className="px-4 py-3 text-sm">{p.experience_years} yrs</td>
                    <td className="px-4 py-3 text-sm"><span className={`px-2 py-0.5 text-xs rounded-full ${p.available ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{p.available ? 'Available' : 'Assigned'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {type === 'facilities' && (
            <table className="w-full min-w-[500px]">
              <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Location</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th></tr></thead>
              <tbody>{facilities.map((f: any) => (<tr key={f.id} className="border-t"><td className="px-4 py-3 text-sm">{f.name}</td><td className="px-4 py-3 text-sm">{f.location}</td><td className="px-4 py-3 text-sm text-gray-500">{f.email}</td></tr>))}</tbody>
            </table>
          )}
          {type === 'shifts' && (
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Facility</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Urgency</th></tr></thead>
              <tbody>{shifts.map((s: any) => (<tr key={s.id} className="border-t"><td className="px-4 py-3 text-sm">{s.role}</td><td className="px-4 py-3 text-sm">{facilities.find((f: any) => f.id === s.facility_id)?.name}</td><td className="px-4 py-3 text-sm">{new Date(s.shift_date).toLocaleDateString()}</td><td className="px-4 py-3 text-sm"><span className={`px-2 py-0.5 text-xs rounded-full ${getUrgencyClass(s.urgency)}`}>{s.urgency}</span></td></tr>))}</tbody>
            </table>
          )}
          {type === 'available' && (
            <table className="w-full min-w-[500px]">
              <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Experience</th></tr></thead>
              <tbody>{providers.filter((p: any) => p.available).map((p: any) => (<tr key={p.id} className="border-t"><td className="px-4 py-3 text-sm">{p.name}</td><td className="px-4 py-3 text-sm">{p.role}</td><td className="px-4 py-3 text-sm">{p.experience_years} yrs</td></tr>))}</tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}