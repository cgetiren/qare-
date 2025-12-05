import React, { useEffect, useState } from 'react';
import { fetchEarthquakes } from './services/earthquakeService';
import { Earthquake, Tab } from './types';
import MapComponent from './components/MapContainer';
import EarthquakeList from './components/EarthquakeList';
import EmergencyKit from './components/EmergencyKit';
import EmergencyContacts from './components/EmergencyContacts';
import SeismicDetector from './components/SeismicDetector';
import { Map, List, Backpack, AlertCircle, Activity } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('map');
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetector, setShowDetector] = useState(false);

  useEffect(() => {
    const getData = async (isBackground = false) => {
      if (!isBackground) setLoading(true);
      
      const data = await fetchEarthquakes();
      
      // Only update if we got data or if it's the first load (to clear loading state)
      if (data.length > 0) {
        setEarthquakes(data);
      }
      
      setLoading(false);
    };

    // Initial load
    getData(false);

    // Refresh every 60 seconds (background)
    const interval = setInterval(() => getData(true), 60000);
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'map':
        return <MapComponent earthquakes={earthquakes} />;
      case 'list':
        return <EarthquakeList earthquakes={earthquakes} loading={loading} />;
      case 'kit':
        return <EmergencyKit />;
      case 'sos':
        return <EmergencyContacts />;
      default:
        return <MapComponent earthquakes={earthquakes} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-slate-200">
      
      {/* Seismic Detector Overlay */}
      {showDetector && (
        <SeismicDetector onClose={() => setShowDetector(false)} />
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="bg-red-600 text-white p-1.5 rounded-lg">
            <AlertCircle size={20} />
          </div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Q<span className="text-red-600">are</span></h1>
        </div>
        
        <div className="flex items-center gap-2">
          {activeTab === 'map' && (
             <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium animate-pulse hidden sm:inline-block">
               Canlı
             </span>
          )}
          
          <button 
            onClick={() => setShowDetector(true)}
            className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 active:scale-95 transition-all"
            title="Erken Uyarı / Sarsıntı Algılayıcı"
          >
            <Activity size={20} className={showDetector ? "text-red-600" : ""} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-slate-200 h-20 pb-4 absolute bottom-0 w-full z-20">
        <ul className="flex justify-around items-center h-full px-2">
          <li>
            <button 
              onClick={() => setActiveTab('map')}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'map' ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Map size={24} />
              <span className="text-[10px] font-medium">Harita</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('list')}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'list' ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List size={24} />
              <span className="text-[10px] font-medium">Liste</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('kit')}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'kit' ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Backpack size={24} />
              <span className="text-[10px] font-medium">Çantam</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('sos')}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'sos' ? 'text-red-600 bg-red-50' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <AlertCircle size={24} />
              <span className="text-[10px] font-medium">SOS</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default App;