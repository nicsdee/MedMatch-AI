'use client';

import { LayoutDashboard, Calendar, Users, Building2, CheckCircle, PlusCircle } from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  activeView: string;
  setActiveView: (view: string) => void;
  setShowPostShiftModal?: (show: boolean) => void;
  setActiveViewWithPost?: (view: string, showPost: boolean) => void;
}

export default function Sidebar({ sidebarOpen, activeView, setActiveView, setShowPostShiftModal, setActiveViewWithPost }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'shifts', label: 'Open Shifts', icon: Calendar },
    { id: 'matched', label: 'Matched Shifts', icon: CheckCircle },
    { id: 'providers', label: 'Provider Network', icon: Users },
    { id: 'facilities', label: 'Facilities', icon: Building2 },
  ];

  const handlePostNewShift = () => {
    // First navigate to shifts view
    setActiveView('shifts');
    
    // Then trigger the post shift modal/form
    if (setShowPostShiftModal) {
      setShowPostShiftModal(true);
    } else if (setActiveViewWithPost) {
      setActiveViewWithPost('shifts', true);
    }
  };

  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          {sidebarOpen && (
            <div className="flex-1">
              <h1 className="font-bold text-gray-800 text-sm">MedMatch AI</h1>
              <p className="text-xs text-gray-400">Healthcare Staffing</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
              activeView === item.id 
                ? 'bg-emerald-50 text-emerald-700' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Post New Shift Button */}
      <div className="p-3 mb-2">
        <button
          onClick={handlePostNewShift}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-md ${
            sidebarOpen ? 'justify-start' : 'justify-center'
          }`}
        >
          <PlusCircle className="w-5 h-5" />
          {sidebarOpen && <span className="text-sm font-semibold">Post New Shift</span>}
        </button>
      </div>

      {/* Footer */}
      {sidebarOpen && (
        <div className="p-3 border-t border-gray-100">
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500">Ready to fill shifts?</p>
            <p className="text-xs text-gray-400 mt-0.5">24/7 Support</p>
          </div>
        </div>
      )}
    </div>
  );
}