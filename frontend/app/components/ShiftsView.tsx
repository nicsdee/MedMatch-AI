'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Building2, Calendar, Search, PlusCircle, X, Briefcase, 
  AlertTriangle, Users, Clock, CheckCircle, ArrowLeft, 
  TrendingUp, Award, MapPin, Stethoscope, Heart, Activity,
  Target, Shield, Star, Tag, Plus
} from 'lucide-react';

//const API_URL = 'http://localhost:8000';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
// Comprehensive healthcare skills database
const HEALTHCARE_SKILLS = [
  'ventilator management', 'critical care', 'patient monitoring', 'trauma care', 
  'triage', 'emergency response', 'advanced cardiac life support', 'basic life support', 
  'wound care', 'medication administration', 'pediatric assessment', 'neonatal care', 
  'post-op care', 'pre-op care', 'sterile technique', 'pain management', 
  'ECG interpretation', 'hemodynamic monitoring', 'renal replacement therapy', 
  'dementia care', 'elderly care', 'chemotherapy administration', 'dialysis care',
  'home health care', 'geriatric care', 'oncology care', 'palliative care',
  'intravenous therapy', 'blood transfusion', 'infection control', 'patient education',
  'cardiac monitoring', 'respiratory therapy', 'physical assessment', 'care coordination',
  'discharge planning', 'family counseling', 'crisis intervention', 'substance abuse counseling'
];

