'use client';

import { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

// ✅ FIXED: Use environment variable instead of hardcoded localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function PostShiftModal({ facilities, roles, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    facility_id: '',
    role: '',
    shift_date: '',
    required_skills: '',
    urgency: 'medium',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/shifts`, {
        facility_id: parseInt(formData.facility_id),
        role: formData.role,
        shift_date: formData.shift_date,
        required_skills: formData.required_skills.split(',').map(s => s.trim()),
        urgency: formData.urgency,
        description: formData.description,
      });
      alert('✓ Shift posted successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert('Error posting shift');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-xl sm:rounded-2xl max-w-[95%] sm:max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        
        {/* Sticky Header - Responsive */}
        <div className="sticky top-0 bg-white p-3 sm:p-4 md:p-6 border-b border-gray-100 flex justify-between items-center z-10">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">Post New Shift</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 flex-shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Form - Responsive padding and inputs */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
          {/* Facility Field */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Facility <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.facility_id}
              onChange={(e) => setFormData({...formData, facility_id: e.target.value})}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">Select facility</option>
              {facilities.map((f: any) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* Role Field */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">Select role</option>
              {roles.map((role: string) => (
                <option key={role} value={role}>{role}</option>
              ))}
              <option value="Other">Other (specify in description)</option>
            </select>
          </div>

          {/* Shift Date Field */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Shift Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.shift_date}
              onChange={(e) => setFormData({...formData, shift_date: e.target.value})}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Required Skills Field */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Required Skills <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="ventilator management, critical care"
              value={formData.required_skills}
              onChange={(e) => setFormData({...formData, required_skills: e.target.value})}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Separate skills with commas (e.g., ICU, Emergency, Critical Care)</p>
          </div>

          {/* Urgency Field - Responsive radio buttons */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Urgency <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="urgency"
                  value="low"
                  checked={formData.urgency === 'low'}
                  onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                />
                <span className="text-xs sm:text-sm text-gray-700">Low</span>
              </label>
              <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="urgency"
                  value="medium"
                  checked={formData.urgency === 'medium'}
                  onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                />
                <span className="text-xs sm:text-sm text-gray-700">Medium</span>
              </label>
              <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="urgency"
                  value="high"
                  checked={formData.urgency === 'high'}
                  onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                />
                <span className="text-xs sm:text-sm text-gray-700">High</span>
              </label>
            </div>
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Additional requirements or notes..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl hover:from-emerald-700 hover:to-teal-700 transition font-medium disabled:opacity-50 text-sm sm:text-base mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Posting...
              </span>
            ) : (
              'Post Shift'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}