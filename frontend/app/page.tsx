'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ShiftsView from './components/ShiftsView';
import ProvidersView from './components/ProvidersView';
import FacilitiesView from './components/FacilitiesView';
import MatchedShiftsView from './components/MatchedShiftsView';
import PostShiftModal from './components/PostShiftModal';
import MatchModal from './components/MatchModal';
import TableModal from './components/TableModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [providers, setProviders] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState<{type: string; title: string} | null>(null);
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [providersRes, facilitiesRes, shiftsRes] = await Promise.all([
        axios.get(`${API_URL}/providers`),
        axios.get(`${API_URL}/facilities`),
        axios.get(`${API_URL}/shifts/open`),
      ]);
      setProviders(providersRes.data);
      setFacilities(facilitiesRes.data);
      setShifts(shiftsRes.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async (shift: any) => {
    setSelectedShift(shift);
    setShowMatchModal(true);
    try {
      const response = await axios.post(`${API_URL}/match/${shift.id}`);
      setMatches(response.data.matches || []);
    } catch (error) {
      console.error('Match error:', error);
      setMatches([]);
    }
  };

  const handleAcceptMatch = async (providerId: number) => {
    if (!selectedShift) return;
    try {
      // ✅ FIXED: Use correct template literal syntax (single curly braces)
      const matchesResponse = await axios.get(`${API_URL}/matches/${selectedShift.id}`);
      const match = matchesResponse.data.find((m: any) => m.provider_id === providerId);
      if (match) {
        // ✅ FIXED: Use correct template literal syntax
        await axios.put(`${API_URL}/matches/${match.id}/accept`);
        alert('✓ Provider assigned successfully');
        setShowMatchModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Accept error:', error);
      alert('Error accepting match');
    }
  };

  const handleShiftAccepted = async () => {
    await fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading MedMatch...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        activeView={activeView} 
        setActiveView={setActiveView} 
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeView={activeView}
          shiftsCount={shifts.length}
        />
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {activeView === 'dashboard' && (
            <Dashboard 
              providers={providers} 
              facilities={facilities} 
              shifts={shifts} 
              setActiveView={setActiveView}
              setShowShiftModal={setShowShiftModal}
            />
          )}

          {activeView === 'shifts' && (
            <ShiftsView 
              shifts={shifts} 
              facilities={facilities} 
              onMatch={handleMatch}
              onShiftPosted={fetchData}
              onShiftAccepted={handleShiftAccepted}
            />
          )}
          {activeView === 'matched' && (
            <MatchedShiftsView 
              facilities={facilities}
              shifts={shifts}
            />
          )}
          {activeView === 'providers' && <ProvidersView providers={providers} />}
          {activeView === 'facilities' && <FacilitiesView facilities={facilities} shifts={shifts} />}

        </div>
      </div>

      {/* Modals */}
      {showShiftModal && (
        <PostShiftModal 
          facilities={facilities} 
          roles={[...new Set(providers.map((p: any) => p.role))]} 
          onClose={() => setShowShiftModal(false)} 
          onSuccess={fetchData} 
        />
      )}
      
      {showMatchModal && selectedShift && (
        <MatchModal 
          shift={selectedShift} 
          matches={matches} 
          providers={providers} 
          facilities={facilities} 
          onClose={() => setShowMatchModal(false)} 
          onAccept={handleAcceptMatch} 
        />
      )}
      
      {showTableModal && (
        <TableModal 
          type={showTableModal.type} 
          title={showTableModal.title} 
          providers={providers} 
          facilities={facilities} 
          shifts={shifts} 
          onClose={() => setShowTableModal(null)} 
        />
      )}
    </div>
  );
}