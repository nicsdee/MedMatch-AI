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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-xl sm:rounded-2xl max-w-[95%] sm:max-w-3xl md:max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        
        {/* Sticky Header - Responsive */}
        <div className="sticky top-0 bg-white p-3 sm:p-4 md:p-6 border-b border-gray-100 flex justify-between items-center z-10">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 pr-2">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 flex-shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Table Container - Responsive overflow */}
        <div className="p-3 sm:p-4 md:p-6 overflow-x-auto">
          
          {/* Providers Table */}
          {type === 'providers' && (
            <table className="w-full min-w-[500px] sm:min-w-[600px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 hidden sm:table-cell">Role</th>
                  <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 hidden md:table-cell">Skills</th>
                  <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 hidden lg:table-cell">Experience</th>
                  <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((p: any) => (
                  <tr key={p.id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-800 truncate max-w-[120px] sm:max-w-none">
                      {p.name}
                    </td>
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600 hidden sm:table-cell">
                      {p.role}
                    </td>
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {p.skills?.slice(0, 2).map((s: string, i: number) => (
                          <span key={i} className="px-1.5 py-0.5 text-[10px] sm:text-xs bg-gray-100 text-gray-600 rounded-full truncate max-w-[80px]">
                            {s}
                          </span>
                        ))}
                        {p.skills?.length > 2 && (
                          <span className="text-[10px] sm:text-xs text-gray-400">+{p.skills.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600 hidden lg:table-cell">
                      {p.experience_years} yrs
                    </td>
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                      <span className={`inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-0.5 text-[10px] sm:text-xs rounded-full font-medium ${
                        p.available 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {p.available ? 'Available' : 'Assigned'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Facilities Table */}
          {type === 'facilities' && (
            <table className="w-full min-w-[400px] sm:min-w-[500px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 hidden sm:table-cell">Location</th>
                  <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 hidden md:table-cell">Email</th>
                </tr>
              </thead>
              <tbody>
                {facilities.map((f: any) => (
                  <tr key={f.id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-800 truncate max-w-[120px] sm:max-w-none">
                      {f.name}
                    </td>
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600 hidden sm:table-cell">
                      {f.location}
                    </td>
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-500 hidden md:table-cell truncate max-w-[150px]">
                      {f.email}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Shifts Table */}
          {type === 'shifts' && (
            <table className="w-full min-w-[500px] sm:min-w-[600px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Role</th>
                  <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 hidden sm:table-cell">Facility</th>
                  <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 hidden md:table-cell">Date</th>
                  <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Urgency</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((s: any) => (
                  <tr key={s.id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-800 truncate max-w-[100px] sm:max-w-none">
                      {s.role}
                    </td>
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600 hidden sm:table-cell truncate max-w-[120px]">
                      {facilities.find((f: any) => f.id === s.facility_id)?.name}
                    </td>
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600 hidden md:table-cell">
                      {new Date(s.shift_date).toLocaleDateString()}
                    </td>
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                      <span className={`inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-0.5 text-[10px] sm:text-xs rounded-full font-medium ${getUrgencyClass(s.urgency)}`}>
                        {s.urgency}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Available Providers Table */}
          {type === 'available' && (
            <table className="w-full min-w-[350px] sm:min-w-[450px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 hidden sm:table-cell">Role</th>
                  <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Experience</th>
                </tr>
              </thead>
              <tbody>
                {providers.filter((p: any) => p.available).map((p: any) => (
                  <tr key={p.id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-800 truncate max-w-[120px] sm:max-w-none">
                      {p.name}
                    </td>
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600 hidden sm:table-cell truncate max-w-[100px]">
                      {p.role}
                    </td>
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600">
                      {p.experience_years} yrs
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}