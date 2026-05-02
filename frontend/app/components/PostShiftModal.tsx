'use client';

import { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const API_URL = 'http://localhost:8000';

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Post New Shift</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Facility</label>
            <select required value={formData.facility_id} onChange={(e) => setFormData({...formData, facility_id: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
              <option value="">Select facility</option>
              {facilities.map((f: any) => (<option key={f.id} value={f.id}>{f.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select required value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
              <option value="">Select role</option>
              {roles.map((role: string) => (<option key={role} value={role}>{role}</option>))}
              <option value="Other">Other (specify in description)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shift Date</label>
            <input type="date" required value={formData.shift_date} onChange={(e) => setFormData({...formData, shift_date: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
            <input type="text" required placeholder="ventilator management, critical care" value={formData.required_skills} onChange={(e) => setFormData({...formData, required_skills: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2"><input type="radio" name="urgency" value="low" checked={formData.urgency === 'low'} onChange={(e) => setFormData({...formData, urgency: e.target.value})} /><span>Low</span></label>
              <label className="flex items-center gap-2"><input type="radio" name="urgency" value="medium" checked={formData.urgency === 'medium'} onChange={(e) => setFormData({...formData, urgency: e.target.value})} /><span>Medium</span></label>
              <label className="flex items-center gap-2"><input type="radio" name="urgency" value="high" checked={formData.urgency === 'high'} onChange={(e) => setFormData({...formData, urgency: e.target.value})} /><span>High</span></label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} placeholder="Additional requirements..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition font-medium disabled:opacity-50">{loading ? 'Posting...' : 'Post Shift'}</button>
        </form>
      </div>
    </div>
  );
}