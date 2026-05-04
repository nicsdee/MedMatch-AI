'use client';

import { useState, useEffect, useRef } from 'react';
import { Menu, X, Bell, User, LogOut, Settings, HelpCircle } from 'lucide-react';

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeView: string;
  shiftsCount?: number;
}

export default function Navbar({ sidebarOpen, setSidebarOpen, activeView, shiftsCount = 0 }: NavbarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get the title based on active page
  const getTitle = () => {
    switch (activeView) {
      case 'dashboard': return 'Dashboard';
      case 'shifts': return 'Open Shifts';
      case 'matched': return 'Matched Shifts';
      case 'providers': return 'Provider Network';
      case 'facilities': return 'Partner Facilities';
      default: return 'Dashboard';
    }
  };

  // Get the subtitle based on active page
  const getSubtitle = () => {
    switch (activeView) {
      case 'dashboard': return 'Intelligent healthcare staffing platform';
      case 'shifts': return `${shiftsCount} open shifts available`;
      case 'matched': return 'Successfully matched shifts';
      case 'providers': return 'Qualified healthcare professionals ready for placement';
      case 'facilities': return 'Healthcare facilities in your network';
      default: return 'Welcome to MedMatch AI';
    }
  };

  // Sample notifications
  const notifications = [
    { id: 1, title: 'New shift posted', message: 'ICU Nurse needed at Kenyatta Hospital', time: '5 min ago', read: false },
    { id: 2, title: 'Match found', message: 'Sarah Njuguna matched with ER shift', time: '1 hour ago', read: false },
    { id: 3, title: 'Shift filled', message: 'Night shift at Aga Khan Hospital filled', time: '3 hours ago', read: true },
    { id: 4, title: 'Provider available', message: 'James Otieno is now available', time: 'Yesterday', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-20">
      <div className="px-3 sm:px-4 py-2 sm:py-3 flex justify-between items-center">
        {/* Left side: Hamburger + Page Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hamburger Button - visible on mobile or when needed */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Page Title - responsive text sizes */}
          <div>
            <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">
              {getTitle()}
            </h2>
            {!isMobile && (
              <p className="text-xs text-gray-500 hidden sm:block">
                {getSubtitle()}
              </p>
            )}
          </div>
        </div>
        
        {/* Right side: Notification + Profile */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Notification Bell */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition text-gray-600 relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-30">
                <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Notifications</h3>
                  <button className="text-xs text-emerald-600 hover:underline">Mark all read</button>
                </div>
                <div className="max-h-80 sm:max-h-96 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition ${!notif.read ? 'bg-emerald-50' : ''}`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{notif.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                        </div>
                        {!notif.read && <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-1"></div>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-100 text-center">
                  <button className="text-xs text-emerald-600 hover:underline">View all notifications</button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Icon with Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-1 sm:gap-2 p-1 hover:bg-gray-100 rounded-lg transition"
              aria-label="Profile menu"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-full flex items-center justify-center text-white font-medium text-xs sm:text-sm">
                NK
              </div>
              <span className="hidden sm:inline text-sm text-gray-700">Nicholas</span>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-30">
                <div className="p-3 border-b border-gray-100">
                  <p className="font-medium text-gray-800 text-sm">Nicholas Kioko</p>
                  <p className="text-xs text-gray-500 truncate">nicsdavid@gmail.com</p>
                </div>
                <div className="py-1">
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition">
                    <User className="w-4 h-4" /> My Profile
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition">
                    <Settings className="w-4 h-4" /> Settings
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition">
                    <HelpCircle className="w-4 h-4" /> Help Center
                  </button>
                </div>
                <div className="border-t border-gray-100 py-1">
                  <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2 transition">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}