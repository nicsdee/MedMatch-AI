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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-xl sm:rounded-2xl max-w-[95%] sm:max-w-lg md:max-w-2xl w-full max-h-[90vh] sm:max-h-[85vh] md:max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white p-3 sm:p-4 md:p-6 border-b border-gray-100 flex justify-between items-center z-10">
          <div className="pr-2">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">AI Match Results</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate max-w-[180px] sm:max-w-xs">
              {shift.role} at {facility?.name}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 flex-shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-4 md:p-6">
          {matches.length === 0 ? (
            <div className="text-center py-8 sm:py-10 md:py-12">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Award className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-400" />
              </div>
              <p className="text-sm sm:text-base text-gray-500">No matches found for this shift.</p>
              <p className="text-xs text-gray-400 mt-1 sm:mt-2">Try adjusting shift requirements or check back later.</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {matches.map((match: any, idx: number) => {
                const provider = providers.find((p: any) => p.id === match.provider_id);
                if (!provider) return null;
                
                return (
                  <div 
                    key={idx} 
                    className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                      {/* Provider Info - Left side */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2 sm:hidden mb-2">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getScoreClass(match.score)} flex-shrink-0`}>
                            {Math.round(match.score * 100)}% Match
                          </span>
                          <button 
                            onClick={() => onAccept(provider.id)} 
                            className="bg-emerald-600 text-white px-3 py-1 rounded-lg hover:bg-emerald-700 transition text-xs flex items-center gap-1 flex-shrink-0"
                          >
                            <CheckCircle className="w-3 h-3" /> Assign
                          </button>
                        </div>
                        
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base md:text-lg truncate">{provider.name}</h3>
                        <p className="text-xs sm:text-sm text-emerald-600 font-medium mt-0.5">{provider.role}</p>
                        
                        {/* Skills */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {provider.skills?.slice(0, 3).map((skill: string, i: number) => (
                            <span key={i} className="px-1.5 py-0.5 text-[10px] sm:text-xs rounded-full bg-gray-100 text-gray-600 truncate max-w-[100px] sm:max-w-none">
                              {skill}
                            </span>
                          ))}
                          {provider.skills?.length > 3 && (
                            <span className="px-1.5 py-0.5 text-[10px] sm:text-xs rounded-full bg-gray-100 text-gray-500">
                              +{provider.skills.length - 3}
                            </span>
                          )}
                        </div>
                        
                        {/* Match Reason */}
                        <p className="text-xs sm:text-sm mt-3 text-gray-600 bg-gray-50 p-2 sm:p-2.5 rounded-lg">
                          💡 {match.reason}
                        </p>
                        
                        {/* Provider Details */}
                        <div className="flex flex-wrap gap-2 sm:gap-3 mt-2 text-[10px] sm:text-xs text-gray-400">
                          <span className="flex items-center gap-0.5 sm:gap-1">
                            <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {provider.experience_years} years exp
                          </span>
                          <span className="truncate max-w-[120px] sm:max-w-none">{provider.license_number}</span>
                        </div>
                      </div>
                      
                      {/* Match Score & Button - Desktop */}
                      <div className="hidden sm:flex sm:flex-col sm:items-end sm:flex-shrink-0">
                        <span className={`px-2 py-1 text-xs rounded-full ${getScoreClass(match.score)} whitespace-nowrap`}>
                          {Math.round(match.score * 100)}% Match
                        </span>
                        <button 
                          onClick={() => onAccept(provider.id)} 
                          className="mt-2 bg-emerald-600 text-white px-3 sm:px-4 py-1.5 rounded-lg hover:bg-emerald-700 transition text-xs sm:text-sm w-full flex items-center justify-center gap-1 whitespace-nowrap"
                        >
                          <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Assign Provider
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