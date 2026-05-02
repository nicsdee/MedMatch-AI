'use client';

import { X, CheckCircle, Award } from 'lucide-react';

export default function MatchModal({ shift, matches, providers, facilities, onClose, onAccept }: any) {
  const getScoreClass = (score: number) => {
    if (score >= 0.8) return 'bg-emerald-100 text-emerald-700';
    if (score >= 0.6) return 'bg-amber-100 text-amber-700';
    return 'bg-gray-100 text-gray-600';
  };

  const facility = facilities.find((f: any) => f.id === shift.facility_id);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">AI Match Results</h2>
            <p className="text-sm text-gray-500">{shift.role} at {facility?.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">
          {matches.length === 0 ? (
            <div className="text-center py-12"><p className="text-gray-500">No matches found for this shift.</p></div>
          ) : (
            <div className="space-y-4">
              {matches.map((match: any, idx: number) => {
                const provider = providers.find((p: any) => p.id === match.provider_id);
                if (!provider) return null;
                return (
                  <div key={idx} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-lg">{provider.name}</h3>
                        <p className="text-sm text-emerald-600 font-medium">{provider.role}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {provider.skills?.slice(0, 3).map((skill: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">{skill}</span>
                          ))}
                        </div>
                        <p className="text-sm mt-3 text-gray-600 bg-gray-50 p-2 rounded-lg">💡 {match.reason}</p>
                        <div className="flex gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Award className="w-3 h-3" /> {provider.experience_years} years exp</span>
                          <span>{provider.license_number}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs rounded-full ${getScoreClass(match.score)}`}>
                          {Math.round(match.score * 100)}% Match
                        </span>
                        <button onClick={() => onAccept(provider.id)} className="mt-2 bg-emerald-600 text-white px-4 py-1.5 rounded-lg hover:bg-emerald-700 transition text-sm w-full flex items-center justify-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Assign
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}