export default function ShiftsView({ shifts, facilities, onMatch, onShiftPosted, onShiftAccepted }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localShifts, setLocalShifts] = useState(shifts);
  const [matchMode, setMatchMode] = useState<{ active: boolean; shift: any | null; matches: any[]; loading: boolean; error: string | null }>({
    active: false,
    shift: null,
    matches: [],
    loading: false,
    error: null
  });
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'success'
  });
  const [skillInput, setSkillInput] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  const [newShift, setNewShift] = useState({
    facility_id: '',
    role: '',
    shift_date: '',
    urgency: 'medium',
    description: ''
  });

  useEffect(() => {
    setLocalShifts(shifts);
  }, [shifts]);

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  useEffect(() => {
    if (skillInput.length > 1) {
      const matches = HEALTHCARE_SKILLS.filter(skill => 
        skill.toLowerCase().includes(skillInput.toLowerCase()) && 
        !selectedSkills.includes(skill)
      );
      setSkillSuggestions(matches.slice(0, 6));
    } else {
      setSkillSuggestions([]);
    }
  }, [skillInput, selectedSkills]);

  const addSkill = (skill: string) => {
    if (skill.trim() && !selectedSkills.includes(skill.trim())) {
      setSelectedSkills([...selectedSkills, skill.trim()]);
      setSkillInput('');
      setSkillSuggestions([]);
    }
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ show: true, message, type });
  };

  const getUrgencyClass = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md';
      case 'medium': return 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md';
      default: return 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md';
    }
  };

  const getScoreColor = (score: number) => {
    const percentage = Math.round(score * 100);
    if (percentage >= 90) return 'bg-emerald-700 text-white';
    if (percentage >= 80) return 'bg-emerald-600 text-white';
    if (percentage >= 70) return 'bg-emerald-500 text-white';
    if (percentage >= 60) return 'bg-teal-500 text-white';
    if (percentage >= 50) return 'bg-amber-500 text-white';
    if (percentage >= 40) return 'bg-orange-500 text-white';
    if (percentage >= 30) return 'bg-orange-400 text-white';
    return 'bg-gray-500 text-white';
  };

  const getStarRating = (score: number) => {
    const percentage = Math.round(score * 100);
    const filledStars = Math.floor(percentage / 20);
    return filledStars;
  };

  const filteredShifts = localShifts.filter((shift: any) => 
    shift.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  //const uniqueRoles = [...new Set(localShifts.map((s: any) => s.role))];
  const uniqueRoles: string[] = [...new Set(localShifts.map((s: any) => s.role).filter(Boolean))] as string[];

  const totalShifts = localShifts.length;
  const highUrgency = localShifts.filter((s: any) => s.urgency === 'high').length;
  const avgSkills = Math.round(localShifts.reduce((acc: number, s: any) => acc + (s.required_skills?.length || 0), 0) / (totalShifts || 1));

  const handlePostShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSkills.length === 0) {
      showNotification('Please add at least one required skill', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const response = await axios.post(`${API_URL}/shifts`, {
        facility_id: parseInt(newShift.facility_id),
        role: newShift.role,
        shift_date: newShift.shift_date,
        required_skills: selectedSkills,
        urgency: newShift.urgency,
        description: newShift.description,
      });
      
      const newShiftObj = {
        id: response.data.shift_id,
        role: newShift.role,
        facility_id: parseInt(newShift.facility_id),
        shift_date: newShift.shift_date,
        required_skills: selectedSkills,
        urgency: newShift.urgency,
        description: newShift.description,
        status: 'open'
      };
      
      setLocalShifts([newShiftObj, ...localShifts]);
      showNotification('✓ Shift posted successfully! AI matching will now find providers.', 'success');
      
      setNewShift({
        facility_id: '',
        role: '',
        shift_date: '',
        urgency: 'medium',
        description: ''
      });
      setSelectedSkills([]);
      setShowInlineForm(false);
      
      if (onShiftPosted) onShiftPosted();
      
    } catch (error) {
      console.error('Error posting shift:', error);
      showNotification('✗ Failed to post shift. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMatchClick = async (shift: any) => {
    setMatchMode({
      active: true,
      shift: shift,
      matches: [],
      loading: true,
      error: null
    });
    
    try {
      await axios.get(`${API_URL}/`);
      const response = await axios.post(`${API_URL}/match/${shift.id}`);
      
      if (response.data && response.data.matches) {
        setMatchMode({
          active: true,
          shift: shift,
          matches: response.data.matches,
          loading: false,
          error: null
        });
      } else {
        setMatchMode({
          active: true,
          shift: shift,
          matches: [],
          loading: false,
          error: 'No matches found for this shift'
        });
      }
    } catch (error: any) {
      console.error('Match error:', error);
      let errorMsg = 'Unable to connect to matching service. ';
      if (error.code === 'ERR_NETWORK') {
        errorMsg = 'Backend server is not running. Please start the server on port 8000.';
      } else if (error.response?.status === 404) {
        errorMsg = 'Matching service endpoint not found.';
      } else if (error.response?.status === 500) {
        errorMsg = 'Server error occurred. Please try again.';
      }
      setMatchMode({
        active: true,
        shift: shift,
        matches: [],
        loading: false,
        error: errorMsg
      });
    }
  };

  const handleAcceptMatch = async (providerId: number) => {
    if (!matchMode.shift) return;
    
    try {
      const matchesResponse = await axios.get(`${API_URL}/matches/${matchMode.shift.id}`);
      const match = matchesResponse.data.find((m: any) => m.provider_id === providerId);
      if (match) {
        await axios.put(`${API_URL}/matches/${match.id}/accept`);
        showNotification(`✓ Provider assigned successfully! The shift has been filled.`, 'success');
        
        setLocalShifts(localShifts.filter((s: any) => s.id !== matchMode.shift.id));
        setMatchMode({ active: false, shift: null, matches: [], loading: false, error: null });
        
        if (onShiftAccepted) onShiftAccepted();
        if (onShiftPosted) onShiftPosted();
      }
    } catch (error) {
      console.error('Accept error:', error);
      showNotification('✗ Failed to assign provider. Please try again.', 'error');
    }
  };

  const handleBackToShifts = () => {
    setMatchMode({ active: false, shift: null, matches: [], loading: false, error: null });
  };

  // Match Results View
  if (matchMode.active) {
    const facility = facilities.find((f: any) => f.id === matchMode.shift?.facility_id);
    
    return (
      <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-slate-50 to-white min-h-screen">
        <button
          onClick={handleBackToShifts}
          className="mb-6 flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
          <span className="text-sm font-medium">Back to Open Shifts</span>
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-10 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Match Results</h1>
              <p className="text-gray-500 text-sm mt-1">
                <span className="font-medium">{matchMode.shift?.role}</span> at <span className="font-medium">{facility?.name}</span> • {matchMode.shift?.shift_date && new Date(matchMode.shift.shift_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {matchMode.loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600 font-medium mt-4">Analyzing provider profiles...</p>
            <p className="text-sm text-gray-400 mt-1">Matching skills and experience</p>
          </div>
        )}

        {!matchMode.loading && matchMode.error && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">Connection Error</h3>
            <p className="text-gray-500 max-w-md mx-auto">{matchMode.error}</p>
            <button onClick={handleBackToShifts} className="mt-6 bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 transition font-medium">Go Back</button>
          </div>
        )}

        {!matchMode.loading && !matchMode.error && (
          <>
            {matchMode.matches && matchMode.matches.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <p className="text-gray-600">Found <span className="font-bold text-emerald-600 text-lg">{matchMode.matches.length}</span> qualified providers</p>
                </div>
                
                {matchMode.matches.map((match: any, idx: number) => {
                  const matchScore = match.score || 0;
                  const matchPercentage = Math.round(matchScore * 100);
                  const matchReason = match.reason || 'Potential match based on skills and experience';
                  const experienceYears = match.experience_years || 5;
                  const starCount = getStarRating(matchScore);
                  
                  return (
                    <div key={idx} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition group">
                      <div className="p-5">
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center shadow-inner">
                                <Users className="w-7 h-7 text-emerald-600" />
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-800 text-lg">{match.provider_name || `Provider #${match.provider_id}`}</h3>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <div className={`px-3 py-0.5 text-sm font-bold rounded-full ${getScoreColor(matchScore)}`}>
                                    {matchPercentage}% Match
                                  </div>
                                  <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`w-4 h-4 ${i < starCount ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-emerald-50 rounded-xl p-4 mb-3 border border-emerald-100">
                              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {matchReason}
                              </p>
                            </div>
                            
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> <span className="font-bold">{experienceYears}</span> years experience</span>
                              <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> License verified</span>
                              <span className="flex items-center gap-1"><Target className="w-4 h-4" /> Skills match: <span className="font-bold">{matchPercentage}%</span></span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAcceptMatch(match.provider_id)}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-2.5 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition font-semibold flex items-center gap-2 w-full lg:w-auto justify-center shadow-md"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Assign Now
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">No Matches Found</h3>
                <p className="text-gray-500 max-w-md mx-auto">We couldn't find any providers matching this shift's requirements.</p>
                <button onClick={handleBackToShifts} className="mt-6 text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 mx-auto">← Back to Open Shifts</button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // New Shift Form
  if (showInlineForm) {
    return (
      <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-slate-50 to-white min-h-screen">
        <button
          onClick={() => setShowInlineForm(false)}
          className="mb-6 flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
          <span className="text-sm font-medium">Back to Open Shifts</span>
        </button>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-100 px-4 py-1 rounded-full mb-3">
              <Tag className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-600">Staffing Request</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Post a New Shift</h1>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">Enter requirements for provider matching</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-600">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-xl">Shift Details</h2>
                  <p className="text-sm text-white/80 mt-0.5">Enter the requirements below</p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handlePostShift} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                    <Building2 className="w-4 h-4 text-emerald-500" /> Facility <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={newShift.facility_id}
                    onChange={(e) => setNewShift({...newShift, facility_id: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-white text-gray-700 transition"
                  >
                    <option value="">Select a facility</option>
                    {facilities.map((f: any) => (<option key={f.id} value={f.id}>{f.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                    <Briefcase className="w-4 h-4 text-emerald-500" /> Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={newShift.role}
                    onChange={(e) => setNewShift({...newShift, role: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-white text-gray-700 transition"
                  >
                    <option value="">Select a role</option>
                    {uniqueRoles.map((role) => (<option key={role} value={role}>{role}</option>))}
                    <option value="Other">Other (specify in description)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-emerald-500" /> Shift Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newShift.shift_date}
                    onChange={(e) => setNewShift({...newShift, shift_date: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-white text-gray-700 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Urgency Level <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-3 gap-3">
                    <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition ${newShift.urgency === 'low' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'}`}>
                      <input type="radio" name="urgency" value="low" checked={newShift.urgency === 'low'} onChange={(e) => setNewShift({...newShift, urgency: e.target.value})} className="hidden" />
                      <span className="text-sm font-medium">Standard</span>
                    </label>
                    <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition ${newShift.urgency === 'medium' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300'}`}>
                      <input type="radio" name="urgency" value="medium" checked={newShift.urgency === 'medium'} onChange={(e) => setNewShift({...newShift, urgency: e.target.value})} className="hidden" />
                      <span className="text-sm font-medium">Urgent</span>
                    </label>
                    <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition ${newShift.urgency === 'high' ? 'border-red-500 bg-red-50 animate-pulse' : 'border-gray-200 hover:border-red-300'}`}>
                      <input type="radio" name="urgency" value="high" checked={newShift.urgency === 'high'} onChange={(e) => setNewShift({...newShift, urgency: e.target.value})} className="hidden" />
                      <span className="text-sm font-medium text-red-600">Critical</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Skills Input with Dropdown */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Required Skills <span className="text-red-500">*</span></label>
                
                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedSkills.map(skill => (
                      <span key={skill} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-sm bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                        <Tag className="w-3 h-3" />
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="text-emerald-400 hover:text-emerald-600 ml-0.5">×</button>
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput))}
                        placeholder="Type a skill and press Enter or select from suggestions..."
                        className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-white text-sm"
                      />
                    </div>
                    <button type="button" onClick={() => addSkill(skillInput)} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium text-sm">Add</button>
                  </div>
                  
                  {skillSuggestions.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {skillSuggestions.map(skill => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => addSkill(skill)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 flex items-center gap-2"
                        >
                          <Plus className="w-3 h-3 text-emerald-500" />
                          {skill}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">Add all required skills for this shift</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Any additional requirements or notes..."
                  value={newShift.description}
                  onChange={(e) => setNewShift({...newShift, description: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-white text-gray-700 transition"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={submitting} className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition font-bold disabled:opacity-50 shadow-md flex items-center justify-center gap-2">
                  {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><CheckCircle className="w-4 h-4" /> Post Shift</>}
                </button>
                <button type="button" onClick={() => setShowInlineForm(false)} className="px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition font-medium">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Main Shifts View
  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      {/* Notification Popup */}
      {notification.show && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in">
          <div className={`rounded-xl shadow-lg p-4 flex items-center gap-3 ${
            notification.type === 'success' ? 'bg-emerald-500 text-white' : 
            notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
          }`}>
            {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {notification.type === 'error' && <AlertTriangle className="w-5 h-5" />}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header with Search on Right */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-10 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Open Shifts</h1>
                <p className="text-gray-500 text-sm mt-1">Provider matching for healthcare facilities</p>
              </div>
            </div>
          </div>
          
          {/* Search and Post New Shift in same row */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:min-w-[250px]">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search shifts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-white text-sm"
              />
            </div>
            <button
              onClick={() => setShowInlineForm(true)}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2.5 rounded-xl text-sm hover:from-emerald-700 hover:to-teal-700 flex items-center gap-2 shadow-md hover:shadow-lg transition font-semibold whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              Post New Shift
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition group cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <Briefcase className="w-5 h-5 text-emerald-500" />
            <TrendingUp className="w-4 h-4 text-gray-300 group-hover:text-emerald-400 transition" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{totalShifts}</p>
          <p className="text-xs text-gray-500 mt-1">Total Open Shifts</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition group cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-500">{highUrgency}</p>
          <p className="text-xs text-gray-500 mt-1">Critical Priority</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition group cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{avgSkills}</p>
          <p className="text-xs text-gray-500 mt-1">Avg Skills/Shift</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition group cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <Building2 className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{facilities.length}</p>
          <p className="text-xs text-gray-500 mt-1">Partner Facilities</p>
        </div>
      </div>

      {/* Shifts Grid - 3 columns on desktop, 2 on tablet, 1 on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredShifts.length === 0 ? (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No Open Shifts</h3>
            <p className="text-gray-500">Click "Post New Shift" to create your first shift requirement.</p>
          </div>
        ) : (
          filteredShifts.map((shift: any) => {
            const facility = facilities.find((f: any) => f.id === shift.facility_id);
            return (
              <div
                key={shift.id}
                className="bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className={`h-1.5 ${shift.urgency === 'high' ? 'bg-gradient-to-r from-red-500 to-red-600' : shift.urgency === 'medium' ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 'bg-gradient-to-r from-emerald-500 to-teal-600'}`}></div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Stethoscope className="w-5 h-5 text-emerald-500" />
                        <h3 className="font-bold text-gray-800 text-lg">{shift.role}</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {facility?.name || 'Unknown'}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {facility?.location || 'Kenya'}</span>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${shift.urgency === 'high' ? 'bg-red-100 text-red-700 animate-pulse' : shift.urgency === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {shift.urgency === 'high' ? 'Critical' : shift.urgency === 'medium' ? 'Urgent' : 'Standard'}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(shift.shift_date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {shift.required_skills?.length || 0} skills required</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {shift.required_skills?.slice(0, 4).map((skill: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 flex items-center gap-1">
                        <Heart className="w-2 h-2 text-emerald-500" /> {skill}
                      </span>
                    ))}
                    {shift.required_skills?.length > 4 && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500">+{shift.required_skills.length - 4}</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleMatchClick(shift)}
                    className="mt-4 w-full py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition shadow-md flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Find Matches
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer note */}
      {filteredShifts.length > 0 && (
        <div className="mt-6 text-center text-xs text-gray-400">
          Showing <span className="font-medium">{filteredShifts.length}</span> of <span className="font-medium">{totalShifts}</span> open shifts
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}