'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard, Calendar, Users, Building2, CheckCircle, PlusCircle, Menu, X } from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
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
      // Auto-close sidebar on mobile
      if (mobile) {
        setMobileSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Toggle sidebar on desktop
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Determine if sidebar should be visible
  const isSidebarVisible = isMobile ? mobileSidebarOpen : sidebarOpen;

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
          flex flex-col
          ${isSidebarVisible ? 'translate-x-0' : '-translate-x-full'}
          ${isMobile ? 'w-64' : (sidebarOpen ? 'w-64' : 'w-16')}
          h-full shadow-xl md:shadow-none
        `}
      >
        {/* Desktop Toggle Button - Always shows ☰ on desktop when collapsed, X when open */}
        <div className="hidden md:flex justify-end p-2 border-b border-gray-100">
          <button
            onClick={toggleSidebar}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-500"
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {/* Show ☰ when collapsed, X when open */}
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Logo */}
        <div className={`py-4 ${sidebarOpen ? 'px-4' : 'px-2'} border-b border-gray-100`}>
          <div className={`flex items-center ${sidebarOpen ? 'justify-start gap-2' : 'justify-center'}`}>
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            {(isSidebarVisible && (isMobile || sidebarOpen)) && (
              <div className="flex-1">
                <h1 className="font-bold text-gray-800 text-sm">MedMatch AI</h1>
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
                ${(!isSidebarVisible || (!isMobile && !sidebarOpen)) ? 'justify-center' : ''}
              `}
              title={(!isSidebarVisible || (!isMobile && !sidebarOpen)) ? item.label : ''}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {(isSidebarVisible && (isMobile || sidebarOpen)) && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Post New Shift Button */}
        <div className={`p-2 mb-2 ${!sidebarOpen && !isMobile ? 'px-2' : 'px-3'}`}>
          <button
            onClick={handlePostNewShift}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition 
              bg-gradient-to-r from-emerald-600 to-teal-600 text-white 
              hover:from-emerald-700 hover:to-teal-700 shadow-md
              ${(!isSidebarVisible || (!isMobile && !sidebarOpen)) ? 'justify-center' : ''}
            `}
            title={(!isSidebarVisible || (!isMobile && !sidebarOpen)) ? 'Post New Shift' : ''}
          >
            <PlusCircle className="w-5 h-5 flex-shrink-0" />
            {(isSidebarVisible && (isMobile || sidebarOpen)) && (
              <span className="text-sm font-semibold">Post New Shift</span>
            )}
          </button>
        </div>

        {/* Footer */}
        {(isSidebarVisible && (isMobile || sidebarOpen)) && (
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