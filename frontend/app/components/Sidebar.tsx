'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard, Calendar, Users, Building2, CheckCircle, PlusCircle, Menu, X } from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;  // ← ADD THIS (missing)
  activeView: string;
  setActiveView: (view: string) => void;
  setShowPostShiftModal?: (show: boolean) => void;
  setActiveViewWithPost?: (view: string, showPost: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen, activeView, setActiveView, setShowPostShiftModal, setActiveViewWithPost }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On desktop, sidebar starts OPEN (true)
      // On mobile, sidebar starts CLOSED
      if (mobile) {
        setMobileSidebarOpen(false);
      } else {
        setSidebarOpen(true);  // Desktop starts expanded
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setSidebarOpen]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!isMobile) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById('main-sidebar');
      const menuBtn = document.getElementById('mobile-menu-btn');
      if (sidebar && !sidebar.contains(e.target as Node) && 
          menuBtn && !menuBtn.contains(e.target as Node) && 
          mobileSidebarOpen) {
        setMobileSidebarOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, mobileSidebarOpen]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'shifts', label: 'Open Shifts', icon: Calendar },
    { id: 'matched', label: 'Matched Shifts', icon: CheckCircle },
    { id: 'providers', label: 'Provider Network', icon: Users },
    { id: 'facilities', label: 'Facilities', icon: Building2 },
  ];

  const handlePostNewShift = () => {
    setActiveView('shifts');
    if (setShowPostShiftModal) {
      setShowPostShiftModal(true);
    } else if (setActiveViewWithPost) {
      setActiveViewWithPost('shifts', true);
    }
    if (isMobile) {
      setMobileSidebarOpen(false);
    }
  };

  const handleMenuClick = (viewId: string) => {
    setActiveView(viewId);
    if (isMobile) {
      setMobileSidebarOpen(false);
    }
  };

  // For desktop: when sidebarOpen = true → w-64 (full with text)
  //              when sidebarOpen = false → w-16 (collapsed, icons only)
  // For mobile: when mobileSidebarOpen = true → w-64 (visible)
  //              when mobileSidebarOpen = false → hidden

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        id="mobile-menu-btn"
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-emerald-600 text-white rounded-lg shadow-lg md:hidden"
      >
        {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay for mobile */}
      {isMobile && mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        id="main-sidebar"
        className={`
          fixed md:sticky top-0 left-0 z-40
          bg-white border-r border-gray-200
          transition-all duration-300 ease-in-out
          flex flex-col h-full shadow-xl md:shadow-none
          ${isMobile 
            ? `${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-64`
            : `translate-x-0 ${sidebarOpen ? 'w-64' : 'w-16'}`
          }
        `}
      >
        {/* Logo */}
        <div className={`py-6 ${sidebarOpen || isMobile ? 'px-4' : 'px-2'} border-b border-gray-100`}>
          <div className={`flex items-center ${sidebarOpen || isMobile ? 'justify-start gap-3' : 'justify-center'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            {(sidebarOpen || isMobile) && (
              <div>
                <h1 className="font-bold text-gray-800 text-sm">FaproMedAI</h1>
                <p className="text-xs text-gray-400">Healthcare Staffing</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition 
                ${activeView === item.id 
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'text-gray-600 hover:bg-gray-50'
                }
                ${(!sidebarOpen && !isMobile) ? 'justify-center' : ''}
              `}
              title={(!sidebarOpen && !isMobile) ? item.label : ''}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {(sidebarOpen || isMobile) && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Post New Shift Button */}
        <div className={`p-2 mb-2 ${(!sidebarOpen && !isMobile) ? 'px-2' : 'px-3'}`}>
          <button
            onClick={handlePostNewShift}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition 
              bg-gradient-to-r from-emerald-600 to-teal-600 text-white 
              hover:from-emerald-700 hover:to-teal-700 shadow-md
              ${(!sidebarOpen && !isMobile) ? 'justify-center' : ''}
            `}
            title={(!sidebarOpen && !isMobile) ? 'Post New Shift' : ''}
          >
            <PlusCircle className="w-5 h-5 flex-shrink-0" />
            {(sidebarOpen || isMobile) && (
              <span className="text-sm font-semibold">Post New Shift</span>
            )}
          </button>
        </div>

        {/* Footer - only shows when expanded */}
        {(sidebarOpen || isMobile) && (
          <div className="p-3 border-t border-gray-100">
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-500">Ready to fill shifts?</p>
              <p className="text-xs text-gray-400 mt-0.5">24/7 Support</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}